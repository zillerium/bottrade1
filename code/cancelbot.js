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

async function main() {

     let currencyPair = 'BTCUSDT';
 //    let jsonAccount = await bmod.getAccountDetails(currencyPair);
 //    console.log(JSON.stringify(jsonAccount.data));
     let apiAllOrders = await bmod.getAllOrders('TRUE');
     //client.logger.log(apiAllOrders.data);

     let buyJson = popJson('BUY', apiAllOrders, 'NEW');
let timeAllowed = 10 * 60; // 10 mins in secs
console.log("buy json == " + JSON.stringify(buyJson));
    for (var key in buyJson) {
	    let timeSecsDiff = buyJson[key]["timeSecsDiff"];
            let clientorderid = buyJson[key]["clientorderid"];
	    console.log(" diff = " + timeSecsDiff);
	    console.log(" timeallowed = " + timeAllowed);
	    console.log(" client order id = " + clientorderid);
	    if (timeSecsDiff > timeAllowed) {
		    console.log("client order id cancel = "+ clientorderid);
    	        let respcancel = await bmod.cancelClientOrder(clientorderid, 'TRUE');
                  console.log(client.logger.log(respcancel.data))

	    }
        //console.log("x10 -- " + key + " " + JSON.stringify(profitJson[key]["profit"]));
     }

//console.log("buy json 2 == " + JSON.stringify(apiAllOrders.data));

process.exit();

}


function popJson(orderType, apiAllOrders, statusType) {
     let nowSecs = (Date.now()/1000);
     let k1=0; let allFilledOrders =[];
     for (let j=0;j<apiAllOrders.data.length;j++) {
        if ((apiAllOrders.data[j]["status"] ==statusType ) && (apiAllOrders.data[j]["side"]==orderType)) {
		let updateSecsDiff = nowSecs - (parseInt(apiAllOrders.data[j]["updateTime"])/1000)
		let timeSecsDiff = nowSecs - (parseInt(apiAllOrders.data[j]["time"])/1000)
              let rec  =  { "clientorderid" :parseInt(apiAllOrders.data[j]["clientOrderId"]),
                "price": parseFloat(apiAllOrders.data[j]["price"]),
                "side": apiAllOrders.data[j]["side"].toString(),
                 "time":new Date(parseInt(apiAllOrders.data[j]["time"])/1),
                 "updatetime":new Date(parseInt(apiAllOrders.data[j]["updateTime"])/1),
                 "updatetimesecs":parseInt(apiAllOrders.data[j]["updateTime"])/1,
                 "updateSecsDiff":updateSecsDiff,
                 "timeSecsDiff":timeSecsDiff,
                 "origQty": parseFloat(apiAllOrders.data[j]["origQty"]),
                 "executedQty": parseFloat(apiAllOrders.data[j]["executedQty"]),
                "status": apiAllOrders.data[j]["status"].toString()};
//{"clientorderid":187918205460,"price":16521.68,"side":"BUY","time":"2022-11-25T19:35:20.982Z","updatetime":"2022-11-25T19:43:54.400Z","updatetimesecs":1669405434400,"origQty":0.00075,"executedQty":0.00075,"status":"FILLED"}
		////      console.log("*********** matched ---- ");
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




function isNumber(val) {
    return !isNaN(val);
        //&& parseFloat(Number(val)) === val && !isNaN(parseInt(val, 10));
}


