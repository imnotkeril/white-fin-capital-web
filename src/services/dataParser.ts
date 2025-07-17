// Data parser service for trading data
import * as XLSX from 'xlsx';
import {
  RawTradeRecord,
  ProcessedTradeRecord,
  ParsedDataResult,
  ValidationError,
  ValidationSchema
} from '@/types/realData';
import { generateUUID } from '@/utils/helpers';

export class DataParser {
  private static validationSchema: ValidationSchema = {
    requiredFields: [
      'Ticker',
      'Position',
      'Entry Date',
      'Avg. Price',
      'Exit Date',
      'Exit Price',
      'PnL %',
      'Portfolio Exposure'
    ],
    fieldValidators: {
      'Ticker': (value) => {
        if (!value || typeof value !== 'string') {
          return { row: 0, field: 'Ticker', value, error: 'Ticker must be a non-empty string' };
        }
        if (value.length > 10) {
          return { row: 0, field: 'Ticker', value, error: 'Ticker must be 10 characters or less' };
        }
        return null;
      },
      'Position': (value) => {
        if (!value || !['LONG', 'SHORT'].includes(value.toString().toUpperCase())) {
          return { row: 0, field: 'Position', value, error: 'Position must be LONG or SHORT' };
        }
        return null;
      },
      'Portfolio Exposure': (value) => {
        const numValue = DataParser.parsePercentage(value);
        if (numValue === null || numValue < 0 || numValue > 100) {
          return { row: 0, field: 'Portfolio Exposure', value, error: 'Portfolio Exposure must be between 0% and 100%' };
        }
        return null;
      }
    }
  };

  /**
   * Parse Excel file and extract trading data
   */
  static async parseExcelFile(filePath: string): Promise<ParsedDataResult> {
    try {
      // Read Excel file
      const response = await window.fs.readFile(filePath);
      const workbook = XLSX.read(response, {
        cellDates: true,
        cellNF: false,
        cellText: false
      });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const rawData: RawTradeRecord[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        blankrows: false
      });

      return this.processRawData(rawData);

    } catch (error) {
      console.error('Error parsing Excel file:', error);
      return {
        success: false,
        data: [],
        errors: [{
          row: 0,
          field: 'file',
          value: filePath,
          error: `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        summary: {
          totalRows: 0,
          validRows: 0,
          invalidRows: 0,
          duplicateRows: 0
        },
        rawData: []
      };
    }
  }

  /**
   * Process raw data from Excel/CSV
   */
  static processRawData(rawData: RawTradeRecord[]): ParsedDataResult {
    const errors: ValidationError[] = [];
    const processedData: ProcessedTradeRecord[] = [];
    const duplicateChecker = new Set<string>();
    let duplicateRows = 0;

    rawData.forEach((row, index) => {
      try {
        // Validate required fields
        const rowErrors = this.validateRow(row, index + 2); // +2 because Excel starts from 1 and has header
        if (rowErrors.length > 0) {
          errors.push(...rowErrors);
          return;
        }

        // Check for duplicates (same ticker, entry date, exit date)
        const duplicateKey = `${row.Ticker}-${row['Entry Date']}-${row['Exit Date']}`;
        if (duplicateChecker.has(duplicateKey)) {
          duplicateRows++;
          errors.push({
            row: index + 2,
            field: 'duplicate',
            value: duplicateKey,
            error: 'Duplicate trade record'
          });
          return;
        }
        duplicateChecker.add(duplicateKey);

        // Process the row
        const processedRow = this.processTradeRecord(row, index + 2);
        if (processedRow) {
          processedData.push(processedRow);
        }

      } catch (error) {
        errors.push({
          row: index + 2,
          field: 'processing',
          value: row,
          error: `Error processing row: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    });

    // Sort by exit date
    processedData.sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());

    return {
      success: errors.length === 0,
      data: processedData,
      errors,
      summary: {
        totalRows: rawData.length,
        validRows: processedData.length,
        invalidRows: errors.length,
        duplicateRows
      },
      rawData
    };
  }

