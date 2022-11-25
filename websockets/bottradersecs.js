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
const takeLimit = 500; // open sale orders - limit liabilities 
var priceVariant = 20; // adjust buy and sell price by this - later calc via currprice table
var riskFactor = parseFloat(1); // defines the risk on the range default is 1, raise this number to decrease risk
var priceBuyVariant = 10; // adjust buy and sell price by this - later calc via currprice table
const openOrderLimit = 5;
const cycleLimit = 5;
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
var totOrderLimit = 2;
var btcQty =(parseFloat(1* 0.00075));
console.log("%%%%%--- btcQty "+ btcQty);

//var btcQty = 0.00075;
//var btcQty = 0.01;
require('dotenv').config();
import {BotMod}  from './botmod.js';
import {SQLMod}  from './sqlmod.js';
import {StatsMod}  from './statsmod.js';
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
	          let saleDone = false;
	   	  console.log("--------------> profit projected == " + profitprojected);
		  if ((freeBal > minTradingBalance) && (profitprojected > 0) ) {
	                loggerp.error("buying option now ");
			  console.log(" buying price === " + statsmod.getBuyPrice());
	                console.log(" selling price === " + statsmod.getSellPrice());
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                        console.log("!       all orders       !!!!!!!!");
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			  let apiAllOrders = await bmod.getAllOrders('TRUE');
			 //client.logger.log(apiAllOrders.data);
                         
			await insertAPI("marginAllOrders", "ok");
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                        console.log("!       all orders - end      !!!!!!!!");
                        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		        let k1=0; let allFilledOrders =[];
		        for (let j=0;j<apiAllOrders.data.length;j++) {
                           if ((apiAllOrders.data[j]["status"] == 'FILLED') && (apiAllOrders.data[j]["side"]=='BUY')) {
                                 allFilledOrders[k1] = apiAllOrders.data[j];
				 k1++;
	         	    }
			 }
			  console.log("£££££££££££££££££££££££££££££££££££")
			  console.log("££  all filled orders £££££££££££££££££££££££££££££££££")
			  console.log("£££££££££££££££££££££££££££££££££££")
			  loggerp.error("found json rec = all ");
			 // console.log("filled == "+ JSON.stringify(allFilledOrders));
			  console.log("£££££££££££££££££££££££££££££££££££")
			 for (let j=0;j<allFilledOrders.length;j++) {
			     let clientorderid = allFilledOrders[j]["clientOrderId"];
				 let statuss = isNumber(clientorderid);
	//			 console.log("status ==== " + statuss);
		             if ((isNumber(clientorderid)) && (allFilledOrders[j]["side"]=='BUY')) {
                                 let clientorderidNum = parseInt(clientorderid);
				 let buyclientid = clientorderidNum;
				 clientorderidNum++; // this is for a sell order - unique
                                 let soldOrder = sellOrderFound(apiAllOrders.data, clientorderidNum); // search all orders
				//     console.log("sold ord £££££ - " + soldOrder);
			         if (!soldOrder) {
				      await sqlmod.selectPriceOrderRec(buyclientid);
			              let priceRec = sqlmod.getPriceOrderRec();
			              let sellPriceLocal = parseFloat(priceRec[0]["exitprice"])
	   	                      let buyPriceLocal = parseFloat(allFilledOrders[j]["price"]);
	   	                      let qtyLocal = parseFloat(allFilledOrders[j]["executedQty"]);
				     console.log("sold ord £££££ - " + JSON.stringify(priceRec));
				     console.log(" sellprice local - " + sellPriceLocal);
				     console.log(" buyprice local - " + buyPriceLocal);
				     console.log(" qty local - " + qtyLocal);
			             if ((btcBal >= qtyLocal) && (sellPriceLocal < 999999)) {  // 999999 legacy orders 
                                          loggerp.warn(" coins to sell for order - " + qtyLocal + " btc bal " + btcBal);
			                  saleDone = true;
					     await mainSellOrder(buyPriceLocal, 
				                sellPriceLocal, qtyLocal, clientorderidNum);
					     addSummarySell(buyPriceLocal,
                                                sellPriceLocal, qtyLocal, clientorderidNum);
					  btcBal -= qtyLocal; // sold
				      } else {
                                          loggerp.warn(" no coins to sell " + qtyLocal*sellPriceLocal + " bal " + freeBal);
				      }
				 }
			     }
			 }
                         let openOrders = await bmod.getOpenOrders('TRUE');
			 //client.logger.log(openOrders.data);
			 await insertAPI("marginOpenOrders", "ok");
			 console.log(JSON.stringify(openOrders.data));
			 console.log("open orders iiiiii"+ JSON.stringify(openOrders.data));
			 console.log("open orders iiiiii len "+ JSON.stringify(openOrders.data.length));
			  // loop and get buy orders
			 let k=0; let openBuyOrders =[]; 
			 for (let j=0;j<openOrders.data.length;j++) {
                             if ((openOrders.data[j]["side"] == 'BUY') && (isNumber(openOrders.data[j]["clientOrderId"])))  {
                                 openBuyOrders[k] = openOrders.data[j];
			         k++;
			     }
			 
			 }
			 k=0; let openSellOrders =[]; let totTakeVal = 0;
			 for (let j=0;j<openOrders.data.length;j++) {
                             if ((openOrders.data[j]["side"] == 'SELL') && (isNumber(openOrders.data[j]["clientOrderId"])))  {
                                 openSellOrders[k] = openOrders.data[j];
				 totTakeVal += parseFloat(openOrders.data[j]["origQty"])*parseFloat(openOrders.data[j]["price"]);
			         k++;
			     }
			 
			 }
			  let changeRange = false;
			  let inBuyRange = false;
				let jsonAvg =     await getRangeAvg();
			  // let avgrange = parseFloat(lastminAvg[0]["avgrange"]);
//let jsonout = { avgrange: avgrange, inrange: inrangeval };
//return jsonout;
console.log("kkk === " +JSON.stringify(jsonAvg));
			  changeRange = !jsonAvg["inrange"];
			  inBuyRange = jsonAvg["inrangebuy"];
			        if (jsonAvg) {
					console.log("&&&& new range found");
				    priceBuyVariant = parseFloat(jsonAvg["avgrange"])*riskFactor;
				    priceVariant = parseFloat(jsonAvg["avgrange"])*riskFactor;
				} else {

					console.log("&&&& new range  was not found");
				}

			  console.log("&&& tranges = " + priceVariant + " " + priceBuyVariant);
			 let topBuyRange = parseFloat(statsmod.getBuyPrice()) + parseFloat(priceVariant);
			  let botBuyRange = parseFloat(statsmod.getBuyPrice()) - parseFloat(priceVariant);
			      console.log("++++++++++++++++++++++++++++++")
			      console.log("+ check range 1 buying price +++" + statsmod.getBuyPrice());
			      console.log("++++++++++++++++++++++++++++++")
			  loggerp.error("check range === " + topBuyRange + " " + botBuyRange);
			  let inRange = await checkInRange(openBuyOrders, topBuyRange, botBuyRange);
                          if (!inRange) {
                                console.log("+++++++++++ not found in range 1 +++ ");
				  inRange =  await newRangeCheck(apiAllOrders.data, topBuyRange, botBuyRange);
			  }
			  else {
                             console.log("+++++++++++ found in range 1 +++ ");
			  }

			  if (inRange) { loggerp.error("&&& within range - failed buy");console.log("+++ found in range check if");}
			 
//  id | txndate | toprange | botrange | buyprice | sellprice | clientid | ordertype | inrange
			  if (!saleDone) {
                              sqlmod.insertTradeProfitLogSQL(topBuyRange, botBuyRange, statsmod.getBuyPrice(), 
				  statsmod.getSellPrice(), orderRefVal, 'BUY', inRange);
			      await sqlmod.exSQL();
			  }
//      inserTradeProfitLogSQL = (toprange, botrange, buyprice, sellprice, clientid, ordertype, inrange) => {

			  let lowestPrice = 0.00;
			 if (openBuyOrders.length > 0) {
                             lowestPrice = getLowestOpenBuyPrice(openBuyOrders);
			 }
                          let minBuyPrice = parseFloat(statsmod.getBuyPrice() - priceBuyVariant);
			 console.log("buy == " + JSON.stringify(openBuyOrders));
			 console.log("taker val == " +totTakeVal);
			 console.log("minBuyPrice  == " +minBuyPrice);
			 console.log("lowest price  == " +lowestPrice);
			 console.log("top range   == " +topBuyRange);
			 console.log("bot range   == " +botBuyRange);
			 console.log("in range   == " +inRange);
			 // let avgQtyValid = checkAvgQty();
			 //if (openBuyOrders.length > openOrderLimit)
			  // ensure there are no open buys within trading range
			  //
			 // if (((minBuyPrice < lowestPrice) && (!saleDone)) ||
			//	  ((lowestPrice == 0) && (!saleDone))) {
			    if (totTakeVal > takeLimit) loggerp.error("too exposed - sell orders - " + totTakeVal + " " + takeLimit);
			    if ((!inRange) && (!saleDone) && (totTakeVal < takeLimit) && (!changeRange) && (inBuyRange)) {
				    //         // !£££££££££££££££££££££££ [{"p1":"9.2101250000000000","r1":"13.9360000000000000","per1":"1.68576090887867142300","pd":"18.4202500000000000"}]
loggerp.error("*** price criteria met *** ");
				    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				     console.log("$$$  BUYING CRITERIA MET $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
				    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");

				let orgSellPrice = statsmod.getSellPrice();
		        	let sellPriceL = parseFloat(statsmod.getBuyPrice()) + parseFloat(priceBuyVariant);
				statsmod.setSellPriceVal(sellPriceL.toFixed(2));
     			        console.log("x10 sell price == " + statsmod.getSellPrice() + " " + sellPriceL + " " + statsmod.getBuyPrice());
			      console.log("++++++++++++++++++++++++++++++")
			      console.log("+ BUYING ORDER 1 NOW buying price +++" + statsmod.getBuyPrice());
			      console.log("++++++++++++++++++++++++++++++")
	   	                await mainBuyOrder(statsmod.getBuyPrice(), 
		        	statsmod.getSellPrice(), statsmod.getBuyQty(), orderRefVal);
                                addSummaryBuy(orderRefVal)
			        // let newBuyprice = statsmod.getBuyPrice()*2-statsmod.getSellPrice();
			        let newBuyprice =  parseFloat(statsmod.getBuyPrice()) - parseFloat(priceBuyVariant);

			        let newBuypriceFixed = newBuyprice.toFixed(2);
				statsmod.setBuyPriceVal(newBuypriceFixed);
			      console.log("++++++++++++++++++++++++++++++")
			      console.log("+ check range 2 buying price +++" + statsmod.getBuyPrice());
			      console.log("++++++++++++++++++++++++++++++")
				    let topBuyRange1 = parseFloat(statsmod.getBuyPrice()) + parseFloat(priceVariant);
			        let botBuyRange1 = parseFloat(statsmod.getBuyPrice()) - parseFloat(priceVariant);
			        let inRange1 = await checkInRange(openBuyOrders, topBuyRange1, botBuyRange1);
                                if (!inRange1) inRange1 =  await newRangeCheck(openBuyOrders, topBuyRange1, botBuyRange1);
				if (!inRange1) {    
					console.log("2 ++++++++++++++ not in range +++ ");
		    		    statsmod.setSellPrice(orgSellPrice);
			      console.log("++++++++++++++++++++++++++++++")
			      console.log("+ BUYING ORDER 2 NOW buying price +++" + statsmod.getBuyPrice());
			      console.log("++++++++++++++++++++++++++++++")
			            orderRefVal +=10; // sell at same price but buy lower in price
                       
			     sqlmod.insertTradeProfitLogSQL(topBuyRange1, botBuyRange1, statsmod.getBuyPrice(), 
				  statsmod.getSellPrice(), orderRefVal, 'BUY', inRange);
			      await sqlmod.exSQL();
	   	                    await mainBuyOrder(statsmod.getBuyPrice(), 
		        	    statsmod.getSellPrice(), statsmod.getBuyQty(), orderRefVal);
                                    addSummaryBuy(orderRefVal)
				} else {
                                    console.log("2 ++++++++++++ in range ");
				}
			 } else {
//   if ((!inRange) && (!saleDone) && (totTakeVal < takeLimit) && (!changeRange) && (inBuyRange)) {
                             if (inBuyRange) { console.log("kkkk1 = Buy OK - within buy range for price")
				     } else console.log("fail kkk1 - buy outside range for market");
                             if (!changeRange) { console.log("kkkk2 =Buy OK range did not change for market")
				     } else console.log("fail kkk2 - market range changed ");
                             if (!inRange) { console.log("kkkk3 =Buy OK range order failed -more orders in that range")
				     } else console.log("fail kkk3 - current buy orders in range");
                             if (!saleDone) { console.log("kkkk4 = Buy OK sale not done"); }
				 else console.log("fail kkk4- sale done");
                             if (totTakeVal < takeLimit) console.log("kkkk5 Buy OK  - too many sales"); else { console.log("kkkk5 failed");}

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
//[{"symbol":"BTCUSDT","orderId":15104494125,"clientOrderId":"web_1e3d4378460b4bc88627c6a89cc18ae9","price":"21451.43","origQty":"0.025","executedQty":"0","cummulativeQuoteQty":"0","status":"NEW","timeInForce":"GTC","type":"LIMIT","side":"SELL","stopPrice":"0","icebergQty":"0","time":1667623112373,"updateTime":1667623112373,"isWorking":true,"isIsolated":true},
async function getRangeAvg(timeminlocal) {

/*crypto=# select * from statsrange where avgperiod = 30 order by lasttimemin limit 1;
 id | lasttimemin |   avgminprice    |   avgmaxprice    |   avgrange    | avgperiod | statsid 
----+-------------+------------------+------------------+---------------+-----------+---------
 48 |    27822531 | 16458.1151612903 | 16473.1200000000 | 15.0048387097 |        30 |    7280
(1 row)

crypto=# select * from statsrange where avgperiod = 10 order by lasttimemin limit 1;
 id | lasttimemin |   avgminprice    |   avgmaxprice    |   avgrange    | avgperiod | statsid 
----+-------------+------------------+------------------+---------------+-----------+---------
 45 |    27822523 | 16453.5818181818 | 16476.1918181818 | 22.6100000000 |        10 |    7272
(1 row)

crypto=# select * from statsrange where avgperiod = 5 order by lasttimemin limit 1;
 id | lasttimemin |   avgminprice    |   avgmaxprice    |   avgrange    | avgperiod | statsid 
----+-------------+------------------+------------------+---------------+-----------+---------
 46 |    27822531 | 16414.3633333333 | 16432.1733333333 | 17.8100000000 |         5 |    7280
(1 row)

crypto=# select * from stats order by id limit 1;
crypto=# select minprice, maxprice from stats order by id limit 1;
     minprice     |     maxprice     
------------------+------------------
 16625.3900000000 | 16634.2400000000
*/
//     await selectLastMinAvgDB();
//     let lastminAvg = sqlmod.getLastMinAvg();
await sqlmod.getLastIdStats();
	let id = sqlmod.getLastIdStatsPriceDB(); console.log("id = "+ id);
	await sqlmod.selectTimeMinStatsDB(id);
	let timemin = sqlmod.getStatsRecTime();
console.log("avg1 == "+ JSON.stringify(timemin));
     await sqlmod.selectLastMinAvgDB(timemin[0]["timemin"]);
     let lastminAvg = sqlmod.getLastMinAvg();
console.log("avg == "+ JSON.stringify(lastminAvg));
//id = 7369
/*avg1 == [{"timemin":"27822620"}]
avg == [{"lasttimemin":"27822620","avgminprice":"16393.9483333333","avgmaxprice":"16403.6150000000","avgrange":"9.6666666667","avgperiod":5,"st
atsid":7369},{"lasttimemin":"27822620","avgminprice":"16388.9445454545","avgmaxprice":"16398.5872727273","avgrange":"9.6427272727","avgperiod":
10,"statsid":7369},{"lasttimemin":"27822620","avgminprice":"16384.4454838710","avgmaxprice":"16396.6651612903","avgrange":"12.2196774194","avgp
eriod":30,"statsid":7369},{"lasttimemin":"27822620","avgminprice":"16394.0921311475","avgmaxprice":"16404.6422950820","avgrange":"10.5501639344
","avgperiod":60,"statsid":7369}]
*/

let range5minLow = parseFloat(lastminAvg[0]["avgminprice"])- parseFloat(lastminAvg[0]["avgrange"]);
let range5minHigh = parseFloat(lastminAvg[0]["avgminprice"])+ parseFloat(lastminAvg[0]["avgrange"]);
let minprice10min = parseFloat(lastminAvg[1]["avgminprice"]);
let inrangeval = false;
let inrangebuyval = false;
if ((minprice10min > range5minLow) && (minprice10min < range5minHigh)) {
console.log("same trangfe ==== "); inrangeval = true;
} else {
console.log("new range =="); inrangeval = false;
}

let buyprice = statsmod.getBuyPrice();
console.log("buy price  ==== "+ buyprice); 
if ((buyprice> range5minLow) && (buyprice < range5minHigh)) {
console.log("same trangfe ==== "); inrangebuyval = true;
} else {
console.log("new range =="); inrangebuyval = false;
}


let avgrange = parseFloat(lastminAvg[0]["avgrange"]);
let jsonout = { avgrange: avgrange, inrange: inrangeval, inrangebuy: inrangebuyval };
return jsonout;

}
async function oldrange1() {
	// !£££££££££££££££££££££££ [{"p1":"9.2101250000000000","r1":"13.9360000000000000","per1":"1.68576090887867142300","pd":"18.4202500000000000"}]

//      getRangeAvgDb= () => { return this.rangeAvgDB }
	      await sqlmod.selectRangeAvgDB(120); // 120 - mins on range
  let jsonAvg = sqlmod.getRangeAvgDb();
	console.log("!£££££££££££££££££££££££ "+ JSON.stringify(jsonAvg));
  return jsonAvg;
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
  if (buyOrders.length == 0) return false; // no open buy orders in range
     for (var key in buyOrders) {
        let buyPrice =      parseFloat(buyOrders[key]["price"]);
	console.log("%%%%%% buy price == "+ buyPrice);     
	console.log("%%%%%%top range == "+ topRange);     
	console.log("%%%%%% bot range == "+ botRange);     
        if ((buyPrice > botRange) && (buyPrice < topRange)) {
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
 return false;

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


     let openBuyJson = popJson('BUY', apiAllOrders, 'NEW');
     inrange = await checkInRange(openBuyJson, topRange, botRange);
     if (inrange) return true;
     return false;

     console.log("Unbrought BUY Orders --- " );
     console.table(openBuyJson);
     console.log("Buy Orders with no Sell Orders--- " );
     console.table(unfilledBuyJson);
     console.log("Buy Orders with no Filled Sell Orders--- " );
     console.table(unfilledBuyJsonFilled);


}

function popUnfilledBuyUnfilledSell(buyJson, allJson) {
//      console.log("unmat buy orders == " + JSON.stringify(allJson));
        let unfilledJson=[]; let k=0;
        for (let j=0; j<buyJson.length;j++) {
           let clientorderid = buyJson[j]["clientorderid"];
           if (isNumber(clientorderid)) {
//                 console.log("buy id - " + clientorderid); 
                let sellClientOrderId = clientorderid+1;
//                 console.log("****** sell id - " + sellClientOrderId); 
                if (sellIdExistsFilled(sellClientOrderId, allJson)) {
              //      console.log("  x10 unmatched buy orders == found in json " + sellClientOrderId); 
                } else {
                //      console.log(" x10 unmatched buy orders not found in json " + sellClientOrderId);
                    unfilledJson[k]=buyJson[j];
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
      let buyJsonL = {"buyPrice": statsmod.getBuyPrice(), 
	       "sellPrice": statsmod.getSellPrice(),
	       "buyQty": statsmod.getBuyQty(),
	       "clientorderid": reflocal,
               "orderType": 'BUY'};
      summaryBuyJson.push(buyJsonL);
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

async function newCandleStickManager() {

       // new candlestick
       console.log("************************************************************");
       console.log("*              NEW CANDLESTICK                            *");
       console.log("*              second count = " + statsmod.getNumberSecs() + "                 *");
       console.log("************************************************************");
       


	statsmod.newCandleStick();
       console.log("nnnnnnnn = "+ JSON.stringify(statsmod.getPriceVars()) + "  *** "); 
       histId++;

  //    let datadb = d.toString().replace('GMT+0000 (Coordinated Universal Time)','');
  //    sqlmod.buildSQLStats(statsmod.getAvgPrice(), orgTime, statsmod.getChgPrice(), statsmod.getDirectionPrice(), datadb);
  //    let rtn = await sqlmod.insertStats();
      
	let delim = ",";
      loggerp.warn(delim, statsmod.getNumberSecs(), delim, statsmod.getBuyPrice(), delim, statsmod.getSellPrice()); 
      let trade = true;
      console.log("percent change = " + statsmod.getPercentChange());

       console.log("************************************************************");
       console.log("*              END CANDLESTICK                            *");
       console.log("*              second count = " + statsmod.getNumberSecs() + "                 *");
       console.log("************************************************************");
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


	// process order
		//
            await checkData();
	    while (id == prevId) {
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

	}
	console.log("*********************************************");
	console.log("*                 SUMMARY          **********");
	console.log("*********************************************");
	console.log("Buy Orders ");
	console.table(summaryBuyJson);
	console.log("Sell Orders ");
	console.table(summarySellJson);
	process.exit();
}


async function checkData() {
   if (statsmod.getNumberSecs() > statsmod.getPrevSecs())  {
       console.log("$$$$$$$$$$$$$$$$$$$ furst if met");
       loggerp.error("cond if get nums ", statsmod.getNumberSecs(), statsmod.getNumberSecs()/60, " prev " , statsmod.getPrevSecs());
       statsmod.setPrevSecsToNumber();
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("& start of main loop &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       cycleCount++;
       console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++****** ======= cycle count " + cycleCount + " ");
       let rtn1 = await newCandleStickManager();
       console.log("------------------------------------- "+ Math.abs(statsmod.getPercentChange()) );     
       if (Math.abs(statsmod.getPercentChange() < 0.5)) {
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrderLimit = " + totOrderLimit + " ++++++++++++");
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
           if (totOrders < totOrderLimit) {
               let rtn = await processOrder();
           }
       }
       //process.exit();
       if (statsmod.getMinPrice() > 0) {
          // prices.push(statsmod.getPriceVars());
           statsmod.setPrices();
       }
       console.log("==================================== new time in secs ===================================");
       setValues();
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("& end of main loop &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");     
    } else {
       // min change
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
      sqlmod.insertPriceOrderSQL(orderRef, buyPrice, btcQty, 'BUY', sellPrice);
      await sqlmod.exSQL();
      await insertAPI("newMarginOrderBuy", "ok");
}



