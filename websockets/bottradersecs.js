// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"r
const __dirname = path.dirname(__filename);


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

var devLimit = parseFloat(1); // limit of changed allowed on deviation from the period avg - eg 60 mins
var summarySellJson = [];
var summaryBuyJson = [];
const takeLimit = 5000; // open sale orders - limit liabilities 
var riskFactor = parseFloat(2); // defines the risk on the range default is 1, raise this number to decrease risk
const openOrderLimit = 5;
const cycleLimit = 2;
var openSalesOrdersRangeJson=[];
var levelsjson = {};
var avgJsonObj = {};
var orderJson = [];
var openOrdersRangeJson = [];
const logger = getLogger();
const loggerp = getLogger("price");
//var logger = log4js.getLogger("bot");
var minTradeValue = 0.00125; // to sell left over coins
var minTradingBalance = 80;
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
var totOrderLimit = 4;
var btcQty =(parseFloat(1* 0.00075));
console.log("%%%%%--- btcQty "+ btcQty);

//var btcQty = 0.00075;
//var btcQty = 0.01;
require('dotenv').config();
import {BotMod}  from './botmod.js';
import {SQLMod}  from './sqlmod.js';
import {StatsMod}  from './statsmod.js';
import {RiskMod}  from './riskmod.js';
const { Spot } = require('@binance/connector')
const apiSecret = process.env.API_SECRET;
const apiKey = process.env.API_KEY;
//const Spot = require('./binance-connector-node/src/spot')
const Pool = require("pg").Pool;
//const {Client} = require("pg");
const client = new Spot(apiKey, apiSecret)
var safeLimit = 10; // difference between buys and sells to stop a runaway bot buying
const bmod = new BotMod(client, minTradePrice, maxTradePrice, safeLimit);
const sqlmod = new SQLMod();
const statsmod = new StatsMod();
const riskmod = new RiskMod();
var cycleCount = 0;
statsmod.setBuyQty(btcQty);
statsmod.setRSIN(RSIN);
statsmod.setPrevSecs(0); // initial Value
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

main();

function sleep(ms) {
    return new Promise((resolve) => { setTimeout(resolve, ms); });
}

function getMod(n, m) {
    return ((n % m) + m) % m;
}

async function processSellOrderForBuy(allFilledBuyOrders, allSellOrders) {


                  //console.log("nnnnnnbbbb = " + JSON.stringify(allSellOrders));
	 let salesunresolved = await allFilledBuyOrders.map(async item =>  {
		      let saleJson = {};
			  let c = parseInt(item["clientOrderId"])+parseInt(1);	
		      if ((parseInt(item["clientOrderId"]) == 481569849090) ||
		           (parseInt(item["clientOrderId"]) == 3716306906) || 
		           (parseInt(item["clientOrderId"]) == 389325811524)) {

			  } else {
                          let m1 = !allSellOrders.some(m => parseInt(m["clientOrderId"]) == c);
			  if (m1) {
				  let json = await sellOrder(item);
				  return json;	  
			  } 
			  }

	 })

	let salesresolved = await Promise.all(salesunresolved);
	let newSalesJson=salesresolved.filter(m=>{return m !=null})
			  console.log("ooooooooooooo - sals json 1 resolved ---- " + JSON.stringify(salesresolved));
			  console.log("ooooooooooooo - sals json 1 ---- " + JSON.stringify(newSalesJson));
              //   let newSaleOrders= newSaleOrders1.filter(m=>Object.keys(m).length!==0) 
        Object.assign(summarySellJson, newSalesJson);

        if ((newSalesJson) && (newSalesJson.length > 0)) return true;
 return false;

}
async function processingInDupOrder(openSellOrders, rangePrice, nsellprice) {


                         let salesunresolvedDup = openSellOrders.map(m =>  {
                              let ordersJson = {};
                              ordersJson["price"] = parseFloat(m["price"]);
                              ordersJson["topRange"] = parseFloat(m["price"])+rangePrice;
                              ordersJson["botRange"] = parseFloat(m["price"])-rangePrice;
                              ordersJson["dupSale"] = 
                                       ((nsellprice < (parseFloat(m["price"])+rangePrice)) &&
		                       (nsellprice > (parseFloat(m["price"])-rangePrice)))
                              ordersJson["rangePrice"] = rangePrice;
                              ordersJson["sellPrice"] = nsellprice;
                              return ordersJson;
                          })

			  let salesresolvedDup = await Promise.all(salesunresolvedDup);
return salesresolvedDup;
}

