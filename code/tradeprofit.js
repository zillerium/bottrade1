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
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
main();

async function main() {

await getTradeProfitDB();

process.exit();

}
// x="Thu Nov 24 2022 04:53:13"
//'Thu Nov 24 2022 04:53:13'
//> h=x.split(' ');
//[ 'Thu', 'Nov', '24', '2022', '04:53:13' ]
//> 

async function getTradeProfitDB() {

//  28      getTradeProfitDb= () => { return this.tradeprofitDB }
await sqlmod.selectTradeProfitDB(100); // 100 recs
let json =  sqlmod.getTradeProfitDb();
	 let txnmins = 0;
	 let txnhours =0; 
	let txntime =0;
        let mth = 0;
	let day =0;
	let year =0;
	let tradetime =0;
	let hour =0;
	let min = 0;
	let sec = 0;
        let mthNum = 0;
	let jsonprofit = [];let hrprofit = 0.00; let hrjsonprofit = [];
//	console.log("jsn = "+JSON.stringify(json));
	// {"id":6,"clientorderid":"656668","profit":"0.0075000000","percent":"0.06","txntime":"Wed Nov 23 2022 13:35:49 "}
   let profit = 0.00;
	 let prevDay=0; let prevMth = 0; let prevYear = 0; let prevMin = -1; let prevHour = -1;
   for (let j=0;j<json.length;j++) {
	let d1 = new Date(parseInt(json[j]["txnsecs"]));
	  txnmins = d1.getMinutes();
	  txnhours = d1.getUTCHours();
	 txntime = (json[j]["txntime"]).toString().split(' ');
         mth = txntime[1];
	day = parseInt(txntime[2]);
	 year =parseInt(txntime[3]);
	 tradetime = txntime[4].split(':');
	 hour = tradetime[0];   
	 min = tradetime[1];   
	 sec = tradetime[2];   
         mthNum = months.indexOf(mth)+1;
            let txnprofit =parseFloat(json[j]["profit"]);
	if ((prevHour == txnhours) || (prevHour == -1)) {
            hrprofit +=txnprofit;
		prevHour = txnhours; // -1
	} else {
		
           let  hrjsonP = { "year": prevYear, "month": prevMth, "day": prevDay, "hour": prevHour,  "profit": hrprofit} 		
            hrprofit = txnprofit;
		hrjsonprofit.push(hrjsonP);		
            prevHour = txnhours;
            prevYear = year; prevMth=mth, prevDay=day;

	}
	if ((prevMin == txnmins) || (prevMin == -1)) {
            profit +=txnprofit;
		prevMin = txnmins;
		prevYear = year; prevMth=mth, prevDay=day;prevHour=hour;
	} else {
		
           let  jsonP = { "year": prevYear, "month": prevMth, "day": prevDay, "hour": prevHour, "min": prevMin, "profit": profit} 		
            profit = txnprofit;
		jsonprofit.push(jsonP);		
            prevMin = txnmins;
	}

    }
           let  hrjsonP = { "year": prevYear, "month": prevMth, "day": prevDay, "hour": prevHour,  "profit": hrprofit} 		
           let  jsonP = { "year": prevYear, "month": prevMth, "day": prevDay, "hour": prevHour, "min": prevMin, "profit": profit} 		
		jsonprofit.push(jsonP);		
		hrjsonprofit.push(hrjsonP);		

	console.table(jsonprofit);
	console.table(hrjsonprofit);
}


function isNumber(val) {
    return !isNaN(val);
        //&& parseFloat(Number(val)) === val && !isNaN(parseInt(val, 10));
}


