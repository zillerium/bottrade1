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
//var log4js = require("log4js");
import pkg from 'log4js';
const { configure, getLogger } = pkg;
configure({
    appenders: {
        out: { type: 'stdout' },
	bot: { type: 'file', filename: '/home/ubuntu/binance/bot.log' },
	price: { type: 'file', filename: '/home/ubuntu/binance/price.log' },
    },
    categories: { default: { appenders: ['bot', 'out'], level: "info"},	
      price: { appenders: ['price', 'out'], level: "info"}},	
})


const logger = getLogger();
const loggerp = getLogger("price");
//var logger = log4js.getLogger("bot");
var minTradeValue = 0.0012; // to sell left over coins
var minTradingBalance = 2000;
const checkLimitOrder= 3; // number of attempts to confirm buy order
//var k=0; // number of candlesticks processed
//var prevClosePrice=0.00; // prev close price on a candlestick
var prices = []; // prices from stream
//var runCycle=400;
var batchSize= 100;
var minTradePrice = 10000; // safety
var maxTradePrice = 25000; // safety
var runCycle=150;
const RSIN=14; // period for RS
var totOrders = 0;
var histId = 0;
var totOrderLimit = 1;
//var btcQty = 0.0015;
var btcQty = 0.01;
require('dotenv').config();
import {BotMod}  from './botmod.js';
import {DBMod}  from './dbmod.js';
import {SQLMod}  from './sqlmod.js';
import {StatsMod}  from './statsmod.js';
const { Spot } = require('@binance/connector')
const apiSecret = process.env.API_SECRET;
const apiKey = process.env.API_KEY;
//const Spot = require('./binance-connector-node/src/spot')
const Pool = require("pg").Pool;
const client = new Spot(apiKey, apiSecret)
var safeLimit = 10; // difference between buys and sells to stop a runaway bot buying
const bmod = new BotMod(client, minTradePrice, maxTradePrice, safeLimit);
const dbmod = new DBMod();
const sqlmod = new SQLMod();
const statsmod = new StatsMod();
var cycleCount = 0;
statsmod.setBuyQty(btcQty);
statsmod.setRSIN(RSIN);
statsmod.setPrevSecs(0); // initial Value
console.log(client);
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "crypto",
  password: "password",
  port: 5432,
});

sqlmod.setPool(pool);

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/trade');

 dbmod.cancelJsonSet();
 dbmod.openOrderSet();
 dbmod.queryJsonSet();

var queryOrderSchema = new mongoose.Schema(dbmod.openOrderGet());
var openOrderSchema = new mongoose.Schema(dbmod.cancelJsonGet());
var cancelOrderSchema = new mongoose.Schema(dbmod.queryJsonGet());

var  cancelModel = mongoose.model("cancelModel", cancelOrderSchema);
var  openOrderModel = mongoose.model("openOrderModel", openOrderSchema);
var  queryOrderModel = mongoose.model("queryOrderModel", queryOrderSchema);

dbmod.queryModelSet(queryOrderModel);
dbmod.openModelSet(openOrderModel);
dbmod.cancelModelSet(cancelModel);

pool.connect();

main();

