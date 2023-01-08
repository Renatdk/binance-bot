import { useAPI } from "./api.ts"
import { useBot} from "./tg-bot.ts"

const { secureQuery, getBallance } = useAPI()
const { sendMessage } = useBot()

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

async function exchangeCoins(pair, from, quantity, price){
  const side = from === pair[0] ? 'SELL' : 'BUY'
  const to = from === pair[0] ? pair[1] : pair[0]
  const symbol = `${pair[0]}${pair[1]}`
  let qty = side === 'BUY' ? quantity / price : quantity
  qty = getFormattedQty(symbol, qty) 
  const query = `symbol=${symbol}&side=${side}&type=MARKET&quantity=${qty}`
  const response = await secureQuery('/api/v3/order/test', query)

  if(resonse.code < 0){
    price = await getPrice(symbol)
    return await exchangeCoins(pair, from, to, quantity, price)  
  }

  if(side === 'SELL'){
    return {coin: to, quantity: response.executedQty}
  } else {
    return response.cummulativeQuoteQty
  }
}

async function getPrice(symbol){
  const query = `/api/v3/ticker/price?symbol=${symbol}`
  const result = await fetch(url + query)
  const data = await result.json()
  return data.price
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

async function calcBuyQty(pair) {
  const symbol = `${pair[0]}${pair[1]}`
  const price = await getPrice(symbol)
  const COINb = await getBallance(pair[1])
  const qty = COINb/price
  return getFormattedQty(symbol, qty) 
}

function convertCoin(pair, myCoin, price, quantity){
  const side = pair.indexOf(myCoin) ? 'BUY' : 'SELL'
  if(side === 'SELL') {
    quantity = getFormattedQty(`${pair[0]}${pair[1]}`, quantity)
    return {
      query: `symbol=${pair[0]}${pair[1]}&side=SELL&type=MARKET&quantity=${quantity}`,
      coin: pair[1],
      pair,
      price,
      sellQty: quantity, 
      quantity: price * quantity,
      side,
    }
  } else if(side === 'BUY') {
    quantity = getFormattedQty(`${pair[0]}${pair[1]}`, quantity / price)
    return {
      query: `symbol=${pair[0]}${pair[1]}&side=BUY&type=MARKET&quantity=${quantity}`,
      coin: pair[0],
      quantity, 
      price,
      pair,
      side,
    } 
  } 
}

async function createOrders(queries){
  for(let i = 0; i < 3; i++){
    const newOrder = await secureQuery('/api/v3/order', queries[i])
    console.log(newOrder)
  }
}

async function checkFlow(options) {
  const symbols = options.coins.map(item => `${item[0]}${item[1]}`)
  
  options.prices= initPrices(symbols)
  
  let currentCoin = options.main
  let currentQuantity = options.quantity 
  let queries = {
    up: {
      coin: null,
      flow: [], 
    },
    down: {
      coin: null,
      flow: [], 
    }
  }

  for(let i = 0; i < 3; i++) {
    const coin = convertCoin(options.coins[i], currentCoin, options.prices[symbols[i]], currentQuantity)
    currentCoin = coin.coin
    currentQuantity = coin.quantity
    queries.up.coin = coin
    queries.up.flow.push(coin)
  }  

  console.log(symbols, currentQuantity)
  currentCoin = options.main
  currentQuantity = options.quantity 

  for(let i = 2; i >= 0; i--) {
    const coin = convertCoin(options.coins[i], currentCoin, options.prices[symbols[i]], currentQuantity)
    currentCoin = coin.coin
    currentQuantity = coin.quantity
    queries.down.coin = coin
    queries.down.flow.push(coin)
  } 
  console.log(symbols, currentQuantity)
  
  if(queries.up.coin.quantity > 100.9){
    console.log('queries up', queries.up)
    sendMessage({chat_id:195282026, text: queries.up.coin})
    return queries.up.flow
    //createOrders(queries.up.queries)
  }
  
  if(queries.down.coin.quantity > 100.9){
    console.log('queries down', queries.down)
    sendMessage({chat_id:195282026, text: queries.down.coin})
    return queries.down.flow
    //createOrders(queries.down.queries)
  }  
  return null 
}

export function useArbitrage(){
  return {
    checkFlow,
    loadPrices,
    exchangeInfo,
    calcBuyQty,
    getFormattedQty,
    getPrice,
  }
}
