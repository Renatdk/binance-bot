
const url = "https://api.binance.com";

async function checkFlow(coin) {
  const query = `/api/v3/ticker/price?symbols=["${coin}USDT","${coin}BTC","BTCUSDT"]`;

  const result = await fetch(url + query);
  const data = await result.json()

  const DOGEUSDT = data.find(item => item.symbol === `${coin}USDT`).price
  const DOGEBTC = data.find(item => item.symbol === `${coin}BTC`).price
  const BTCUSDT = data.find(item => item.symbol === 'BTCUSDT').price

  const DOGE = 100/DOGEUSDT
  const BTC = DOGE*DOGEBTC 
  const USDT = BTC*BTCUSDT
  console.log(`#####${coin}#####`);
  console.log(`${coin}USDT`, DOGEUSDT); 
  console.log(`${coin}BTC`, DOGEBTC, ); 
  console.log(`BTCUSDT`, BTCUSDT); 

  console.log('-----------'); 

  console.log(`${coin}`, DOGE); 
  console.log('BTC', BTC); 
  console.log('USDT', USDT); 

  console.log('-----------'); 

  const BTC100T = 100/BTCUSDT
  const DOGE100T = BTC100T/DOGEBTC
  const USDT100T = DOGE100T*DOGEUSDT

  console.log('BTC100T', BTC100T)
  console.log(`${coin}100T`, DOGE100T)
  console.log('USDT100T', USDT100T)
  return { COINUSDT: DOGEUSDT, COINBTC: DOGEBTC, BTCUSDT, UP: USDT > 100.2, DOWN: USDT100T > 100.2 }
}

export function useArbitrage(){
  return {
    checkFlow,
  }
}
