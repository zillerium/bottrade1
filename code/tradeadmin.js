// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"r
const __dirname = path.dirname(__filename);


const WebSocket = require('ws');
const ws = new WebSocket('wss://stream.binance.com:9443/ws/eo:tcusdt@trade');
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


const takeLimit = 30;
const openOrderLimit = 5;
const cycleLimit = 5;
const logger = getLogger();
const loggerp = getLogger("price");
//var logger = log4js.getLogger("bot");
var minTradeValue = 0.00125; // to sell left over coins
var minTradingBalance = 500;
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
var btcQty = 0.00075;
//var btcQty = 0.01;
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
//const {Client} = require("pg");
const client = new Spot(apiKey, apiSecret)
var safeLimit = 10; // difference between buys and sells to stop a runaway bot buying
const bmod = new BotMod(client, minTradePrice, maxTradePrice, safeLimit);
const dbmod = new DBMod();
const sqlmod = new SQLMod();
const statsmod = new StatsMod();

main();

async function main() {

     let currencyPair = 'BTCUSDT';
 //    let jsonAccount = await bmod.getAccountDetails(currencyPair);
 //    console.log(JSON.stringify(jsonAccount.data));
     let apiAllOrders = await bmod.getAllOrders('TRUE');
     client.logger.log(apiAllOrders.data);

     let buyJson = popJson('BUY', apiAllOrders, 'FILLED');
     let sellJson = popJson('SELL', apiAllOrders, 'FILLED');
     let profitJson = 	calcProfit(buyJson, sellJson);
     let profittot = 0;
     for (var key in profitJson) {
	profittot += parseFloat(JSON.stringify(profitJson[key]["profit"]));
        console.log("x10 -- " + key + " " + JSON.stringify(profitJson[key]["profit"]));
     }

     let unfilledBuyJson = popUnfilledJson(buyJson, apiAllOrders.data);
     let unfilledBuyJsonFilled = popUnfilledJsonFilled(buyJson, apiAllOrders.data);
     let openBuyJson = popJson('BUY', apiAllOrders, 'NEW');
     let openSellJson = popJson('SELL', apiAllOrders, 'NEW');

              //    let btcBal = parseFloat(jsonAccount.data["assets"][0]["baseAsset"]["free"]);
              //    let freeBal = parseFloat(jsonAccount.data["assets"][0]["quoteAsset"]["free"]);
             //     let tradePrice = 0.00;
                  //let btcrtn = await btcBalCheck(btcBal, minTradeValue, currencyPair, minTradePrice);
            //      console.log(" ooooooo freeBal = " + freeBal);
            //      console.log(" ooooooo btcBal = " + btcBal);



console.log("BUY Orders Filled --- " );
console.table(buyJson);
console.log("SELL Orders Filled --- " );
console.table(sellJson);
console.log("PROFIT Orders Filled --- total profit for table " + profittot );
console.table(profitJson);

console.log("Unbrought BUY Orders --- " );
console.table(openBuyJson);
console.log("Unsold SELL Orders --- " );
console.table(openSellJson);
console.log("Buy Orders with no Sell Orders--- " );
console.table(unfilledBuyJson);
console.log("Buy Orders with no Filled Sell Orders--- " );
console.table(unfilledBuyJsonFilled);
//console.log("BUY Orders --- " + JSON.stringify(buyJson));
//console.log("SELL Orders --- " + JSON.stringify(sellJson));
//{"symbol":"BTCUSDT","orderId":15761117236,"clientOrderId":"103018","price":"15792.84","origQty":"0.00075","executedQty":"0.00075","cummulativeQuoteQty":"11.84463","status":"FILLED","timeInForce":"GTC","type":"LIMIT","side":"BUY","stopPrice":"0","icebergQty":"0","time":1669082832507,"updateTime":1669082902513,"isWorking":true,"isIsolated":true}


process.exit();

}

