import { Router, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ImportService } from '../services/import/import.service';
import { FastImportService } from '../services/import/fast-import.service';
import { csvParser } from '../services/import/csv-parser';
import { excelParser } from '../services/import/excel-parser';
import prisma from '../lib/prisma';

const router = Router();
const importService = new ImportService(prisma);
const fastImportService = new FastImportService(prisma);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/octet-stream' // Some browsers send this for CSV files
    ];
    
    if (allowedTypes.includes(file.mimetype) || 
        file.originalname.endsWith('.csv') || 
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  }
});

// Validation schemas
const columnMappingSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.string(),
  currency: z.string().optional(),
  category: z.string().optional(),
  type: z.string().optional()
});

const importOptionsSchema = z.object({
  assetId: z.string(),
  columnMapping: columnMappingSchema,
  dateFormat: z.string().optional(),
  skipDuplicates: z.boolean().optional().default(true),
  sheetName: z.string().optional()
});

// Preview file endpoint
router.post('/import/preview', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    let headers: string[] = [];
    let preview: Record<string, any>[] = [];
    let sheets: string[] = [];

    if (isExcel) {
      sheets = await excelParser.getSheetNames(fileBuffer);
      const sheetName = req.body.sheetName || sheets[0];
      headers = await excelParser.detectColumns(fileBuffer, { sheetName });
      preview = await excelParser.previewRows(fileBuffer, 10, { sheetName });
    } else {
      headers = await csvParser.detectColumns(fileBuffer);
      preview = await csvParser.previewRows(fileBuffer, 10);
    }

    res.json({
      fileName,
      fileType: isExcel ? 'excel' : 'csv',
      headers,
      preview,
      sheets: isExcel ? sheets : undefined,
      suggestedMapping: suggestColumnMapping(headers)
    });
  } catch (error: any) {
    console.error('File preview error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Import file endpoint
router.post('/import/process', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse columnMapping if it's a string
    const columnMapping = typeof req.body.columnMapping === 'string' 
      ? JSON.parse(req.body.columnMapping) 
      : req.body.columnMapping;
    
    // Parse skipDuplicates to boolean
    const skipDuplicates = req.body.skipDuplicates === 'true' || req.body.skipDuplicates === true;

    // Validate request body with parsed values
    const options = importOptionsSchema.parse({
      ...req.body,
      columnMapping,
      skipDuplicates
    });

    // Check asset ownership
    const asset = await prisma.asset.findFirst({
      where: {
        id: options.assetId,
        organizationId: req.user!.organizationId
      }
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    let result;
    
    // Use fast import for better performance
    if (isExcel) {
      result = await fastImportService.importFromExcel(
        fileBuffer,
        fileName,
        req.user!.id,
        req.user!.organizationId,
        options
      );
    } else {
      result = await fastImportService.importFromCSV(
        fileBuffer,
        fileName,
        req.user!.id,
        req.user!.organizationId,
        options
      );
    }

    res.json({
      success: true,
      importId: result.importHistory.id,
      totalRows: result.successCount + result.failedCount,
      successfulRows: result.successCount,
      failedRows: result.failedCount,
      errors: result.errors
    });
  } catch (error: any) {
    console.error('Import error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get import history
router.get('/import/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const history = await importService.getImportHistory(
      req.user!.organizationId,
      req.user!.id,
      limit
    );

    res.json(history);
  } catch (error) {
    console.error('Get import history error:', error);
    res.status(500).json({ error: 'Failed to fetch import history' });
  }
});

// Get import details
router.get('/import/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const importHistory = await prisma.importHistory.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId
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
        transactions: {
          take: 100,
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!importHistory) {
      return res.status(404).json({ error: 'Import not found' });
    }

    res.json(importHistory);
  } catch (error) {
    console.error('Get import details error:', error);
    res.status(500).json({ error: 'Failed to fetch import details' });
  }
});

// Helper function to suggest column mapping
function suggestColumnMapping(headers: string[]): Partial<Record<string, string>> {
  const mapping: Partial<Record<string, string>> = {};
  
  const datePatterns = /date|time|when/i;
  const descriptionPatterns = /description|desc|detail|particular|narration|memo/i;
  const amountPatterns = /amount|value|total|balance|credit|debit/i;
  const currencyPatterns = /currency|curr|ccy/i;
  const categoryPatterns = /category|cat|type|class/i;
  const typePatterns = /type|credit|debit|dr|cr/i;

  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim();
    
    if (datePatterns.test(normalizedHeader) && !mapping.date) {
      mapping.date = header;
    } else if (descriptionPatterns.test(normalizedHeader) && !mapping.description) {
      mapping.description = header;
    } else if (amountPatterns.test(normalizedHeader) && !mapping.amount) {
      mapping.amount = header;
    } else if (currencyPatterns.test(normalizedHeader) && !mapping.currency) {
      mapping.currency = header;
    } else if (categoryPatterns.test(normalizedHeader) && !mapping.category) {
      mapping.category = header;
    } else if (typePatterns.test(normalizedHeader) && !mapping.type) {
      mapping.type = header;
    }
  }

  return mapping;
}

export default router;