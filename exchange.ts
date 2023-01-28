import { SymbolType } from "./symbols.ts";

const BASE_URL = "https://api.binance.com";

export class Exchange {
  symbol: SymbolType;

  constructor(exSymbol: SymbolType) {
    this.symbol = exSymbol;
  }

  async convertMarketInfo(from: string, quantity: number) {
    const response = await fetch(
      `${BASE_URL}/api/v3/depth?symbol=${this.symbol.symbol}`,
    );
    const data = await response.json();
    const side = from === this.symbol.baseAsset
      ? "SELL"
      : from === this.symbol.quoteAsset
      ? "BUY"
      : null;

    let baseQuantity = 0;
    let quoteQuantity = 0;
    let value = 0;
    if (side === "SELL") {
      for (const bid of data.bids) {
        const askQuantity = bid[1] + baseQuantity;
        if (askQuantity < quantity) {
          baseQuantity = askQuantity;
          quoteQuantity = Number(bid[0]) * Number(bid[1]) + quoteQuantity;
        } else {
          const partQuantity = quantity - baseQuantity;
          baseQuantity = baseQuantity + partQuantity;
          quoteQuantity = Number(bid[0]) * partQuantity + quoteQuantity;
          break;
        }
      }
    } else {
      for (const ask of data.asks) {
        console.log("ask", ask);
        const bidQuantity = Number(ask[0]) * Number(ask[1]) + quoteQuantity;
        if (bidQuantity < quantity) {
          quoteQuantity = bidQuantity;
          baseQuantity = Number(ask[1]) + baseQuantity;
        } else {
          if (baseQuantity < quantity) {
            const partQuantity = quantity - quoteQuantity;
            baseQuantity = partQuantity / Number(ask[0]) + baseQuantity;
          } else {
            baseQuantity = quantity / Number(ask[0]);
          }
          break;
        }
      }
    }

    return {
      side,
      from,
      fromQuantity: quantity,
      to: side === "BUY" ? this.symbol.baseAsset : this.symbol.quoteAsset,
      toQuantity: side === "BUY" ? baseQuantity : quoteQuantity,
    };
  }
}
