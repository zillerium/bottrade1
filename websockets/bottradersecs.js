// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"r
const __dirname = path.dirname(__filename);
var statsPkg =require('simple-statistics')


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
var timeAllowed = parseInt(60) * parseInt(60); 
var devLimit = parseFloat(1); // limit of changed allowed on deviation from the period avg - eg 60 mins
var summarySellJson = [];
var summaryBuyJson = [];
const takeLimit = 5000; // open sale orders - limit liabilities 
var riskFactor = parseFloat(2); // defines the risk on the range default is 1, raise this number to decrease risk
const openOrderLimit = 2;
var profitFactor = parseFloat(101/100);
const cycleLimit = 2;
var levelsjson = {};
var avgJsonObj = {};
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
var totOrderLimit = 2;
var btcStdQty = parseFloat(0.00075);
var btcQty =(parseFloat(2)* btcStdQty);
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


async function processCancelOrders(cancelOrders, aBuyPrice){

	  await cancelOrders.map(async item =>  {
			  let c = parseInt(item["clientOrderId"]);
		          let execqtyCancel = parseFloat(item["executedQty"])
                          if (execqtyCancel == 0) {
				  let resp = await bmod.cancelClientOrder(c, 'TRUE');
                  console.log(client.logger.log(resp.data))
   
                                  let sellPriceOrg = parseFloat(item["price"]);
				  let sellPriceCancel = aBuyPrice;
		                  let qtyCancel = parseFloat(item["origQty"]);
                                  let nowqty =parseFloat(qtyCancel) - parseFloat(btcStdQty);
				  console.log(" qty = " + nowqty + " sell price cancel " + sellPriceCancel);
                                  let sellPriceFixed2 = sellPriceCancel.toFixed(2);                                  
				  resp = await bmod.newMarginOrder(sellPriceFixed2, nowqty, c, 'GTC','SELL');
                  console.log(client.logger.log(resp.data))
                                 sqlmod.insertPriceOrderSQL(c, parseFloat(sellPriceFixed2),
					 nowqty, 'SELL', parseFloat(sellPriceFixed2));
                                 await sqlmod.exSQL();

                                  let orgTot = qtyCancel * sellPriceOrg;
				  // profit factor allows for profit to compensate for losses when using fixed 2
				 let totToSell = parseFloat(orgTot - (parseFloat(sellPriceFixed2) * nowqty))*parseFloat(profitFactor);
				 let newSellPrice= parseFloat(totToSell/btcStdQty);
				  console.log(" qty = " + btcStdQty + " sell price cancel " + newSellPrice);
				  
				  let c1=c+1;
				  resp = await bmod.newMarginOrder(newSellPrice.toFixed(2), btcStdQty, c1, 'GTC','SELL');
                  console.log(client.logger.log(resp.data))

                                 sqlmod.insertPriceOrderSQL(c1, newSellPrice, btcStdQty, 'SELL', newSellPrice);
                                 await sqlmod.exSQL();
	                         // addSummarySellJson(buyprice, sellprice, qty, sellId);
				  
			  } 

	 })
}

async function processSellOrderForBuy(allFilledBuyOrders, allSellOrders, btcBal) {


                //  console.log("nnnnnnbbbb = " + JSON.stringify(allSellOrders));
	 let salesunresolved = await allFilledBuyOrders.map(async item =>  {
		      let saleJson = {};
			  let c = parseInt(item["clientOrderId"])+parseInt(1);	
		      if (((parseInt(item["clientOrderId"]) == 481569849090) ||
		           (parseInt(item["clientOrderId"]) == 3716306906) || 
		           (parseInt(item["clientOrderId"]) == 143891352102) || 
		           (parseInt(item["clientOrderId"]) == 23541204855) || 
		           (parseInt(item["clientOrderId"]) == 702319960530) || 
		           (parseInt(item["clientOrderId"]) == 65933311107) || 
		           (parseInt(item["clientOrderId"]) == 691595626555) || 
		           (parseInt(item["clientOrderId"]) == 389325811524))
                           || (parseInt(item["time"]) <=1669693522665))           
// 1669693522665
// 143891352103
		          {

			  } else {
				//  console.log("jjjjjjjjjjjjj match before if -- " + c);
                                  let m1 = !allSellOrders.some(m => parseInt(m["clientOrderId"]) == c);
			          if (m1) {
				  //    console.log("jjjjjjjjjjjjj no matchyy -- " + c);
				      let json = await sellOrder(item, btcBal);
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
                                       (
					(nsellprice < (parseFloat(m["price"])+rangePrice)) &&
		                        (nsellprice > (parseFloat(m["price"])-rangePrice)) &&
                                        (parseFloat(m["origQty"]) == btcQty) // original sale before splitting (when coins do not sell)
				       )
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
		                        (topBuyRange >= (parseFloat(m["price"]))) &&
					      (parseFloat(m["origQty"]) == btcQty)
				      )
	                              );
	return inRange;
}

async function inDupDecision(openSellOrders, nsellprice, rangePrice) {

       	                  let dupSale = openSellOrders.some(m => 
                                       (
				       (nsellprice < (parseFloat(m["price"])+rangePrice)) &&
		                       (nsellprice > (parseFloat(m["price"])-rangePrice)) &&
					      (parseFloat(m["origQty"]) == btcQty)
				       )
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
		                        (topBuyRange >= (parseFloat(m["price"]))) &&
					      (parseFloat(m["origQty"]) == btcQty)
				      );
                              ordersJson["buyPrice"] = cBuyPrice;
                              return ordersJson;
                          })

			  let ordersresolved = await Promise.all(ordersunresolved);
	                   return ordersresolved;

                         //Object.assign(openOrdersRangeJson, ordersresolved);
			 //console.log("uuuuuuuuuuuuuuuuu orders resolved == " + JSON.stringify(ordersresolved));

}
/*
 *
*/

