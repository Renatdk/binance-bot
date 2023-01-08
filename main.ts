import { useAPI } from "./api.ts";
import { useBot} from "./tg-bot.ts"
import { useArbitrage } from "./arbitrage.ts"
import { toFixed, toPrecision } from "https://deno.land/x/math@v1.1.0/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

const { secureQuery, getBallance, newOrder, isOpenOrders } = useAPI();
const { checkFlow, loadPrices, exchangeInfo, getPrice, getFormattedQty} = useArbitrage();
const { sendMessage } = useBot()


const exchangeList = '["AIONUSDT","AIONBTC","BTCUSDT","USDTBRL","FISBRL","FISUSDT","FTMUSDT","FTMRUB","USDTRUB"]'

await exchangeInfo(exchangeList)

const flowOptions = [
    [['AION','USDT'],['AION','BTC'],['BTC','USDT']],
    [['USDT','BRL'],['FIS','BRL'],['FIS','USDT']],
    [['FTM','USDT'],['FTM','RUB'],['USDT','RUB']],
]
let loop = 0
async function checkFlows(){
  await loadPrices()
  for(let i=0; i < flowOptions.length; i++) {
    const flows = await checkFlow({coins: flowOptions[i], main: 'USDT', quantity: 100})
    if(flows){
      console.log('flows', flows)
      createOrders(flows)
      return null 
    }  
  }
  await sleep(2)
  console.log(loop++)
  checkFlows()
}
  
async function createOrder(flow, prevQty) {
  const symbol = `${flow.pair[0]}${flow.pair[1]}`
  
  if(prevQty) {
    console.log('getFormattedQty', symbol, prevQty, getFormattedQty(symbol, prevQty))
    
    prevQty = flow.side === 'SELL' ? getFormattedQty(symbol, prevQty) : getFormattedQty(symbol, prevQty/flow.price)
  }
 
  let qty = prevQty ?? flow.sellQty ?? flow.quantity
  qty = getFormattedQty(symbol, qty)
  let query = `symbol=${flow.pair[0]}${flow.pair[1]}&side=${flow.side}&type=MARKET&quantity=${qty}`
  console.log('query', query)
  console.log('flow', flow)
  let newOrder = await secureQuery('/api/v3/order', query)
  
  if(newOrder.code < 0) {
    sendMessage({chat_id:195282026, text: 'Упс!'})
    sendMessage({chat_id:195282026, text: newOrder})
    sendMessage({chat_id:195282026, text: flow})
    sendMessage({chat_id:195282026, text: `https://www.binance.com/ru/trade/${flow.pair[0]}_${flow.pair[1]}?theme=dark&type=spot`})
    sendMessage() 
    if(flow.side === 'BUY'){ 
      flow.price = await getPrice(symbol)
      console.log('price', flow.price)
      newOrder = await createOrder(flow, prevQty)      
    }
 
    if(flow.side === 'SELL'){
      sendMessage({chat_id:195282026, text: 'Flow sell???'})
    }
  }
  console.log(newOrder)
  sendMessage({chat_id:195282026, text: query})
  return newOrder
}

async function createOrders(flows) {
  let prevQty = null
  for(let i = 0; i < flows.length; i++) {
    const newOrder = await createOrder(flows[i], prevQty)
    prevQty = flows[i].side === 'BUY' ?  newOrder.executedQty : newOrder.cummulativeQuoteQty

  }
}

checkFlows()

//const { COINUSDT, COINBTC, BTCUSDT, UP, DOWN } =  await checkFlow(flowOptions1);

