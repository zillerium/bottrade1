// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);
var statsPkg =require('simple-statistics')

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
const Pool = require("pg").Pool;
//const {Client} = require("pg");
var safeLimit = 10; // difference between buys and sells to stop a runaway bot buying
const dbmod = new DBMod();
const sqlmod = new SQLMod();
const statsmod = new StatsMod();
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
 let timep = 30; // no. of peaks
 	await sqlmod.getStatsPeaksSQL(timep, 0, 1); // threshold for a peak and sum of actual price rise
 let jsonPks = 	sqlmod.getStatsPeaks();

//{"sr1timemin":"27844611","sr1peak":-1,"sr1minprice":"17154.3100000000","sr1maxprice":"17156.5200000000","sr1avgprice":"17155.0902889246","sr2peak":1,"sr2timemin":"27844610","sr2avgprice":"17155.3542234332","sr2minprice":"17154.7100000000","sr2maxprice":"17156.7600000000"},{"sr1timemin":"27844607","sr1peak":-1,"sr1minprice":"17155.3800000000","sr1maxprice":"17156.8400000000","sr1avgpri
        let lenInd = jsonPks.length - 1;
	let jsonLinPks = [];
	let sumc0 = parseFloat(jsonPks[lenInd]["sr2sumc"]);
	let time0 = parseInt(jsonPks[lenInd]["sr2timemin"]);
	let price0 = parseFloat(jsonPks[lenInd]["sr2maxprice"]);
	jsonPks.map(m=>{
                           let sumc = parseFloat(m["sr2sumc"])-sumc0;
                           let price = parseFloat(m["sr2maxprice"])-price0;
                           let timem = parseInt(m["sr2timemin"]) - time0;
		jsonLinPks.push([timem,price]);
	});

//	let linStatsRev = jsonLinPks.reverse();
	
        let linearStats = statsPkg.linearRegression(jsonLinPks);
        console.log("hhhh = "+ JSON.stringify(jsonPks));
        console.log("price array = "+ JSON.stringify(jsonLinPks));
  //      console.log("price rev array = "+ JSON.stringify(linStatsRev));
        console.log("hhhh = "+ JSON.stringify(linearStats));
	let m = parseFloat(linearStats["m"]);
	let b = parseFloat(linearStats["b"]);
        let newprice = 50;
        let newtime =	(newprice- b)/m;
        console.log(" new time == " + newtime);
	let nprice = statsPkg.linearRegressionLine(linearStats)(100); // this = min time but this is measured from the series of peaks
	// if there aree 15 peaks - see timep - then the last peak defines the end of the line, so we predict based on the t in this
        console.log("nprice == "+ nprice);
// hhhh = {"m":0.0005085248871631026,"b":5.2240409948634525}

//console.log("json == "+JSON.stringify(jsonPks));
process.exit();

}

