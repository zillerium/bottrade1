// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"r
const __dirname = path.dirname(__filename);


const WebSocket = require('ws');
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
var prevSecs = 0; // second value for streamed txn - streamed in millisecs
var minPrice = 0.00; // min price in a candlestick
var maxPrice = 0.00; // max price in a candlestick
var k=0; // number of candlesticks processed
var numberTxns=0; // number txns in a candlestick
var openPrice=0.00; // open price on a candlestick
var closePrice=0.00; // close price on a candlestick
var prevClosePrice=0.00; // prev close price on a candlestick
var prices = []; // prices from stream
//var runCycle=400;
var batchSize= 100;
var runCycle=20;
var prevAvgPrice=0;
var rsiPeriod=5;
var rsiCurrentPeriod=0;
var priceMoves=[]; // open and closes - json format
var RSIN=5; // period for RS
var numberPeriods=0; // number of candlesticks
var profitMargin = 0.005; // profit from the txn
var capital = 100; // capital available for the trade
var orderRefGlobal = 99999;
var sold = true;
var totOrders = 0;
var histId = 0;
//var totOrderLimit = 100;
var totOrderLimit = 1;
var btcQty = 0.0025;
//var btcQty = 0.005;
require('dotenv').config();
import {BotMod}  from './botmod.js';
const { Spot } = require('@binance/connector')
const apiSecret = process.env.API_SECRET;
const apiKey = process.env.API_KEY;
//const Spot = require('./binance-connector-node/src/spot')
const Pool = require("pg").Pool;
const client = new Spot(apiKey, apiSecret)

const bmod = new BotMod(client);


console.log(client);
var numTries=0;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "crypto",
  password: "password",
  port: 5432,
});
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/trade');
//
/*{
  orderId: '15332223862',
  symbol: 'BTCUSDT',
  origClientOrderId: '422',
  clientOrderId: 'itEIHMvGHrjk9McY34OXFx',
  price: '16725.2',
  origQty: '0.0025',
  executedQty: '0',
  cummulativeQuoteQty: '0',
  status: 'CANCELED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  isIsolated: true
}
*/

var cancelSchema = new mongoose.Schema({
  orderId : { type: String, default: null},
  symbol : {type: String, default: null},
  origClientOrderId : {type: String, default: null},  
  clientOrderId : {type: String, default: null},
  price : {type: String, default: null},
  origQty : {type: String, default: null},
  executedQty : {type: String, default: null},
  cummulativeQuoteQty : {type: String, default: null},
  status : {type: String, default: null},
  timeInForce : {type: String, default: null},
  type : {type: String, default: null},
  side : {type: String, default: null},
  isIsolated : {type: Boolean, default: null}
});

/*
  symbol: 'BTCUSDT',
  orderId: 15332223130,
  clientOrderId: '421',
  transactTime: 1668060352219,
  price: '16728.89',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '41.8179',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  fills: [
    {
      price: '16727.16',
      qty: '0.0025',
      commission: '0',
      commissionAsset: 'BNB'
    }
  ],
  isIsolated: true
}
*/

var openOrderSchema = new mongoose.Schema({
  orderId : { type: Number, default: null},
  symbol : {type: String, default: null},
  clientOrderId : {type: String, default: null},
  transactTime : {type: Number, default: null},
  price : {type: String, default: null},
  origQty : {type: String, default: null},
  executedQty : {type: String, default: null},
  cummulativeQuoteQty : {type: String, default: null},
  status : {type: String, default: null},
  timeInForce : {type: String, default: null},
  type : {type: String, default: null},
  side : {type: String, default: null},
  isIsolated : {type: Boolean, default: null},
  fills: [
	  {
	      price: {type:String, default: null},
              qty: {type:String, default: null},
              commission: {type:String, default: null},
              commissionAsset: {type:String, default: null},
	  }
  ]
});


/*  symbol: 'BTCUSDT',
  orderId: 15332222142,
  clientOrderId: '420',
  price: '16729.81',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '41.825325',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'SELL',
  stopPrice: '0',
  icebergQty: '0',
  time: 1668060350580,
  updateTime: 1668060350580,
  isWorking: true,
  accountId: 33,
  isIsolated: true
}
*/

