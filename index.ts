import { Symbols } from "./symbols.ts";
import { Flow, FlowType } from "./flows.ts";

const exchangeList =
  '["AIONUSDT","AIONBTC","BTCUSDT","FTMUSDT","FTMRUB","USDTRUB","STORJUSDT","STORJTRY","USDTTRY","ALGOUSDT","ALGORUB","SOLUSDT","SOLBUSD","BUSDUSDT","DCRUSDT","DCRBTC","USDTBRL","BTCBRL"]';

const flowOptions = [
  ["AIONUSDT", "AIONBTC", "BTCUSDT"],
  ["FTMUSDT", "FTMRUB", "USDTRUB"],
  ["STORJUSDT", "STORJTRY", "USDTTRY"],
  ["ALGOUSDT", "ALGORUB", "USDTRUB"],
  ["SOLUSDT", "SOLBUSD", "BUSDUSDT"],
  ["DCRUSDT", "DCRBTC", "BTCUSDT"],
  ["USDTBRL", "BTCBRL", "BTCUSDT"],
]

const symbols = new Symbols(exchangeList);
await symbols.init();


for(const optionIndex in flowOptions) {
 const flowItem: FlowType = {
    id: optionIndex,
    symbols: flowOptions[optionIndex],
    startCoin: "USDT",
    startQuantity: 100,
  }
  const flow = new Flow(flowItem, symbols);
  console.log("index", optionIndex);
  console.log("symbols", flowOptions[optionIndex]);
  console.log("checkUp", await flow.checkFlow());
  console.log("checkDown", await flow.checkFlow('down'));
}