function WithinSellRange(price, levelsjson, time) {

	let nowSecs = (Date.now()/1000);
	  let min5m =parseFloat(levelsjson["min5m"]);
	  let max5m = parseFloat(levelsjson["max5m"]);
	  let min10m =parseFloat(levelsjson["min10m"]);
	  let max10m = parseFloat(levelsjson["max10m"]);
console.log("hhhhhhh sell price = " + price);
	console.log("hhhhh levels = " + JSON.stringify(levelsjson));
      let range = max10m - min10m;
	let withinRange = false;
	if (price < (max10m + range)) {
             withinRange = true;
	} else {
		if ((nowSecs - time)<timeAllowed) {
			
                    withinRange = true;
		} else {
			withinRange = false;
		}
	}
	console.log("hh withinrange  "  + withinRange);
        return withinRange;
}

function getOpenSell(openOrders) {
	let nowSecs = (Date.now()/1000);
//            let timeSecsDiff = nowSecs - (parseInt(apiAllOrders.data[j]["time"])/1000)

console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
console.log("h open check data for open sell hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");
        let openBuyOrders=[];
	let openSellOrders=[];
	let openCancelOrders=[];
	let openNewSellOrders=[];
	let totTake=[]; let totTakeVal=0;
        openOrders.data.map(item => {
            // console.log("item = "+ JSON.stringify(item));
            if (
		     (item["side"] == 'BUY') 
	             && (item["origQty"] == parseFloat(btcQty))
     	             && (isNumber(item["clientOrderId"]))
               ) 
		    openBuyOrders.push(item);	
            if (
		    (item["side"] == 'SELL') 
	             && (item["origQty"] == parseFloat(btcQty))
		     && (isNumber(item["clientOrderId"]))
               ) {
		    openSellOrders.push(item);
		    totTakeVal += parseFloat(item["origQty"])*parseFloat(item["price"]);    
    	         }
            if (
		    (item["side"] == 'SELL') 
	             && (item["origQty"] == parseFloat(btcQty))
		     && (isNumber(item["clientOrderId"]))
		     //&& (!WithinSellRange(parseFloat(item["price"]),
	//		 levelsjson, parseInt(item["time"]/1000))) // expect price to be reached
		     && ((nowSecs - (parseInt(item["time"]/1000)))>timeAllowed)
               ) {
		    openCancelOrders.push(item);
    	         }
             })
	totTake[0]={totTakeVal: totTakeVal};
	return [ openBuyOrders, openSellOrders, openCancelOrders, totTake ];

}
async function popOrdersJson(openBuyOrders, topBuyRange, botBuyRange, priceVariant, cBuyPrice) {
     let openOrdersRangeJson=[];
                         let ordersresolved = await processingRangeOrder(
				 openBuyOrders, 
				 topBuyRange, 
				 botBuyRange, 
				 priceVariant, 
				 cBuyPrice
			    );

                         Object.assign(openOrdersRangeJson, ordersresolved);
			 return openOrdersRangeJson; 

}
async function processingDup(openSellOrders, rangePrice, nsellprice) {
let openSalesOrdersRangeJson=[];
                          let salesresolvedDup = await processingInDupOrder(
				 openSellOrders, 
				 rangePrice, 
				 nsellprice
			        );
                          Object.assign(openSalesOrdersRangeJson, salesresolvedDup);
	return openSalesOrdersRangeJson;
}
async function processOrder(buyJson) {

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
                  let jsonAccount = await bmod.getAccountDetails(currencyPair);
	          await insertAPI("isolatedMarginAccountInfo", "ok");
		//  console.log(JSON.stringify(jsonAccount.data));
		  let btcBal = parseFloat(jsonAccount.data["assets"][0]["baseAsset"]["free"]);
		  let freeBal = parseFloat(jsonAccount.data["assets"][0]["quoteAsset"]["free"]);
               //   let btcBal = 10; // api calls can fail         
               //   let freeBal = 1000; // api calls can fail         
	          let tradePrice = 0.00;
                  //let btcrtn = await btcBalCheck(btcBal, minTradeValue, currencyPair, minTradePrice);
                  console.log(" ooooooo btcBal = " + btcBal);
                  console.log(" ooooooo freeBal = " + freeBal);
                  console.log(" ooooooo min trading balance = " + minTradingBalance);
		  // avoid when profit is zero
		  // add two sell prices - one at max candlestick and one at x10 candlestick - 50% split.
		  let profitprojected = statsmod.getSellPrice() - statsmod.getBuyPrice();
	   	  console.log("--------------> profit projected == " + profitprojected);
		  if (
			 ( (freeBal > minTradingBalance) || (btcBal > 0))
			  && (profitprojected > 0) ) {

                      await processMainOrders(orderRefVal, btcBal, buyJson);
		  }
}

