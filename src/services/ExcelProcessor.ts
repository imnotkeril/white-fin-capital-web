// src/services/ExcelProcessor.ts - ИСПРАВЛЕН расчет процентов
import * as XLSX from 'xlsx';

export interface TradeRecord {
  ticker: string;
  position: 'Long' | 'Short';
  entryDate: Date;
  avgPrice: number;
  exitDate: Date;
  exitPrice: number;
  pnlPercent: number;  // ✅ Уже в процентах (15.5, не 0.155)
  portfolioExposure: number; // ✅ В долях (0.1, не 10)
  holdingDays: number;
  portfolioImpact: number;
}

export interface BenchmarkPoint {
  date: Date;
  value: number;
  change: number;
  cumulativeReturn: number;
}

export interface LoadedData {
  trades: TradeRecord[];
  benchmark: BenchmarkPoint[];
}

export class ExcelProcessor {
  private static readonly TRADING_FILE = '/data/trading-data.xlsx';
  private static readonly BENCHMARK_FILE = '/data/SP500.xlsx';

  static async loadAllData(): Promise<LoadedData> {
    try {
      console.log('📊 Loading Excel data...');

      const [tradesResult, benchmarkResult] = await Promise.allSettled([
        this.loadTradingData(),
        this.loadBenchmarkData()
      ]);

      const trades = tradesResult.status === 'fulfilled' ? tradesResult.value : [];
      let benchmark = benchmarkResult.status === 'fulfilled' ? benchmarkResult.value : [];

      if (tradesResult.status === 'rejected') {
        console.error('❌ Failed to load trading data:', tradesResult.reason);
      }
      if (benchmarkResult.status === 'rejected') {
        console.warn('⚠️ Failed to load benchmark data:', benchmarkResult.reason);
      }

      if (trades.length > 0 && benchmark.length > 0) {
        benchmark = this.syncBenchmarkToPortfolio(benchmark, trades);
      }

      console.log(`✅ Loaded ${trades.length} trades, ${benchmark.length} benchmark points`);

      return { trades, benchmark };

    } catch (error) {
      console.error('❌ Critical error loading Excel data:', error);
      throw new Error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async loadTradingData(): Promise<TradeRecord[]> {
    const workbook = await this.loadExcelFile(this.TRADING_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    if (!sheet) {
      throw new Error('No sheets found in trading data file');
    }

    const rawData: any[] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: false
    });

    if (rawData.length < 2) {
      throw new Error('Trading data file must have headers and data');
    }

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    console.log(`Found headers: ${headers.join(', ')}`);

    // Маппинг заголовков
    const headerMap = this.createHeaderMap(headers, {
      ticker: ['ticker', 'symbol', 'stock'],
      position: ['position', 'side', 'direction'],
      entryDate: ['entry date', 'entry_date', 'open date'],
      avgPrice: ['avg. price', 'avg price', 'entry price'],
      exitDate: ['exit date', 'exit_date', 'close date'],
      exitPrice: ['exit price', 'close price'],
      pnlPercent: ['pnl %', 'pnl_percent', 'return %'],
      portfolioExposure: ['portfolio exposure', 'exposure', 'size']
    });

    const trades: TradeRecord[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        if (!row || row.every(cell => !cell)) continue;

        const trade = this.parseTradeRow(row, headerMap, i + 2);
        if (trade) {
          trades.push(trade);
        }
      } catch (error) {
        console.warn(`⚠️ Skipping invalid trade at row ${i + 2}:`, error);
      }
    }

    if (trades.length === 0) {
      throw new Error('No valid trades found in Excel file');
    }

    return trades;
  }

