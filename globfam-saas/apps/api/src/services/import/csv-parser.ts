import { parse } from 'csv-parse';
import { Readable } from 'stream';

export interface ParsedTransaction {
  date: string;
  description: string;
  amount: string;
  currency?: string;
  category?: string;
  type?: 'income' | 'expense';
  originalRow: Record<string, any>;
}

export interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  currency?: string;
  category?: string;
  type?: string;
}

export interface ParseOptions {
  delimiter?: string;
  skipRows?: number;
  dateFormat?: string;
  encoding?: BufferEncoding;
}

export class CSVParser {
  async parseFile(
    fileBuffer: Buffer,
    columnMapping: ColumnMapping,
    options: ParseOptions = {}
  ): Promise<ParsedTransaction[]> {
    const {
      delimiter = ',',
      skipRows = 0,
      encoding = 'utf-8'
    } = options;

    return new Promise((resolve, reject) => {
      const results: ParsedTransaction[] = [];
      const parser = parse({
        delimiter,
        columns: true,
        skip_empty_lines: true,
        trim: true,
        from_line: skipRows + 1,
        relax_column_count: true,
        encoding
      });

      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          try {
            const parsedTransaction = mapRowToTransaction(record, columnMapping);
            if (parsedTransaction) {
              results.push(parsedTransaction);
            }
          } catch (error) {
            console.error('Error parsing row:', error, record);
          }
        }
      });

      parser.on('error', function(err) {
        reject(err);
      });

      parser.on('end', function() {
        resolve(results);
      });

      // Convert buffer to stream and pipe to parser
      const stream = Readable.from(fileBuffer);
      stream.pipe(parser);
    });
  }

  async detectColumns(fileBuffer: Buffer, options: ParseOptions = {}): Promise<string[]> {
    const { delimiter = ',', encoding = 'utf-8' } = options;
    
    return new Promise((resolve, reject) => {
      const parser = parse({
        delimiter,
        to_line: 1,
        relax_column_count: true,
        encoding
      });

      let headers: string[] = [];

      parser.on('readable', function() {
        const record = parser.read();
        if (record) {
          headers = record;
        }
      });

      parser.on('error', function(err) {
        reject(err);
      });

      parser.on('end', function() {
        resolve(headers);
      });

      const stream = Readable.from(fileBuffer);
      stream.pipe(parser);
    });
  }

  async previewRows(
    fileBuffer: Buffer,
    limit: number = 10,
    options: ParseOptions = {}
  ): Promise<Record<string, any>[]> {
    const {
      delimiter = ',',
      skipRows = 0,
      encoding = 'utf-8'
    } = options;

    return new Promise((resolve, reject) => {
      const results: Record<string, any>[] = [];
      const parser = parse({
        delimiter,
        columns: true,
        skip_empty_lines: true,
        trim: true,
        from_line: skipRows + 1,
        to_line: skipRows + limit + 1,
        relax_column_count: true,
        encoding
      });

      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          results.push(record);
        }
      });

      parser.on('error', function(err) {
        reject(err);
      });

      parser.on('end', function() {
        resolve(results);
      });

      const stream = Readable.from(fileBuffer);
      stream.pipe(parser);
    });
  }
}

function mapRowToTransaction(
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

    // Parse amount (handle negative values, currency symbols, etc.)
    const cleanAmount = parseAmount(amount);
    if (isNaN(cleanAmount)) {
      return null;
    }

    // Determine transaction type
    let type: 'income' | 'expense' = cleanAmount >= 0 ? 'income' : 'expense';
    if (mapping.type && row[mapping.type]) {
      const typeValue = row[mapping.type].toLowerCase();
      if (typeValue.includes('credit') || typeValue.includes('income')) {
        type = 'income';
      } else if (typeValue.includes('debit') || typeValue.includes('expense')) {
        type = 'expense';
      }
    }

    return {
      date: date.toString(),
      description: description.toString(),
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

function parseAmount(value: any): number {
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

export const csvParser = new CSVParser();