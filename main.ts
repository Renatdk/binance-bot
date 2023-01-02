import { useAPI } from "./api.ts";
import { useArbitrage } from "./arbitrage.ts"
import { toFixed, toPrecision } from "https://deno.land/x/math@v1.1.0/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";

const { secureQuery, getBallance } = useAPI();
const { checkFlow } = useArbitrage();

//await checkFlow("DOGE");
const { COINUSDT, COINBTC, BTCUSDT, UP, DOWN } =  await checkFlow("AION");

const USDTb = await getBallance('USDT');
console.log();
console.log('USDT ballance: ', USDTb);

if(UP) {
  const COIN = Math.trunc(USDTb/COINUSDT)-1;
  console.log('Buy COIN: ', COIN);
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

if(true) {
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
/*  const queryFirst = `symbol=BTCUSDT&side=BUY&type=LIMIT&timeInForce=GTC&price=${BTCUSDT}&quantity=${BTCdown.toString().slice(0,7)}`;
  const stepFirst = await secureQuery('/api/v3/order', queryFirst); 
  console.log("stepFirst", stepFirst);
  const BTCb = stepFirst.cummulativeQuoteQty;

  const querySecond = `symbol=AIONBTC&side=BUY&type=MARKET&quantity=508`;
  const stepSecond = await secureQuery('/api/v3/order', querySecond); 
  console.log("stepSecond", stepSecond);
  
  const queryThree = `symbol=AIONUSDT&side=SELL&type=MARKET&quantity=508`;
  const stepThree= await secureQuery('/api/v3/order', queryThree); 
  console.log("stepThree", stepThree);

*/
}




