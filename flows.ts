import { Exchange } from "./exchange.ts";
import { Symbols } from "./symbols.ts";

export interface FlowType {
  id: number;
  symbols: Array<string>;
  startCoin: string;
  startQuantity: number;
}

export class Flow {
  flow: FlowType = {};
  symbols: Symbols = {};
 
  constructor (flow: FlowType, symbols: Symbols) {
    this.flow = flow; 
    this.symbols = symbols;
  }
  
  exchange(symbol: string, from: string, quantity: number ) {
    const exItem = new Exchange(this.symbols.getItem(symbol));
    return exItem.convertMarketInfo(from, quantity); 
  }
 
  async checkFlow(direction: string = 'up') {
    let coin = this.flow.startCoin;
    let quantity = this.flow.startQuantity;
    const symbols = direction === 'up' ? this.flow.symbols : this.flow.symbols.reverse() 
    for(const symbol of symbols) {
      const result = await this.exchange(symbol, coin, quantity);
      coin = result.to;
      quantity = result.toQuantity;
    }    
    return {
      coin,
      quantity,
    }
  }
}