  private static async loadBenchmarkData(): Promise<BenchmarkPoint[]> {
    const workbook = await this.loadExcelFile(this.BENCHMARK_FILE);

    const sheetName = workbook.SheetNames.find(name =>
      name.toLowerCase().includes('daily') ||
      name.toLowerCase().includes('close')
    ) || workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    console.log(`Loading benchmark from sheet: ${sheetName}`);

    const rawData: any[] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: null,
      raw: false
    });

    if (rawData.length < 2) {
      throw new Error('Benchmark file must have headers and data');
    }

    const headers = rawData[0] as string[];
    const dataRows = rawData.slice(1);

    const dateCol = this.findColumnIndex(headers, ['date', 'observation_date', 'time']);
    const priceCol = this.findColumnIndex(headers, ['sp500', 'price', 'close', 'value']);

    if (dateCol === -1 || priceCol === -1) {
      throw new Error('Could not find date and price columns in benchmark file');
    }

    const points: BenchmarkPoint[] = [];
    let startValue: number | null = null;

    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        if (!row || !row[dateCol] || !row[priceCol]) continue;

        const date = this.parseDate(row[dateCol], `row ${i + 2}`);
        const value = this.parseNumber(row[priceCol], `row ${i + 2}`);

        if (startValue === null) {
          startValue = value;
        }

        const previousValue = points.length > 0 ? points[points.length - 1].value : startValue;
        const change = ((value - previousValue) / previousValue) * 100;
        const cumulativeReturn = ((value - startValue) / startValue) * 100;

        points.push({
          date,
          value,
          change,
          cumulativeReturn
        });

      } catch (error) {
        console.warn(`⚠️ Skipping invalid benchmark row ${i + 2}:`, error);
      }
    }

    return points.sort((a, b) => a.date.getTime() - b.date.getTime());
  }


  private static syncBenchmarkToPortfolio(benchmarkPoints: BenchmarkPoint[], trades: TradeRecord[]): BenchmarkPoint[] {
    if (trades.length === 0 || benchmarkPoints.length === 0) {
      return benchmarkPoints;
    }

    // ✅ ИСПРАВЛЕНИЕ: Используем entryDate, а не exitDate
    const sortedTrades = [...trades].sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());
    const firstTradeDate = sortedTrades[0].entryDate;

    console.log(`🔄 Syncing benchmark to portfolio start date: ${firstTradeDate.toISOString().split('T')[0]}`);

    // Находим ближайшую точку бенчмарка к дате первого трейда
    let basePoint: BenchmarkPoint | null = null;
    let minDiff = Infinity;

    for (const point of benchmarkPoints) {
      const diff = Math.abs(point.date.getTime() - firstTradeDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        basePoint = point;
      }
    }

    if (!basePoint) {
      console.warn('⚠️ Could not find benchmark base point, using original data');
      return benchmarkPoints;
    }

    const newStartValue = basePoint.value;
    console.log(`📌 New benchmark base: ${basePoint.date.toISOString().split('T')[0]} = ${newStartValue}`);

    // Пересчитываем все cumulativeReturn от новой базовой точки
    const syncedBenchmark = benchmarkPoints.map(point => {
      const newCumulativeReturn = ((point.value - newStartValue) / newStartValue) * 100;

      return {
        ...point,
        cumulativeReturn: newCumulativeReturn
      };
    });

    console.log(`✅ Benchmark synced: first point = 0%, last point = ${syncedBenchmark[syncedBenchmark.length - 1].cumulativeReturn.toFixed(2)}%`);

    return syncedBenchmark;
  }


  private static parseTradeRow(row: any[], headerMap: Record<string, number>, rowNum: number): TradeRecord | null {

    const required = ['ticker', 'position', 'entryDate', 'exitDate', 'pnlPercent'];
    for (const field of required) {
      if (!(field in headerMap) || !row[headerMap[field]]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const entryDate = this.parseDate(row[headerMap.entryDate], 'entry date');
    const exitDate = this.parseDate(row[headerMap.exitDate], 'exit date');


    const pnlPercent = this.parseNumber(row[headerMap.pnlPercent], 'PnL %');


    const portfolioExposure = headerMap.portfolioExposure ?
      this.parsePortfolioExposure(row[headerMap.portfolioExposure], 'exposure') : 0.1;


    const holdingDays = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));


    const portfolioImpact = (pnlPercent / 100) * portfolioExposure;

    console.log(`Trade ${rowNum}: ${pnlPercent}% * ${portfolioExposure} = ${portfolioImpact * 100}% impact`);

    return {
      ticker: String(row[headerMap.ticker]).toUpperCase(),
      position: this.parsePosition(row[headerMap.position]),
      entryDate,
      avgPrice: headerMap.avgPrice ? this.parseNumber(row[headerMap.avgPrice], 'avg price') : 0,
      exitDate,
      exitPrice: headerMap.exitPrice ? this.parseNumber(row[headerMap.exitPrice], 'exit price') : 0,
      pnlPercent,
      portfolioExposure,
      holdingDays,
      portfolioImpact
    };
  }

  /**

   */
  private static parsePortfolioExposure(value: any, context: string): number {
    let numericValue: number;

    if (typeof value === 'number') {
      numericValue = value;
    } else if (typeof value === 'string') {
      const cleaned = value.replace(/[%\s]/g, '');
      numericValue = parseFloat(cleaned);

      if (isNaN(numericValue)) {
        throw new Error(`Cannot parse portfolio exposure "${value}" for ${context}`);
      }
    } else {
      throw new Error(`Invalid portfolio exposure format for ${context}: ${typeof value}`);
    }

    // АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ ФОРМАТА:
    if (numericValue > 1) {
      // Конвертируем проценты в доли: 15.5% -> 0.155
      const asDecimal = numericValue / 100;
      console.log(`🔄 Converting exposure: ${numericValue}% -> ${asDecimal}`);
      return asDecimal;
    } else {
      // Уже в формате долей: 0.155 -> 0.155
      console.log(`✅ Exposure in decimal: ${numericValue}`);
      return numericValue;
    }
  }

  // ============================================
  // УТИЛИТНЫЕ МЕТОДЫ
  // ============================================

  private static async loadExcelFile(filePath: string): Promise<XLSX.WorkBook> {
    const response = await fetch(filePath);

    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return XLSX.read(arrayBuffer, {
      cellStyles: true,
      cellFormulas: true,
      cellDates: true,
      cellNF: true,
      sheetStubs: true
    });
  }

  private static createHeaderMap(headers: string[], mapping: Record<string, string[]>): Record<string, number> {
    const result: Record<string, number> = {};

    for (const [key, alternatives] of Object.entries(mapping)) {
      const index = this.findColumnIndex(headers, alternatives);
      if (index !== -1) {
        result[key] = index;
      }
    }

    return result;
  }

  private static findColumnIndex(headers: string[], alternatives: string[]): number {
    const normalized = headers.map(h => h.toLowerCase().trim());

    for (const alt of alternatives) {
      const index = normalized.findIndex(h => h.includes(alt.toLowerCase()));
      if (index !== -1) return index;
    }

    return -1;
  }

  private static parseDate(value: any, context: string): Date {
    if (value instanceof Date) return value;

    if (typeof value === 'number') {
      // Excel date number
      return new Date((value - 25569) * 86400 * 1000);
    }

    if (typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    throw new Error(`Invalid date for ${context}: ${value}`);
  }

  private static parseNumber(value: any, context: string): number {
    if (typeof value === 'number') return value;

    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.-]/g, '');
      const parsed = parseFloat(cleaned);
      if (!isNaN(parsed)) return parsed;
    }

    throw new Error(`Invalid number for ${context}: ${value}`);
  }

  private static parsePosition(value: any): 'Long' | 'Short' {
    const str = String(value).toLowerCase();
    if (str.includes('long') || str.includes('buy')) return 'Long';
    if (str.includes('short') || str.includes('sell')) return 'Short';
    return 'Long'; // Default
  }
}