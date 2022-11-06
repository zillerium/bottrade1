const { Spot } = require('@binance/connector')
//const Spot = require('./binance-connector-node/src/spot')
const apiSecret = 'xxx' 
const apiKey = 'xxx'
const client = new Spot(apiKey, apiSecret)
console.log(client);

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
    newClientOrderId: 'my_order',
    newOrderRespType: 'FULL',
    timeInForce: 'GTC'
  }
).then(response => client.logger.log(response.data))
  .catch(error => client.logger.error(error))