function sleep(ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function getMod(n, m) {
    return ((n % m) + m) % m;
}

async function btcBalCheck(btcBalLocal, minTradeValueLocal, currencyPairLocal, minTradePriceLocal) {
    let tradePrice = 0.0;
    if (btcBalLocal > minTradeValueLocal) {
        let tradelimit = 10;
	let isIsolatedMargin = "TRUE";
		  logger.info("api check order");
	let trades = await bmod.getTrades(currencyPairLocal, tradelimit, isIsolatedMargin);
	console.log("response == " + JSON.stringify(trades.data));
	if (trades.data) {
	    let j = tradelimit;
	    do {
	      //console.log(trades.data[j])
	        j--;
	        console.log(trades.data[j]);
	        if (trades.data[j]["isMaker"] == true) {
                    // take last maker - sell - price
                    console.log("match on price === " + j);
                    tradePrice = parseFloat(trades.data[j]["price"]);
	        }
	    } while ((j > 0) && (tradePrice == 0.0));
	    //  console.log(array[i])
        }
	console.log(" ################## sale price = " + tradePrice);
	if (tradePrice > minTradePriceLocal) {
		logger.info("api new order - check sale");
            let responseorder = await bmod.newMarginOrder(
                tradePrice,
                btcBalLocal,
                "none",
                "GTC",
                "SELL"
                );
        }
    }
    return 0;
}			
async function processOrder() {

		  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		  console.log("+     NEW API CALL                                               +");
		  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		  logger.info("loop order - new api call ");
		  totOrders++;
		  const ran=Math.floor(Math.random() * 1000)
		  const ran2 = Math.floor(Math.random() * 1000)
		  var orderRefVal = ran*ran2;
		  console.log("order ref val === "+ orderRefVal);
		  let currencyPair = 'BTCUSDT';
                  let jsonAccount = await bmod.getAccountDetails(currencyPair);
		  console.log(JSON.stringify(jsonAccount.data));
		  let btcBal = parseFloat(jsonAccount.data["assets"][0]["baseAsset"]["free"]);
		  let freeBal = parseFloat(jsonAccount.data["assets"][0]["quoteAsset"]["free"]);
                  let tradePrice = 0.00;
                  let btcrtn = await btcBalCheck(btcBal, minTradeValue, currencyPair, minTradePrice);
                  console.log(" ooooooo freeBal = " + freeBal);
                  console.log(" ooooooo min trading balance = " + minTradingBalance);
		  // avoid when profit is zero
		  // add two sell prices - one at max candlestick and one at x10 candlestick - 50% split.
		  let profitprojected = statsmod.getSellPrice() - statsmod.getBuyPrice();
		 console.log("--------------> profit projected == " + profitprojected);
		  if ((freeBal > minTradingBalance) && (profitprojected > 0) && (statsmod.RSI<30)) {
		      let rtnresp =  await manageOrder(statsmod.getBuyPrice(), statsmod.getSellPrice(), statsmod.getBuyQty(), orderRefVal);
		      totOrders = totOrders+ 100; // pause processing
                  } else { 
		      totOrders = totOrders+ 100; // pause processing
		  }
		  console.log("************************************************");
		  console.log("***** END OF API CALL ***************************");
		  console.log("************************************************");

}

async function newCandleStickManager(orgTime, d) {

       // new candlestick
       console.log("************************************************************");
       console.log("*              NEW CANDLESTICK                            *");
       console.log("*              second count = " + statsmod.getNumberSecs() + "                 *");
       console.log("************************************************************");
       


	statsmod.newCandleStick();
       console.log("nnnnnnnn = "+ JSON.stringify(statsmod.getPriceVars()) + "  *** "); 
       histId++;

      let datadb = d.toString().replace('GMT+0000 (Coordinated Universal Time)','');
      sqlmod.buildSQLStats(statsmod.getAvgPrice(), orgTime, statsmod.getChgPrice(), statsmod.getDirectionPrice(), datadb);
      let rtn = await sqlmod.insertStats();
      
	let delim = ",";
      loggerp.warn(delim, statsmod.getNumberSecs(), delim, statsmod.getBuyPrice(), delim, statsmod.getSellPrice()); 
      let trade = true;
      console.log("percent change = " + statsmod.getPercentChange());

       console.log("************************************************************");
       console.log("*              END CANDLESTICK                            *");
       console.log("*              second count = " + statsmod.getNumberSecs() + "                 *");
       console.log("************************************************************");
}


async function main() {

        let rtnsql = await sqlmod.getId();
    
	let rtnhist =  await sqlmod.setHistId();
	histId = sqlmod.getHistId();
        console.log("histid == " + histId);

	let firstId = 3;
        let lastId = histId;
        console.log("oooooooooo histId = " + histId);
        if (lastId > 2*batchSize) firstId = lastId - batchSize;
        // add async later
        let priceSQL = "select avg(avg_price), sum(chg_price) from tradehist where id between " + firstId + " and " + lastId;
        console.log("price sql = " + priceSQL);
        sqlmod.setPriceSQL(priceSQL);
	let rtnsum =await sqlmod.sumPrices();
	var priceChgJson = sqlmod.getPriceJson();
        console.log("+++++++++++++++++++++++++++++ price change "+ JSON.stringify(priceChgJson));
        statsmod.setChangePriceDB(parseFloat(priceChgJson["sum"]));
        statsmod.setAvgPriceDB(parseFloat(priceChgJson["avg"]));



ws.onmessage = async  (event) => {

   // get the streamed data	
   let obj = JSON.parse(event.data); // data stream of prices
   //  console.log(JSON.stringify(obj));

   // get the price 
   statsmod.setCurrentPrice(parseFloat(obj.p).toFixed(2)); // price
   //   console.log("price = " +price);

   // Calc the sec value for the candlestick

   let orgTime = parseInt(obj.E); // time - in millisecs
   let tradeTime = parseInt(obj.E/1000);
   //   console.log("trade time = " + tradeTime);

   let d = new Date(orgTime);
   //   console.log("local time in date - " + d);
   //let timeCheck = d.setUTCSeconds(orgTime);
   let numberSecs = (d.getTime() - d.getMilliseconds())/1000; // number of secs for that candlestick
   //var rsiCurrentPeriod=0;
   //   console.log("local time in secs - " + numberSecs);
   statsmod.setNumberSecs(numberSecs);
  
   if (statsmod.getPrevSecs() == 0) {
       // first time
       statsmod.initializeTxns();
   }
//	cycleCount++;
//	console.log("****** ======= cycle count " + cycleCount + " ");
       // data streams in millisecs - only take sec blocks	   
   if (statsmod.getNumberSecs() > statsmod.getPrevSecs())  {
       if (getMod(statsmod.getNumberSecs(), 60)==0) {
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("& start of main loop &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
  	    cycleCount++;
	    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++****** ======= cycle count " + cycleCount + " ");
	    console.log("AAAAAAAAAAAAAAAAAAAA start");
	       let rtn1 = await newCandleStickManager(orgTime, d);
	    console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBb end");
            console.log("***** price moves = " + JSON.stringify(statsmod.getPriceMoves()) + " ****");
           if (Math.abs(statsmod.getPercentChange() < 0.005)) {
	       console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
               if (totOrders < totOrderLimit) {
	           console.log("CCCCCCCCCCCCCCCCCCCC start");
	           let rtn = await processOrder();
	           console.log("DDDDDDDDDDDDDDDDDDDDDDD start");
	       }
	   }
       
          //process.exit();
           if (statsmod.getMinPrice() > 0) {
          // prices.push(statsmod.getPriceVars());
               statsmod.setPrices();
           }
           console.log("==================================== new time in secs ===================================");
           statsmod.setPrevSecsToNumber();
           statsmod.setPrevClosePrice(); 
           statsmod.setOpenPrice(parseFloat(statsmod.getCurrentPrice())); //reset for the new candletsick
           statsmod.setClosePrice(parseFloat(statsmod.getCurrentPrice()));  // reset for the new candlestick
           statsmod.setMinPrice(parseFloat(statsmod.getCurrentPrice())); // init min price
           statsmod.setMaxPrice(parseFloat(statsmod.getCurrentPrice())); // init min price

           statsmod.setNumberTxns(1);  // initialize number of txns	   
           statsmod.incCycle();
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("& end of main loop &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       } else {
	   // min change
           statsmod.incNumberTxns();	   
           statsmod.setClosePrice(parseFloat(statsmod.getCurrentPrice()));
           statsmod.setMinMaxPrices();
       } 
    } else {

    }

   // if ((k>runCycle) || (totOrders >= totOrderLimit)) {
   //if ((k>runCycle)) {
   if (statsmod.getCycle()>runCycle) {
       console.log("price data ===== array = " +JSON.stringify(statsmod.getPrices()));
let priceArray = statsmod.getPrices();
       for (let i=0;i < priceArray.length; i++) {
	  //  {"open":20867.08,"close":20866.87,"txns":50,"min":20866.16,"max":20867.1,"avg":20866.629999999997,"var":0.47000000000116415,"ratio":0.00002252349392110855}
          console.log("price data " + i + " " + JSON.stringify(priceArray[i]));
      }
      
      process.exit();
   }

}


async function timetest1() {
      console.log("****************************** first new order ***********************");	
      setTimeout(function() { console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& waiting ...........");
       }, 5000);
      console.log("****************************** second new order ***********************");	
}

function isExecuted(executedQty, timeInForce) {
     if (timeInForce == 'FOK') {
             if (executedQty > 0) return true;
     } else {
                  if (timeInForce == 'IOC') {
                      btcQty = executedQty;
                  }
              }


}

async function proofExecution (orderQty, executedQty, orderId, isIsolated) {
    console.log("********************* checking poe ============= " + orderId);
console.log("order qty " + orderQty);
	
console.log("exc qty " + executedQty);
console.log("order id " + orderId);
console.log("isIsolated " + isIsolated);
    let executedTrade = false;
    let qty = parseFloat(executedQty);
    let orgQty = parseFloat(orderQty);
    if (qty == orgQty) {
	    executedTrade = true;
    }	   
    console.log("loop");
    let checkedCount = 0;
    while ((!executedTrade) && (checkedCount < checkLimitOrder)) {
        checkedCount++;
		logger.info("api check sale");
        let result = await bmod.getOrder(orderId, isIsolated); // order ref = pair ref for order
        // let rtnresult = await dbmod.addQueryOrder(result.data);
	console.log("resuilt " + JSON.stringify(result.data));
	if (result.data) {
            client.logger.log(result.data);
            qty = parseFloat(result.data.executedQty);
            orgQty = parseFloat(result.data.origQty);
           // let rtnval = await addQueryOrder(result.data);
	    console.log("qty val = " + qty);
	    console.log("org qty val = " + orgQty);
	
            if (qty == orgQty ) {
	      console.log("if statement met ");
              executedTrade = true;
            }
	    console.log("exec trade in loop " + executedTrade);
        }
	console.log("end of loop");
    } // end of check for txn existance/manage
	// orders can ne partially sold
    let json =  { "executedTrade": executedTrade, "qty": qty };
    console.log("json out " + JSON.stringify(json));
    return json;
}
async function manageOrder(buyPrice, sellPrice, btcQty, orderRef) {

//    totOrders++;
    if (totOrders > 5*totOrderLimit) {
	    console.log("@@@@@@@@@@@@@@@ forced exit - loop @@@@@@@@@@@@@@@@");
	    process.exit();
    }
    if (totOrders > totOrderLimit) {
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);
	return 0;
    }

    totOrders++;
    console.log("tot orders ---------> " + totOrders);
   
    let OrderPair = orderRef;
    let isIsolated = 'TRUE';    
    let buyOrderRef = orderRef;
   
	logger.info("api new order - buy ");
      let responseMargin = await bmod.newMarginOrder(buyPrice, btcQty, orderRef, 'GTC','BUY');
      let executedTrade = false;
      console.log("++++++++++ end of order +++++++++++++++");
      if (responseMargin) {
	  client.logger.log(responseMargin.data);
	  let orderId = responseMargin.data.orderId;
          let clientOrderId = responseMargin.data.orderId;
          let executedQty = responseMargin.data.executedQty;
          let statusRes = responseMargin.data.status;
          //btcQty = executedQty;
          let executedTradeJson = await proofExecution(btcQty, executedQty, orderId, isIsolated);
          console.log("json exec = " + JSON.stringify(executedTradeJson));
	      // qty is updated when trade is confirmed
	 // if (executedTradeJson) {
             let purchasedQty = executedTradeJson["qty"];
	      executedTrade = executedTradeJson["executedTrade"];
	 // }
	      // partial orders
	    console.log("exec trade bool = " + executedTrade);
	 // if (executedTrade) {
	 if (purchasedQty > minTradeValue) {
	      statsmod.setBuyQty(purchasedQty);
	      statsmod.setQtys();
	      console.log(" buy price ==================== " + statsmod.getBuyPrice());
	      console.log(" sell price ==================== " + statsmod.getSellPrice());
	      console.log(" sell high price ==================== " + statsmod.getHighSellPrice());
	      console.log(" buy qty ==================== " + statsmod.getBuyQty());
	      console.log(" sell qty ==================== " + statsmod.getSellQty());
	      console.log(" sell high qty ==================== " + statsmod.getHighSellQty());
         }
	      let sellOrderRef = orderRef++;
	      let highSellOrderRef = sellOrderRef++;

	  if ((purchasedQty >minTradeValue) && (statsmod.getSellQty() > minTradeValue) && (statsmod.getHighSellQty() > minTradeValue)) {
	      let respsell = await manageSellOrder(statsmod.getSellPrice(), statsmod.getSellQty(), sellOrderRef, OrderPair);
	      let respsell2 = await manageSellOrder(statsmod.getHighSellPrice(), statsmod.getHighSellQty(), highSellOrderRef, OrderPair);
	      //let rtn1 = await dbmod.addOpenOrder(responseMargin.data);
	      //let sqlx1 = buildSQLGen(buyOrderRef, OrderPair, 'BTCUSDT', 'BUY', buyPrice, purchasedQty, 'Closed', responseMargin);
	      sqlmod.createSQL(buyOrderRef, OrderPair, 'BTCUSDT', 'BUY', buyPrice, purchasedQty, 'Closed', responseMargin);
              //let sqlx1 = sqlmod.getSQL();
//		  let rtnx1 = await sqlmod.insertOrder();
	      let profit = parseFloat(statsmod.getSellPrice() - buyPrice)*statsmod.getSellQty();
	      logger.warn("profit =", profit);
              sqlmod.createProfitSQL(buyPrice,statsmod.getSellPrice(), statsmod.getSellQty(), profit);
              let rtnprofit = await sqlmod.insertOrder();
	      profit = parseFloat(statsmod.getHighSellPrice() - buyPrice)*statsmod.getHighSellQty();
	      logger.warn("profit 2 =", profit);
              sqlmod.createProfitSQL(buyPrice,statsmod.getHighSellPrice(), statsmod.getHighSellQty(), profit);
              rtnprofit = await sqlmod.insertOrder();

	 //     if ((btcQty - purchasedQty)>minTradeValue) {
	 //         console.log(" cancel orderid = " + orderId);
//		  logger.info("api cancel order");
//	          let respcancel = await bmod.cancelOrder(orderId, isIsolated);
//	          console.log(client.logger.log(respcancel.data));
	         // let rtn = await dbmod.addCancelOrder(respcancel.data);
	   //   }
	  } else {

		  logger.info("api cancel order");
	          let respcancel = await bmod.cancelOrder(orderId, isIsolated);
	          console.log(client.logger.log(respcancel.data));
	       //   let rtn = await dbmod.addCancelOrder(respcancel.data);
	  }
     }	     
     return responseMargin;
}


async function manageSellOrder(sellPrice, btcQty, orderRefSellVal, OrderPair) {
    console.log("************************ sell order ***** = "+ orderRefSellVal );
	logger.info("api new order - sell ");
    let rSell = await bmod.newMarginOrder(sellPrice, btcQty, orderRefSellVal, 'GTC', 'SELL');
    let executedTrade = false;
    if (rSell) {
   	    //let sql = buildSQLGen(orderRefSellVal, OrderPair, 'BTCUSDT', 'SELL', sellPrice, btcQty, 'Open', rSell);
   	    sqlmod.createSQL(orderRefSellVal, OrderPair, 'BTCUSDT', 'SELL', sellPrice, btcQty, 'Open', rSell);
	    let rtn= await sqlmod.insertOrder();
       
    }
    return rSell;
}


//ws.on('message', function incoming(data) {
//    console.log(data);
//})

}
