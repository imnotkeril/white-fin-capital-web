// Data parser service for trading data
import * as XLSX from 'xlsx';
import {
  RawTradeRecord,
  ProcessedTradeRecord,
  ParsedDataResult,
  ValidationError,
} from '@/types/realData';

export class DataParser {
  private static readonly REQUIRED_FIELDS: (keyof RawTradeRecord)[] = [
    'Ticker',
    'Position',
    'Entry Date',
    'Avg. Price',
    'Exit Date',
    'Exit Price',
    'PnL %',
    'Portfolio Exposure'
  ];

  /**
   * Main method to load trading data from Excel file
   */
  static async loadTradingData(filePath: string = '/data/trading-data.xlsx'): Promise<ParsedDataResult> {
    try {
      console.log(`Loading trading data from: ${filePath}`);

      // Use fetch API for files in public directory
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log(`File loaded successfully, size: ${arrayBuffer.byteLength} bytes`);

      // Parse Excel file
      const workbook = XLSX.read(arrayBuffer, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      if (workbook.SheetNames.length === 0) {
        throw new Error('No sheets found in Excel file');
      }

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      console.log(`Processing sheet: ${firstSheetName}`);

      // Convert to JSON with headers
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        blankrows: false
      });

      if (rawData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      // Extract headers and data
      const headers = rawData[0] as string[];
      const dataRows = rawData.slice(1);

      console.log(`Found ${headers.length} columns and ${dataRows.length} data rows`);
      console.log('Headers:', headers);

      // Convert to objects
      const rawRecords: RawTradeRecord[] = dataRows.map((row: any[], index: number) => {
        const record: any = {};
        headers.forEach((header: string, colIndex: number) => {
          record[header] = row[colIndex];
        });
        return record;
      });

      // Validate and process data
      return this.validateAndProcessData(rawRecords);

    } catch (error) {
      console.error('Error loading trading data:', error);
      throw new Error(`Failed to load trading data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Alias for loadTradingData for backward compatibility
   */
  static async loadData(filePath: string = '/data/trading-data.xlsx'): Promise<ParsedDataResult> {
    return this.loadTradingData(filePath);
  }

  private static validateAndProcessData(rawData: RawTradeRecord[]): ParsedDataResult {
    const errors: ValidationError[] = [];
    const processedData: ProcessedTradeRecord[] = [];
    const seenTrades = new Set<string>();
    let duplicateCount = 0;

    rawData.forEach((raw, index) => {
      const rowNumber = index + 2; // +2 because Excel is 1-indexed and we skip header

      try {
        // Validate required fields
        const validation = this.validateRecord(raw, rowNumber);
        if (validation.length > 0) {
          errors.push(...validation);
          return;
        }

        // Process the record
        const processed = this.processRecord(raw, rowNumber);

        // Check for duplicates
        const tradeKey = `${processed.ticker}-${processed.entryDate.getTime()}-${processed.exitDate.getTime()}`;
        if (seenTrades.has(tradeKey)) {
          duplicateCount++;
          errors.push({
            row: rowNumber,
            field: 'duplicate',
            value: tradeKey,
            error: 'Duplicate trade detected'
          });
          return;
        }

        seenTrades.add(tradeKey);
        processedData.push(processed);

      } catch (error) {
        errors.push({
          row: rowNumber,
          field: 'processing',
          value: raw,
          error: error instanceof Error ? error.message : 'Processing failed'
        });
      }
    });

    console.log(`Processed ${processedData.length} valid trades, ${errors.length} errors`);

    return {
      success: errors.length === 0,
      data: processedData,
      errors,
      summary: {
        totalRows: rawData.length,
        validRows: processedData.length,
        invalidRows: errors.length,
        duplicateRows: duplicateCount
      },
      rawData
    };
  }

  private static validateRecord(record: RawTradeRecord, rowNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check required fields
    this.REQUIRED_FIELDS.forEach(field => {
      if (!record[field] || record[field] === null || record[field] === '') {
        errors.push({
          row: rowNumber,
          field,
          value: record[field],
          error: `Required field '${field}' is missing or empty`
        });
      }
    });

    return errors;
  }

  private static processRecord(raw: RawTradeRecord, rowNumber: number): ProcessedTradeRecord {
    // Parse dates
    const entryDate = this.parseDate(raw['Entry Date'], `Entry Date at row ${rowNumber}`);
    const exitDate = this.parseDate(raw['Exit Date'], `Exit Date at row ${rowNumber}`);

    // Debug logging for problematic rows
    if ([20, 31, 32, 34, 44, 65, 101, 102, 103].includes(rowNumber)) {
      console.log(`Row ${rowNumber} - ${raw.Ticker}: Entry=${entryDate.toISOString().split('T')[0]}, Exit=${exitDate.toISOString().split('T')[0]}`);
    }

    // Validate date order (allow same-day trades)
    if (entryDate > exitDate) {
      throw new Error(`Entry date (${entryDate.toISOString().split('T')[0]}) must be before or equal to exit date (${exitDate.toISOString().split('T')[0]}) at row ${rowNumber}`);
    }

    // Parse numeric values
    const avgPrice = this.parsePrice(raw['Avg. Price'], `Avg. Price at row ${rowNumber}`);
    const exitPrice = this.parsePrice(raw['Exit Price'], `Exit Price at row ${rowNumber}`);
    const pnlPercent = this.parsePercentage(raw['PnL %'], `PnL % at row ${rowNumber}`);
    const portfolioExposure = this.parsePercentage(raw['Portfolio Exposure'], `Portfolio Exposure at row ${rowNumber}`);

    // Parse optional fields with defaults
    const positionHigh = raw['Position High'] ? this.parsePrice(raw['Position High'], `Position High at row ${rowNumber}`) : exitPrice;
    const positionLow = raw['Position Low'] ? this.parsePrice(raw['Position Low'], `Position Low at row ${rowNumber}`) : avgPrice;
    const drawdown = raw['Drawdown'] ? this.parsePercentage(raw['Drawdown'], `Drawdown at row ${rowNumber}`) : 0;
    const runUp = raw['Run Up'] ? this.parsePercentage(raw['Run Up'], `Run Up at row ${rowNumber}`) : pnlPercent;

    // Calculate derived fields
    const holdingDays = Math.floor((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    const absolutePnL = (exitPrice - avgPrice) * (portfolioExposure / 100) * 100; // Simplified calculation
    const portfolioImpact = (pnlPercent * portfolioExposure) / 100;

    return {
      id: `${raw.Ticker}-${entryDate.getTime()}`,
      ticker: String(raw.Ticker).toUpperCase(),
      position: this.parsePosition(raw.Position, `Position at row ${rowNumber}`),
      entryDate,
      avgPrice,
      exitDate,
      exitPrice,
      pnlPercent,
      portfolioExposure,
      source: String(raw.Source || 'Unknown'),
      positionHigh,
      positionLow,
      drawdown,
      runUp,
      holdingDays,
      absolutePnL,
      portfolioImpact
    };
  }

  private static parseDate(value: any, context: string): Date {
    if (!value) {
      throw new Error(`Invalid date value for ${context}`);
    }

    // Handle Excel date objects
    if (value instanceof Date) {
      return value;
    }

    // Handle Excel date numbers (правильная формула)
    if (typeof value === 'number') {
      // Excel date number to JS Date - правильная формула
      const jsDate = new Date((value - 25569) * 86400 * 1000);
      if (isNaN(jsDate.getTime())) {
        throw new Error(`Invalid Excel date number "${value}" for ${context}`);
      }
      return jsDate;
    }

    // Handle string dates
    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        throw new Error(`Cannot parse date "${value}" for ${context}`);
      }
      return parsed;
    }

    throw new Error(`Unsupported date format for ${context}: ${typeof value}`);
  }

  private static parsePrice(value: any, context: string): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      // Remove currency symbols and parse
      const cleaned = value.replace(/[$,\s]/g, '');
      const parsed = parseFloat(cleaned);

      if (isNaN(parsed)) {
        throw new Error(`Cannot parse price "${value}" for ${context}`);
      }

      return parsed;
    }

    throw new Error(`Invalid price format for ${context}: ${typeof value}`);
  }

  private static parsePercentage(value: any, context: string): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      // Remove % symbol and parse
      const cleaned = value.replace(/%/g, '');
      const parsed = parseFloat(cleaned);

      if (isNaN(parsed)) {
        throw new Error(`Cannot parse percentage "${value}" for ${context}`);
      }

      return parsed;
    }

    throw new Error(`Invalid percentage format for ${context}: ${typeof value}`);
  }

  private static parsePosition(value: any, context: string): 'LONG' | 'SHORT' {
    const position = String(value).toUpperCase().trim();

    if (position === 'LONG' || position === 'SHORT') {
      return position;
    }

    throw new Error(`Invalid position "${value}" for ${context}. Must be LONG or SHORT`);
  }
}

export default DataParser;