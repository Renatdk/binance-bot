
const url = "https://api.binance.com";
let priceList = []
let exchangeList = []

async function exchangeInfo(list) {
  const query = `/api/v3/exchangeInfo?symbols=${list}`
  const result = await fetch(url + query)
  exchangeList = await result.json()
}

async function loadPrices(){
  //const query = `/api/v3/ticker/price?symbols=[${coinsList}]`;
  const query = '/api/v3/ticker/price';

  const result = await fetch(url + query);
  priceList = await result.json();
}

function initPrices(coins){
  return coins.reduce((a, coin) => ({ ...a, [coin]: priceList.find(item => item.symbol === coin).price}), {});
}

function getFormattedQty(symbol, quantity){
  const stepSize = exchangeList.symbols.find(item => item.symbol === symbol)?.filters.find(item => item.filterType === 'LOT_SIZE')?.stepSize
  const index = stepSize.indexOf(1)
  const precision = index ? index - 1 : 0
  const splitedQty = quantity.toString().split(".")
  const part1 = splitedQty[0]
  const part2 = splitedQty[1]?.substring(0, precision)
  if(Number(part2)){
    return Number(`${part1}.${part2}`)
  } else {
    return Number(part1)
  }
}

function convertCoin(pair, myCoin, price, quantity){
  console.log(pair, myCoin, price, quantity)
  const side = pair.indexOf(myCoin) ? 'BUY' : 'SELL'
  if(side === 'SELL') {
    quantity = getFormattedQty(`${pair[0]}${pair[1]}`, quantity)
    console.log('quantity', quantity)
    return {
      coin: pair[1],
      quantity: price * quantity,
      side,
    }
  } else if(side === 'BUY') {
    quantity = getFormattedQty(`${pair[0]}${pair[1]}`, quantity / price)
    console.log('quantity', quantity)
    return {
      coin: pair[0],
      quantity, 
      side,
    } 
  } 
}


async function checkFlow(options) {
  const symbols = options.coins.map(item => `${item[0]}${item[1]}`)
  
  options.prices= initPrices(symbols)
  
  let currentCoin = options.main
  let currentQuantity = options.quantity 

  for(let i = 0; i < 3; i++) {
    const coin = convertCoin(options.coins[i], currentCoin, options.prices[symbols[i]], currentQuantity)
    currentCoin = coin.coin
    currentQuantity = coin.quantity
    console.log(coin)
  }  
  console.log() 
  currentCoin = options.main
  currentQuantity = options.quantity 

  for(let i = 2; i >= 0; i--) {
    const coin = convertCoin(options.coins[i], currentCoin, options.prices[symbols[i]], currentQuantity)
    currentCoin = coin.coin
    currentQuantity = coin.quantity
    console.log(coin)
  } 

  console.log() 
  console.log() 
  return {}

  const coinsList = coins.map(item=>`"${item}"`);
  const query = `/api/v3/ticker/price?symbols=[${coinsList}]`;

  console.log('query', query);
  const result = await fetch(url + query);
  const data = await result.json();
  
  console.log('data', data);
  const DOGEUSDT = data.find(item => item.symbol === `${coins[0]}`).price;
  const DOGEBTC = data.find(item => item.symbol === `${coins[1]}`).price;
  const BTCUSDT = data.find(item => item.symbol === `${coins[2]}`).price;

  const DOGE = 100/DOGEUSDT;
  const BTC = DOGE*DOGEBTC; 
  const USDT = BTC*BTCUSDT;
  console.log(`${coins[0]}`, DOGEUSDT); 
  console.log(`${coins[1]}`, DOGEBTC); 
  console.log(`${coins[2]}`, BTCUSDT); 

  console.log('-----------'); 

  console.log(`${coins[0]}`, DOGE); 
  console.log(`${coins[1]}`, BTC); 
  console.log(`${coins[2]}`, USDT); 

  console.log('-----------'); 

  const BTC100T = 100/BTCUSDT;
  const DOGE100T = BTC100T/DOGEBTC;
  const USDT100T = DOGE100T*DOGEUSDT;

  console.log('BTC100T', BTC100T);
  console.log(`${coins[0]}100T`, DOGE100T);
  console.log('USDT100T', USDT100T);
  return { COINUSDT: DOGEUSDT, COINBTC: DOGEBTC, BTCUSDT, UP: USDT > 100.2, DOWN: USDT100T > 100.2 };
}

export function useArbitrage(){
  return {
    checkFlow,
    loadPrices,
    exchangeInfo,
  }
}
