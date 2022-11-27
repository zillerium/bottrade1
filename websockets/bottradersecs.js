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

var summarySellJson = [];
var summaryBuyJson = [];
const takeLimit = 5000; // open sale orders - limit liabilities 
var priceVariant = 20; // adjust buy and sell price by this - later calc via currprice table
var riskFactor = parseFloat(2); // defines the risk on the range default is 1, raise this number to decrease risk
var priceBuyVariant = 10; // adjust buy and sell price by this - later calc via currprice table
const openOrderLimit = 5;
const cycleLimit = 2;
var levelsjson = {};
var avgJsonObj = {};
var errJson = [];
var orderJson = [];
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
console.log(client);
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

async function processOrder() {

		  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		  console.log("+     NEW API CALL                                               +");
		  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		  logger.info("loop order - new api call ");
		  totOrders++;
		  const ran=Math.floor(Math.random() * 1000000)
		  const ran2 = Math.floor(Math.random() * 1000000)
		  var orderRefVal = ran*ran2;
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
                          //console.log("nnnnnnbbbb = " + JSON.stringify(allSellOrders));
		          let salesunresolved = await allFilledBuyOrders.map(async item =>  {
		              let saleJson = {};
			      let c = parseInt(item["clientOrderId"])+parseInt(1);	
		              if ((parseInt(item["clientOrderId"]) == 481569849090) ||
		                   (parseInt(item["clientOrderId"]) == 3716306906)) {

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

                          if ((newSalesJson) && (newSalesJson.length > 0)) saleDone = true;
			  console.log("ooooooooooooo - saledone ---- " + saleDone);
			  console.log("ooooooooooooo - sals json 2 ---- " + JSON.stringify(newSalesJson));

			  let openOrders = await bmod.getOpenOrders('TRUE');
			 //client.logger.log(openOrders.data);
			 await insertAPI("marginOpenOrders", "ok");
			 let k=0;
                         let openBuyOrders = [];
                         let openSellOrders = [];
			 let totTakeVal = 0;
                         openOrders.data.map(item => {
                            // console.log("item = "+ JSON.stringify(item));
                             if ((item["side"] == 'BUY') && (isNumber(item["clientOrderId"]))) openBuyOrders.push(item);	
                             if ((item["side"] == 'SELL') && (isNumber(item["clientOrderId"]))) {
		                 openSellOrders.push(item);
				 totTakeVal += parseFloat(item["origQty"])*parseFloat(item["price"]);    
			     }
                         })
			  console.log("ppppppppppppp json open sell "+JSON.stringify(openSellOrders));
//      return {aboveavg: buyprice>avgc, buyprice: buyprice, avgc: agvc, maxp: maxp, minp: minp);

                          let period = parseInt(1440);
			  avgJsonObj = await avgStats(statsmod.getBuyPrice(), period);
			  let aboveAvg = avgJsonObj["aboveavg"];
                          if (aboveAvg)  {
                              riskFactor = 2;
			      console.log("above avg == " + riskFactor);
			  } 

console.log("************ start of avg");  // range calc
                          let jsonout = await getRangeAvg();
			  levelsjson = jsonout["levelsjson"];
			  let changeRange = jsonout["changeRange"];
			  let inBuyRange = jsonout["inBuyRange"];
			  console.log("KKKKKKKKKKKKKKKKKKKK = inbuy range = " + inBuyRange);
			  priceBuyVariant = parseFloat(jsonout["priceBuyVar"]);
			  priceVariant = parseFloat(jsonout["priceVar"]);
			  let rangePrice = parseFloat(jsonout["rangePrice"]);

console.log("************ end of avg");

                          let nsellprice = statsmod.getSellPrice();
       	                  let dupSale = openSellOrders.some(m => 
                                       ((nsellprice < (parseFloat(m["price"])+rangePrice)) &&
		                       (nsellprice > (parseFloat(m["price"])-rangePrice)))
	                            ) 
			  console.log("&&& dup sales val  = " + dupSale);
			  console.log("&&& tranges = " + priceVariant + " " + priceBuyVariant);
			  
			  let topBuyRange = parseFloat(statsmod.getBuyPrice()) + parseFloat(priceVariant);
			  let botBuyRange = parseFloat(statsmod.getBuyPrice()) - parseFloat(priceVariant);
			  
			  console.log("+ check range 1 buying price +++" + statsmod.getBuyPrice());
			  loggerp.error("check range === " + topBuyRange + " " + botBuyRange);
           	          
			  let inRange = openBuyOrders.some(m => 
                                      (
	                                (botBuyRange <= (parseFloat(m["price"]))) &&
		                        (topBuyRange >= (parseFloat(m["price"]))))
	                              );

			 
			  if (!saleDone) {
                              sqlmod.insertTradeProfitLogSQL(topBuyRange, botBuyRange, statsmod.getBuyPrice(), 
				  statsmod.getSellPrice(), orderRefVal, 'BUY', inRange);
			      await sqlmod.exSQL();
			  }

			  let lowestPrice = 0.00;
			 if (openBuyOrders.length > 0) {
                             lowestPrice = getLowestOpenBuyPrice(openBuyOrders);
			 }

                         let minBuyPrice = parseFloat(statsmod.getBuyPrice() - priceBuyVariant);
			 console.log("buy == " + JSON.stringify(openBuyOrders));
			 console.log("minBuyPrice  == " +minBuyPrice);
			 console.log("lowest price  == " +lowestPrice);
                         
			 let errJsonLocal = {
				 totTakeVal: totTakeVal,
				 takeLimit: takeLimit,
				 inRange: inRange,
				 saleDone: saleDone,
				 changeRange: changeRange,
				 inBuyRange: inBuyRange,
				 dupSale: dupSale,
				 err: null
			       };
			  errJson.push(errJsonLocal);

		          let orderJsonLocal = {
				    sellPrice: statsmod.getSellPrice(),
				     buyPrice: statsmod.getBuyPrice(),
				     orderRef: orderRefVal,
				     qty: statsmod.getBuyQty(),
				     topRange: topBuyRange,
				     botRange: botBuyRange,
				     type: 'BUY'
			        };
			    orderJson.push(orderJsonLocal);



		           errJson.map(m => { 
                               m["err"]= (!m["inRange"] && 
		                !m["saleDone"] && 
			        (m["totTakeVal"] < m["takeLimit"]) &&
			        !m["changeRange"] &&
		                !m["dupSale"])}			  
			         )

			    console.log("================== err fnd = "+ JSON.stringify(errJson));
			    if (totTakeVal > takeLimit) loggerp.error("too exposed - sell orders - " + totTakeVal + " " + takeLimit);
			   // if ((!inRange) && (!saleDone) && 
		//		    (totTakeVal < takeLimit) &&
			//	    (!changeRange) && 
			//	    (inBuyRange ) && (!dupSale)) {
			     if (!errJson[0]["err"]) {
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

                                processingBuying(
					priceBuyVariant, 
					rangePrice, 
					dupSale, 
					orderRefVal, 
	                                topBuyRange, 
					botBuyRange, 
					inRange, 
					totTakeVal, 
					takeLimit);

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

async function processingBuying(priceBuyVariant, rangePrice, dupSale, orderRefVal, 
	topBuyRange, botBuyRange, inRange, totTakeVal, takeLimit) {

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

				let orgSellPrice = statsmod.getSellPrice();
			        let orgBuyPricelocal = parseFloat(statsmod.getBuyPrice());
				let origQty = statsmod.getBuyQty();
		        	
				let sellPriceL = parseFloat(orgBuyPricelocal) + parseFloat(priceBuyVariant);
			        
				dupSale = openSellOrders.some(m => 
                                       ((sellPriceL < (parseFloat(m["price"])+rangePrice)) &&
		                       (sellPriceL > (parseFloat(m["price"])-rangePrice)))
	                            ) 
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

			        } else {
                                        loggerp.warn("kkk6 - order failed due to sell price dup");
                                        console.log("kkk6 - order failed due to sell price dup");
			        }


				let margin = parseFloat(2);
                                let sellPriceL2 = parseFloat(orgBuyPricelocal) +
					   parseFloat(parseFloat(margin)* parseFloat(priceBuyVariant));    

				let orderRefVal3 = orderRefVal + 20; 
				dupSale = openSellOrders.some(m => 
                                       ((sellPriceL2 < (parseFloat(m["price"])+rangePrice)) &&
		                       (sellPriceL2 > (parseFloat(m["price"])-rangePrice)))
	                            ) 
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
                                } else {
                                        loggerp.warn("kkk7 - order failed due to sell price dup");
                                        console.log("kkk7 - order failed due to sell price dup");


				}


			  errJsonLocal = {
				 totTakeVal: totTakeVal,
				 takeLimit: takeLimit,
				 inRange: inRange,
				 saleDone: saleDone,
				 changeRange: changeRange,
				 inBuyRange: inBuyRange,
				 dupSale: dupSale,
				 err: null
			       };
			  errJson.push(errJsonLocal);

		           orderJsonLocal = {
				     sellPrice: sellPriceL2.toFixed(2),
				     buyPrice: orgBuyPricelocal.toFixed(2),
				     orderRef: orderRefVal3,
				     qty: origQty,
				     topRange: topBuyRange,
				     botRange: botBuyRange,
				     type: 'BUY'
			        };
			    orderJson.push(orderJsonLocal);


				let newBuyprice =  parseFloat(statsmod.getBuyPrice()) - parseFloat(priceBuyVariant);

				let topBuyRange1 = parseFloat(orgBuyPricelocal) + parseFloat(priceVariant);
			        let botBuyRange1 = parseFloat(orgBuyPricelocal) - parseFloat(priceVariant);

			        let inRange1 = openBuyOrders.some(m => 
                                      (
	                                (botBuyRange1 <= (parseFloat(m["price"]))) &&
		                        (topBuyRange1 >= (parseFloat(m["price"]))))
	                              );

				let orderRefVal2 = orderRefVal+10;    
				if (!inRange1) {    
				      console.log("2 ++++++++++++++ not in range +++ ");
		    		      statsmod.setSellPriceVal(orgSellPrice);
			              
			              orderRefVal +=10; // sell at same price but buy lower in price
                                
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

				} else {
                                    console.log("2 ++++++++++++ in range ");
				}


			  errJsonLocal = {
				 totTakeVal: totTakeVal,
				 takeLimit: takeLimit,
				 inRange: inRange1,
				 saleDone: saleDone,
				 changeRange: changeRange,
				 inBuyRange: inBuyRange,
				 dupSale: dupSale,
				 err: null
			       };
			  errJson.push(errJsonLocal);

		          orderJsonLocal = {
				     sellPrice: orgSellPrice,
				     buyPrice: newBuyprice.toFixed(2),
				     orderRef: orderRefVal2,
				     qty: origQty,
				     topRange: topBuyRange1,
				     botRange: botBuyRange1, 
				     type: 'BUY'
			        };
			    orderJson.push(orderJsonLocal);

                            errJson.map(m => {
                               m["err"]= (!m["inRange"] &&
                                !m["saleDone"] &&
                                (m["totTakeVal"] < m["takeLimit"]) &&
                                !m["changeRange"] &&
                                !m["dupSale"])}
                                 )

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
	     buyprice: buyprice, 
	     avgc: avgc, 
	     maxp: maxp, 
	     minp: minp,
             period: period};	
}

async function processBuyOrder(aSellPrice, aBuyPrice, aOrderRef, topLimit, botLimit, rangeInc, aBuyQty, n) {


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
function dupSales(sellJsonOrders, nsellprice, rangePrice) {
console.log("&&&&&&&&&&&&&&&&&&&&&&&&& dup sales check%%%% " + JSON.stringify(sellJsonOrders));
console.log("&&&&&&&&&&&&&&&&&&&&&&&&& dup sales check%%%% range price " + rangePrice);
console.log("&&&&&&&&&&&&&&&&&&&&&&&&& dup sales check%%%% sell price " + nsellprice);
//nsellprice = 16700;rangePrice = 20;
	let m1 = sellJsonOrders.some(m => 
                  ((nsellprice < (parseFloat(m["price"])+rangePrice)) &&
		   (nsellprice > (parseFloat(m["price"])-rangePrice)))
	          ) 
console.log("lllllllllllllll m1 = "+ m1);
	/*for (let j=0; j<sellJsonOrders.length; j++) {
            let nprice = parseFloat(sellJsonOrders[j]["price"]);
            let nstatus = sellJsonOrders[j]["status"];
            let upperLimit = parseFloat(nprice+rangePrice) *riskFactor;
            let lowerLimit = parseFloat(nprice-rangePrice) *riskFactor;
		 // within range
            if ((nsellprice < upperLimit) && (nsellprice > lowerLimit)) {
                                   
                 console.log("kkk - dup sale = selling price " + nsellprice);
                 console.log("kkk - dup sale = existing order price " + nprice);
                 console.log("kkk - rangePrice " + rangePrice);

			return true;
		 }
	 }
	return false;*/
	return true;
}

async function checkAvgQty() {
    await sqlmod.selectAvgQtyDB(60); // 60 mins - gets avg qty for all slots
    let avgQty = sqlmod.getAvgQtyDb();
    console.log("**** avg qty == "+ avgQty);
     // check last min and compare to avg to avoid a spike to zeroing out of qty in a min slot

}

async function checkInRange(buyOrders, topRange, botRange) {
 //[{"clientorderid":4321556200,"price":16680.84,"side":"BUY","time":"2022-11-24T07:16:27.392Z","updatetime":"2022-11-24T07:52:47.061Z","origQty":0.0015,"executedQty":0.0015,"status":"FILLED"},
   //let topBuyRange = parseFloat(statsmod.getBuyPrice()) + parseFloat(priceVariant);
     //                     let botBuyRange = parseFloat(statsmod.getBuyPrice()) - parseFloat(priceVariant);
       //                   let inRange = checkInRange(openBuyOrders, topBuyRange, botBuyRange);

//console.log("@@@@@@@@@@@@@@@@@ json file --- " + JSON.stringify(buyOrders));
	let m1 = buyOrders.some(m => 
                  (
	           (botRange <= (parseFloat(m["price"]))) &&
		   (topRange >= (parseFloat(m["price"]))))
	          );
	return m1;
 /* if (buyOrders.length == 0) return false; // no open buy orders in range
     for (var key in buyOrders) {
        let buyPrice =      parseFloat(buyOrders[key]["price"]);
	console.log("%%%%%% buy price == "+ buyPrice);     
	console.log("%%%%%%top range == "+ topRange);     
	console.log("%%%%%% bot range == "+ botRange);     
        if ((buyPrice >= botRange) && (buyPrice < topRange)) {
	     sqlmod.insertOpenOrderSQL(parseInt(buyOrders[key]["clientOrderId"]),
		     
		     parseInt(buyOrders[key]["updateTime"]), 
		     parseFloat(buyOrders[key]["price"]), 
			     buyOrders[key]["side"].toString(),
			     buyOrders[key]["status"].toString());
                await sqlmod.exSQL();
		console.log("match - range ");
                  return true;
        }
     }
	console.log("kkkkk - no math range");
 return false;*/

} 

async function newRangeCheck(apiAllOrders,  topRange, botRange) {
        let buyJson = popJson('BUY', apiAllOrders, 'FILLED');

	//unfilled sales orders
//	let unfilledBuyJson = popUnfilledJson(buyJson, apiAllOrders);
 //    let inrange = checkInRange(unfilledBuyJson, topRange, botRange);
  //   if (inrange) return true;

     let buyfilledUnfilledSell = popUnfilledBuyUnfilledSell(buyJson, apiAllOrders);
     let inrange = await checkInRange(buyfilledUnfilledSell, topRange, botRange);
     if (inrange) return true;


//     let openBuyJson = popJson('BUY', apiAllOrders, 'NEW');
//     inrange = await checkInRange(openBuyJson, topRange, botRange);
//     if (inrange) return true;


 //       let sellJson = popJson('SELL', apiAllOrders, 'NEW');
// check if unfilled sales order is within range of expected new sales price.

  //   return false;

  //   console.log("Unbrought BUY Orders --- " );
  //   console.table(openBuyJson);
  //   console.log("Buy Orders with no Sell Orders--- " );
  //   console.table(unfilledBuyJson);
  //   console.log("Buy Orders with no Filled Sell Orders--- " );
  //   console.table(unfilledBuyJsonFilled);


}

function popUnfilledBuyUnfilledSell(buyFilledJson, allOrdersJson) {
//      console.log("unmat buy orders == " + JSON.stringify(allJson));
        let unfilledJson=[]; let k=0;
        for (let j=0; j<buyFilledJson.length;j++) {
           let clientorderid = buyFilledJson[j]["clientorderid"];
           if (isNumber(clientorderid)) {
//                 console.log("buy id - " + clientorderid); 
                let sellClientOrderId = clientorderid+1;
//                 console.log("****** sell id - " + sellClientOrderId); 
                if (sellIdExistsFilled(sellClientOrderId, allOrdersJson)) {
              //      console.log("  x10 unmatched buy orders == found in json " + sellClientOrderId); 
                } else {
                //      console.log(" x10 unmatched buy orders not found in json " + sellClientOrderId);
                    unfilledJson[k]=buyFilledJson[j];
                    k++;
                }
           }
        }
        return unfilledJson;

}

function popUnfilledJson(buyJson, allJson) {
        let unfilledJson=[]; let k=0;
        for (let j=0; j<buyJson.length;j++) {
           let clientorderid = buyJson[j]["clientorderid"];
           if (isNumber(clientorderid)) {
                //   console.log("buy id - " + clientorderid); 
                let sellClientOrderId = clientorderid+1;
                //   console.log("sell id - " + sellClientOrderId); 
                if (sellIdExists(sellClientOrderId, allJson)) {

                } else {
                    unfilledJson[k]=buyJson[j];
                    k++;
                }
           }
        }
        return unfilledJson;


}

function sellIdExistsFilled(id, allJson) {
    for (let j=0;j<allJson.length;j++) {
        if (isNumber(allJson[j]["clientOrderId"])) {
        //    console.log("id == " + id);
        //    console.log("client order id == " + allJson[j]["clientOrderId"]);
//          console.log("status == " + allJson[j]["status"]);
            if (id == parseInt(allJson[j]["clientOrderId"])) {
               if (allJson[j]["status"]=='FILLED') {
                   //  console.log("--------- matched d ---") ;
                  //   console.log("--------- id ---" + id);
                  //   console.log("--------- json client  ---" + JSON.stringify(allJson[j]));
                     return true;
                } else {
                  //   console.log("status not mtached --" + allJson[j]["clientOrderId"]);
                }
            } else {
                 //  console.log("id not matched exists filled"+ id + " " + allJson[j]["clientOrderId"]);
            }
        }

    }
    return false;
}

function sellIdExists(id, allJson) {
    for (let j=0;j<allJson.length;j++) {
        if (isNumber(allJson[j]["clientOrderId"])) {
//              console.log("id == " + id);
//              console.log("client order id == " + allJson[j]["clientOrderId"]);
            if (id == parseInt(allJson[j]["clientOrderId"])) return true;
        }
    }
    return false;
}

function popJson(orderType, apiAllOrders, statusType) {

     let k1=0; let allFilledOrders =[];
     for (let j=0;j<apiAllOrders.length;j++) {
        if ((apiAllOrders[j]["status"] ==statusType ) && (apiAllOrders[j]["side"]==orderType)) {
              let rec  =  { "clientOrderId" :parseInt(apiAllOrders[j]["clientOrderId"]),
                "price": parseFloat(apiAllOrders[j]["price"]),
                "side": apiAllOrders[j]["side"].toString(),
                 "time":new Date(parseInt(apiAllOrders[j]["time"])/1),
                 "updateTime":parseInt(apiAllOrders[j]["updateTime"]),
                 "origQty": parseFloat(apiAllOrders[j]["origQty"]),
                 "executedQty": parseFloat(apiAllOrders[j]["executedQty"]),
                "status": apiAllOrders[j]["status"].toString()};
//      console.log("*********** matched ---- ");
//              console.log(JSON.stringify(rec));
//                      console.log("status type == "+ statusType);
//                      console.log("order type == "+ orderType);
//
                //console.log("api ordes  == "+ JSON.stringify(apiAllOrders.data[j]));
                allFilledOrders[k1]= rec;
        k1++;
        }
     }
        return allFilledOrders;
}




function getLowestOpenBuyPrice(buyOrders) {

    let lowestPrice = parseFloat(buyOrders[0]["price"]);
     for (var key in buyOrders) {
        let buyPrice =      parseFloat(buyOrders[key]["price"]);
        if (buyPrice < lowestPrice) {
                  lowestPrice = buyPrice;
        }
     }
 return lowestPrice; 

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
	let qty = parseFloat(filledBuyOrder["executedQty"]);
	let sellId = parseInt(filledBuyOrder["clientOrderId"])+1;
				     
        if ((btcBal >= qty) && (sellprice < 999999)) {  // 999999 legacy orders 
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


function sellOrderFound(allFilledOrders, clientorderNum) {
     //console.log("x11 = clientordernum " + clientorderNum);
	if (((clientorderNum-1) == 692570) 
	|| ((clientorderNum-1) == 372386)) 
	{return true;}
     //console.log("x11 2 = clientordernum " + clientorderNum);
      // console.log("88888888 - clientorderNum = " + clientorderNum);
       for (let n=0;n<allFilledOrders.length;n++) {
       //    console.log(" all orders == " + n + " , " + JSON.stringify(allFilledOrders[n]));
	   if (isNumber(allFilledOrders[n]["clientOrderId"] )) {
               let num1 = parseInt(allFilledOrders[n]["clientOrderId"] );
               if (num1==clientorderNum) return true;	   
	   }
       }
	return false;
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
	console.table(errJson);
	console.log("Order Table");
	console.table(orderJson);
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
    return 0;
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



