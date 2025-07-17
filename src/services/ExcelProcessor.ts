// src/services/ExcelProcessor.ts - ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ ФАЙЛ
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
  private static readonly BENCHMARK_FILE = '/SP500.xlsx';  // ✅ Файл в корне public/

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
    console.log('📊 Loading benchmark data from SP500.xlsx...');

    try {
      // ✅ Используем исправленный метод загрузки
      const workbook = await this.loadExcelFile(this.BENCHMARK_FILE);

      console.log(`📋 Available sheets: ${workbook.SheetNames.join(', ')}`);

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      if (!sheet) {
        throw new Error('No sheets found in benchmark file');
      }

      console.log(`📊 Processing sheet: ${sheetName}`);

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

      console.log(`📋 Headers: ${headers.join(', ')}`);
      console.log(`📊 Data rows: ${dataRows.length}`);

      const points: BenchmarkPoint[] = [];
      let startValue: number | null = null;

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];

        if (!row || !row[0] || !row[1]) {
          continue;
        }

        try {
          const dateStr = row[0].toString();
          const value = parseFloat(row[1].toString());

          if (isNaN(value)) {
            continue;
          }

          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            continue;
          }

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

      const sortedPoints = points.sort((a, b) => a.date.getTime() - b.date.getTime());

      console.log(`✅ Loaded ${sortedPoints.length} benchmark points`);

      if (sortedPoints.length > 0) {
        const first = sortedPoints[0];
        const last = sortedPoints[sortedPoints.length - 1];

        console.log(`📅 Period: ${first.date.toISOString().split('T')[0]} → ${last.date.toISOString().split('T')[0]}`);
        console.log(`📊 Values: ${first.value} → ${last.value}`);
        console.log(`📈 Total return: ${last.cumulativeReturn.toFixed(2)}%`);
      }

      return sortedPoints;

    } catch (error) {
      console.error('❌ Error loading benchmark data:', error);
      return [];
    }
  }

  private static syncBenchmarkToPortfolio(benchmarkPoints: BenchmarkPoint[], trades: TradeRecord[]): BenchmarkPoint[] {
    if (trades.length === 0 || benchmarkPoints.length === 0) {
      console.warn('⚠️ No trades or benchmark data available for sync');
      return benchmarkPoints;
    }

    console.log(`📊 Input: ${benchmarkPoints.length} benchmark points, ${trades.length} trades`);

    // Получаем диапазон дат трейдов
    const sortedTradesByEntry = [...trades].sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());
    const sortedTradesByExit = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());

    const portfolioStartDate = sortedTradesByEntry[0].entryDate;
    const portfolioEndDate = sortedTradesByExit[sortedTradesByExit.length - 1].exitDate;

    console.log(`📅 Portfolio period: ${portfolioStartDate.toISOString().split('T')[0]} → ${portfolioEndDate.toISOString().split('T')[0]}`);

    // Найдем ближайшую точку бенчмарка к началу периода
    let basePoint: BenchmarkPoint | null = null;
    let minDiff = Infinity;

    for (const point of benchmarkPoints) {
      const diff = Math.abs(point.date.getTime() - portfolioStartDate.getTime());
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
    console.log(`📌 Benchmark base: ${basePoint.date.toISOString().split('T')[0]} = ${newStartValue}`);

    // ✅ НЕ фильтруем данные, а только пересчитываем cumulativeReturn
    const syncedBenchmark = benchmarkPoints.map(point => {
      const newCumulativeReturn = ((point.value - newStartValue) / newStartValue) * 100;

      return {
        ...point,
        cumulativeReturn: newCumulativeReturn
      };
    });

    console.log(`✅ Benchmark synced: ${syncedBenchmark.length} points processed`);

    if (syncedBenchmark.length > 0) {
      // Найдем первую и последнюю точки в диапазоне портфеля для логирования
      const relevantPoints = syncedBenchmark.filter(p =>
        p.date >= portfolioStartDate && p.date <= portfolioEndDate
      );

      console.log(`📊 Points in portfolio period: ${relevantPoints.length}`);

      if (relevantPoints.length > 0) {
        const firstRelevant = relevantPoints[0];
        const lastRelevant = relevantPoints[relevantPoints.length - 1];
        console.log(`   First: ${firstRelevant.date.toISOString().split('T')[0]} = ${firstRelevant.cumulativeReturn.toFixed(2)}%`);
        console.log(`   Last:  ${lastRelevant.date.toISOString().split('T')[0]} = ${lastRelevant.cumulativeReturn.toFixed(2)}%`);
      }
    }

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

  // ✅ ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ метод загрузки через fetch
  private static async loadExcelFile(filename: string): Promise<XLSX.WorkBook> {
    try {
      console.log(`📂 Loading Excel file via fetch: ${filename}`);

      const response = await fetch(filename);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      console.log(`✅ Successfully loaded: ${filename}`);
      return workbook;

    } catch (error) {
      console.error(`❌ Failed to load ${filename}:`, error);
      throw new Error(`Failed to load ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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