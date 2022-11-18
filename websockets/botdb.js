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
var lastPrevRec = 0;
main();


async function main() {



//***** only save the prices - analyse elsewhere 
ws.onmessage = async  (event) => {

   // get the streamed data	
   let obj = JSON.parse(event.data); // data stream of prices
   //  console.log(JSON.stringify(obj));

   // get the price 
   let price = parseFloat(obj.p).toFixed(2); // price
   console.log("price = " +price);

   // Calc the sec value for the candlestick

   let orgTime = parseInt(obj.E); // time - in millisecs
   let tradeTime = parseInt(obj.E/1000);
      console.log("trade time = " + tradeTime);

   let d = new Date(orgTime);
   //   console.log("local time in date - " + d);
   //let timeCheck = d.setUTCSeconds(orgTime);
   let numberSecs = (d.getTime() - d.getMilliseconds())/1000; // number of secs for that candlestick
   //var rsiCurrentPeriod=0;
   //   console.log("local time in secs - " + numberSecs);
//console.log("********************************");
//console.log("* insert recs   *********************");
//console.log("********************************");

   sqlmod.createPriceSQL(price, numberSecs);
   await sqlmod.exSQL();
// small table needed for efficiency reasons    
   sqlmod.createCurrentPriceSQL(price, numberSecs);
   await sqlmod.exSQL();

   let currMin = parseInt(numberSecs/60);
	       // logger.warn("min ===  ", currMin);
   let lastRec = (currMin -3)*60; // conv to ms, hold 15 mins data
  // console.log("%%%%%%%%% curreMin == " + currMin);
 //  console.log(" last rec == " + lastRec);
 //  console.log(" last prev rec == " + lastPrevRec);
   if (lastRec == lastPrevRec) {
       } else {
	    //   logger.error("delete ", lastRec);
	    //   logger.error("prev rec ", lastPrevRec);
//	   console.log("***** delete *********** ");
           lastPrevRec = lastRec;
	   sqlmod.deleteCurrentPriceSQL(lastRec);
           await sqlmod.exSQL();

        }
      
//console.log("********************************");
//console.log("* end insert recs   *********************");
//console.log("********************************");
   }

}