async function inRangeDecision(openBuyOrders, topBuyRange, botBuyRange) {

			  let inRange = openBuyOrders.some(m => 
                                      (
	                                (botBuyRange <= (parseFloat(m["price"]))) &&
		                        (topBuyRange >= (parseFloat(m["price"]))))
	                              );
	return inRange;
}

async function inDupDecision(openSellOrders, nsellprice, rangePrice) {

       	                  let dupSale = openSellOrders.some(m => 
                                       ((nsellprice < (parseFloat(m["price"])+rangePrice)) &&
		                       (nsellprice > (parseFloat(m["price"])-rangePrice)))
	                            ) 
	if (dupSale) {
            console.log("existing sale orders ---------------------->")
	}
return dupSale;
}
async function processingRangeOrder(openBuyOrders, topBuyRange, botBuyRange, priceVariant, cBuyPrice) {


                         let ordersunresolved = openBuyOrders.map(m =>  {
                              let ordersJson = {};
                              ordersJson["price"] = parseFloat(m["price"]);
                              ordersJson["topRange"] = topBuyRange;
                              ordersJson["botRange"] = botBuyRange;
                              ordersJson["priceVariant"] = parseFloat(priceVariant);
                              ordersJson["inRange"] = 
                                      (
	                                (botBuyRange <= (parseFloat(m["price"]))) &&
		                        (topBuyRange >= (parseFloat(m["price"]))));
                              ordersJson["buyPrice"] = cBuyPrice;
                              return ordersJson;
                          })

			  let ordersresolved = await Promise.all(ordersunresolved);
	                   return ordersresolved;

                         //Object.assign(openOrdersRangeJson, ordersresolved);
			 //console.log("uuuuuuuuuuuuuuuuu orders resolved == " + JSON.stringify(ordersresolved));

}


function getOpenSell(openOrders) {
let openBuyOrders=[];
	let openSellOrders=[];
	let totTake=[]; let totTakeVal=0;
                         openOrders.data.map(item => {
                            // console.log("item = "+ JSON.stringify(item));
                             if ((item["side"] == 'BUY') && (isNumber(item["clientOrderId"]))) openBuyOrders.push(item);	
                             if ((item["side"] == 'SELL') && (isNumber(item["clientOrderId"]))) {
		                 openSellOrders.push(item);
				 totTakeVal += parseFloat(item["origQty"])*parseFloat(item["price"]);    
			     }
                         })
	totTake[0]={totTakeVal: totTakeVal};
	return [ openBuyOrders, openSellOrders, totTake ];

}


