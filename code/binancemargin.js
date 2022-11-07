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
//client.account().then(response => client.logger.log(response.data))

//client.marginAllOrders(
//  'BTCUSDT'
//).then(response => client.logger.log(response.data))
//  .catch(error => client.logger.error(error))
client.newMarginOrder(
  'BTCUSDT', // symbol
  'BUY',
  'LIMIT',
  {
    quantity: 0.005,
    isIsolated: 'TRUE',
    price: '20000',
    newClientOrderId: '001',
    newOrderRespType: 'FULL',
    timeInForce: 'GTC'
  }
).then(response => {
    client.logger.log(response.data); 
    getOrder('001')
  })
  .catch(error => client.logger.error(error))

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
      if (response.data.executedQty == 0.005) {
          sellOrder('002');
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
    quantity: 0.005,
    isIsolated: 'TRUE',
    price: '22000',
    newClientOrderId: orderId,
    newOrderRespType: 'FULL',
    timeInForce: 'GTC'
  }
).then(response => {client.logger.log(response.data); return})
  .catch(error => client.logger.error(error))
}
