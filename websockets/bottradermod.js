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
var minTradeValue = 0.0012; // to sell left over coins
var minTradingBalance = 100;
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
var minTradePrice = 10000; // safety
var maxTradePrice = 25000; // safety
var runCycle=15;
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
var totOrderLimit = 1;
var btcQty = 0.0015;
//var btcQty = 0.0030
require('dotenv').config();
import {BotMod}  from './botmod.js';
import {DBMod}  from './dbmod.js';
import {SQLMod}  from './sqlmod.js';
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


console.log(client);
var numTries=0;
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
      //// check let buyP = parseFloat(maxPrice - 2*varPrice).toFixed(2); // var taken from the average, so *2
       // based on profit margin - let sellPx = parseFloat(profitMargin + capital)*parseFloat(buyP/capital)
       //let sellP = parseFloat(sellPx).toFixed(2);
      ///check let sellP=avgPrice.toFixed(2); // can also take max price - look at trend for previous 100 values
       let buyP =minPrice.toFixed(2);
       //let buyP = avgPrice.toFixed(2);
	   let sellP = maxPrice.toFixed(2);

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
       sqlmod.buildSQLStats(avgPrice, orgTime, chgPrice, directionPrice, datadb);
       await sqlmod.insertStats();
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
		   console.log("gggggggggggggggg totOrders = " + totOrders);
              if (totOrders < totOrderLimit) {
		      totOrders++;
		      const ran=Math.floor(Math.random() * 1000)
		      const ran2 = Math.floor(Math.random() * 1000)
		      var orderRefVal = ran*ran2;
		      console.log("order ref val === "+ orderRefVal);
		      //await newMarginOrder(buyP, sellP, btcQty, orderRefGlobal);
		      let currencyPair = 'BTCUSDT';
		      console.log("======================%%%%%%%%%%%%%%%%%%%%%%% start of getaccount %%%%%%%%%%%%%%%%%%%%");
                      let jsonAccount = await bmod.getAccountDetails(currencyPair);
		      console.log(JSON.stringify(jsonAccount.data));
		      console.log("======================%%%%%%%%%%%%%%%%%%%%%%% end of getaccount %%%%%%%%%%%%%%%%%%%%");
		      let btcBal = parseFloat(jsonAccount.data["assets"][0]["baseAsset"]["free"]);
		      let freeBal = parseFloat(jsonAccount.data["assets"][0]["quoteAsset"]["free"]);
		      console.log("%%%%%%%%%%%%%%%%%%%%%%% start of manage Order %%%%%%%%%%%%%%%%%%%%");
                      let tradePrice = 0.00;
                      let btcrtn = await btcBalCheck(btcBal, minTradeValue, currencyPair, minTradePrice);
                      console.log(" ooooooo freeBal = " + freeBal);
                      console.log(" ooooooo min trading balance = " + minTradingBalance);
		      if (freeBal > minTradingBalance) {
		          let rtnresp =  await manageOrder(buyP, sellP, btcQty, orderRefVal);
                      } else { 
		          totOrders = totOrders+ 100; // pause processing
		      }
		      console.log("%%%%%%%%%%%%%%%%%%%%%%% end of manage Order %%%%%%%%%%%%%%%%%%%%");
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
 // console.log(" tot orders ==================== "+ );
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

async function btcBalCheck(btcBalLocal, minTradeValueLocal, currencyPairLocal, minTradePriceLocal) {
    let tradePrice = 0.0;
    if (btcBalLocal > minTradeValueLocal) {
        let tradelimit = 10;
	let isIsolatedMargin = "TRUE";
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

async function timetest1() {
      sold=false;
      console.log("****************************** first new order ***********************");	
      setTimeout(function() { sold=true;console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& waiting ...........");
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
    while ((!executedTrade) && (checkedCount < 10)) {
        checkedCount++;
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
    } // end of check for txn existance
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
	  if (purchasedQty >minTradeValue) {
	      let respsell = await manageSellOrder(sellPrice, purchasedQty, orderRef++, OrderPair);
	      //let rtn1 = await dbmod.addOpenOrder(responseMargin.data);
	      //let sqlx1 = buildSQLGen(buyOrderRef, OrderPair, 'BTCUSDT', 'BUY', buyPrice, purchasedQty, 'Closed', responseMargin);
	      sqlmod.createSQL(buyOrderRef, OrderPair, 'BTCUSDT', 'BUY', buyPrice, purchasedQty, 'Closed', responseMargin);
              //let sqlx1 = sqlmod.getSQL();
		  let rtnx1 = await sqlmod.insertOrder();
	      if ((btcQty - purchasedQty)>minTradeValue) {
	          console.log(" cancel orderid = " + orderId);
	          let respcancel = await bmod.cancelOrder(orderId, isIsolated);
	          console.log(client.logger.log(respcancel.data));
	         // let rtn = await dbmod.addCancelOrder(respcancel.data);
	      }
	  } else {

	        //  let respcancel = await bmod.cancelOrder(orderId, isIsolated);
	          console.log(client.logger.log(respcancel.data));
	          let rtn = await dbmod.addCancelOrder(respcancel.data);
	  }
     }	     
     return responseMargin;
}


async function manageSellOrder(sellPrice, btcQty, orderRefSellVal, OrderPair) {
    console.log("************************ sell order ***** = "+ orderRefSellVal );
    let rSell = await bmod.newMarginOrder(sellPrice, btcQty, orderRefSellVal, 'GTC', 'SELL');
    let executedTrade = false;
    if (rSell) {
   	    //let sql = buildSQLGen(orderRefSellVal, OrderPair, 'BTCUSDT', 'SELL', sellPrice, btcQty, 'Open', rSell);
   	    sqlmod.createSQL(orderRefSellVal, OrderPair, 'BTCUSDT', 'SELL', sellPrice, btcQty, 'Open', rSell);
	    let rtn= await sqlmod.insertOrder();
       
    }
    return rSell;
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

//ws.on('message', function incoming(data) {
//    console.log(data);
//})

}
