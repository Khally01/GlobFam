import * as XLSX from 'xlsx';
import { ParsedTransaction, ColumnMapping } from './csv-parser';

export interface ExcelParseOptions {
  sheetName?: string;
  skipRows?: number;
  dateFormat?: string;
}

export class ExcelParser {
  async parseFile(
    fileBuffer: Buffer,
    columnMapping: ColumnMapping,
    options: ExcelParseOptions = {}
  ): Promise<ParsedTransaction[]> {
    const { sheetName, skipRows = 0 } = options;

    // Read the workbook
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    
    // Get the sheet
    const sheet = sheetName 
      ? workbook.Sheets[sheetName]
      : workbook.Sheets[workbook.SheetNames[0]];
    
    if (!sheet) {
      throw new Error(`Sheet ${sheetName || 'default'} not found`);
    }

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      dateNF: 'yyyy-mm-dd',
      defval: ''
    });

    // Skip rows if needed
    const dataToProcess = skipRows > 0 ? jsonData.slice(skipRows) : jsonData;

    // Map to transactions
    const transactions: ParsedTransaction[] = [];
    for (const row of dataToProcess) {
      const transaction = this.mapRowToTransaction(row as Record<string, any>, columnMapping);
      if (transaction) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  async getSheetNames(fileBuffer: Buffer): Promise<string[]> {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    return workbook.SheetNames;
  }

  async detectColumns(
    fileBuffer: Buffer,
    options: ExcelParseOptions = {}
  ): Promise<string[]> {
    const { sheetName } = options;

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = sheetName 
      ? workbook.Sheets[sheetName]
      : workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error(`Sheet ${sheetName || 'default'} not found`);
    }

    // Get the range of the sheet
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    const headers: string[] = [];

    // Read the first row (headers)
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = sheet[cellAddress];
      headers.push(cell ? cell.v.toString() : `Column${col + 1}`);
    }

    return headers;
  }

  async previewRows(
    fileBuffer: Buffer,
    limit: number = 10,
    options: ExcelParseOptions = {}
  ): Promise<Record<string, any>[]> {
    const { sheetName, skipRows = 0 } = options;

    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true });
    const sheet = sheetName 
      ? workbook.Sheets[sheetName]
      : workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error(`Sheet ${sheetName || 'default'} not found`);
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      dateNF: 'yyyy-mm-dd',
      defval: ''
    });

    // Skip rows and limit
    const startIndex = skipRows;
    const endIndex = Math.min(startIndex + limit, jsonData.length);
    
    return jsonData.slice(startIndex, endIndex) as Record<string, any>[];
  }

  private mapRowToTransaction(
    row: Record<string, any>,
    mapping: ColumnMapping
  ): ParsedTransaction | null {
    try {
      // Extract values based on mapping
      const date = row[mapping.date];
      const description = row[mapping.description];
      const amount = row[mapping.amount];

      // Basic validation
      if (!date || !description || !amount) {
        return null;
      }

      // Parse amount
      const cleanAmount = this.parseAmount(amount);
      if (isNaN(cleanAmount)) {
        return null;
      }

      // Determine transaction type
      let type: 'income' | 'expense' = cleanAmount >= 0 ? 'income' : 'expense';
      if (mapping.type && row[mapping.type]) {
        const typeValue = row[mapping.type].toString().toLowerCase();
        if (typeValue.includes('credit') || typeValue.includes('income') || typeValue.includes('deposit')) {
          type = 'income';
        } else if (typeValue.includes('debit') || typeValue.includes('expense') || typeValue.includes('withdrawal')) {
          type = 'expense';
        }
      }

      // Format date
      let formattedDate = date;
      if (date instanceof Date) {
        formattedDate = date.toISOString().split('T')[0];
      } else if (typeof date === 'number') {
        // Excel serial date
        const excelDate = XLSX.SSF.parse_date_code(date);
        formattedDate = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
      }

      return {
        date: formattedDate.toString(),
        description: description.toString().trim(),
        amount: Math.abs(cleanAmount).toFixed(2),
        currency: mapping.currency ? row[mapping.currency] : undefined,
        category: mapping.category ? row[mapping.category] : undefined,
        type,
        originalRow: row
      };
    } catch (error) {
      console.error('Error mapping row:', error);
      return null;
    }
  }

  private parseAmount(value: any): number {
    if (typeof value === 'number') {
      return value;
    }

    // Convert to string and clean
    let cleanValue = value.toString()
      .replace(/[^0-9.\-+,]/g, '') // Remove currency symbols and letters
      .replace(/,/g, ''); // Remove thousand separators

    // Handle parentheses for negative values (accounting format)
    if (value.toString().includes('(') && value.toString().includes(')')) {
      cleanValue = '-' + cleanValue;
    }

    return parseFloat(cleanValue);
  }
}

export const excelParser = new ExcelParser();