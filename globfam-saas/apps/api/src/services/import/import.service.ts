import { PrismaClient, ImportHistory, Transaction, Prisma } from '@prisma/client';
import { csvParser, ParsedTransaction, ColumnMapping } from './csv-parser';
import { excelParser } from './excel-parser';
import { format, parse } from 'date-fns';
import { CategorizationService } from '../categorization.service';
import { logger } from '../../utils/logger';

interface ImportOptions {
  assetId: string;
  columnMapping: ColumnMapping;
  dateFormat?: string;
  skipDuplicates?: boolean;
}

interface ImportResult {
  importHistory: ImportHistory;
  transactions: Transaction[];
  errors: Array<{ row: number; error: string; data?: any }>;
}

export class ImportService {
  private categorizationService: CategorizationService;
  
  constructor(private prisma: PrismaClient) {
    this.categorizationService = new CategorizationService(prisma);
  }

  async importFromCSV(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    organizationId: string,
    options: ImportOptions
  ): Promise<ImportResult> {
    // Create import history record
    const importHistory = await this.prisma.importHistory.create({
      data: {
        type: 'csv',
        fileName,
        status: 'processing',
        userId,
        organizationId,
        assetId: options.assetId,
        mapping: options.columnMapping as any,
        startedAt: new Date()
      }
    });

    try {
      // Parse CSV file
      const parsedTransactions = await csvParser.parseFile(
        fileBuffer,
        options.columnMapping
      );

      // Process transactions
      const result = await this.processTransactions(
        parsedTransactions,
        importHistory.id,
        userId,
        organizationId,
        options
      );

      // Update import history
      await this.prisma.importHistory.update({
        where: { id: importHistory.id },
        data: {
          status: 'completed',
          totalRows: parsedTransactions.length,
          successfulRows: result.transactions.length,
          failedRows: result.errors.length,
          errors: result.errors.length > 0 ? result.errors : undefined,
          completedAt: new Date()
        }
      });

      return {
        importHistory,
        transactions: result.transactions,
        errors: result.errors
      };
    } catch (error: any) {
      // Update import history with error
      await this.prisma.importHistory.update({
        where: { id: importHistory.id },
        data: {
          status: 'failed',
          errors: [{ error: error.message || 'Import failed' }],
          completedAt: new Date()
        }
      });

      throw error;
    }
  }

  async importFromExcel(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    organizationId: string,
    options: ImportOptions & { sheetName?: string }
  ): Promise<ImportResult> {
    // Create import history record
    const importHistory = await this.prisma.importHistory.create({
      data: {
        type: 'excel',
        fileName,
        status: 'processing',
        userId,
        organizationId,
        assetId: options.assetId,
        mapping: options.columnMapping as any,
        startedAt: new Date()
      }
    });

    try {
      // Parse Excel file
      const parsedTransactions = await excelParser.parseFile(
        fileBuffer,
        options.columnMapping,
        { sheetName: options.sheetName }
      );

      // Process transactions
      const result = await this.processTransactions(
        parsedTransactions,
        importHistory.id,
        userId,
        organizationId,
        options
      );

      // Update import history
      await this.prisma.importHistory.update({
        where: { id: importHistory.id },
        data: {
          status: 'completed',
          totalRows: parsedTransactions.length,
          successfulRows: result.transactions.length,
          failedRows: result.errors.length,
          errors: result.errors.length > 0 ? result.errors : undefined,
          completedAt: new Date()
        }
      });

      return {
        importHistory,
        transactions: result.transactions,
        errors: result.errors
      };
    } catch (error: any) {
      // Update import history with error
      await this.prisma.importHistory.update({
        where: { id: importHistory.id },
        data: {
          status: 'failed',
          errors: [{ error: error.message || 'Import failed' }],
          completedAt: new Date()
        }
      });

      throw error;
    }
  }

