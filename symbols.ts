const BASE_URL = "https://api.binance.com";

interface SymbolType {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  stepSize: string;
}

interface SymbolsType {
  [SymbolKey: string]: SymbolType;
}

export class Symbols {
  items: SymbolsType = {};
  symbolsList: Array<string> = [];

  constructor(list: Array<string>) {
    this.symbolsList = list;
  }

  async init() {
    const response = await fetch(
      `${BASE_URL}/api/v3/exchangeInfo?symbols=${this.symbolsList}`,
    );
    const data = await response.json();
    this.initSymbols(data.symbols);
    return this.items;
  }

  initSymbols(symbols: any) {
    for (const item of symbols) {
      this.items[item.symbol] = {
        symbol: item.symbol,
        baseAsset: item.baseAsset,
        quoteAsset: item.quoteAsset,
        stepSize: item.filters.find((f) =>
          f.filterType === "LOT_SIZE"
        ).stepSize,
        tickSize: item.filters.find((f) => 
          f.filterType === "PRICE_FILTER"
        ).tickSize,
      };
    }
  }

  getItem(symbol: string) {
    return this.items[symbol];
  }
}
