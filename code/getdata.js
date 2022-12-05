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
var timeAllowed = parseInt(15) * parseInt(60); 
var devLimit = parseFloat(1); // limit of changed allowed on deviation from the period avg - eg 60 mins
var summarySellJson = [];
var summaryBuyJson = [];
const takeLimit = 5000; // open sale orders - limit liabilities 
var riskFactor = parseFloat(2); // defines the risk on the range default is 1, raise this number to decrease risk
const openOrderLimit = 5;
var fs = require('fs');
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
var totOrderLimit = 4;
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

async function writeFile(filename, datastr) {

	await fs.writeFile(filename, datastr, function (err) {

        if (err) return console.log(err);
		console.log("done "+ filename);
	})
}

async function main() {

//,{"id":58725,"lasttimemin":"27837062","avgminprice":"17300.2500000000","avgmaxprice":"17306.7854545455","avgrange":"6.5354545455","avgperiod":10,"statsid":22050,"minm":"-0.4309363732","minb":"12013301.8684386520","maxb":"11026297.0867080990","maxm":"-0.3954796424","rangem":"0.0354458048","rangeb":"-986700.6343218888"},{"id":58721,"lasttimemin":"27837061","avgminprice":"17300.2063636364","avgmaxprice":"17306.5727272727","avgrange":"6.3663636364","avgperiod":10,"statsid":22049,"minm":"-0.5582107843","minb":"15556246.8526686730","maxb":"13519538.2141732180","maxm":"-0.4850451900","rangem":"0.0731729035","rangeb":"-2036912.1041527705"}]
let minArr = [];
let maxArr = [];
let rangeArr = [];

        await sqlmod.getLinearRegDataDB(10, 60);
	let json = sqlmod.getLinearRegTrend();
//	console.log(" json == "+ JSON.stringify(json));
 let minStr=""; let maxStr=""; let rangeStr="";
	json.map(m=>  {

    let t = parseInt(m["lasttimemin"]);
    let minp = parseFloat(m["avgminprice"]);
    let maxp = parseFloat(m["avgmaxprice"]);
    let rangep = parseFloat(m["avgrange"]);
    let minm = parseFloat(m["minm"]);
    let maxm = parseFloat(m["maxm"]);
    let rangem = parseFloat(m["rangem"]);
minArr.push([t, minp, minm]);
maxArr.push([t, maxp, maxm]);
rangeArr.push([t, rangep, rangem]);

	})

	minArr.reverse();
	maxArr.reverse();
	rangeArr.reverse();
minArr.map(m => {
	 minStr = minStr + m[0] +","+ m[1] + "," + m[2] + "\n";
});
maxArr.map(m => {
	 maxStr = maxStr + m[0] +","+ m[1] + "," + m[2] + "\n";
});
rangeArr.map(m => {
	 rangeStr = rangeStr + m[0] +","+ m[1] + "," + m[2] + "\n";
});
console.log(minStr);
	fs.writeFile('minstr.txt', minStr, function (err) {

        if (err) return console.log(err);
		console.log("done ");
	})
//await writeFile('minstr.txt', minStr);
//	process.exit();
}
