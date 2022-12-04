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
		await insertLinearReg();
	}
   // let jsonRange = sqlmod.getPeriodStatsDB();
   // console.log("json " + JSON.stringify(jsonRange));
}
function getStatsPeriodRec(jsonStatsPeriodRec, statsvar) {

//      let tperiod = 60;
//        let nrecs = 60;
        //  [{"lasttimemin":"27834353","avgminprice":"16959.4811475410","avgmaxprice":"16964.9219672131","avgrange":"5.4408196721","avgperiod":60},{"lasttimemin":"27834352","avgminprice":"16958.8150819672","avgmaxprice":"16964.3439344262","avgrange":"5.5288524590","avgperiod":60},{"lasttimemin":"27834351","avgminprice"
        let statsMinArray = [];
        let initialMins = parseInt(jsonStatsPeriodRec[0]["lasttimemin"]);
        let initialPrice = parseFloat(jsonStatsPeriodRec[0][statsvar]);
        jsonStatsPeriodRec.map(m=>{
        //       statsMinArray.push([parseInt(m["lasttimemin"])-
         //              initialMins, parseFloat(m[statsvar])-initialPrice]);
               statsMinArray.push([parseInt(m["lasttimemin"]), parseFloat(m[statsvar])]);
        })
      //  console.log("hhhh " + statsMinArray);
        let linearStats = statsPkg.linearRegression(statsMinArray);
     //   console.log("hhhh = "+ JSON.stringify(linearStats));
        return linearStats;
}

async function insertLinearReg() {
          const createJson = (jsonRec) => {
//              console.log("json rec " + JSON.stringify(jsonRec));
              return {min: getStatsPeriodRec(jsonRec, "avgminprice"),
               max: getStatsPeriodRec(jsonRec, "avgmaxprice"),
               range: getStatsPeriodRec(jsonRec, "avgrange")};

        }

	let jsonStatsRec = [];
        await sqlmod.getLinearReg(60, 60);
        let jsonSPR = sqlmod.getStatsPeriodRec();
        let tMins = parseInt(jsonSPR[jsonSPR.length-1]["lasttimemin"]);

        jsonStatsRec.push(createJson( sqlmod.getStatsPeriodRec()));

        //       {min: getStatsPeriodRec(jsonRec, "avgminprice"),
          //     max: getStatsPeriodRec(jsonRec, "avgmaxprice"),
            //   range: getStatsPeriodRec(jsonRec, "avgrange")};

          await sqlmod.getLinearReg(30, 30);
        jsonStatsRec.push(createJson( sqlmod.getStatsPeriodRec()));

           await sqlmod.getLinearReg(10, 10);
        jsonStatsRec.push(createJson( sqlmod.getStatsPeriodRec()));

           await sqlmod.getLinearReg(5, 5);
        jsonStatsRec.push(createJson( sqlmod.getStatsPeriodRec()));
//        console.log("nnnnnnbbbb = "+ JSON.stringify(jsonStatsRec));
        // [{"min":{"m":0.09276483904922828,"b":-0.5264097464806015},"max":{"m":0.09434713194461344,"b":-0.3912321956843634},"range":{"m":0.001582292895473748,"b":0.13517755079185811}},{"min":{"m":0.06168014639956249,"b":-0.8404051335048749},"max":{"m":0.044907388136838464,"b":-0.7083184182885874},"range":{"m":-0.016772758262046723,"b":0.1320867152163439}},{"min":{"m":-0.379234159785979,"b":1.1682809917269465},"max":{"m":-0.24891460055082323,"b":1.019024793349143},"range":{"m":0.13031955922666666,"b":-0.1492561983400002}},{"min":{"m":-1.912000000000262,"b":0.03766666666051588},"max":{"m":-1.5878333333199408,"b":-0.06900000000023265},"range":{"m":0.3241666666799998,"b":-0.10666666665999991}}]
 const createStatsDB = async (period, index, tMins) => { sqlmod.updateLinearReg(period, tMins,
                parseFloat(jsonStatsRec[index]["min"]["m"]),
                parseFloat(jsonStatsRec[index]["min"]["b"]),

                parseFloat(jsonStatsRec[index]["max"]["m"]),
                parseFloat(jsonStatsRec[index]["max"]["b"]),
                parseFloat(jsonStatsRec[index]["range"]["m"]),
                parseFloat(jsonStatsRec[index]["range"]["b"])
             )
             await sqlmod.exSQL();
       }
        await createStatsDB(60, 0, tMins);
        await createStatsDB(30, 1, tMins);
        await createStatsDB(10, 2, tMins);
        await createStatsDB(5, 3, tMins);


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