  /**
   * Validate a single row of data
   */
  private static validateRow(row: RawTradeRecord, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check required fields
    this.validationSchema.requiredFields.forEach(field => {
      const value = row[field];
      if (value === null || value === undefined || value === '') {
        errors.push({
          row: rowNumber,
          field,
          value,
          error: `${field} is required`
        });
      }
    });

    // Run field validators
    Object.entries(this.validationSchema.fieldValidators).forEach(([field, validator]) => {
      const value = row[field as keyof RawTradeRecord];
      const error = validator(value);
      if (error) {
        errors.push({
          ...error,
          row: rowNumber
        });
      }
    });

    // Validate dates
    const entryDate = this.parseDate(row['Entry Date']);
    const exitDate = this.parseDate(row['Exit Date']);

    if (!entryDate) {
      errors.push({
        row: rowNumber,
        field: 'Entry Date',
        value: row['Entry Date'],
        error: 'Invalid entry date format'
      });
    }

    if (!exitDate) {
      errors.push({
        row: rowNumber,
        field: 'Exit Date',
        value: row['Exit Date'],
        error: 'Invalid exit date format'
      });
    }

    if (entryDate && exitDate && exitDate <= entryDate) {
      errors.push({
        row: rowNumber,
        field: 'Exit Date',
        value: row['Exit Date'],
        error: 'Exit date must be after entry date'
      });
    }

    // Validate prices
    const avgPrice = this.parsePrice(row['Avg. Price']);
    const exitPrice = this.parsePrice(row['Exit Price']);

    if (avgPrice === null || avgPrice <= 0) {
      errors.push({
        row: rowNumber,
        field: 'Avg. Price',
        value: row['Avg. Price'],
        error: 'Average price must be a positive number'
      });
    }

    if (exitPrice === null || exitPrice <= 0) {
      errors.push({
        row: rowNumber,
        field: 'Exit Price',
        value: row['Exit Price'],
        error: 'Exit price must be a positive number'
      });
    }

    return errors;
  }

  /**
   * Process a single trade record
   */
  private static processTradeRecord(row: RawTradeRecord, rowNumber: number): ProcessedTradeRecord | null {
    try {
      const entryDate = this.parseDate(row['Entry Date'])!;
      const exitDate = this.parseDate(row['Exit Date'])!;
      const avgPrice = this.parsePrice(row['Avg. Price'])!;
      const exitPrice = this.parsePrice(row['Exit Price'])!;
      const pnlPercent = this.parsePercentage(row['PnL %'])!;
      const portfolioExposure = this.parsePercentage(row['Portfolio Exposure'])!;
      const positionHigh = this.parsePrice(row['Position High']) || exitPrice;
      const positionLow = this.parsePrice(row['Position Low']) || avgPrice;
      const drawdown = this.parsePercentage(row['Drawdown']) || 0;
      const runUp = this.parsePercentage(row['Run Up']) || 0;

      const holdingDays = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      const absolutePnL = (exitPrice - avgPrice) / avgPrice * 100;
      const portfolioImpact = (pnlPercent * portfolioExposure) / 100;

      return {
        id: generateUUID(),
        ticker: row.Ticker.toString().toUpperCase().trim(),
        position: row.Position.toString().toUpperCase() as 'LONG' | 'SHORT',
        entryDate,
        avgPrice,
        exitDate,
        exitPrice,
        pnlPercent,
        portfolioExposure,
        source: row.Source?.toString() || 'Unknown',
        positionHigh,
        positionLow,
        drawdown,
        runUp,
        holdingDays,
        absolutePnL,
        portfolioImpact
      };

    } catch (error) {
      console.error(`Error processing row ${rowNumber}:`, error);
      return null;
    }
  }

  /**
   * Parse date from various formats
   */
  private static parseDate(value: any): Date | null {
    if (!value) return null;

    // If already a Date object
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    // If string, try to parse
    if (typeof value === 'string') {
      // Handle Excel date serial numbers
      if (/^\d+(\.\d+)?$/.test(value)) {
        const excelDate = new Date((parseInt(value) - 25569) * 86400 * 1000);
        return isNaN(excelDate.getTime()) ? null : excelDate;
      }

      // Standard date parsing
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }

    // If number (Excel serial date)
    if (typeof value === 'number') {
      const excelDate = new Date((value - 25569) * 86400 * 1000);
      return isNaN(excelDate.getTime()) ? null : excelDate;
    }

    return null;
  }

  /**
   * Parse price from string (remove $ and commas)
   */
  private static parsePrice(value: any): number | null {
    if (typeof value === 'number') return value;
    if (!value) return null;

    const stringValue = value.toString().replace(/[$,\s]/g, '');
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Parse percentage from string (remove % and convert to number)
   */
  private static parsePercentage(value: any): number | null {
    if (typeof value === 'number') return value;
    if (!value) return null;

    const stringValue = value.toString().replace(/[%\s]/g, '');
    const parsed = parseFloat(stringValue);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Get data file path
   */
  static getDataFilePath(): string {
    return '/data/trading-data.xlsx';
  }

  /**
   * Load and parse data file
   */
  static async loadData(): Promise<ParsedDataResult> {
    const filePath = this.getDataFilePath();
    return this.parseExcelFile(filePath);
  }
}