import { Symbols } from "./symbols.ts";
import { Exchange } from "./exchange.ts";

const exchangeList =
  '["AIONUSDT","AIONBTC","BTCUSDT","FTMUSDT","FTMRUB","USDTRUB","STORJUSDT","STORJTRY","USDTTRY","ALGOUSDT","ALGORUB","SOLUSDT","SOLBUSD","BUSDUSDT","DCRUSDT","DCRBTC","USDTBRL","BTCBRL"]';

const symbols = new Symbols(exchangeList);
await symbols.init();

const exchange = new Exchange(symbols.getItem("AIONUSDT"));
const convertInfo = await exchange.convertMarketInfo("USDT", 100);
console.log("convertInfo", convertInfo);
const convertInfo1 = await exchange.convertMarketInfo(
  convertInfo.to,
  convertInfo.toQuantity,
);
console.log("convertInfo", convertInfo1);
