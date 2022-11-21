// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"r
const __dirname = path.dirname(__filename);


require('dotenv').config();
const { Spot } = require('@binance/connector')
const apiSecret = process.env.API_SECRET;
const apiKey = process.env.API_KEY;
//const Spot = require('./binance-connector-node/src/spot')

console.log("secret " + apiSecret);

//process.exit();

const client = new Spot(apiKey, apiSecret)
console.log(client);
var numTries=0;
var buyPrice = 19847;
var sellPrice = buyPrice + 1;
//client.account().then(response => client.logger.log(response.data))

client.marginAllOrders(
  'BTCUSDT', {isIsolated: 'TRUE', limit: 10},
).then(response => client.logger.log(response.data))
  .catch(error => client.logger.error(error))
/*client.newMarginOrder(
  'BTCUSDT', // symbol
  'BUY',
  'LIMIT',
  {
    quantity: 0.001,
    isIsolated: 'TRUE',
    price: buyPrice.toString(),
    newClientOrderId: '003',
    newOrderRespType: 'FULL',
    timeInForce: 'GTC'
  }
).then(response => {
    client.logger.log(response.data); 
    getOrder('003')
  })
  .catch(error => client.logger.error(error))
*/
function getOrder(orderId) {
client.marginOrder(
  'BTCUSDT', // symbol
  {
    isIsolated: 'TRUE',
    origClientOrderId: orderId,

  }
).then(response => {
      if (numTries> 10) process.exit();
      client.logger.log(response.data);
      console.log("exec qty "+response.data.executedQty); 
      if (response.data.executedQty == 0.001) {
          sellOrder('004');
      } else {
          getOrder(orderId);
          numTries++;
      } 
      return;
  })
  .catch(error => client.logger.error(error))

}


function sellOrder(orderId) {
client.newMarginOrder(
  'BTCUSDT', // symbol
  'SELL',
  'LIMIT',
  {
    quantity: 0.001,
    isIsolated: 'TRUE',
    price: sellPrice.toString(),
    newClientOrderId: orderId,
    newOrderRespType: 'FULL',
    timeInForce: 'GTC'
  }
).then(response => {client.logger.log(response.data); return})
  .catch(error => client.logger.error(error))
}