function getStatsPeriodRec(jsonStatsPeriodRec, statsvar) {

//	let tperiod = 60;
//	  let nrecs = 60;
	//  [{"lasttimemin":"27834353","avgminprice":"16959.4811475410","avgmaxprice":"16964.9219672131","avgrange":"5.4408196721","avgperiod":60},{"lasttimemin":"27834352","avgminprice":"16958.8150819672","avgmaxprice":"16964.3439344262","avgrange":"5.5288524590","avgperiod":60},{"lasttimemin":"27834351","avgminprice"
	let statsMinArray = [];
	let initialMins = parseInt(jsonStatsPeriodRec[0]["lasttimemin"]);
	let initialPrice = parseFloat(jsonStatsPeriodRec[0][statsvar]);
	jsonStatsPeriodRec.map(m=>{
               statsMinArray.push([parseInt(m["lasttimemin"])-
		       initialMins, parseFloat(m[statsvar])-initialPrice]);
	})
	console.log("hhhh " + statsMinArray);
        let linearStats = statsPkg.linearRegression(statsMinArray);
	console.log("hhhh = "+ JSON.stringify(linearStats));
        return linearStats;
}

async function buyDecision() {

	await sqlmod.getLinearRegDataDB(10,30); // time, number recs
	let jsonLR60 = sqlmod.getLinearRegTrend();
//	console.log("kkkkkk = "+ JSON.stringify(jsonLR60));
	console.log(" kkkk min price = "+statsmod.getMinPrice());
	console.log(" kkkk max price = "+statsmod.getMaxPrice());
	let buyArray = [];
	let buyArrayMinm = [];
	let prevmind = 0;
        jsonLR60.map(m=> {
    	    let gradmind = parseFloat(m["mind"]) - prevmind;
            buyArray.push([
		    parseInt(m["lasttimemin"]), // 0 
		    parseFloat(m["avgminprice"]), // 1
		    parseFloat(m["avgmaxprice"]), // 2
		    parseFloat(m["minm"]),  // 3
		    parseFloat(m["maxm"]), // 4
		    parseFloat(m["mind"]), // 5
		    parseFloat(m["maxd"]), // 6
		    parseFloat(m["avgrange"]), // 7
		    parseFloat(gradmind) // 8
		     
	             ] );
	    prevmind = parseFloat(m["mind"]);
	    buyArrayMinm.push(parseFloat(m["mind"]));
	});
        for (let j=0;j< buyArray.length; j++) {
    	    //console.log("array mind == " + buyArray[j][5] + " " + buyArray[j][8]);
	}
	//console.log("array buy == " + buyArray);
	console.log("array == " + buyArrayMinm);
	let minmVal = Math.min(...buyArrayMinm);
	let maxmVal = Math.max(...buyArrayMinm);
        let minmInd = buyArrayMinm.findIndex(m=>m==minmVal);
        let maxmInd = buyArrayMinm.findIndex(m=>m==minmVal);
	console.log( "mmmmm = min " +Math.min(...buyArrayMinm));
	console.log( "mmmmm = max " +Math.max(...buyArrayMinm));
	console.log( "mmmmm = findindex min " +buyArrayMinm.findIndex(m=>m==minmVal));
	console.log( "mmmmm = findindex max " +buyArrayMinm.findIndex(m=>m==maxmVal));
        let bnd = getBoundaryPoints(buyArray); // gets peaks and troughs in mind data
        let cos = getCrossOvers(buyArray); // gets peaks and troughs in mind data
	console.log("bnd == "+ JSON.stringify(bnd));
	console.log("cos == "+ JSON.stringify(cos));
	
	let timemins =buyArray[0][0];
	let range =buyArray[0][7];
	await sqlmod.selectCurrentStatsMins(timemins);
	let jsonPrices = sqlmod.getCurrentStatsMins();
		// |          txndate           |     minprice     |     maxprice     |    openprice     |    closeprice    |     avgprice     |      sumprice       | timemin  | itemnum |      qty 
        let minprice = parseFloat(jsonPrices[0]["minprice"]);
	let maxprice = parseFloat(jsonPrices[0]["maxprice"]);
	let avgprice = parseFloat(jsonPrices[0]["avgprice"]);
	let avgminprice10 = buyArray[0][1];
	let avgmaxprice10 = buyArray[0][2];
	let buyPrice = maxprice; // min prices left orders not bought - avg prices also were left not bought on the up curve
	let sellPrice = buyPrice + (maxprice - minprice); // range is usually constant unless there is a crash or breakout
        let t = buyArray[0][0];
        let buyOrder = false;
        //let buyOrderUnresolved = cos["up"].map(n=>{
	if (cos["down"] && cos["down"].length>0) {
	    if (cos["up"] && cos["up"].length>0) {
		    let n = parseInt(cos["up"][0])
		    let o = parseInt(cos["down"][0])
// can just use indexes here and not time, also can just ensure up time > down time
                let tup=parseInt(buyArray[n][0]);
                let tdown=parseInt(buyArray[o][0]);
                if ((t>= tup && t> tdown) && (tup > tdown)) {
			      console.log(" time if + " + t + " tup + " + tup + " tdown + " + tdown);
    	            buyOrder = true;
    	        }
	    }
		
//		console.log("     llllllllllllll ==== found down recs");
  //      cos["up"].map(n=>{
   //         let tup=parseInt(buyArray[n][0]);
    //  	    cos["down"].map(o=>{
//	        let tdown = parseInt(buyArray[o][0]);
//			      console.log(" time  + " + t + " tup + " + tup + " tdown + " + tdown);
 //               if (t> tup && t> tdown) {
//			      console.log(" time if + " + t + " tup + " + tup + " tdown + " + tdown);
  //  	            buyOrder = true;
    //	        }
    //	    })
      //  })
	} else { buyOrder=true;}
//	let buyOrder = await Promise.all(buyOrderUnresolved);
        if (buyOrder) {
             statsmod.setBuyPriceVal(buyPrice);
             statsmod.setSellPriceVal(sellPrice);
		return {buy: buyPrice, sell: sellPrice, range: range, buyOrder: true}
	} else {
		return {buy: 0, sell: sellPrice, range: range, buyOrder: false}
	}
/*	if ((buyArray[1]["mind"]<0) && (buyArray[0]["mind"]>0)) {
             // turning point - buying possibility
		if (buyPrice > avgminprice10) {
                    buyPrice = avgminprice10;
		}
		console.log("buy price == "+ buyPrice);
		console.log("sell price == "+ sellPrice);
		return buyPrice;
	}
*/
/*	while (notFound) {
	    if (minmInd>0) {
             // minimum is not first entry so data is past minimum
	     // split array before min value
	        let afterMin = [];
		afterMin = buyArrayMinm.slice(0,minmInd-1);
		console.log(" new array == " + afterMin);
	        let minmVal = Math.min(..a.buyArrayMinm);
         	let maxmVal = Math.max(...buyArrayMinm);
                let minmInd = buyArrayMinm.findIndex(m=>m==minmVal);
                let maxmInd = buyArrayMinm.findIndex(m=>m==minmVal);
    	    }
	console.log( "mmmmm = min " +Math.min(...buyArrayMinm));
	console.log( "mmmmm = max " +Math.max(...buyArrayMinm));
	console.log( "mmmmm = findindex min " +buyArrayMinm.findIndex(m=>m==minmVal));
	console.log( "mmmmm = findindex max " +buyArrayMinm.findIndex(m=>m==maxmVal));
	 } */
}
function getBoundaryPoints (arr) {
	var bnd = { highs:[], lows: []} 
	for (let i=1; i<arr.length - 1; i++) {
           let current = arr[i][5];
           let last = arr[i-1][5];
	   let next = arr[i+1][5];
//		console.log("curr == "+ current);
	   if (current > next && current > last) {
		   bnd["highs"].push(i);
//		   console.log("found peak");
	   }
	   else {
		   if (current < next && current < last) {
		   bnd["lows"].push(i);
//		   console.log("found lows");
	        }
	   }
	}
	return bnd;
}
function getCrossOvers (arr) {
	var bnd = {up:[], down: []} 
	for (let i=0; i<arr.length - 2; i++) {
           let current = arr[i][5];
           let last = arr[i+1][5];
	  // let next = arr[i-1][5];
           if ((current > 0 && last < 0) && (i<3)) { // take only first three up pts - avoid buy orders being left unbought
		   bnd["up"].push(i);
//		   console.log("current == "+ current + " up " + "last " + last);
	   }
	   else {
		   if (current < 0 && last  >0 ) {
		   bnd["down"].push(i);
//		   console.log("current == "+ current + " down " + "last " + last);
	        }
	   }
	}
	return bnd;
}
async function processMainOrders(orderRefVal, btcBal, buyJson) {


	let range = parseFloat(buyJson["range"]);
    loggerp.error("buying option now ");
    console.log(" buying price === " + statsmod.getBuyPrice());
    console.log(" selling price === " + statsmod.getSellPrice());
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("!       all orders       !!!!!!!!");
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    let apiAllOrders = await bmod.getAllOrdersSelect('TRUE', 200);
    //client.logger.log(apiAllOrders.data);
                         
    await insertAPI("marginAllOrders", "ok");
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.log("!       all orders - end      !!!!!!!!");
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    let allFilledOrders =[];
    let allUnFilledBuyOrders = [];
    let allFilledBuyOrders = [];
    let allFilledSellOrders = [];
    let allSellOrders = []; // includes new orders 
    apiAllOrders.data.map(item => {
        //  console.log("item = "+ JSON.stringify(item));
        if (
		 (item["status"] == 'FILLED') 
	      && (item["side"] =='BUY')
	      && (item["executedQty"] == parseFloat(btcQty))
	      && (isNumber(item["clientOrderId"]))
	 ) { 
	      allFilledBuyOrders.push(item);
        }
        if (
				 (item["status"] == 'NEW') 
		          && (item["side"] =='BUY')
	                  && (item["origQty"] == parseFloat(btcQty))
		          && (isNumber(item["clientOrderId"]))
			 ) { 
			     allUnFilledBuyOrders.push(item);
         }
         if (
				 (item["status"] == 'FILLED') 
		          && ((item["side"])=='SELL')
	                  && (item["executedQty"] == parseFloat(btcQty))
		          && (isNumber(item["clientOrderId"]))
			 ) { 
			     allFilledSellOrders.push(item);
		         }
        if (
				 ((item["status"] == 'NEW') || (item["status"] == 'FILLED') ) 
		          && ((item["side"])=='SELL')
	                 // && (item["origQty"] == parseFloat(btcQty))
		          && (isNumber(item["clientOrderId"]))
			 ) { 
			     allSellOrders.push(item);
		         }
       })
    let saleDone = await  processSellOrderForBuy(allFilledBuyOrders, allSellOrders, btcBal);
    statsmod.setSaleDone(saleDone);

    if (saleDone) return 0; // do not buy
    

          let openOrders = await bmod.getOpenOrders('TRUE');
          await insertAPI("marginOpenOrders", "ok");

	  let changeRange = false;
	  let inBuyRange = true;
	  let priceBuyVariant = range;
	  let priceVariant = range; 
	  let rangePrice = range;
	  
	  statsmod.setPriceBuyVariant(priceBuyVariant);
	  statsmod.setPriceVariant(priceVariant);
	  statsmod.setRangePrice(rangePrice);
	  statsmod.setChangeRange(changeRange);
	  statsmod.setInBuyRange(inBuyRange);
  	
	  let jsonOS = getOpenSell(openOrders);
	  let openBuyOrders = jsonOS[0];
	  let openSellOrders = jsonOS[1];
	  let totTakeVal = jsonOS[3][0]["totTakeVal"];
	  let openCancelOrders = jsonOS[2];
	  statsmod.setTotTakeVal(totTakeVal);
	  statsmod.setTakeLimit(takeLimit);
//		  console.log(" sell orders = "+ JSON.stringify(openSellOrders));
          if ((openCancelOrders) && (openCancelOrders.length > 0)) {
//		  console.log(" cancel orders = "+ JSON.stringify(openCancelOrders));
	       await  processCancelOrders(openCancelOrders, parseFloat(statsmod.getBuyPrice())); // cancel and resell
               return 0;
          } 
	if (buyJson.buyOrder) {
	    await longTermBuys(
		    apiAllOrders,
		    allFilledOrders,
		    allUnFilledBuyOrders,
		    allFilledBuyOrders,
		    allFilledSellOrders,
		    allSellOrders,
		    saleDone,
		    orderRefVal,
	            openOrders, 
               	    openBuyOrders,
		    openSellOrders,
	            totTakeVal,
                    openCancelOrders,
		    changeRange, inBuyRange, priceBuyVariant, priceVariant, rangePrice
	    ); 	    
	}
	return 0;
}



