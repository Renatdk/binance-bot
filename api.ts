import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const url = "https://api.binance.com";
const apiKey =
  "M4DU0JB2iF7nwAJKGtW44JDuYfTCbLdZet2EswQ7WlnnQ5Gy67hD5Jk50qEj1cm2";
const secretKey =
  "Dhx5kZ9DM4B5Is548y2qPnesgQY8tONxhZqqFD1o1t1VhnX1MnQI0lt04TNABpTz";

async function secureQuery(endpoint, query = "", method = "POST") {
  const timestamp = new Date().getTime();
  const timestampQuery = `recvWindow=5000&timestamp=${timestamp}`;
  query = query === "" ? timestampQuery : `${query}&${timestampQuery}`;
  const signature = hmac("sha256", secretKey, query, "utf8", "hex");
  const response = await fetch(
    `${url}${endpoint}?signature=${signature}&${query}`,
    {
      method,
      headers: {
        "X-MBX-APIKEY": apiKey,
      },
    },
  );

  return response.json();
}

function fetchAccount() {
  return secureQuery("/api/v3/account");
}

function newOrder(options) {
  let query = null;
  if (options.type === "LIMIT") {
    query =
      `symbol=${options.symbol}&side=${options.side}&price=${options.price}&quantity=${
        Number(options.quantity)
      }&timeInForce=GTC&type=LIMIT`;
  } else if (options.type === "MARKET") {
    query = `symbol=${options.symbol}&side=${options.side}&quantity=${
      Number(options.quantity)
    }&type=MARKET`;
  }

  return secureQuery("/api/v3/order", query);
}

async function getBallance(COIN) {
  const response = await secureQuery("/sapi/v3/asset/getUserAsset");
  return response.find((item) => item.asset === COIN)?.free || 0;
}

async function isOpenOrders() {
  const orders = await secureQuery("/api/v3/openOrders", "", "GET");
  return Boolean(orders.length);
}

export function useAPI() {
  return {
    secureQuery,
    getBallance,
    isOpenOrders,
    fetchAccount,
    newOrder,
  };
}
