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
var minTradeValue = 0.00125; // to sell left over coins
var minTradingBalance = 80;
var reserves = 200;
var batchSize= 100;
var minTradePrice = 10000; // safety
var maxTradePrice = 25000; // safety
var safeLimit = 10; // difference between buys and sells to stop a runaway bot buying
const Pool = require("pg").Pool;

import {SQLMod}  from './sqlmod.js';
const sqlmod = new SQLMod();

import {BotMod}  from './botmod.js';
const client = new Spot(apiKey, apiSecret)
var safeLimit = 10; // difference between buys and sells to stop a runaway bot buying
const bmod = new BotMod(client, minTradePrice, maxTradePrice, safeLimit);

//console.log(client);
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "crypto",
  password: "password",
  port: 5432,
});
//client.connect();
sqlmod.setPool(pool);
pool.connect();


//const Spot = require('./binance-connector-node/src/spot')


function getOpenSell(openOrders) {

	let totSell = 0;
	let totBuy = 0;

        let openBuyOrders=[];
        let openSellOrders=[];
        openOrders.data.map(item => {
            // console.log("item = "+ JSON.stringify(item));
            
             let price = parseFloat(item["price"]);
             let qty = parseFloat(item["origQty"]);
             let tot = price * qty;
		if (
                     (item["side"] == 'BUY')
               ) {

                    openBuyOrders.push(item);
		    totBuy +=tot;
		}
            if (
                    (item["side"] == 'SELL')
               ) {
                    openSellOrders.push(item);
		    totSell +=tot;
                 }
             })
        return [ openBuyOrders, openSellOrders, totBuy, totSell ];

}

function findSlot(ele) {
// if (ele[0] == 
}

async function getOrders() {
          let openOrders = await bmod.getOpenOrders('TRUE');
          // ********************** get all open buy and sell orders 
 //       client.logger.log(openOrders.data);
          // BEGIN **** pop buy and sell orders and tot val
          let jsonOS = getOpenSell(openOrders);
          let openBuyOrders = jsonOS[0];
          let openSellOrders = jsonOS[1];
          let totBuy= jsonOS[2];
          let totSell= jsonOS[3];

         for(var attributename in openBuyOrders){
             console.log(attributename+": "+ JSON.stringify(openBuyOrders[attributename]) );
	 }
         for(var attributename in openSellOrders){
             console.log(attributename+": "+ JSON.stringify(openSellOrders[attributename]) );
	 }

let slotN = parseFloat(100);
let arr = [];
       openSellOrders.map(m =>{
          // console.log(m["price"]);
         //  console.log(m["origQty"]);
                let val = parseFloat(m["price"])*parseFloat(m["origQty"]);
                let     priceInt = parseInt(parseFloat(m["price"])/slotN)*parseInt(slotN);
              //  console.log("val int " + priceInt);
                let m1 = arr.some(n=>n[0]==priceInt);
              //  console.log("m1 == "+ m1);
                if (m1) {
                       arr.map(n=>{
                               if (n[0] == priceInt) n[1] +=val;
                       })
                } else {
                        arr.push([priceInt,val]);
                }
        })

console.log("arrays = "+ arr);
	arr.map(async m=>{
		let priceSlot = parseInt(m[0]);
		let val = parseFloat(m[1]);
		let perval = (val/totSell)*100;
                sqlmod.insertOpenSell(priceSlot, val, perval);
		await sqlmod.exSQL();

	})
	//      insertOpenSell = (opensellslot, opensellval, opensellper) => {


  /*       let sellArray =[[0,0]]
 	  let slot = 100; // 100 dollars
	 openSellOrders.map(item => {
              let price = parseFloat(item["price"]);
              let qty = parseFloat(item["origQty"]);
      	      let val = price*qty;
	      let slotN = parseInt(price/slot)
	      sellArray.map(findSlot)
	 })
*/

     let jsonAccount = await bmod.getAccountDetails('BTCUSDT');
                //  console.log(JSON.stringify(jsonAccount.data));
     let btcBal = parseFloat(jsonAccount.data["assets"][0]["baseAsset"]["free"]);
     let freeBal = parseFloat(jsonAccount.data["assets"][0]["quoteAsset"]["free"]);
    // console.log("json sell == " + JSON.stringify(openSellOrders));
     console.log("total sell == " + totSell);
     console.log("total buy == " + totBuy);
     console.log("total btcbal== " + btcBal);
     console.log("total reserves== " + reserves);
     console.log("total bal== " + freeBal);
     let otot = totSell + totBuy + freeBal + reserves;
     console.log("total overview== " + otot);
     sqlmod.insertCapital(totBuy, totSell, reserves, freeBal, otot, btcBal);
     await sqlmod.exSQL();
}
//process.exit();
main();
async function main() {

     await getOrders();
     process.exit();
}
//client.account({accountType: 'MARGIN'})
//client.account({symbols: 'BTCUSDT'})
function getopenorders() {

client.marginOpenOrders(
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


})
  .catch(error => client.logger.error(error))
}

/*
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