var queryOrderSchema = new mongoose.Schema({
  orderId : { type: Number, default: null},
  symbol : {type: String, default: null},
  clientOrderId : {type: String, default: null},
  price : {type: String, default: null},
  origQty : {type: String, default: null},
  executedQty : {type: String, default: null},
  cummulativeQuoteQty : {type: String, default: null},
  status : {type: String, default: null},
  timeInForce : {type: String, default: null},
  type : {type: String, default: null},
  side : {type: String, default: null},
  //stopPrice : {type: String, default: null},
 // icebergQty : {type: String, default: null},
//  time : {type: Number, default: null},
//  updateTime : {type: Number, default: null},
//  isWorking : {type: Boolean, default: null},
//  accountId : {type: Number, default: null},
  isIsolated : {type: Boolean, default: null},
});

var  cancelModel = mongoose.model("cancelModel", cancelSchema);
var  openOrderModel = mongoose.model("openOrderModel", openOrderSchema);
var  queryOrderModel = mongoose.model("queryOrderModel", queryOrderSchema);

pool.connect();

main();

async function main() {

orderRefGlobal = await getId();
	if (orderRefGlobal == 4287) orderRefGlobal = 4289;
	if (orderRefGlobal == 4423) orderRefGlobal = 4430;
histId = await getHistId();
console.log("histid == " + histId);
console.log("orderRefGlobal == " + orderRefGlobal);
	//.rder

/*let delay = 10;
//fix as we have no async
sleep = function(time) {
  var stop = new Date().getTime();
  while (new Date().getTime() < stop + time) {;
  }
  return new Promise((r, _) => r())
}
console.log("sleeping...")
sleep(3000 * 1).then(() => console.log("awake"))
*/
let firstId = 3;
let lastId = histId;
console.log("oooooooooo histId = " + histId);
if (lastId > 2*batchSize) firstId = lastId - batchSize;
// add async later
let priceSQL = "select avg(avg_price), sum(chg_price) from tradehist where id between " + firstId + " and " + lastId;
console.log("price sql = " + priceSQL);
var priceChgJson =await sumPrices(priceSQL);
console.log("price change "+ JSON.stringify(priceChgJson));
var changePriceDB = parseFloat(priceChgJson["sum"]);
var avgPriceDB = parseFloat(priceChgJson["avg"]);
//console.log("price rows = " + JSON.stringify(priceRows));
let u=1;
for (let i=0;i< 99999;i++) {
	u=u+1;
}
console.log("id " + orderRefGlobal);
console.log("secret " + apiSecret);



ws.onmessage = async  (event) => {

// get the streamed data	
   let obj = JSON.parse(event.data); // data stream of prices
 //  console.log(JSON.stringify(obj));

// get the price 
   let price = parseFloat(obj.p).toFixed(2); // price
//   console.log("price = " +price);

// Calc the sec value for the candlestick

   let orgTime = parseInt(obj.E); // time - in millisecs
   let tradeTime = parseInt(obj.E/1000);
//   console.log("trade time = " + tradeTime);

   let d = new Date(orgTime);
//   console.log("local time in date - " + d);
   //let timeCheck = d.setUTCSeconds(orgTime);
   let numberSecs = (d.getTime() - d.getMilliseconds())/1000; // number of secs for that candlestick
//   console.log("local time in secs - " + numberSecs);

   if (prevSecs == 0) {
       // first time
       openPrice = parseFloat(price); // first price for candlestick
       closePrice = parseFloat(price); // init close price for candlestick
       //prevPrice = parseFloat(price); // init prev close price for candlestick
       prevSecs = numberSecs; // sec value for candlestick
       minPrice = parseFloat(price); // initialize to defaults
       maxPrice = parseFloat(price);
       prevAvgPrice = parseFloat(price);
       numberTxns=1; // initialize to 1	   
       k++;
       rsiCurrentPeriod=1; // start of rsi period
   }
       // data streams in millisecs - only take sec blocks	   
   if (numberSecs > prevSecs) {
	   // new candletick
       let priceUDdef = { "up": 0.00, "down": 0.00};
 
       let priceUD = priceUpDown(closePrice, prevClosePrice); // [up, down] prices
       if (priceMoves.length > RSIN) priceMoves.splice(0, 1); // remove first entry for that RS period
       if (k>1)
          priceMoves.push(priceUD);
       else 
	  priceMoves.push(priceUDdef);

       console.log("min price = " + minPrice);
       console.log("max price = " + maxPrice);
       let totPrice=parseFloat(minPrice)+parseFloat(maxPrice);
       console.log("tot price = " + totPrice);
       let avgPrice = totPrice/2;
       let varPrice=maxPrice-avgPrice;
       console.log("avg price = " + avgPrice);
       let priceRatio = 0;
       if (maxPrice > 0) { 	   
           priceRatio = (maxPrice-avgPrice)/maxPrice;
       
       }
       let rsi = 0.00;	   
       if (priceMoves.length > RSIN) {
           let avgP = SAMoves(priceMoves);
           console.log("price moves data ===== array = " + JSON.stringify(priceMoves));
	   console.log("avg prices rsi " + JSON.stringify(avgP));
	   let rs = calcRS(avgP["upAvg"], avgP["downAvg"]);
	   console.log("rs value = " + rs);
	   rsi = calcRSI(rs);
	   console.log("rsi value = " + rsi);
       }
       let tvr = numberTxns/varPrice; // ratio => more txns more variation
	   // max":20708.57,"avg":20707.585,"var":0.9850000000005821
       let buyP = parseFloat(maxPrice - 2*varPrice).toFixed(2); // var taken from the average, so *2
       // based on profit margin - let sellPx = parseFloat(profitMargin + capital)*parseFloat(buyP/capital)
       //let sellP = parseFloat(sellPx).toFixed(2);
       let sellP=avgPrice.toFixed(2); // can also take max price - look at trend for previous 100 values
       let pricevar = {"open":openPrice, "close": closePrice, "txns": numberTxns, 
	       "min":minPrice, "max":maxPrice, "avg":avgPrice, "var":varPrice, 
	       "ratio": priceRatio, "rsi": rsi, "tvr": tvr, "buy": buyP, "sell": sellP
               };
       console.log("price data ===== array = " + JSON.stringify(pricevar));
       //let orderRef = 1;
       console.log("start wait ....");
       //prevAvgPrice = praseFloat(price);
       let chgPrice = avgPrice - prevAvgPrice;
       prevAvgPrice = avgPrice;
//sumPriceDB, avgPriceDB
// avgPrice
	avgPriceDB = (avgPriceDB + avgPrice)/2;
	changePriceDB =  (changePriceDB + chgPrice)/2;
       let percentChange = parseFloat(changePriceDB/avgPriceDB);
console.log("avg price db " + avgPriceDB);
console.log("change price db " + changePriceDB);
console.log("percent change price " + percentChange);

       let directionPrice = 0;
       histId++;
       
       if (chgPrice > 0) directionPrice = 1; else directionPrice = -1;
       let datadb = d.toString().replace('GMT+0000 (Coordinated Universal Time)','');
       let statSQL = buildSQLStats(avgPrice, orgTime, chgPrice, directionPrice, datadb);
       insertOrder(statSQL);
       let trade = true;
	   // Fri Nov 11 2022 07:23:40 GMT+0000 (Coordinated Universal Time)
//function buildSQLStats(avgPrice, timePrice, chgPrice, directionPrice) {
    //  buyP = 17200.00;
	   if (orderRefGlobal == 671) orderRefGlobal = 672;
	   //if (sold) {
	       numTries = 0; //reset when considering new orders
	   console.log("order ref at invoke 111111111111111111111111111" + orderRefGlobal);
	   orderRefGlobal++; // take into account the sell order    
	   console.log("order ref at invoke 000000000000000000000000000" + orderRefGlobal);
	   sold=false; 
           console.log("percent change = " + percentChange);
           console.log("mmmmmmmmmmmmmmmmmm start mmmmmmmmmmmmm");
	   if (Math.abs(percentChange < 0.005)) { 		   
              if (totOrders < totOrderLimit) {
		      const ran=Math.floor(Math.random() * 1000)
		      const ran2 = Math.floor(Math.random() * 1000)
		      var orderRefVal = ran*ran2;
		      console.log("order ref val === "+ orderRefVal);
		      //await newMarginOrder(buyP, sellP, btcQty, orderRefGlobal);
		      await manageOrder(buyP, sellP, btcQty, orderRefVal);
	      }
	   }
           console.log("yyyyyyyyyyyyyyyyymmmmmmmmmmmmmmmmmm end mmmmmmmmmmmmm");
	   //getId();    
    //   }
      // setTimeout(function() { console.log("waiting ...........");
     //  }, 10000);
       console.log("end wait ....");
       //process.exit();
       if (minPrice > 0) {
           prices.push(pricevar);

       }
       console.log("==================================== new time in secs ===================================");
       prevSecs = numberSecs; // init current sec value
       prevClosePrice = closePrice; // save prev close price
       minPrice = parseFloat(price); // init min price
       minPrice = parseFloat(price); // init min price
       maxPrice = parseFloat(price); // init max price
       openPrice = parseFloat(price); //reset for the new candletsick
       closePrice=parseFloat(price);  // reset for the new candlestick
       numberTxns=1;  // initialize number of txns	   
       k++;
   } else {
       numberTxns++;	   
       closePrice=parseFloat(price);	   
       if (price < minPrice) minPrice =parseFloat(price);
       if (price > maxPrice) maxPrice = parseFloat(price);


   }
 // console.log(" tot orders ==================== "+ totOrders);
//  console.log(" tot order limit ==================== "+ totOrderLimit);
// add a check for open orders
  // if ((k>runCycle) || (totOrders >= totOrderLimit)) {
   if ((k>runCycle)) {
      // let pricevar = {"min":minPrice, "max":maxPrice};
     //  prices.push(pricevar);
       console.log("price data ===== array = " + prices);
      let priceUp=0;
      let priceDown=0;
      let priceUpTot=0;
      let priceDownTot=0;
      let priceChange=0;
      for (let i=0;i < prices.length; i++) {
	  //  {"open":20867.08,"close":20866.87,"txns":50,"min":20866.16,"max":20867.1,"avg":20866.629999999997,"var":0.47000000000116415,"ratio":0.00002252349392110855}
          console.log("price data " + i + " " + JSON.stringify(prices[i]));
      }
      
      process.exit();
   }
   //console.log("min price = " + minPrice);
   //console.log("max price = " + maxPrice);

}


function priceUpDown(priceCloseT, priceCloseT_1) {
    let priceUp=0;
    let priceDown=0;
    let priceChange = priceCloseT - priceCloseT_1;
    if (priceChange == 0) {
        priceUp=0;
        priceDown=0;
    } else {
        if (priceChange > 0) {
            priceUp=priceChange;
            priceDown=0;
        } else {
            priceUp=0; 
            priceDown=Math.abs(priceChange);	  
        }
    }
    let priceUD = { "up": priceUp, "down": priceDown};
    return priceUD;
}

function SAMoves(udMoves) {

    let sumUp=0;
    let sumDown=0;
    for (let i=0; i<udMoves.length;i++) {
        let upP = udMoves[i]["up"];
        let downP = udMoves[i]["down"];
	sumUp += upP;
	sumDown += downP;
    }
  //  upMoves.forEach(p => {sumUp += p;});
  //  downMoves.forEach(p => {sumDown += p;});
    let avgUp = sumUp/udMoves.length;
    let avgDown = sumDown/udMoves.length;
    let jsonAvg = {"upAvg": avgUp, "downAvg": avgDown};
    return jsonAvg; 	
}

function calcRS(avgUp, avgDown) {
    return avgUp/avgDown;
}

function calcRSI(RS) {
    let RSIval = 100 - 100/(1+RS);
    return RSIval;
}

async function timetest1(buyPrice, sellPrice, btcQty, orderRef) {
      sold=false;
      console.log("****************************** first new order ***********************");	
      setTimeout(function() { sold=true;console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& waiting ...........");
       }, 5000);
      console.log("****************************** second new order ***********************");	
}
async function manageOrder(buyPrice, sellPrice, btcQty, orderRef) {

    totOrders++;
	console.log("tot orders ---------> " + totOrders);
    sold = false;
    let OrderPair = orderRef;
    let buyOrderRef = orderRef;
    let Pair = 'BTCUSDT';
    let Type = 'BUY';
    let Price = buyPrice;
    let Qty = btcQty;
    let Status = 'Closed'; // buy order
    let buyPriceStr = buyPrice.toString();
    let sellPriceStr = sellPrice.toString();
    let orderRefStr = orderRef.toString();
    console.log("price order reference global " + orderRefGlobal);
    console.log("price str buy " + buyPriceStr);
    console.log("price str sell "+ sellPriceStr);
    //let orderType = 'FOK';
    //let orderType = 'IOC';
    let timeInForce = 'GTC';
    let orderType = 'BUY';	
    let errorTrade = false;
      let responseMargin = await bmod.newMarginOrder(buyPrice, btcQty, orderRef, timeInForce, orderType);

      console.log("++++++++++ end of order +++++++++++++++");
      //console.log("json = "+ JSON.stringify(responseMargin));
      if (responseMargin) {
	  client.logger.log(responseMargin.data);
         // if (!responseMargin["error"]) {
/*symbol: 'BTCUSDT',
  orderId: 15437356167,
  clientOrderId: '61104',
  price: '16893.04',
  origQty: '0.0025',
  executedQty: '0',
  cummulativeQuoteQty: '0',
  status: 'NEW',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  stopPrice: '0',
  icebergQty: '0',
  time: 1668246495375,
  updateTime: 1668246495375,
  isWorking: true,
  accountId: 263,
  isIsolated: true
*/
	      let orderId = responseMargin.data.orderId;
              let clientOrderId = responseMargin.data.orderId;
              let priceRes = responseMargin.data.price;
              let origQty = responseMargin.data.origQty;
              let executedQty = responseMargin.data.executedQty;
              let cummulativeQuoteQty = responseMargin.data.cummulativeQuoteQty;
              let statusRes = responseMargin.data.status;
              let timeInForce = responseMargin.data.timeInForce;
              let typeRes = responseMargin.data.type;
              let sideRes = responseMargin.data.side;
          //  let stopPrice = response.data.stopPrice;
          //  let icebergQty = response.data.icebergQty;
         //   let timeRes = response.data.time;
        //    let updateTime = response.data.updateTime;
        //    let isWorking = response.data.isWorking;
        //    let accountId = response.data.accountId;
              let isIsolated = responseMargin.data.isIsolated;
              let errorTrade = false;
              let executedTrade = false;
	      let checkedCount = 0;
	      if (executedQty > 0) btcQty = executedQty;

	      if (timeInForce == 'FOK') {
                  if (executedQty > 0) executedTrade = true;
	      } else {
                  if (timeInForce == 'IOC') {
                      btcQty = executedQty;
		  }
	      }
              while ((!executedTrade) && (checkedCount < 20) && (!errorTrade) && (timeInForce != 'FOK') && (timeInForce != 'IOC')) {
                  checkedCount++;
	   	  console.log("nnnnnnn start getorder");
                  let result = await bmod.getOrder(orderId, isIsolated); // order ref = pair ref for order
	          console.log("nnnnnnn end getorder");
                  if (result) { 
			  // await not working correctly
		       client.logger.log(result.data);
                       if (result.data.executedQty > 0) { executedTrade = true;}
		       await addQueryOrder(result.data);
	          }
              } // end of check for txn existance
	
              if (executedTrade) {
                  console.log("------- sell order now, buy was done -------");
                  console.log("????????????? global order ref before ???????????? " + orderRefGlobal );
                  console.log("????????????? local order ref ???????????? " + orderRef );
                  let orderRefSellVal = orderRef++; // global var
                  console.log("????????????? global order ref after ??????????? " + orderRefGlobal );
//	          await sellOrder(sellPrice, btcQty, orderRefSellVal, OrderPair); // order ref for the buy is the ref for the order pair
	          await manageSellOrder(sellPrice, btcQty, orderRefSellVal, OrderPair); // order ref for the buy is the ref for the order pair
	          //insert buy order - do after sell to save time
                   let sql = buildSQLGen(buyOrderRef, OrderPair, Pair, Type, Price, Qty, Status, responseMargin);
                   await insertOrder(sql);
                   ///getOrder(buyPrice, sellPrice, btcQty, orderRef, orderRef); // order ref = pair ref for order
                   await addOpenOrder(responseMargin);
              } else {
           //       if ((!errorTrade) 
	//		  && (orderType != 'FOK') 
	//		  && (orderType != 'IOC') 
//
//		  ) {
	              await addCancelOrder(responseMargin);
	              Status = 'Cancelled';
	              console.log(" cancel orderid = " + orderId);
	              //  console.log(" iceberg qty " + icebergQty);

	              let respcancel = await bmod.cancelOrder(orderId, isIsolated);
		      console.log(client.logger.log(respcancel.data));
                      let sql = buildSQLGen(orderRef, OrderPair, Pair, Type, Price, Qty, Status, responseMargin);
                      await insertOrder(sql);

  //                }
	      }
         // }
      }	      
}

function buildSQLGen(orderRef, OrderPair, Pair, Type, Price, Qty, Status, responseMargin) {
     let orderId = responseMargin.data.orderId;
              let clientOrderId = responseMargin.data.orderId;
              let priceRes = responseMargin.data.price;
              let origQty = responseMargin.data.origQty;
              let executedQty = responseMargin.data.executedQty;
              let cummulativeQuoteQty = responseMargin.data.cummulativeQuoteQty;
              let statusRes = responseMargin.data.status;
              let timeInForce = responseMargin.data.timeInForce;
              let typeRes = responseMargin.data.type;
              let sideRes = responseMargin.data.side;
          //  let stopPrice = response.data.stopPrice;
          //  let icebergQty = response.data.icebergQty;
         //   let timeRes = response.data.time;
        //    let updateTime = response.data.updateTime;
        //    let isWorking = response.data.isWorking;
        //    let accountId = response.data.accountId;
              let isIsolated = responseMargin.data.isIsolated;
     let sql = buildSQLInsertBuy(orderRef, OrderPair, 
	     Pair, 
	     Type, Price, Qty, Status,

                            orderId,
                            clientOrderId,
                             priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                //   stopPrice,
               //    icebergQty,
              //     timeRes,
              //     updateTime,
              //     isWorking,
               //    accountId,
                   isIsolated

                          );
	return sql;

}

async function manageSellOrder(sellPrice, btcQty, orderRefSellVal, OrderPair) {
    let Pair = 'BTCUSDT';
    let Type = 'SELL';
    let Price = sellPrice;
    let Qty = btcQty;
    let Status = 'Closed'; // buy order
    //let rSell = await sellOrder(sellPrice, btcQty, orderRefSellVal, OrderPair);
// price, quantity, clientOrderId, timeInForce, orderType)
    let rSell = await bmod.newMarginOrder(sellPrice, btcQty, orderRefSellVal, 'GTC', Type);
 //   console.log("response " + JSON.stringify(rSell));
    
    if (rSell) {
      //  if (!rSell["error"]) {

            await addQueryOrder(rSell);
            let orderId = rSell.data.orderId;
            let clientOrderId = rSell.data.orderId;
            let priceRes = rSell.data.price;
            let origQty = rSell.data.origQty;
            let executedQty = rSell.data.executedQty;
            let cummulativeQuoteQty = rSell.data.cummulativeQuoteQty;
            let statusRes = rSell.data.status;
            let timeInForce = rSell.data.timeInForce;
            let typeRes = rSell.data.type;
            let sideRes = rSell.data.side;
            let stopPrice = rSell.data.stopPrice;
            //  let icebergQty = rSell.resp.icebergQty;
            //    let timeRes = rSellresp..time;
            //     let updateTime = rSell.resp.updateTime;
            //     let isWorking = rSell.resp.isWorking;
            //     let accountId = rSell.resp.accountId;
            let isIsolated = rSell.data.isIsolated;
            //console.log("icebergqty == " + icebergQty);
            //while ((!executedTrade) && (checkedCount < 20)) {
            //  checkedCount++;
            //   executedTrade = await getSellOrder(sellPrice, btcQty, orderRefSell, OrderPair); // order ref = pair ref for order
            let errorTrade = false;
            let executedTrade = false;
            let checkedCount = 0;
            while ((!executedTrade) && (checkedCount < 20) && (!errorTrade)) {
                checkedCount++;
	        //    return {"exec":true, "rtn": 0};
               // let result = await getSellOrder(sellPrice, btcQty, orderRefSellVal, OrderPair); // order ref = pair ref for order
                  let result = await bmod.getOrder(orderId, isIsolated); // order ref = pair ref for order
                if (result) { // await not working correctly
		       client.logger.log(result.data);
                       if (result.data.executedQty > 0) { executedTrade = true;}
		       await addQueryOrder(result.data);
	        }
            }
            if (executedTrade) {
                console.log("------- sold order now -------");
                //  let sql = buildSQLInsert(sellOrderRef, OrderPair, Pair, Type, Price, Qty, Status);
                //  insertOrder(sql)
	        let sql = buildSQLGen(orderRefSellVal, OrderPair, Pair, Type, Price, Qty, Status, rSell);
             /*   let sql = buildSQLInsertBuy(orderRefSellVal, 
		    OrderPair, Pair, Type, 
		    Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                 //  stopPrice,
                 //  icebergQty,
                 //  timeRes,
                 //  updateTime,
                //   isWorking,
                //   accountId,
                   isIsolated
	        );
		*/
                await insertOrder(sql) 

            } else {

         //        if (!errorTrade) {
	             Status = 'Open';
		     let sql = buildSQLGen(orderRefSellVal, OrderPair, Pair, Type, Price, Qty, Status, rSell);
               /*      let sql = buildSQLInsertBuy(orderRefSellVal, OrderPair, Pair, Type, Price, Qty, Status,
                                orderId,
                                clientOrderId,
                                priceRes,
                                origQty,
                                executedQty,
                                cummulativeQuoteQty,
                                statusRes,
                                timeInForce,
                                typeRes,
                                sideRes,
                                //   stopPrice,
                                //   icebergQty,
                                //    timeRes,
                                //    updateTime,
                                //    isWorking,
                                //    accountId,
                                isIsolated);
				*/
                     await insertOrder(sql);
	   //      }
	    }
	//}
    }
}




function buildSQLInsertBuy(OrderRef, OrderPair, Pair, Type, Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                //   stopPrice,
               //    icebergQty,
               //    timeRes,
               //    updateTime,
               //    isWorking,
               //    accountId,
                   isIsolated
) {

  /*symbol: 'BTCUSDT',
  orderId: 15302691247,
  clientOrderId: '393',
  price: '17180.29',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '42.947475',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  stopPrice: '0',
  icebergQty: '0',
  time: 1668012106653,
  updateTime: 1668012106653,
  isWorking: true,
  accountId: ,
  isIsolated: true
  */
    var sql =
    "insert into trade (orderref, orderpair, pair, type, price, qty, txndate, status, " +
    "orderId, clientOrderId, priceRes, origQty, executedQty, cummulativeQuoteQty, " +
    " statusRes, timeInForce, typeRes, sideRes," +
		//stopPrice, icebergQty, timeRes, " +
   // "updateTime, isWorking, accountId,
		"isIsolated " +

    ") values (" +
    OrderRef + ", " + OrderPair + 
    ",'" +
    Pair + "','" + Type + "'," + Price + "," + Qty + "," + "NOW()" + ",'"+ Status + "'," +
    
                    + orderId + "," +
                  "'"+ clientOrderId + "'," +
                  "'" + priceRes +  "'," +
                  "'" + origQty  + "'," +
                   "'" + executedQty + "'," +
                   "'" + cummulativeQuoteQty + "'," +
                   "'" + statusRes + "'," +
                   "'" + timeInForce + "'," +
                   "'" + typeRes + "'," +
                   "'" + sideRes + "'," +
              //     "'" + stopPrice + "'," +
               //    "'" + icebergQty + "'," +
              //     timeRes + "," +
             //      updateTime + "," +
            //       isWorking + "," +
            //       accountId + "," +
                   isIsolated +
  /*symbol: 'BTCUSDT',
  orderId: 15302691247,
  clientOrderId: '393',
  price: '17180.29',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '42.947475',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  stopPrice: '0',
  icebergQty: '0',
  time: 1668012106653,
  updateTime: 1668012106653,
  isWorking: true,
  accountId: ,
  isIsolated: true*/

    ")";
    console.log('sql ==== ' + sql);
    return sql;

}


function buildSQLStats(avgPrice, timePrice, chgPrice, directionPrice, timeSecs) {

    var sql =
    "insert into tradehist (avg_Price, time_Price, chg_Price, direction_Price, time_secs ) values (" +
        avgPrice + "," + timePrice + "," + chgPrice + ", " + directionPrice + ",'" + timeSecs + "')";

    console.log('sql ==== ' + sql);
    return sql;

}
function buildSQLInsert(OrderRef, OrderPair, Pair, Type, Price, Qty, Status) {

    var sql =
    "insert into trade (orderref, orderpair, pair, type, price, qty, txndate, status) values (" +
    OrderRef + ", " + OrderPair + 
    ",'" +
    Pair + "','" + Type + "'," + Price + "," + Qty + "," + "NOW()" + ",'"+ Status + "'" +
    ")";
    console.log('sql ==== ' + sql);
    return sql;

}

async function insertOrder(sql) {
// need to add async await later into this db

/*crypto=# CREATE TABLE TRADE(
   ID SERIAL PRIMARY KEY,
   ORDERREF INTEGER,
   PAIR VARCHAR(8),
   TYPE CHAR(4),
   PRICE MONEY,
   QTY NUMERIC(5,10),
   TXNDATE TIMESTAMP,
   STATUS VARCHAR(6)
);
*/

  console.log("insert db   " + sql);
  //  var sql = "select user_name from account where user_name = '" + userName +"' ";
  var res;
  try {
   await  pool.query(sql);
  //  pool.end;
   // return res.rows;
  } catch (err) {
    console.log(err);
  }
}



async function getHistId() {
        console.log("test history");
//sql = "select currval('trade_id_seq')";
let sql = "select last_value from tradehist_id_seq";

//sql = "select * from trade";
try {
        let res=await pool.query(sql)
 //       .then((data) => {console.log(" hist ref " + JSON.stringify(data));
let histIdlocal = parseInt(res.rows[0]["last_value"]);
//	 console.log("histid llllllll = "+ histId);
//	 console.log("last val llllllll = "+parseInt(data["rows"][0]["last_value"]) );
		//orderRef++;
//	return data})
return histIdlocal;
} catch (err) {
        console.log(err);
        return 0;
}

}
async function sumPrices(sql) {
        console.log("test price");
//sql = "select currval('trade_id_seq')";

try {
        let res=await pool.query(sql)
        //.then((data) => {console.log(" data returned " + JSON.stringify(data));
	 //orderRef++;
        console.log("res == " + JSON.stringify(res));
	//priceRows = res.rows;
	let sum= parseFloat(res.rows[0]["sum"]);
	let avg=parseFloat(res.rows[0]["avg"]);
	let priceJson = {"sum": sum, "avg": avg};
	//return res.rows})
	return priceJson;

} catch (err) {
        console.log(err);
        return 0;
}
}
async function getId() {
        console.log("test");
//sql = "select currval('trade_id_seq')";
let sql = "select last_value from trade_id_seq";

//sql = "select * from trade";
try {
        let res=await pool.query(sql)
       // .then((data) => {console.log(" order ref " + JSON.stringify(data));
        console.log("res == " + JSON.stringify(res));
	let orderRefGlobalLocal = parseInt(res.rows[0]["last_value"]);
//	console.log("order ref == "+ orderRefGlobal);
	 //orderRef++;
	//return data})
	return orderRefGlobalLocal;

} catch (err) {
        console.log(err);
        return 0;
}

}
//var  cancelModel = mongoose.model("cancelModel", cancelSchema);
//166 var  openOrderModel = mongoose.model("openOrderModel", openOrderSchema);
//167 var  queryOrderModel = mongoose.model("queryOrderModel", queryOrderSchema);
//168 

async function addOpenOrder(jsonOpenResponse) {
  var openOrderRec = new openOrderModel( jsonOpenResponse);
    await openOrderRec.save(function(err, doc){
        if(err) throw err;
         console.log("open order db done" + jsonOpenResponse);
      });
}
async function addCancelOrder(jsonCancelResponse) {
  var cancelRec = new cancelModel( jsonCancelResponse);
    await cancelRec.save(function(err, doc){
        if(err) throw err;
         console.log("cancel order db done" + jsonCancelResponse);
      });
}
async function addQueryOrder(jsonQueryResponse) {
  var queryRec = new queryOrderModel( jsonQueryResponse);
   await queryRec.save(function(err, doc){
        if(err) throw err;
         console.log("query order db done" + jsonQueryResponse);
      });
}
//ws.on('message', function incoming(data) {
//    console.log(data);
//})

}