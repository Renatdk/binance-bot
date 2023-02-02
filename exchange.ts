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
      toQuantity: side === "BUY" ? this.format(this.symbol.stepSize, baseQuantity) : this.format(this.symbol.tickSize, quoteQuantity),
    };
  }
  
  format(size, quantity) {
    const index = size.indexOf(1);
    const precision = index ? index - 1 : 0;
    const splitedQty = quantity.toString().split(".");
    const part1 = splitedQty[0];
    const part2 = splitedQty[1]?.substring(0, precision);
    if (Number(part2)) {
      return Number(`${part1}.${part2}`);
    } else {
      return Number(part1);
    }
  }
  
}
