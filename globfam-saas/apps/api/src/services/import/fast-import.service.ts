import { PrismaClient, ImportHistory, Transaction, Prisma } from '@prisma/client';
import { csvParser, ParsedTransaction, ColumnMapping } from './csv-parser';
import { excelParser } from './excel-parser';
import { parse } from 'date-fns';
import { logger } from '../../utils/logger';

interface ImportOptions {
  assetId: string;
  columnMapping: ColumnMapping;
  dateFormat?: string;
  skipDuplicates?: boolean;
}

interface FastImportResult {
  importHistory: ImportHistory;
  successCount: number;
  failedCount: number;
  errors: Array<{ row: number; error: string }>;
}

export class FastImportService {
  constructor(private prisma: PrismaClient) {}

  async importFromCSV(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    organizationId: string,
    options: ImportOptions
  ): Promise<FastImportResult> {
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

      // Process transactions in batches
      const result = await this.processBatchTransactions(
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
          successfulRows: result.successCount,
          failedRows: result.failedCount,
          errors: result.errors.length > 0 ? result.errors : undefined,
          completedAt: new Date()
        }
      });

      // Queue AI categorization as background job
      this.queueCategorizationJob(importHistory.id, organizationId);

      return {
        importHistory,
        successCount: result.successCount,
        failedCount: result.failedCount,
        errors: result.errors
      };
    } catch (error: any) {
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
  ): Promise<FastImportResult> {
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
      const parsedTransactions = await excelParser.parseFile(
        fileBuffer,
        options.columnMapping,
        { sheetName: options.sheetName }
      );

      const result = await this.processBatchTransactions(
        parsedTransactions,
        importHistory.id,
        userId,
        organizationId,
        options
      );

      await this.prisma.importHistory.update({
        where: { id: importHistory.id },
        data: {
          status: 'completed',
          totalRows: parsedTransactions.length,
          successfulRows: result.successCount,
          failedRows: result.failedCount,
          errors: result.errors.length > 0 ? result.errors : undefined,
          completedAt: new Date()
        }
      });

      this.queueCategorizationJob(importHistory.id, organizationId);

      return {
        importHistory,
        successCount: result.successCount,
        failedCount: result.failedCount,
        errors: result.errors
      };
    } catch (error: any) {
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

  private async processBatchTransactions(
    parsedTransactions: ParsedTransaction[],
    importHistoryId: string,
    userId: string,
    organizationId: string,
    options: ImportOptions
  ): Promise<{ successCount: number; failedCount: number; errors: Array<{ row: number; error: string }> }> {
    const errors: Array<{ row: number; error: string }> = [];
    const BATCH_SIZE = 100;

    // Get asset details
    const asset = await this.prisma.asset.findFirst({
      where: { id: options.assetId, organizationId }
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    // Process transactions in batches
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < parsedTransactions.length; i += BATCH_SIZE) {
      const batch = parsedTransactions.slice(i, i + BATCH_SIZE);
      const transactionsToCreate: Prisma.TransactionCreateManyInput[] = [];

      // Process batch
      for (let j = 0; j < batch.length; j++) {
        const parsed = batch[j];
        const rowIndex = i + j + 1;

        try {
          const transactionDate = this.parseDate(parsed.date, options.dateFormat);
          if (!transactionDate) {
            throw new Error('Invalid date format');
          }

          const transactionType = parsed.type === 'income' ? 'INCOME' : 'EXPENSE';
          
          // Use basic category for now, AI will categorize later
          const category = parsed.category || (transactionType === 'INCOME' ? 'Other Income' : 'Other');

          transactionsToCreate.push({
            type: transactionType,
            category,
            amount: new Prisma.Decimal(parsed.amount),
            currency: parsed.currency || asset.currency,
            description: parsed.description || '',
            date: transactionDate,
            assetId: options.assetId,
            userId,
            organizationId,
            importHistoryId,
            metadata: {
              imported: true,
              originalRow: parsed.originalRow,
              needsCategorization: !parsed.category
            }
          });
        } catch (error: any) {
          errors.push({
            row: rowIndex,
            error: error.message || 'Transaction processing failed'
          });
          failedCount++;
        }
      }

      // Bulk create transactions
      if (transactionsToCreate.length > 0) {
        try {
          if (options.skipDuplicates) {
            // Check for duplicates more efficiently
            const duplicateCheck = await this.checkDuplicatesBatch(
              transactionsToCreate,
              options.assetId
            );
            
            const nonDuplicates = transactionsToCreate.filter((_, index) => !duplicateCheck[index]);
            
            if (nonDuplicates.length > 0) {
              const result = await this.prisma.transaction.createMany({
                data: nonDuplicates
              });
              successCount += result.count;
            }
          } else {
            const result = await this.prisma.transaction.createMany({
              data: transactionsToCreate
            });
            successCount += result.count;
          }
        } catch (error: any) {
          logger.error('Batch insert failed:', error);
          failedCount += transactionsToCreate.length;
        }
      }
    }

    return { successCount, failedCount, errors };
  }

  private async checkDuplicatesBatch(
    transactions: Prisma.TransactionCreateManyInput[],
    assetId: string
  ): Promise<boolean[]> {
    // Get all existing transactions for this asset in the date range
    const dates = transactions.map(t => t.date as Date);
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const existing = await this.prisma.transaction.findMany({
      where: {
        assetId,
        date: {
          gte: minDate,
          lte: maxDate
        }
      },
      select: {
        date: true,
        amount: true,
        description: true
      }
    });

    // Create a Set for faster lookup
    const existingSet = new Set(
      existing.map(e => `${e.date.toISOString()}_${e.amount.toString()}_${e.description}`)
    );

    // Check each transaction
    return transactions.map(t => {
      const key = `${(t.date as Date).toISOString()}_${t.amount.toString()}_${t.description}`;
      return existingSet.has(key);
    });
  }

  private parseDate(dateString: string, format?: string): Date | null {
    try {
      if (!dateString) return null;

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

      if (format) {
        formats.unshift(format);
      }

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

      // Try native Date parsing
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async queueCategorizationJob(importHistoryId: string, organizationId: string) {
    // In a production app, this would queue a job to a background worker
    // For now, we'll just log it
    logger.info(`Queued AI categorization for import ${importHistoryId}`);
    
    // You could implement this with Bull, BullMQ, or another job queue
    // The job would:
    // 1. Get all transactions with needsCategorization: true
    // 2. Batch them and send to AI for categorization
    // 3. Update the transactions with categories and AI metadata
  }
}