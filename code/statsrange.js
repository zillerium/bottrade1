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
import {SQLMod}  from './sqlmod.js';
const Pool = require("pg").Pool;
//const {Client} = require("pg");
var safeLimit = 10; // difference between buys and sells to stop a runaway bot buying
const sqlmod = new SQLMod();
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

//> h=x.split(' ');
//[ 'Thu', 'Nov', '24', '2022', '04:53:13' ]
//> 
//const calcPeriodDB = async (previd) => {
async function calcPeriodDB(previd) {
// this.periodStatsDB
	//
      //  let n = 10; // period of historical recs
        await sqlmod.getLastIdStats();
	let id2 = sqlmod.getLastIdStatsPriceDB();
	if (previd == id2) { 
	} 
	else {
	    previd = id2;
		await insertAvgs(id2, 5);
		await insertAvgs(id2, 10);
		await insertAvgs(id2, 30);
	await 	insertAvgs(id2, 60);
	}
   // let jsonRange = sqlmod.getPeriodStatsDB();
   // console.log("json " + JSON.stringify(jsonRange));
}

async function insertAvgs(id2, period) {

   	    await sqlmod.existsStatsRange(id2, period);
    	    let existsId = sqlmod.getStatsRangeExists();
   	    if (!existsId) {
                 let id1 = id2 - period; // period // insertPeriodStatsDB
                 await sqlmod.insertPeriodStatsDB(id1, id2);
  	    }
}


function isNumber(val) {
    return !isNaN(val);
        //&& parseFloat(Number(val)) === val && !isNaN(parseInt(val, 10));
}



async function main() {
let recs = true;
	let initialid = sqlmod.getLastIdStatsPriceDB();
while (recs) {
	await  calcPeriodDB(initialid);
}

process.exit();

}
// x="Thu Nov 24 2022 04:53:13"
//'Thu Nov 24 2022 04:53:13'


