const apiKey = "5127616880:AAE8U181lBgEWyDnaVEvf_jAA7t4tJ248jM";
const url = "https://api.telegram.org";

async function sendResponse(endpoint, params) {
  const response = await fetch(`${url}/bot${apiKey}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  return response.json();
}

function sendMessage(params) {
  return sendResponse("sendMessage", params);
}

export function useBot() {
  return {
    sendMessage,
  };
}