async function longTermBuys(
	    apiAllOrders,
            allFilledOrders,
            allUnFilledBuyOrders,
            allFilledBuyOrders,
            allFilledSellOrders,
            allSellOrders,
	    saleDone,
	    orderRefVal,
	openOrders, 
	openBuyOrders,
	openSellOrders,
	totTakeVal,
	openCancelOrders,
             changeRange, inBuyRange, priceBuyVariant, priceVariant, rangePrice

) {


	  let nsellprice = statsmod.getSellPrice();
	  
	  let dupSale = await inDupDecision(openSellOrders, nsellprice, rangePrice);
	  statsmod.setDupSale(dupSale);

	  let dupSalesJson = await processingDup(openSellOrders, rangePrice, nsellprice);
	  statsmod.setOpenSalesRangeJson(dupSalesJson); 

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
	 let openOrdersRangeJson = await popOrdersJson(
		 openBuyOrders, 
		 topBuyRange, 
		 botBuyRange, 
		 priceVariant, 
		 cBuyPrice);
	  statsmod.setOpenOrdersRangeJson(openOrdersRangeJson);

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
			//	    (inBuyRange ) && (!dupSale)) 
	//	    {
     let currErrIndex = (statsmod.getErrJson()).length - 1;
     if (!statsmod.getErrJson()[currErrIndex]["err"]) {
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

      console.log("************************************************");
      console.log("***** END OF API CALL ***************************");
      console.log("************************************************");

}
async function buyOrderInd(
	sellPrice, 
	buyPrice,
	catNum,
	orderRef,
	txnType,
	rangePrice,
        topBuyRange,
        botBuyRange,
        inRange,
        qty,
	openSellOrders
     ) {

	let sellPriceNum = parseFloat(sellPrice);			 

        statsmod.setSellPriceVal(sellPriceNum);
        statsmod.setBuyPriceVal(buyPrice);
        statsmod.setOrderCat(catNum);
	statsmod.setOrderRef(orderRef);
        statsmod.setTxnType(txnType);	             
	let  dupSale = await inDupDecision(openSellOrders, sellPrice, rangePrice);
	if (!dupSale) {
	     await processBuyOrder(
		      sellPriceNum.toFixed(2), 
		      buyPrice.toFixed(2),
		      orderRef, 
		      topBuyRange,
		      botBuyRange, 
		      inRange, 
		      qty,
		      catNum
	      );
              statsmod.setOrderJson();
              statsmod.setErrJson();
        }

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
	let orderRef = statsmod.getOrderRef();
	let inRange = statsmod.getInRange();
	let totTakeVal = statsmod.getTotTakeVal();
	let takeLimit = statsmod.getTakeLimit();
        statsmod.setKeyOrderVars();
	console.log("mmmmmmmmmmmmmm = "+ JSON.stringify(statsmod.getKeyOrderVars()));

	console.log("kkkkkkkk = end staryt");
// sell at price 1 - buy at current price
	let orgSellPrice = parseFloat(statsmod.getSellPrice());
        let orgBuyPricelocal = parseFloat(statsmod.getBuyPrice());
	let origQty = statsmod.getBuyQty();
		        	
       let sellPrice = parseFloat(orgBuyPricelocal) + parseFloat(priceBuyVariant);
       let catNum = parseInt(1);
       await buyOrderInd(
   	     sellPrice, 
	     orgBuyPricelocal,
   	     catNum,
	     orderRef,
             'BUY',
	     rangePrice,
             topBuyRange,
             botBuyRange,
             inRange,
             origQty,
	     openSellOrders
         );
	catNum = parseInt(3);
        let orderRefVal3 = orderRef + 20; 
	let margin = parseFloat(2);
        sellPrice = parseFloat(orgBuyPricelocal) + parseFloat(parseFloat(margin)* parseFloat(priceBuyVariant));
	 statsmod.setErrForJson(); // move later
}
async function rsell2() {
       await buyOrderInd(
   	     sellPrice, 
	     orgBuyPricelocal,
   	     catNum,
	     orderRefVal3,
             'BUY',
	     rangePrice,
             topBuyRange,
             botBuyRange,
             inRange,
             origQty,
	     openSellOrders
         );

// new buy price, sell price is current sell price, check no current buy prices exist
	let newBuyprice =  parseFloat(orgBuyPricelocal) - parseFloat(priceBuyVariant);
	let topBuyRange1 = parseFloat(newBuyprice) + parseFloat(priceVariant);
        let botBuyRange1 = parseFloat(newBuyprice) - parseFloat(priceVariant);
        statsmod.setTopBuyRange(topBuyRange1);
        statsmod.setBotBuyRange(botBuyRange1);
        let inRange1 = await inRangeDecision
	                (openBuyOrders, 
		         topBuyRange1, 
		         botBuyRange1
                 );
        catNum = parseInt(2);
	let orderRefVal2 = orderRef+10; 
        statsmod.setInRange(inRange1);
	if (!inRange1) {
            await buyOrderInd(
   	             orgSellPrice, 
	             newBuyprice,
   	             catNum,
	             orderRefVal2,
                     'BUY',
	             rangePrice,
                     topBuyRange1,
                     botBuyRange1,
                     inRange1,
                     origQty,
	             openSellOrders
                  );
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

//        let levelsjson = {min5m: range5minLow, max5m: range5minHigh,
//                         min10m: minprice10min, max10m: maxprice10min, buyprice: buyprice};


async function checkAvgQty() {
    await sqlmod.selectAvgQtyDB(60); // 60 mins - gets avg qty for all slots
    let avgQty = sqlmod.getAvgQtyDb();
    console.log("**** avg qty == "+ avgQty);
     // check last min and compare to avg to avoid a spike to zeroing out of qty in a min slot

}



function addSumaryBuy(reflocal) {
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

async function sellOrder(filledBuyOrder, btcBal) {

	console.log("filled by order to sell mmmmmmmmmmm = "+JSON.stringify(filledBuyOrder));
       // let btcBal = 1000; // should be changed for the real btc balc - get account info
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
//
//
async function main3() {
// use  ntpdate -s ntp.ubuntu.com to sync time 
	// also date "+%S"
let response = await bmod.getServerTime();
	client.logger.log(response.data);
	console.log("time - "+ Date.now());
	process.exit();
}
async function mainx() {
	let processLimit = parseInt(1);
        let processA = 0;
	let processtest = true;
        let i=0;
        let btcBal = await getBtcBalance();
        if (btcBal == 0) {
	    const ran=Math.floor(Math.random() * 1000000)
	    const ran2 = Math.floor(Math.random() * 1000000)
	    var aOrderRef = ran*ran2;

	    await sqlmod.selectPriceDB(1, 'desc');
	    let priceRecs = sqlmod.getPriceDb();
	    //let qty= parseFloat(priceRecs[0]["qty"]);
	    let qty =parseFloat(1) * parseFloat(0.00075);
	    let aBuyPrice = parseFloat(priceRecs[0]["price"]);
	    let aSellPrice = aBuyPrice + parseFloat(1); // 1 dollar
            loggerp.error("log buy call to api");
	    await processShortTermBuyOrder(
		    aSellPrice, 
		    aBuyPrice, 
		    aOrderRef, 
		    qty);

	   while ((btcBal == 0) && (i< 20)) {
                btcBal = await getBtcBalance();
		i++;   
    	    }
            if (btcBal > 0) {		
                loggerp.error("log sell call to api");
                await mainSellOrderShort(aBuyPrice, aSellPrice, qty, aOrderRef);
	    }
	}	

	process.exit();
}

async function getBtcBalance() {

loggerp.error("log call to api");
    let jsonAccount = await bmod.getAccountDetails('BTCUSDT');
    console.log(JSON.stringify(jsonAccount.data));
    let btcBal = parseFloat(jsonAccount.data["assets"][0]["baseAsset"]["free"]);
    let freeBal = parseFloat(jsonAccount.data["assets"][0]["quoteAsset"]["free"]);

	return btcBal;
}
async function shortTermTrade() {
	
    let jsonAccount = await bmod.getAccountDetails('BTCUSDT');
    console.log(JSON.stringify(jsonAccount.data));
    let btcBal = parseFloat(jsonAccount.data["assets"][0]["baseAsset"]["free"]);
    let freeBal = parseFloat(jsonAccount.data["assets"][0]["quoteAsset"]["free"]);

    await insertAPI("getAccountInfo", "ok");
    if (btcBal > 0) {
	    await sellShort();
    } else {
	    await buyShort();
    }
}

async function sellShort() {

       await sqlmod.getPriceOrderLastIdShort();
       let id = sqlmod.getPid();
       console.log(" id 222 = "+ id);
       await sqlmod.selectPriceOrderRecByIdShort(parseInt(id));
       let priceRec = sqlmod.getPriceOrderRec();
       console.log("JSON.stringidy - "+JSON.stringify(priceRec));
       let buyprice = parseFloat(priceRec[0]["price"]);
       let sellprice = parseFloat(priceRec[0]["exitprice"]);
       if (sellprice > buyprice) {
           let qty = parseFloat(priceRec[0]["qty"]);
           let sellId = parseInt(priceRec[0]["clientorderid"])+1;
           await mainSellOrderShort(buyprice, sellprice, qty, sellId);
       }
}
async function buyShort() {

	    const ran=Math.floor(Math.random() * 1000000)
	    const ran2 = Math.floor(Math.random() * 1000000)
	    var aOrderRef = ran*ran2;

	    await sqlmod.selectPriceDB(1, 'desc');
	    let priceRecs = sqlmod.getPriceDb();
	    //let qty= parseFloat(priceRecs[0]["qty"]);
	    let qty = 0.00075;
	    let aBuyPrice = parseFloat(priceRecs[0]["price"]);
	    let aSellPrice = aBuyPrice + parseFloat(1); // 1 dollar
	    await processShortTermBuyOrder(
		    aSellPrice, 
		    aBuyPrice, 
		    aOrderRef, 
		    qty);
}


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
	console.table(statsmod.getOpenOrdersRangeJson());
	console.log("Dup Sales");
	console.table(statsmod.getOpenSalesRangeJson());
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
       let delim = ",";
       loggerp.warn(delim, statsmod.getNumberSecs(), delim, statsmod.getBuyPrice(), delim, statsmod.getSellPrice()); 
       let trade = true;
       let buyJson = await buyDecision();
       console.log("++++++++++++++ buyPrice = " + JSON.stringify(buyJson)+ " ++++++++++++");
       console.log("++++++++++++++ totOrders = " + totOrders + " ++++++++++++");
       console.log("++++++++++++++ totOrderLimit = " + totOrderLimit + " ++++++++++++");
       if ((totOrders < totOrderLimit) ) {
            let rtn = await processOrder(buyJson);
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

async function mainSellOrderShort(buyPrice, sellPrice, btcQty, orderRef) {
console.log("KKKKKKKKKKKKK sell order");

      logger.info("api new order - buy ");
      let responseMargin = await bmod.newMarginOrderShort(sellPrice, btcQty, orderRef, 'GTC','SELL');
 //     await insertAPI("newMarginOrderSell", "ok");
      client.logger.log(responseMargin.data);
	


}
async function mainSellOrder(buyPrice, sellPrice, btcQty, orderRef) {
console.log("KKKKKKKKKKKKK sell order");
//    totOrders++;
//    return 0;
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


async function mainBuyOrderShort(buyPrice, sellPrice, btcQty, orderRef) {
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);
        console.log("@@@@@@@@@@@@@@@@@ loop alert @@@@@@@@@@@@@@@@ " + totOrders);

      let responseMargin = await bmod.newMarginOrderShort(buyPrice, btcQty, orderRef, 'GTC','BUY');
    //  console.log("resp buy == "+ JSON.stringify(responseMargin.data));
     // sqlmod.insertPriceOrderSQLShort(orderRef, buyPrice, btcQty, 'BUY', sellPrice);
    //  await sqlmod.exSQL();
    //  await insertAPI("newMarginOrderBuy", "ok");
      client.logger.log(responseMargin.data);
}


