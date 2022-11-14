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
//client.account({accountType: 'MARGIN'})
//client.account({symbols: 'BTCUSDT'})

//client.marginMyTrades('BTCUSDT', {isIsolated: 'TRUE'})
//  .then(response => client.logger.log(response.data))
//  .catch(error => client.logger.error(error))


//client.trades('BTCUSDT', { limit: 5 }).then(response => client.logger.log(response.data))
//  .catch(error => client.logger.error(error))


/*client.marginOpenOrders(
  {
	//  side : 'BUY',
    symbol: 'BTCUSDT',
	  isIsolated: 'TRUE'
  }
).then(response => {
	client.logger.log(response.data);
let  grandtotsell = 0.00;
let  grandtotbuy = 0.00;
for(var attributename in response.data){
    console.log(attributename+": "+ JSON.stringify(response.data[attributename]) );
//"price":"21451.43","origQty":"0.025",
let side =response.data[attributename]["side"].toString();
let price = parseFloat(response.data[attributename]["price"]);
let qty = parseFloat(response.data[attributename]["origQty"]);
let tot = price * qty;
if (side == 'SELL') grandtotsell += tot;
if (side == 'BUY') grandtotbuy += tot;

}

console.log("total sell == " + grandtotsell);
console.log("total buy == " + grandtotbuy);

})
  .catch(error => client.logger.error(error))
*/
//client.marginPair(
//  'BNBUSDT'
//client.fundingWallet('BTC')
//client.isolatedAccount('BTCUSDT')
//client.isolatedMarginSymbol('BTCUSDT')
//client.isolatedMarginAllSymbols()
//client.isolatedMarginAccountInfo('BTCUSDT')

//client.marginPair('BTCUSDT', {isIsolated: 'TRUE'}
//client.marginAccount(/)
//client.isolatedMarginAccountInfo({symbols: 'BTCUSDT'})
//client.marginAllAssets({symbol: 'BTCUSDT', isIsolated: 'TRUE'})
 //     )

//client.assetDetail({ asset: 'BTC', isIsolated: 'TRUE' })
 //client.isolatedMarginAccountInfo ({symbol:'BTCUSDT'})

//client.marginAsset(
//  'BTC' // asset
//let d = Date.now();
//console.log("date ====== " + d);
//let date1 = Date.now(d);
//console.log("date reformatted == " + date1);
//var unixTimestamp = Math.floor(d.getTime()/1000);
//console.log(unixTimestamp);
client.marginMyTrades('BTCUSDT', {limit: 10, isIsolated: 'TRUE' }).then(response => client.logger.log(response.data))
//client.marginAllOrders('BTCUSDT', {endTime: d, limit: 10, isIsolated: 'TRUE' }).then(response => client.logger.log(response.data))


//client.trades('BTCUSDT', { limit: 10 }).then(response => client.logger.log(response.data))
//.then(response => client.logger.log(JSON.stringify(response.data)))
//client.trades('BTCUSDT', { limit: 5 }).then(response => client.logger.log(response.data))
//  .catch(error => client.logger.error(error))

/*
client.marginOrder(
                'BTCUSDT', // symbol
            {
                isIsolated: 'TRUE',
               orderId: '15475654645',
                //origClientOrderId: orderRef.toString(),
            }
            ).then(response => {
         console.log(response.data) })
  .catch(error => client.logger.error(error))


client.marginOrder(
        'BTCUSDT', // symbol
        {
            isIsolated: 'TRUE',
		orderId:'15345857020'
           // origClientOrderId:'358',
        }
    ).then(response => {
         console.log(response.data) })
  .catch(error => client.logger.error(error))
*/

/*client.account()
	.then(response => {client.logger.log(response.data);
for(var attributename in response.data){
    console.log(attributename+": "+ JSON.stringify(response.data[attributename]) );
}
	})
*/
//client.account(
//  'BTCUSDT')
//.then(response => client.logger.log(response.data))
//  .catch(error => client.logger.error(error))

//client.isolatedMarginSymbol('BTCUSDT').then(response => client.logger.log(response.data))
//  .catch(error => client.logger.error(error))


/*client.marginAllAssets(
      ).then(response => {
    client.logger.log(response.data);
  })
  .catch(error => client.logger.error(error))

*/

//client.marginAsset('BTC'
//	).then(response => {
//    client.logger.log(response.data);
//  })
//  .catch(error => client.logger.error(error))


/*client.newMarginOrder(
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
