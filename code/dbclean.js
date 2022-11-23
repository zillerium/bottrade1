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


pool.connect();
var lastPrevRec = 0;

   var d1 = new Date();
   //   console.log("local time in date - " + d);
   //let timeCheck = d.setUTCSeconds(orgTime);
   var initTime = (d1.getTime() - d1.getMilliseconds())/1000; // number of secs for that candlestick
   var lastMin = parseInt(initTime/60);
   var keepMin = 1440; // stop the price table getting too large, delete all recs, later move to sharding and retain historical recs

// ******************** clean up db
// delete price recs to stop db getting large, later convert to sharding

var numberToKeep = 1000000;
main();


async function main() {

// read first id
	// read last id
	// calc number of recs
	// calc id which will be last (current - number of recs to keep
	// delete recs
	// test size of db
	// run on bot delay for hourly running
   await sqlmod.selectPriceDB(1, 'desc');
   let	 priceRecs = sqlmod.getPriceDb();
   let   timeprice = parseInt(priceRecs[0]["timeprice"]);
   let   price = parseFloat(priceRecs[0]["price"]);
   let   id = parseFloat(priceRecs[0]["id"]);

   await sqlmod.selectPriceDB(1, 'asc');

    let	 priceRecs_m = sqlmod.getPriceDb();
    let  timeprice_m = parseInt(priceRecs_m[0]["timeprice"]);
    let  price_m = parseFloat(priceRecs_m[0]["price"]);
    let  id_m = parseFloat(priceRecs_m[0]["id"]);
    let  numberRecs = id - id_m; 
    let finalId = id - numberToKeep;



   sqlmod.deletePriceSQLId(finalId);
   await sqlmod.exSQL();
   process.exit();

}