async function processOrder() {

		  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		  console.log("+     NEW API CALL                                               +");
		  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		  logger.info("loop order - new api call ");
		  totOrders++;
		  const ran=Math.floor(Math.random() * 1000000)
		  const ran2 = Math.floor(Math.random() * 1000000)
		  var orderRefVal = ran*ran2;
	          statsmod.setOrderRef(orderRefVal);
		  console.log("order ref val === "+ orderRefVal);
		  let currencyPair = 'BTCUSDT';
             //     let jsonAccount = await bmod.getAccountDetails(currencyPair);
	      //    await insertAPI("isolatedMarginAccountInfo", "ok");
		//  console.log(JSON.stringify(jsonAccount.data));
		//  let btcBal = parseFloat(jsonAccount.data["assets"][0]["baseAsset"]["free"]);
	//	  let freeBal = parseFloat(jsonAccount.data["assets"][0]["quoteAsset"]["free"]);
                 let btcBal = 10; // api calls can fail         
                  let freeBal = 1000; // api calls can fail         
	let tradePrice = 0.00;
                  //let btcrtn = await btcBalCheck(btcBal, minTradeValue, currencyPair, minTradePrice);
                  console.log(" ooooooo freeBal = " + freeBal);
                  console.log(" ooooooo min trading balance = " + minTradingBalance);
		  // avoid when profit is zero
		  // add two sell prices - one at max candlestick and one at x10 candlestick - 50% split.
		  let profitprojected = statsmod.getSellPrice() - statsmod.getBuyPrice();
	          var saleDone = false;
	   	  console.log("--------------> profit projected == " + profitprojected);
		  if ((freeBal > minTradingBalance) && (profitprojected > 0) ) {
	                loggerp.error("buying option now ");
			  console.log(" buying price === " + statsmod.getBuyPrice());
	                console.log(" selling price === " + statsmod.getSellPrice());
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                        console.log("!       all orders       !!!!!!!!");
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			  let apiAllOrders = await bmod.getAllOrdersSelect('TRUE', 100);
			 //client.logger.log(apiAllOrders.data);
                         
			await insertAPI("marginAllOrders", "ok");
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                        console.log("!       all orders - end      !!!!!!!!");
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		        let k1=0; let allFilledOrders =[];
			 let allUnFilledBuyOrders = [];
			 let allFilledBuyOrders = [];
			 let allFilledSellOrders = [];
			 let allSellOrders = []; // includes new orders 
                         apiAllOrders.data.map(item => {
                           //  console.log("item = "+ JSON.stringify(item));
                             if (
				 (item["status"] == 'FILLED') 
		              && (item["side"] =='BUY')
		              && (isNumber(item["clientOrderId"]))
			     ) { 
			         allFilledBuyOrders.push(item);
		             }
                             if (
				 (item["status"] == 'NEW') 
		              && (item["side"] =='BUY')
		              && (isNumber(item["clientOrderId"]))
			     ) { 
			         allUnFilledBuyOrders.push(item);
		             }
                             if (
				 (item["status"] == 'FILLED') 
		              && ((item["side"])=='SELL')
		              && (isNumber(item["clientOrderId"]))
			     ) { 
			         allFilledSellOrders.push(item);
		             }
                             if (
				 ((item["status"] == 'NEW') || (item["status"] == 'FILLED') ) 
		              && ((item["side"])=='SELL')
		              && (isNumber(item["clientOrderId"]))
			     ) { 
			         allSellOrders.push(item);
		             }
                         })

			  // detect filled buy orders without a sale - sell the current btc
                         saleDone = await  processSellOrderForBuy(allFilledBuyOrders, allSellOrders);
                         statsmod.setSaleDone(saleDone);
			  //console.log("nnnnnnbbbb = " + JSON.stringify(allSellOrders));
// end of sale - proceed to buys only when there are no sales
			  // ********************** get all open buy and sell orders 
			  let openOrders = await bmod.getOpenOrders('TRUE');
			 //client.logger.log(openOrders.data);
			 await insertAPI("marginOpenOrders", "ok");
			 let k=0;
			  // **** OPEN AND SELL ORDERS - POP 
			  // **********************************************
			  // BEGIN **** pop buy and sell orders and tot val
                          let jsonOS = getOpenSell(openOrders);
		          let openBuyOrders = jsonOS[0];
		  	  let openSellOrders = jsonOS[1];
			  let totTakeVal = jsonOS[2][0]["totTakeVal"];
			  statsmod.setTotTakeVal(totTakeVal);
			  statsmod.setTakeLimit(takeLimit);
			  // END **** pop buy and sell orders and tot val
			  // **********************************************

			  // **********************************************
			  // **** GET THE AVG STATS 
			  avgJsonObj = await avgStats(statsmod.getBuyPrice(), parseInt(1440));
                          if (avgJsonObj["aboveavg"])  {
                              riskFactor = 2;
			      console.log("above avg == " + riskFactor);
			  } 
			  // **********************************************
			  // ******************** get range data
                          let jsonout = await getRangeAvg();
			  if (!jsonout) return 0; // db has been failing
			  if (jsonout.length == 0) return 0;

			  levelsjson = jsonout["levelsjson"];
			  let min5m =parseFloat(levelsjson["min5m"]);
			  let max5m = parseFloat(levelsjson["max5m"]);
			  let changeRange = jsonout["changeRange"];
			  let inBuyRange = jsonout["inBuyRange"];
			  console.log("KKKKKKKKKKKKKKKKKKKK = inbuy range = " + inBuyRange);
			  let priceBuyVariant = parseFloat(jsonout["priceBuyVar"]);
			  let priceVariant = parseFloat(jsonout["priceVar"]);
			  let rangePrice = parseFloat(jsonout["rangePrice"]);
                          statsmod.setPriceBuyVariant(priceBuyVariant);
                          statsmod.setPriceVariant(priceVariant);
                          statsmod.setRangePrice(rangePrice);
			  statsmod.setChangeRange(changeRange);
			  statsmod.setInBuyRange(inBuyRange);
			  // **************** end of range data
// *** get dup sale
                          let nsellprice = statsmod.getSellPrice();
                          
			  let dupSale = await inDupDecision(openSellOrders, nsellprice, rangePrice);
                          let salesresolvedDup = await processingInDupOrder(
				 openSellOrders, 
				 rangePrice, 
				 nsellprice
			        );
                          Object.assign(openSalesOrdersRangeJson, salesresolvedDup);
// *** end open sales orders
			  statsmod.setDupSale(dupSale);

// *** check in range 
			  let topBuyRange = parseFloat(statsmod.getBuyPrice()) + parseFloat(priceVariant);
			  let botBuyRange = parseFloat(statsmod.getBuyPrice()) - parseFloat(priceVariant);
			  statsmod.setTopBuyRange(topBuyRange); 
			  statsmod.setBotBuyRange(botBuyRange); 
           	          let cBuyPrice = statsmod.getBuyPrice();

                          let inRange = await inRangeDecision
			                (openBuyOrders, 
				         topBuyRange, 
				         botBuyRange
			                 );
			  statsmod.setInRange(inRange);
// end check in range
			  // ***get all open orders and range
                         let ordersresolved = await processingRangeOrder(
				 openBuyOrders, 
				 topBuyRange, 
				 botBuyRange, 
				 priceVariant, 
				 cBuyPrice
			    );

                         Object.assign(openOrdersRangeJson, ordersresolved);
			  

			  if (!saleDone) {
                              sqlmod.insertTradeProfitLogSQL(topBuyRange, botBuyRange, statsmod.getBuyPrice(), 
				  statsmod.getSellPrice(), orderRefVal, 'BUY', inRange);
			      await sqlmod.exSQL();
			  }

			 console.log("buy == " + JSON.stringify(openBuyOrders));
                         statsmod.setErrJson();
                         statsmod.setErrForJson();

			   // if ((!inRange) && (!saleDone) && 
		//		    (totTakeVal < takeLimit) &&
			//	    (!changeRange) && 
			//	    (inBuyRange ) && (!dupSale)) {
			     if (!statsmod.getErrJson()[0]["err"]) {
                                loggerp.error("*** price criteria met *** ");
	    	                loggerp.warn("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
			        loggerp.warn("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				loggerp.warn("$$$  BUYING CRITERIA MET $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				loggerp.warn("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				console.log("$$$  BUYING CRITERIA MET $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");

                                await processingBuying(
					openSellOrders, 
					openBuyOrders
				        );

			 } else {

                                loggerp.error("failed to meet buy criteria");
				    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				     console.log("$$$  BUYING CRITERIA NOT  MET $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
			 }

	//	         let rtnresp =  await manageOrder(statsmod.getBuyPrice(), statsmod.getSellPrice(), statsmod.getBuyQty(), orderRefVal);
	//	      totOrders = totOrders+ 100; // pause processing
                  } else { 
	//	      totOrders = totOrders+ 100; // pause processing
		  }
		  console.log("************************************************");
		  console.log("***** END OF API CALL ***************************");
		  console.log("************************************************");

}

async function processingBuying(
	openSellOrders, 
	openBuyOrders
      ) {

	console.log("kkkkkkkk = staryt");
        let priceBuyVariant = statsmod.getPriceBuyVariant();
        let priceVariant = statsmod.getPriceVariant();
        let rangePrice = statsmod.getRangePrice();
	let topBuyRange = statsmod.getTopBuyRange();
	let botBuyRange = statsmod.getBotBuyRange();
	let inBuyRange = statsmod.getInBuyRange();
	let changeRange = statsmod.getChangeRange();
	let saleDone = statsmod.getSaleDone();
	let dupSale = statsmod.getDupSale();
	let orderRefVal = statsmod.getOrderRef();
	let inRange = statsmod.getInRange();
	let totTakeVal = statsmod.getTotTakeVal();
	let takeLimit = statsmod.getTakeLimit();
        statsmod.setKeyOrderVars();
	console.log("mmmmmmmmmmmmmm = "+ JSON.stringify(statsmod.getKeyOrderVars()));

	console.log("kkkkkkkk = end staryt");
// sell at price 1 - buy at current price
				let orgSellPrice = statsmod.getSellPrice();
			        let orgBuyPricelocal = parseFloat(statsmod.getBuyPrice());
				let origQty = statsmod.getBuyQty();
		        	
				let sellPriceL = parseFloat(orgBuyPricelocal) + parseFloat(priceBuyVariant);
			        statsmod.setSellPriceVal(sellPriceL);
	                        statsmod.setBuyPriceVal(orgBuyPricelocal.toFixed(2));
				statsmod.setOrderCat(1);
	                        statsmod.setOrderRef(orderRefVal);
                                statsmod.setTxnType('BUY');	             
			        dupSale = await inDupDecision(openSellOrders, sellPriceL, rangePrice);
			        if (!dupSale) {
					 
				      await processBuyOrder(
					      sellPriceL.toFixed(2), 
					      orgBuyPricelocal.toFixed(2),
					      orderRefVal, 
					      topBuyRange,
					      botBuyRange, 
					      inRange, 
					      origQty,
					      1
				            );
                                         statsmod.setOrderJson();

                                       statsmod.setErrJson();
                                }

				let margin = parseFloat(2);
                                let sellPriceL2 = parseFloat(orgBuyPricelocal) +
					   parseFloat(parseFloat(margin)* parseFloat(priceBuyVariant));    

			        statsmod.setSellPriceVal(sellPriceL2);
	                        statsmod.setBuyPriceVal(orgBuyPricelocal.toFixed(2));
				statsmod.setOrderCat(3);
                                statsmod.setTxnType('BUY');	             
				let orderRefVal3 = orderRefVal + 20; 
	                        statsmod.setOrderRef(orderRefVal3);
			        dupSale = await inDupDecision(openSellOrders, sellPriceL2, rangePrice);
                                if (!dupSale) {
                                    await processBuyOrder(
					     sellPriceL2.toFixed(2),
					     orgBuyPricelocal.toFixed(2),
					     orderRefVal3, 
					     topBuyRange,
					     botBuyRange, 
					     inRange, 
					     origQty,
					     3
				         );
                                        
                                         statsmod.setOrderJson();
                                       statsmod.setErrJson();
                                } 

// new buy price, sell price is current sell price, check no current buy prices exist
				let newBuyprice =  parseFloat(statsmod.getBuyPrice()) - parseFloat(priceBuyVariant);
                                statsmod.setBuyPrice(newBuyprice);
				let topBuyRange1 = parseFloat(newBuyprice) + parseFloat(priceVariant);
			        let botBuyRange1 = parseFloat(newBuyprice) - parseFloat(priceVariant);
                                statsmod.setTopBuyRange(topBuyRange1);
                                statsmod.setBotBuyRange(botBuyRange1);
                                let inRange1 = await inRangeDecision
			                (openBuyOrders, 
				         topBuyRange1, 
				         botBuyRange1
			                 );

				statsmod.setOrderCat(2);
				let orderRefVal2 = orderRefVal+10; 
	                        statsmod.setOrderRef(orderRefVal2);
	                        statsmod.setInRange(inRange);
				if (!inRange1) {    
				      console.log("2 ++++++++++++++ not in range +++ ");
		    		      statsmod.setSellPriceVal(orgSellPrice);
		    		      statsmod.setBuyPriceVal(newBuyprice.toFixed(2));
			              
				      await processBuyOrder(
					      orgSellPrice,
					      newBuyprice.toFixed(2), 
					      orderRefVal2, 
					      topBuyRange1,
			 		      botBuyRange1, 
					      inRange1, 
					      origQty,
					      2
				      );
				      statsmod.setInRange(inRange1);	
                                      statsmod.setOrderJson();
                                      statsmod.setErrJson();

				} else {
                                    console.log("2 ++++++++++++ in range ");
				}

                   statsmod.setErrForJson();

}

async function avgStats(buyprice, period) {
     await sqlmod.getAvgMaxMin(period);
     let jsonAvgMaxMinRec = await sqlmod.getAvgMaxMinRec(); 
//        avgc        |       maxp       |       minp       
//--------------------+------------------+------------------
// 16556.965376671378 | 16701.4600000000 | 16436.7900000000
     console.log("avg json = "+ JSON.stringify(jsonAvgMaxMinRec));
     let avgc = parseFloat(jsonAvgMaxMinRec[0]["avgc"]);
     let maxp = parseFloat(jsonAvgMaxMinRec[0]["maxp"]);
     let minp = parseFloat(jsonAvgMaxMinRec[0]["minp"]);
   //  if (buyprice > avgc) {
    //     return true;   
   //  }
   //  return false;
     return {aboveavg: parseFloat(buyprice)>avgc, 
	     dev:parseFloat(buyprice) - avgc,
	     perdev: (((parseFloat(buyprice) - avgc)/avgc)*100).toFixed(2),
	     buyprice: buyprice, 
	     avgc: avgc, 
	     maxp: maxp, 
	     minp: minp,
             period: period};	
}

async function processBuyOrder(aSellPrice, aBuyPrice, aOrderRef, topLimit, botLimit, rangeInc, aBuyQty, n) {

        if (aSellPrice > aBuyPrice) { } else {
           loggerp.error("buying and selling prices equal - error --------------");
           loggerp.error("buying and selling prices equal - error --------------");
           loggerp.error("buying and selling prices equal - error --------------");
           console.log("buying and selling prices equal - error --------------");
           console.log("buying and selling prices equal - error --------------");
           console.log("buying and selling prices equal - error --------------");
           return 1;
	}
	console.log("++++++++++++++++++++++++++++++")
	console.log("++++++++++++++++++++++++++++++ buy order - " + n)
	console.log("+ BUYING ORDER NOW buying price +++" + aBuyPrice);
	console.log("+ BUYING ORDER NOW selling price +++" + aSellPrice);
	console.log("++++++++++++++++++++++++++++++")
	console.log("+ BUYING ORDER NOW buying price state+++" + statsmod.getBuyPrice());
	console.log("+ BUYING ORDER NOW selling price state +++" + statsmod.getSellPrice());
	
	sqlmod.insertTradeProfitLogSQL(topLimit, botLimit, aBuyPrice, aSellPrice, aOrderRef, 'BUY', rangeInc);

	await sqlmod.exSQL();
	await mainBuyOrder(aBuyPrice, aSellPrice, aBuyQty, aOrderRef);
                               
//	addSummaryBuy(aOrderRef);
        let buyJsonL = {"buyPrice": aBuyPrice, 
	                "sellPrice": aSellPrice,
	                "buyQty": aBuyQty,
	                "clientorderid": aOrderRef,
                        "orderType": 'BUY'};
        summaryBuyJson.push(buyJsonL);
	return 0;
}


//[{"symbol":"BTCUSDT","orderId":15104494125,"clientOrderId":"web_1e3d4378460b4bc88627c6a89cc18ae9","price":"21451.43","origQty":"0.025","executedQty":"0","cummulativeQuoteQty":"0","status":"NEW","timeInForce":"GTC","type":"LIMIT","side":"SELL","stopPrice":"0","icebergQty":"0","time":1667623112373,"updateTime":1667623112373,"isWorking":true,"isIsolated":true},
async function getRangeAvg() {


    loggerp.warn("******************************************");	
    loggerp.warn("*   CHECK THE RANGE AVERAGE***************");	
    loggerp.warn("******************************************");	
    console.log("******************************************");	
    console.log("*   CHECK THE RANGE AVERAGE***************");	
    console.log("******************************************");	
    await sqlmod.getLastIdStats();
    let id = sqlmod.getLastIdStatsPriceDB(); 
	
    await sqlmod.selectTimeMinStatsDB(id);
    let timemin = sqlmod.getStatsRecTime();
        
    await sqlmod.selectLastMinAvgDB(timemin[0]["timemin"]); // 5 mins avg
    let lastminAvg = sqlmod.getLastMinAvg();

    if (!lastminAvg) return null; // db has been failing	
    if (lastminAvg.length==0) return null; // db has been failing	
    let jsonAvg =  riskmod.calcAvg(id, timemin, lastminAvg, statsmod.getBuyPrice(), statsmod.getMinPrice(), statsmod.getMaxPrice());

    console.log("json avg === " +JSON.stringify(jsonAvg));
//     let jsonout = { avgrange: avgrange, inrange: inrangeval, inrangebuy: inrangebuyval, levelsjson: levelsjson };

    let jsonout = {changeRange:  !jsonAvg["inrange"], 
	           inBuyRange:   jsonAvg["inrangebuy"],
	           priceBuyVar:  parseFloat(jsonAvg["avgrange"]),
	           priceVar:     parseFloat(jsonAvg["avgrange"]),
	           rangePrice:   parseFloat(jsonAvg["avgrange"]),
	           levelsjson:   jsonAvg["levelsjson"]}

    console.log("json out === " +JSON.stringify(jsonout));
    console.log("******************************************");	
    console.log("*   END THE RANGE AVERAGE***************");	
    console.log("******************************************");	
    return jsonout;

}

async function checkAvgQty() {
    await sqlmod.selectAvgQtyDB(60); // 60 mins - gets avg qty for all slots
    let avgQty = sqlmod.getAvgQtyDb();
    console.log("**** avg qty == "+ avgQty);
     // check last min and compare to avg to avoid a spike to zeroing out of qty in a min slot

}



function addSummaryBuy(reflocal) {
	console.log("88888 add summary buy ");
      let buyJsonL = {"buyPrice": statsmod.getBuyPrice(), 
	       "sellPrice": statsmod.getSellPrice(),
	       "buyQty": statsmod.getBuyQty(),
	       "clientorderid": reflocal,
               "orderType": 'BUY'};
      summaryBuyJson.push(buyJsonL);
}

function addSummarySellJson(buyPriceLocal, sellPriceLocal, qtyLocal, clientorderidNum) {

    let sellJsonL = {"buyPrice": buyPriceLocal, 
	       "sellPrice": sellPriceLocal,
	       "sellQty": qtyLocal,
	       "clientorderid": clientorderidNum,
               "orderType": 'SELL'};
    return sellJsonL;
}
function addSummarySell(buyPriceLocal, sellPriceLocal, qtyLocal, clientorderidNum) {

    let sellJsonL = {"buyPrice": buyPriceLocal, 
	       "sellPrice": sellPriceLocal,
	       "sellQty": qtyLocal,
	       "clientorderid": clientorderidNum,
               "orderType": 'SELL'};
    summarySellJson.push(sellJsonL);
}
function isNumber(val) {
    return !isNaN(val);
	//&& parseFloat(Number(val)) === val && !isNaN(parseInt(val, 10));
}

async function sellOrder(filledBuyOrder) {

	console.log("filled by order to sell mmmmmmmmmmm = "+JSON.stringify(filledBuyOrder));
        let btcBal = 1000; // should be changed for the real btc balc - get account info
	await sqlmod.selectPriceOrderRec(filledBuyOrder["clientOrderId"]);
///	console.log("llllllllllllll call done to db");
	let priceRec = sqlmod.getPriceOrderRec();

	let buyprice = parseFloat(filledBuyOrder["price"]);
	let sellprice = parseFloat(priceRec[0]["exitprice"]);
	let failedSell=false;
        if (sellprice < buyprice) {
                console.log("************ sale price too low ************");
		failedSell=true;
	}
	let qty = parseFloat(filledBuyOrder["executedQty"]);
	let sellId = parseInt(filledBuyOrder["clientOrderId"])+1;
				     
        if ((btcBal >= qty) && (sellprice < 999999) && (!failedSell)) {  // 999999 legacy orders 
             console.log("if to sell order llllllll");
	     await mainSellOrder(buyprice, sellprice, qty, sellId);

	     btcBal -= qty;
	     let json = addSummarySellJson(buyprice, sellprice, qty, sellId);
             console.log("if to sell order llllllll json "+ JSON.stringify(json));
             return json;		
         } else {
             loggerp.warn(" no coins to sell " + qtyLocal*sellPriceLocal + " bal " + freeBal);
         }
//	console.log("no if return lllll");
	return {}

}


//************* read prices from the db in real-time
// this allows for additional analysi
//
// s
async function main() {
	// get price data by the sec
	// check if new sec
	// open buy orders
	// check open orders
	// sell as needed
	// do not open more buy orders when a lot are open
	//
	//
	await sqlmod.selectPriceDB(1, 'desc');
	let priceRecs = sqlmod.getPriceDb();
      	//    id    |          txndate           | timeprice  |      price       
        let id = parseInt(priceRecs[0]["id"]);
        let tradeqty= parseFloat(priceRecs[0]["qty"]);
	let timeprice = parseInt(priceRecs[0]["timeprice"]);
	let price = parseFloat(priceRecs[0]["price"]);
	console.log("prices == " + price + " " + timeprice + "  " + id );
	let processtest=true;
	let prevTime=timeprice;
	statsmod.setPrevSecs(timeprice);
	statsmod.initializeTxns();
        statsmod.setCurrentPrice(price); // price
        statsmod.setNumberSecs(timeprice);
        let prevId = id;
	while (processtest) {

            //console.log("processing loop"+ new Date());
	// process order
		//
//	    let numMins = statsmod.getNumberSecs();
           if (getMod(statsmod.getNumberSecs(), 10)==0) {
               await newSecond();
           }
	   while (id == prevId) {
//		console.log("db checks id = " + id);
//		console.log("db checks previd = " + prevId);
                await sqlmod.selectPriceDB(1, 'desc');
                priceRecs = sqlmod.getPriceDb(); 
     	        timeprice = parseInt(priceRecs[0]["timeprice"]);
	        price = parseFloat(priceRecs[0]["price"]);
	        id = parseFloat(priceRecs[0]["id"]);
	        tradeqty = parseFloat(priceRecs[0]["qty"]);
	   }
           prevId = id;
           statsmod.setCurrentPrice(price); // price
           statsmod.setNumberSecs(timeprice);

//            cycleCount++;
	   if (cycleCount > cycleLimit) processtest=false;
//             processtest=false;

	}
	console.log("*********************************************");
	console.log("*                 SUMMARY          **********");
	console.log("*********************************************");
	console.log("Buy Orders ");
	console.table(summaryBuyJson);
	console.log("Sell Orders ");
	console.table(summarySellJson);
	console.log("Price ranges ");
	console.table(levelsjson);
	//process.exit();
	console.log("Price market ranges - period in mins");
	console.table(avgJsonObj);
	//process.exit();
	console.log("Error Table");
	console.table(statsmod.getErrJson());
	console.log("Order Table");
	console.table(statsmod.getOrderJson());
	console.log("Order Range Buy Table");
	console.table(openOrdersRangeJson);
	console.log("Dup Sales");
	console.table(openSalesOrdersRangeJson);
	process.exit();
}


async function newSecond() {
   if (statsmod.getNumberSecs() > statsmod.getPrevSecs())  {
       loggerp.error("cond if get nums ", statsmod.getNumberSecs(), statsmod.getNumberSecs()/60, " prev " , statsmod.getPrevSecs());
       
       statsmod.setPrevSecsToNumber();
       
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("& START OF A NEW PRICE SEC &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       cycleCount++;
       console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++****** ======= cycle count " + cycleCount + " ");
       
       console.log("*              second count = " + statsmod.getNumberSecs() + "                 *");
       statsmod.newCandleStick();
       console.log("nnnnnnnn = "+ JSON.stringify(statsmod.getPriceVars()) + "  *** "); 
       let delim = ",";
       loggerp.warn(delim, statsmod.getNumberSecs(), delim, statsmod.getBuyPrice(), delim, statsmod.getSellPrice()); 
       let trade = true;
       console.log("percent change = " + statsmod.getPercentChange());
       console.log("*              second count = " + statsmod.getNumberSecs() + "                 *");
       console.log("------------------------------------- "+ Math.abs(statsmod.getPercentChange()) );     
       
       if (Math.abs(statsmod.getPercentChange() < 0.5)) {
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrderLimit = " + totOrderLimit + " ++++++++++++");
           if (totOrders < totOrderLimit) {
               let rtn = await processOrder();
           }
       }
       //process.exit();
       if (statsmod.getMinPrice() > 0) {
          // prices.push(statsmod.getPriceVars());
           statsmod.setPrices();
       }
       setValues();
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("& END OF A NEW PRICE SEC &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
    } else {
       // min change
     //  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
     //  console.log("& USING CURRENT SEC &");
     //  console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
       statsmod.incNumberTxns();	   
       statsmod.setClosePrice(parseFloat(statsmod.getCurrentPrice()));
       statsmod.setMinMaxPrices();
    } 
}
function setValues() {

         //  statsmod.setPrevSecsToNumber();
           statsmod.setPrevClosePrice(); 
           statsmod.setOpenPrice(parseFloat(statsmod.getCurrentPrice())); //reset for the new candletsick
           statsmod.setClosePrice(parseFloat(statsmod.getCurrentPrice()));  // reset for the new candlestick
           statsmod.setMinPrice(parseFloat(statsmod.getCurrentPrice())); // init min price
           statsmod.setMaxPrice(parseFloat(statsmod.getCurrentPrice())); // init min price

           statsmod.setNumberTxns(1);  // initialize number of txns	   
           statsmod.incCycle();
}

async function mainSellOrder(buyPrice, sellPrice, btcQty, orderRef) {
console.log("KKKKKKKKKKKKK sell order");
//    totOrders++;
  //  return 0;
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
	logger.info("api new order - buy ");
      let responseMargin = await bmod.newMarginOrder(sellPrice, btcQty, orderRef, 'GTC','SELL');
      sqlmod.insertPriceOrderSQL(orderRef, sellPrice, btcQty, 'SELL', sellPrice);
      await sqlmod.exSQL();
      await insertAPI("newMarginOrderSell", "ok");

}
async function insertAPI(apicall, statusapi) {

    sqlmod.insertAPISQL(apicall, statusapi);
    await sqlmod.exSQL();
}
async function mainBuyOrder(buyPrice, sellPrice, btcQty, orderRef) {
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);
//    totOrders++;
//	return 0;
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
      logger.info("api new order - buy ");
      let responseMargin = await bmod.newMarginOrder(buyPrice, btcQty, orderRef, 'GTC','BUY');
      console.log("resp buy == "+ JSON.stringify(responseMargin.data));
      sqlmod.insertPriceOrderSQL(orderRef, buyPrice, btcQty, 'BUY', sellPrice);
      await sqlmod.exSQL();
      await insertAPI("newMarginOrderBuy", "ok");
}



