const WebSocket = require('ws');

const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

ws.onmessage = (event) => {
   let obj = JSON.parse(event.data);
   console.log(JSON.stringify(obj));
   let price = parseFloat(obj.p).toFixed(2);
   console.log(price);
}
//ws.on('message', function incoming(data) {
//    console.log(data);
//})
