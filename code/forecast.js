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
var previd = 0;
var id2 = 0;
main();

//> h=x.split(' ');
//[ 'Thu', 'Nov', '24', '2022', '04:53:13' ]
//> 
//const calcPeriodDB = async (previd) => {
async function calcForecastDB() {
// this.periodStatsDB
	//
      //  let n = 10; // period of historical recs

	if (previd == id2) { 
	} 
	else {
	        previd = id2;
                console.log("id 2 if = " + id2); 
		await sqlmod.getStatsRangeById(id2);
		let json = sqlmod.getStatsRangeData();
		// json = [{"id":53311,"lasttimemin":"27835717","avgminprice":"17000.4972131148","avgmaxprice":"17006.2786885246","avgrange":"5.7814754098","avgperiod":60,"statsid":20681,"minm":null,"minb":null,"maxb":null,"maxm":null,"rangem":null,"rangeb":null}]
                   console.log("json  = " + JSON.stringify(json));
                while (!json[0]["rangeb"]) {
		    await sqlmod.getStatsRangeById(id2);
		     json = sqlmod.getStatsRangeData();
                     console.log("json while = " + JSON.stringify(json));
		} 

	}
	    await sqlmod.getStatsRangeLastId();
	    id2 = sqlmod.getStatsRangeId();
   // let jsonRange = sqlmod.getPeriodStatsDB();
   // console.log("json " + JSON.stringify(jsonRange));
}


function isNumber(val) {
    return !isNaN(val);
        //&& parseFloat(Number(val)) === val && !isNaN(parseInt(val, 10));
}



async function main() {
let recs = true;
	await sqlmod.getStatsRangeLastId();

	let id = sqlmod.getStatsRangeId();
console.log(" id x = "+ id);
    //    await sqlmod.getLastStatsRange();
////	let initialid = sqlmod.getLastIdStatsPriceDB();
while (recs) {
//	console.log("loop = id 2 " + id2);
//	console.log("loop prev id= " + previd);
	await  calcForecastDB();
}

process.exit();

}
// x="Thu Nov 24 2022 04:53:13"
//'Thu Nov 24 2022 04:53:13'