/*
const USDTb = await getBallance('USDT');
console.log();
console.log('USDT ballance: ', USDTb);

const COINqty = Math.trunc(USDTb/COINUSDT)-1;
const flow = {
  up: [ 
    {
      symbol: `${COINname}USDT`,
      side: 'BUY',
      price: COINUSDT,
      type: 'MARKET',
      getQty: async () => {
        const USDTb = await getBallance('USDT');
        return Math.trunc(USDTb/COINUSDT)-1;
      }, 
    },
    {
      symbol: `${COINname}BTC`,
      side: 'SELL',
      type: 'MARKET',
      price: COINBTC,
      getQty: async () => {
        const COINb = await getBallance(COINname);
        return Math.trunc(COINb)-1; 
      }, 
    },
    {
      symbol: 'BTCUSDT',
      side: 'SELL',
      type: 'LIMIT',
      price: BTCUSDT,
      getQty: async () => {
        const BTCb = await getBallance('BTC');
        return BTCb.toString().slice(0, 7);  
      }, 
    },
  ],
  down: [
    {
      symbol: 'BTCUSDT',
      side: 'BUY',
      type: 'LIMIT',
      price: BTCUSDT,
      getQty: async () => {
        const USDTb = await getBallance('USDT');
        return (USDTb/BTCUSDT).toString().slice(0, 7);
      },
    },
    {
      symbol: `${COINname}BTC`,
      side: 'BUY',
      type: 'MARKET',
      price: COINBTC,
      getQty: async () => {
        const BTCb = await getBallance('BTC');
        return Math.trunc(BTCb/COINBTC)-1;
      }, 
    },
    {
      symbol: `${COINname}USDT`,
      side: 'SELL',
      type: 'MARKET',
      price: COINUSDT,
      getQty: async () => {
        const COINb = await getBallance(COINname);
        return Math.trunc(COINb)-1; 
      },
    },
  ],
}

let steps = [];
let step = 0;
if(UP) {
  steps = flow.up;
}
if(DOWN) {
  steps = flow.down;
}
async function nextStep(){
  const options = steps[step];    
  options.quantity = await options.getQty(); 
  console.log('options', options);
  if(options.quantity) {
    step++;
    return newOrder(options);
  }
  return null;
};

if(steps.length > 0){
  const first = await nextStep();
  console.log('frist', first);
  while(true) {
    if(step === 3) {
      break;
    }
    const hasOpenOrder = await isOpenOrders();      
    if(!hasOpenOrder) {
      const next = await nextStep(); 
      console.log('next', next);
    }
    sleep(2);
  }
}

if(false) {
  const BTC = COIN * COINBTC;
  console.log('Buy BTC: ', BTC);
  const USDT = BTC * BTCUSDT;
  console.log('Buy USDT: ', USDT);

  //console.log("getall", response);

  const queryFirst = `symbol=AIONUSDT&side=BUY&type=MARKET&quantity=${COIN}`;
  const stepFirst = await secureQuery('/api/v3/order', queryFirst); 
  console.log("stepFirst", stepFirst);

  const querySecond = `symbol=AIONBTC&side=SELL&type=MARKET&quantity=${COIN}`;
  const stepSecond = await secureQuery('/api/v3/order', querySecond); 
  console.log("stepSecond", stepSecond);

  //const BTCb = await getBallance('BTC');
  const BTCb = stepSecond.cummulativeQuoteQty;

  console.log('BTC ballance', BTCb, BTCb.slice(0,7));

  const queryThree = `symbol=BTCUSDT&side=SELL&type=LIMIT&timeInForce=GTC&price=${BTCUSDT}&quantity=${BTCb.slice(0,7)}`;
  const stepThree = await secureQuery('/api/v3/order', queryThree); 
  console.log("stepThree", stepThree);
}

if(false) {
  const BTCdown = USDTb/BTCUSDT;

  console.log();
  console.log('BTC down', BTCdown);


  while(true){
    const orders = await secureQuery('/api/v3/openOrders', '', 'GET');
    console.log('orders', orders.length);
    
    const BTCb = await getBallance('BTC');
    console.log('BTC ballance: ', BTCb); 
    console.log('COINBTC : ', COINBTC); 
    const COIN = Math.trunc(BTCb/COINBTC)-1;
    console.log('COIN', COIN);
    await sleep(2);
  }


  const queryFirst = `symbol=BTCUSDT&side=BUY&type=LIMIT&timeInForce=GTC&price=${BTCUSDT}&quantity=${BTCdown.toString().slice(0,7)}`;
  const stepFirst = await secureQuery('/api/v3/order', queryFirst); 
  console.log("stepFirst", stepFirst);
  const BTCb = stepFirst.cummulativeQuoteQty;

  const querySecond = `symbol=AIONBTC&side=BUY&type=MARKET&quantity=508`;
  const stepSecond = await secureQuery('/api/v3/order', querySecond); 
  console.log("stepSecond", stepSecond);
  
  const queryThree = `symbol=AIONUSDT&side=SELL&type=MARKET&quantity=508`;
  const stepThree= await secureQuery('/api/v3/order', queryThree); 
  console.log("stepThree", stepThree);

}
*/