function popUnfilledJsonFilled(buyJson, allJson) {
//	console.log("unmat buy orders == " + JSON.stringify(allJson));
        let unfilledJson=[]; let k=0;
	for (let j=0; j<buyJson.length;j++) {
           let clientorderid = buyJson[j]["clientorderid"];
	   if (isNumber(clientorderid)) {
//		   console.log("buy id - " + clientorderid); 
	       	let sellClientOrderId = clientorderid+1;
//		   console.log("****** sell id - " + sellClientOrderId); 
		if (sellIdExistsFilled(sellClientOrderId, allJson)) {
              //      console.log("  x10 unmatched buy orders == found in json " + sellClientOrderId); 
		} else {
		//	console.log(" x10 unmatched buy orders not found in json " + sellClientOrderId);
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

function one1() {

	       /*if (allJson[j]["status"]=='NEW') {
                     console.log("--------- matched d ---") ;
                     console.log("--------- id ---" + id);
                     console.log("--------- json client  ---" + JSON.stringify(allJson[j]));
		     return true;
                } else {
                     console.log("status not mtached --" + allJson[j]["clientOrderId"]);
		}*/
}

function sellIdExistsFilled(id, allJson) {
    for (let j=0;j<allJson.length;j++) {
        if (isNumber(allJson[j]["clientOrderId"])) {
        //    console.log("id == " + id);
	//    console.log("client order id == " + allJson[j]["clientOrderId"]);
//	    console.log("status == " + allJson[j]["status"]);
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
//		console.log("id == " + id);
//		console.log("client order id == " + allJson[j]["clientOrderId"]);
            if (id == parseInt(allJson[j]["clientOrderId"])) return true;
	}
    }
    return false;
}
function popJson(orderType, apiAllOrders, statusType) {

     let k1=0; let allFilledOrders =[];
     for (let j=0;j<apiAllOrders.data.length;j++) {
        if ((apiAllOrders.data[j]["status"] ==statusType ) && (apiAllOrders.data[j]["side"]==orderType)) {
              let rec  =  { "clientorderid" :parseInt(apiAllOrders.data[j]["clientOrderId"]),
                "price": parseFloat(apiAllOrders.data[j]["price"]),
                "side": apiAllOrders.data[j]["side"].toString(),
                 "time":new Date(parseInt(apiAllOrders.data[j]["time"])/1),
                 "updatetime":new Date(parseInt(apiAllOrders.data[j]["updateTime"])/1),
                 "origQty": parseFloat(apiAllOrders.data[j]["origQty"]),
                 "executedQty": parseFloat(apiAllOrders.data[j]["executedQty"]),
                "status": apiAllOrders.data[j]["status"].toString()};
//	console.log("*********** matched ---- ");
//		console.log(JSON.stringify(rec));
//			console.log("status type == "+ statusType);
//			console.log("order type == "+ orderType);
//
		//console.log("api ordes  == "+ JSON.stringify(apiAllOrders.data[j]));
		allFilledOrders[k1]= rec;
	k1++;
        }
     }
	return allFilledOrders;
}

function calcProfit(buyJson, sellJson) {
    let k=0; let profitJson = [];
    for (let j=0;j<buyJson.length;j++) {
        if (isNumber(buyJson[j]["clientorderid"])) {
            let buyVal = buyJson[j]["executedQty"]*buyJson[j]["price"];
	    let sellVal = getSellVal(buyJson[j]["clientorderid"]+1, sellJson);
	    if (sellVal == 0) {
	    } else {
        	let profit = sellVal - buyVal;
		let percent = (profit/buyVal)*100;   
         	let json = { "clientorderid": buyJson[j]["clientorderid"], "profit": profit,
			"percent": percent, "date": buyJson[j]["updatetime"]}
		profitJson[k]=json;
		    k++;
	    }
	}

    }
    return profitJson;

}

function getSellVal(id,sellJson) {

    for (let j=0;j<sellJson.length;j++) {
        if (isNumber(sellJson[j]["clientorderid"])) {
            if (id == sellJson[j]["clientorderid"]) {
                let sellVal = sellJson[j]["executedQty"]*sellJson[j]["price"];
                return sellVal;
	    }
	}
    }
    return 0;
}


function isNumber(val) {
    return !isNaN(val);
        //&& parseFloat(Number(val)) === val && !isNaN(parseInt(val, 10));
}


