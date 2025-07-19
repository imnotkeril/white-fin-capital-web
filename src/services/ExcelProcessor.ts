// src/services/ExcelProcessor.ts - ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ ФАЙЛ
import * as XLSX from 'xlsx';

export interface TradeRecord {
  ticker: string;
  position: 'Long' | 'Short';
  entryDate: Date;
  avgPrice: number;
  exitDate: Date;
  exitPrice: number;
  pnlPercent: number;
  portfolioExposure: number;
  holdingDays: number;
  portfolioImpact: number;
  // ✅ ДОБАВИТЬ ЭТИ ПОЛЯ:
  positionHigh?: number;
  positionLow?: number;
  drawdown?: number;
  runUp?: number;
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
  // ✅ ИСПРАВЛЕНО: Поддержка CSV и Excel файлов
  private static readonly TRADING_FILE_XLSX = '/data/trading-data.xlsx';
  private static readonly TRADING_FILE_CSV = '/data/tradingdata.csv';
  private static readonly BENCHMARK_FILE_XLSX = '/data/SP500.xlsx';
  private static readonly BENCHMARK_FILE_CSV = '/data/SP500.csv';

  static async loadAllData(): Promise<LoadedData> {
    try {
      console.log('📊 Loading data (CSV/Excel support)...');

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
      console.error('❌ Critical error loading data:', error);
      throw new Error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ✅ ИСПРАВЛЕНО: Попытка загрузить сначала CSV, потом Excel
  private static async loadTradingData(): Promise<TradeRecord[]> {
    // Сначала пробуем CSV
    try {
      console.log('📂 Trying to load trading data from CSV...');
      return await this.loadTradingDataFromCSV();
    } catch (csvError) {
      console.log('📂 CSV failed, trying Excel...', csvError);

      // Если CSV не удался, пробуем Excel
      try {
        return await this.loadTradingDataFromExcel();
      } catch (excelError) {
        throw new Error(`Failed to load trading data from both CSV and Excel: ${csvError}, ${excelError}`);
      }
    }
  }

  // ✅ НОВЫЙ МЕТОД: Загрузка трейдов из CSV
  private static async loadTradingDataFromCSV(): Promise<TradeRecord[]> {
    const fileContent = await this.loadTextFile(this.TRADING_FILE_CSV);
    const lines = fileContent.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new Error('CSV file must have headers and data');
    }

    const trades: TradeRecord[] = [];

    // Пропускаем заголовок (первая строка)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const parts = line.split(';');
      if (parts.length < 8) continue;

      try {
        const ticker = parts[0]?.trim();
        const position = parts[1]?.trim();
        const entryDate = this.parseCSVDate(parts[2]?.trim() || '01.01.2020');
        const avgPrice = this.parseCSVNumber(parts[3]?.trim() || '0');
        const exitDate = this.parseCSVDate(parts[4]?.trim() || '01.01.2020');
        const exitPrice = this.parseCSVNumber(parts[5]?.trim() || '0');
        const pnlPercent = this.parseCSVNumber((parts[6]?.trim() || '0').replace('%', ''));
        const portfolioExposure = this.parseCSVNumber((parts[7]?.trim() || '0').replace('%', '')) / 100;

        // Проверить все parts перед использованием:
        if (!ticker || !position || !entryDate || avgPrice === null || !exitDate || exitPrice === null || pnlPercent === null) {
          continue;
        }

        if (isNaN(entryDate.getTime()) || isNaN(exitDate.getTime()) ||
            isNaN(pnlPercent) || isNaN(portfolioExposure)) {
          console.warn(`⚠️ Skipping invalid CSV trade at line ${i + 1}`);
          continue;
        }

        const holdingDays = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        const portfolioImpact = (pnlPercent / 100) * portfolioExposure;

        const positionHigh = parts.length > 9 ? this.parseCSVNumber(parts[9]?.trim() || '0') : avgPrice;
        const positionLow = parts.length > 10 ? this.parseCSVNumber(parts[10]?.trim() || '0') : avgPrice;
        const drawdown = parts.length > 11 ? this.parseCSVNumber(parts[11]?.trim()?.replace('%', '') || '0') : 0;
        const runUp = parts.length > 12 ? this.parseCSVNumber(parts[12]?.trim()?.replace('%', '') || '0') : 0;

        trades.push({
          ticker: ticker.toUpperCase(),
          position: position.toUpperCase() === 'LONG' ? 'Long' : 'Short',
          entryDate,
          avgPrice,
          exitDate,
          exitPrice,
          pnlPercent,
          portfolioExposure,
          holdingDays,
          portfolioImpact,
          // ✅ ДОБАВИТЬ НОВЫЕ ПОЛЯ:
          positionHigh,
          positionLow,
          drawdown,
          runUp
        });
        console.log(`[DEBUG] Trade ${i}: ${ticker} - PnL: ${pnlPercent}%, Exp: ${portfolioExposure}, Impact: ${portfolioImpact}`);
        console.log(`✅ CSV Trade ${i}: ${ticker} ${pnlPercent}% * ${portfolioExposure} = ${portfolioImpact * 100}% impact`);

      } catch (error) {
        console.warn(`⚠️ Skipping invalid CSV trade at line ${i + 1}:`, error);
      }
    }

    if (trades.length === 0) {
      throw new Error('No valid trades found in CSV file');
    }

    console.log(`✅ Loaded ${trades.length} trades from CSV`);
    return trades.sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());
  }

  // ✅ ПЕРЕИМЕНОВАННЫЙ МЕТОД: Загрузка трейдов из Excel
  private static async loadTradingDataFromExcel(): Promise<TradeRecord[]> {
    const workbook = await this.loadExcelFile(this.TRADING_FILE_XLSX);
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error('No sheets found');
    const sheet = workbook.Sheets[firstSheetName];

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
      portfolioExposure: ['portfolio exposure', 'exposure', 'size'],
      // ✅ ДОБАВИТЬ НОВЫЕ ПОЛЯ:
      positionHigh: ['position high', 'high', 'max price'],
      positionLow: ['position low', 'low', 'min price'],
      drawdown: ['drawdown', 'dd', 'max dd'],
      runUp: ['run up', 'runup', 'max gain']
    });

    const trades: TradeRecord[] = [];

    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        if (!row || row.every((cell: any) => !cell)) continue;

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

  // ✅ ИСПРАВЛЕНО: Попытка загрузить сначала CSV, потом Excel для benchmark
  private static async loadBenchmarkData(): Promise<BenchmarkPoint[]> {
    console.log('📊 Loading benchmark data (CSV/Excel support)...');

    // Сначала пробуем CSV
    try {
      return await this.loadBenchmarkDataFromCSV();
    } catch (csvError) {
      console.log('📂 CSV failed, trying Excel...', csvError);

      // Если CSV не удался, пробуем Excel
      try {
        return await this.loadBenchmarkDataFromExcel();
      } catch (excelError) {
        console.warn(`⚠️ Failed to load benchmark from both sources: ${csvError}, ${excelError}`);
        return [];
      }
    }
  }

  // ✅ НОВЫЙ МЕТОД: Загрузка S&P 500 из CSV
  private static async loadBenchmarkDataFromCSV(): Promise<BenchmarkPoint[]> {
    const fileContent = await this.loadTextFile(this.BENCHMARK_FILE_CSV);
    const lines = fileContent.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const points: BenchmarkPoint[] = [];
    let startValue: number | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const parts = line.split(';');
      if (parts.length !== 2) continue;

      const [dateStr, valueStr] = parts;
      if (!dateStr || !valueStr) continue;

      try {
        const date = this.parseCSVDate(dateStr);
        const value = this.parseCSVNumber(valueStr.replace(',', '.'));

        if (isNaN(date.getTime()) || isNaN(value)) continue;

        if (startValue === null) {
          startValue = value;
        }

        const previousValue = points.length > 0 ? points[points.length - 1]?.value || startValue : startValue;
        const change = ((value - previousValue) / previousValue) * 100;
        const cumulativeReturn = ((value - startValue) / startValue) * 100;

        points.push({
          date,
          value,
          change,
          cumulativeReturn
        });

      } catch (error) {
        console.warn(`⚠️ Skipping invalid CSV benchmark row ${i + 1}:`, error);
      }
    }

    const sortedPoints = points.sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log(`✅ Loaded ${sortedPoints.length} benchmark points from CSV`);

    if (sortedPoints.length > 0) {
      const first = sortedPoints[0];
      const last = sortedPoints[sortedPoints.length - 1];
      console.log(`📅 S&P 500 Period: ${first?.date.toISOString().split('T')[0]} → ${last?.date.toISOString().split('T')[0]}`);
      console.log(`📊 S&P 500 Values: ${first?.value} → ${last?.value}`);
      console.log(`📈 S&P 500 Total return: ${last?.cumulativeReturn.toFixed(2)}%`);
    }

    return sortedPoints;
  }

  // ✅ ПЕРЕИМЕНОВАННЫЙ МЕТОД: Загрузка S&P 500 из Excel
  private static async loadBenchmarkDataFromExcel(): Promise<BenchmarkPoint[]> {
    console.log('📊 Loading benchmark data from SP500.xlsx...');

    try {
      const workbook = await this.loadExcelFile(this.BENCHMARK_FILE_XLSX);

      console.log(`📋 Available sheets: ${workbook.SheetNames.join(', ')}`);

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName!];

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

          const previousValue = points.length > 0 ? points[points.length - 1]?.value || startValue : startValue;
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

        console.log(`📅 Period: ${first?.date.toISOString().split('T')[0]} → ${last?.date.toISOString().split('T')[0]}`);
        console.log(`📊 Values: ${first?.value} → ${last?.value}`);
        console.log(`📈 Total return: ${last?.cumulativeReturn.toFixed(2)}%`);
      }

      return sortedPoints;

    } catch (error) {
      console.error('❌ Error loading benchmark data:', error);
      return [];
    }
  }

  // ✅ ИСПРАВЛЕННАЯ СИНХРОНИЗАЦИЯ: Начинается с 0%
  private static syncBenchmarkToPortfolio(benchmarkPoints: BenchmarkPoint[], trades: TradeRecord[]): BenchmarkPoint[] {
    if (trades.length === 0 || benchmarkPoints.length === 0) {
      console.warn('⚠️ No trades or benchmark data available for sync');
      return benchmarkPoints;
    }

    console.log(`📊 Syncing benchmark: ${benchmarkPoints.length} points, ${trades.length} trades`);

    // Находим дату первого трейда (entry, не exit!)
    const sortedTradesByEntry = [...trades].sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());
    const sortedTradesByExit = [...trades].sort((a, b) => a.exitDate.getTime() - b.exitDate.getTime());

    const portfolioStartDate = sortedTradesByEntry[0]?.entryDate;
    const portfolioEndDate = sortedTradesByExit[sortedTradesByExit.length - 1]?.exitDate;
    if (!portfolioStartDate || !portfolioEndDate) return benchmarkPoints;

    console.log(`📅 Portfolio period: ${portfolioStartDate.toISOString().split('T')[0]} → ${portfolioEndDate.toISOString().split('T')[0]}`);

    // Найдем ближайшую точку бенчмарка к началу торговли портфеля
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

    // ✅ ИСПРАВЛЕНО: Пересчитываем cumulativeReturn от базовой точки (начинаем с 0%)
    const syncedBenchmark = benchmarkPoints.map(point => {
      const newCumulativeReturn = ((point.value - newStartValue) / newStartValue) * 100;
      return {
        ...point,
        cumulativeReturn: newCumulativeReturn
      };
    });

    console.log(`✅ Benchmark synced: ${syncedBenchmark.length} points processed`);

    if (syncedBenchmark.length > 0) {
      const relevantPoints = syncedBenchmark.filter(p =>
        p.date >= portfolioStartDate && p.date <= portfolioEndDate
      );

      console.log(`📊 Points in portfolio period: ${relevantPoints.length}`);

      if (relevantPoints.length > 0) {
        const firstRelevant = relevantPoints[0];
        const lastRelevant = relevantPoints[relevantPoints.length - 1];
        console.log(`   First: ${firstRelevant?.date.toISOString().split('T')[0]} = ${firstRelevant?.cumulativeReturn.toFixed(2)}%`);
        console.log(`   Last:  ${lastRelevant?.date.toISOString().split('T')[0]} = ${lastRelevant?.cumulativeReturn.toFixed(2)}%`);
      }
    }

    return syncedBenchmark;
  }

  static resyncBenchmarkAfterFiltering(
    benchmarkPoints: BenchmarkPoint[],
    filteredTrades: TradeRecord[]
  ): BenchmarkPoint[] {
    if (filteredTrades.length === 0 || benchmarkPoints.length === 0) {
      console.warn('⚠️ No filtered trades or benchmark data for resync');
      return benchmarkPoints;
    }

    console.log(`🔄 Resyncing benchmark for ${filteredTrades.length} filtered trades`);

    const sortedFilteredTrades = [...filteredTrades].sort((a, b) => a.entryDate.getTime() - b.entryDate.getTime());
    const firstFilteredTradeDate = sortedFilteredTrades[0]?.entryDate;
    if (!firstFilteredTradeDate) return benchmarkPoints;

    const originalFirstTrade = new Date('2024-01-03');
    const timeDiff = Math.abs(firstFilteredTradeDate.getTime() - originalFirstTrade.getTime());

    if (timeDiff < 24 * 60 * 60 * 1000) {
      console.log('🚫 Skipping resync - filtered period starts with same trade as full portfolio');
      return benchmarkPoints;
    }

    console.log(`📅 First filtered trade date: ${firstFilteredTradeDate.toISOString().split('T')[0]}`);

    // Найти ближайшую точку бенчмарка к дате первого отфильтрованного трейда
    let basePoint: BenchmarkPoint | null = null;
    let minDiff = Infinity;

    for (const point of benchmarkPoints) {
      const diff = Math.abs(point.date.getTime() - firstFilteredTradeDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        basePoint = point;
      }
    }

    if (!basePoint) {
      console.warn('⚠️ Could not find benchmark base point for filtered period');
      return benchmarkPoints;
    }

    const newStartValue = basePoint.value;
    console.log(`📌 New benchmark base for filtered period: ${basePoint.date.toISOString().split('T')[0]} = ${newStartValue}`);

    // Пересчитать все cumulativeReturn от новой базовой точки
    const resyncedBenchmark = benchmarkPoints.map(point => {
      const newCumulativeReturn = ((point.value - newStartValue) / newStartValue) * 100;

      return {
        ...point,
        cumulativeReturn: newCumulativeReturn
      };
    });

    // Логирование результата
    const relevantPoints = resyncedBenchmark.filter(p => p.date >= firstFilteredTradeDate);
    if (relevantPoints.length > 0) {
      const lastRelevant = relevantPoints[relevantPoints.length - 1];
      console.log(`✅ Resynced benchmark: 0% → ${lastRelevant?.cumulativeReturn.toFixed(2)}%`);
    }

    return resyncedBenchmark;
  }

  // ✅ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ для парсинга CSV
  private static parseCSVDate(dateStr: string): Date {
    // Ожидаем формат DD.MM.YYYY
    const [day, month, year] = dateStr.split('.').map(x => parseInt(x));
    return new Date(year || 2020, (month || 1) - 1, day || 1);
  }

  private static parseCSVNumber(str: string): number {
    // Убираем символы валют, пробелы и заменяем запятую на точку
    const cleaned = str.replace(/[$€£¥₽\s]/g, '').replace(',', '.');
    return parseFloat(cleaned);
  }

  private static async loadTextFile(filename: string): Promise<string> {
    try {
      console.log(`📂 Loading text file: ${filename}`);
      const response = await fetch(filename);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const text = await response.text();
      console.log(`✅ Successfully loaded: ${filename} (${text.length} chars)`);
      return text;

    } catch (error) {
      console.error(`❌ Failed to load ${filename}:`, error);
      throw new Error(`Failed to load ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static parseTradeRow(row: any[], headerMap: Record<string, number>, rowNum: number): TradeRecord | null {
    const required = ['ticker', 'position', 'entryDate', 'exitDate', 'pnlPercent'];
    for (const field of required) {
      if (!(field in headerMap) || !row[headerMap[field]!]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const entryDate = this.parseDate(row[headerMap.entryDate!], 'entry date');
    const exitDate = this.parseDate(row[headerMap.exitDate!], 'exit date');
    const pnlPercent = this.parseNumber(row[headerMap.pnlPercent!], 'PnL %');
    const portfolioExposure = headerMap.portfolioExposure ?
      this.parsePortfolioExposure(row[headerMap.portfolioExposure], 'exposure') : 0.1;

    const holdingDays = Math.ceil((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    const portfolioImpact = (pnlPercent / 100) * portfolioExposure;

    console.log(`Trade ${rowNum}: ${pnlPercent}% * ${portfolioExposure} = ${portfolioImpact * 100}% impact`);


    const avgPrice = headerMap.avgPrice ? this.parseNumber(row[headerMap.avgPrice], 'avg price') : 0;
    const positionHigh = headerMap.positionHigh ?
      this.parseNumber(row[headerMap.positionHigh], 'position high') : avgPrice;
    const positionLow = headerMap.positionLow ?
      this.parseNumber(row[headerMap.positionLow], 'position low') : avgPrice;
    const drawdown = headerMap.drawdown ?
      this.parseNumber(row[headerMap.drawdown], 'drawdown') : 0;
    const runUp = headerMap.runUp ?
      this.parseNumber(row[headerMap.runUp], 'run up') : 0;

    return {
      ticker: String(row[headerMap.ticker!]).toUpperCase(),
      position: this.parsePosition(row[headerMap.position!]),
      entryDate,
      avgPrice: headerMap.avgPrice ? this.parseNumber(row[headerMap.avgPrice], 'avg price') : 0,
      exitDate,
      exitPrice: headerMap.exitPrice ? this.parseNumber(row[headerMap.exitPrice], 'exit price') : 0,
      pnlPercent,
      portfolioExposure,
      holdingDays,
      portfolioImpact,
      positionHigh,
      positionLow,
      drawdown,
      runUp
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
        cellFormula: true,
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