  private async processTransactions(
    parsedTransactions: ParsedTransaction[],
    importHistoryId: string,
    userId: string,
    organizationId: string,
    options: ImportOptions
  ): Promise<{ transactions: Transaction[]; errors: Array<{ row: number; error: string; data?: any }> }> {
    const transactions: Transaction[] = [];
    const errors: Array<{ row: number; error: string; data?: any }> = [];

    // Get asset details for currency
    const asset = await this.prisma.asset.findFirst({
      where: { id: options.assetId, organizationId }
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Process each transaction
    for (let i = 0; i < parsedTransactions.length; i++) {
      const parsed = parsedTransactions[i];
      
      try {
        // Parse date
        const transactionDate = this.parseDate(parsed.date, options.dateFormat);
        if (!transactionDate) {
          throw new Error('Invalid date format');
        }

        // Check for duplicates if enabled
        if (options.skipDuplicates) {
          const existing = await this.prisma.transaction.findFirst({
            where: {
              assetId: options.assetId,
              date: transactionDate,
              amount: new Prisma.Decimal(parsed.amount),
              description: parsed.description
            }
          });

          if (existing) {
            continue; // Skip duplicate
          }
        }

        // Determine transaction type
        const transactionType = parsed.type === 'income' ? 'INCOME' : 'EXPENSE';
        
        // Use AI categorization if no category provided
        let category = parsed.category;
        let categorizationMetadata = {};
        
        if (!category || category === 'Other' || category === 'Other Income') {
          try {
            const categorizationResult = await this.categorizationService.categorizeTransaction(
              parsed.description,
              Math.abs(parsed.amount),
              transactionType
            );
            
            category = categorizationResult.subcategory || categorizationResult.category;
            categorizationMetadata = {
              aiCategorized: true,
              confidence: categorizationResult.confidence,
              merchantName: categorizationResult.merchantName,
              isRecurring: categorizationResult.isRecurring,
              recurringFrequency: categorizationResult.recurringFrequency
            };
          } catch (error) {
            logger.error('Categorization failed for transaction:', error);
            // Fall back to default category
            category = transactionType === 'INCOME' ? 'Other Income' : 'Other';
          }
        }

        // Create transaction with enhanced metadata
        const transaction = await this.prisma.transaction.create({
          data: {
            type: transactionType,
            category,
            amount: new Prisma.Decimal(parsed.amount),
            currency: parsed.currency || asset.currency,
            description: parsed.description,
            date: transactionDate,
            assetId: options.assetId,
            userId,
            organizationId,
            importHistoryId,
            metadata: {
              imported: true,
              originalRow: parsed.originalRow,
              ...categorizationMetadata
            }
          }
        });

        transactions.push(transaction);
      } catch (error: any) {
        errors.push({
          row: i + 1,
          error: error.message || 'Transaction processing failed',
          data: parsed
        });
      }
    }

    return { transactions, errors };
  }

  private parseDate(dateString: string, format?: string): Date | null {
    try {
      if (!dateString) return null;

      // Try to parse with provided format
      if (format) {
        return parse(dateString, format, new Date());
      }

      // Try common date formats
      const formats = [
        'yyyy-MM-dd',
        'dd/MM/yyyy',
        'MM/dd/yyyy',
        'dd-MM-yyyy',
        'MM-dd-yyyy',
        'yyyy/MM/dd',
        'd/M/yyyy',
        'M/d/yyyy'
      ];

      for (const fmt of formats) {
        try {
          const date = parse(dateString, fmt, new Date());
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch {
          // Try next format
        }
      }

      // Try native Date parsing as last resort
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      return null;
    } catch {
      return null;
    }
  }

  async getImportHistory(
    organizationId: string,
    userId?: string,
    limit: number = 10
  ): Promise<ImportHistory[]> {
    return this.prisma.importHistory.findMany({
      where: {
        organizationId,
        ...(userId && { userId })
      },
      include: {
        asset: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }
}