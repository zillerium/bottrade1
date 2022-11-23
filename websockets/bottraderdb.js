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
	db: { type: 'file', filename: '/home/ubuntu/binance/db.log' },
    },
    categories: { default: { appenders: ['bot', 'out'], level: "info"},	
      price: { appenders: ['price', 'out'], level: "info"},
      db: { appenders: ['db', 'out'], level: "info"},
      },	
})


const logger = getLogger();
const loggerp = getLogger("db");
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
var btcQty = 0.003;
//var btcQty = 0.01;
require('dotenv').config();
import {SQLMod}  from './sqlmod.js';
import {StatsMod}  from './statsmod.js';
//const Spot = require('./binance-connector-node/src/spot')
const Pool = require("pg").Pool;
//const {Client} = require("pg");
var safeLimit = 10; // difference between buys and sells to stop a runaway bot buying
const sqlmod = new SQLMod();
const statsmod = new StatsMod();
var cycleCount = 0;
statsmod.setBuyQty(btcQty);
statsmod.setRSIN(RSIN);
statsmod.setPrevSecs(0); // initial Value
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




//************* read prices from the db in real-time
// this allows for additional analysi
//
// s
async function main() {


        let rtnsql = await sqlmod.getId();
    
	let rtnhist =  await sqlmod.setHistId();
	histId = sqlmod.getHistId();
        //console.log("histid == " + histId);

	let firstId = 3;
        let lastId = histId;
        //console.log("oooooooooo histId = " + histId);
        if (lastId > 2*batchSize) firstId = lastId - batchSize;
        // add async later
        let priceSQL = "select avg(avg_price), sum(chg_price) from tradehist where id between " + firstId + " and " + lastId;
        //console.log("price sql = " + priceSQL);
        sqlmod.setPriceSQL(priceSQL);
	let rtnsum =await sqlmod.sumPrices();
	var priceChgJson = sqlmod.getPriceJson();
        //console.log("+++++++++++++++++++++++++++++ price change "+ JSON.stringify(priceChgJson));
        statsmod.setChangePriceDB(parseFloat(priceChgJson["sum"]));
        statsmod.setAvgPriceDB(parseFloat(priceChgJson["avg"]));
        statsmod.setCycle(14);
	//console.log(" cyc = " + statsmod.getCycle());
	//console.log(" run cycle == " + runCycle);
//	while (statsmod.getCycle()<runCycle) {
  //          await processData();
//	}
	//	************************* start of processing
	await sqlmod.selectCurrMins();
	let dbRes = sqlmod.getDbRes();
	//console.log("=====sql ========== " + JSON.stringify(dbRes.rows));
        let prevMin = 0; let stats = []; let minInd = -1;
	for (var key in dbRes.rows) {
            //console.log(" key === "  + JSON.stringify(dbRes.rows[key]) + "");
            let itemInt = parseInt(dbRes.rows[key]["id"]);
            let itemPrice = parseFloat(dbRes.rows[key]["price"]);
            let itemTimePrice =parseInt(dbRes.rows[key]["timeprice"]);
	    let itemMin = parseInt(itemTimePrice/60);
		let itemQty = 0;
		if (isNumber(dbRes.rows[key]["qty"])) {
	    itemQty = parseFloat(dbRes.rows[key]["qty"]);

		}
         //  console.log("item price == " + itemPrice);
        //   console.log("item min == " + itemMin);
        //   console.log("prev min == " + prevMin);
        //   console.log(" json stats == " + JSON.stringify(stats));
	   if (itemMin == prevMin) {

    	       if (itemPrice < parseFloat(stats[minInd]["min"])) {
    	           stats[minInd]["min"] = itemPrice;
	       }
    	       if (itemPrice > parseFloat(stats[minInd]["max"])) {
    	           stats[minInd]["max"] = itemPrice;
	       }
	       stats[minInd]["sum"] += itemPrice;
	       stats[minInd]["itemNum"]++;
	       stats[minInd]["qty"]+=itemQty;

	       stats[minInd]["close"] = itemPrice;
//	       stats[minInd]["avg"] = (parseFloat(stats[minInd]["avg"])+ itemPrice)/2
            } else {
		    //console.log("************** item min =========== "+ itemMin + " open price " + itemPrice +  " item int " + itemInt);
    	       if (prevMin > 0) {
                       stats[minInd]["avg"] = parseFloat(stats[minInd]["sum"])/parseFloat(stats[minInd]["itemNum"])
	       }
               prevMin = itemMin;
	       minInd++;
	       let json = { min: itemPrice, max: itemPrice, open: itemPrice, avg: itemPrice, close: itemPrice,
		       timemin: itemMin, sum: itemPrice, itemNum: 1, qty: itemQty}
    	   //    stats[itemMin]["min"] = itemPrice;
    	   //    stats[itemMin]["max"] = itemPrice;
    	  //     stats[itemMin]["open"] = itemPrice;
	  //     stats[itemMin]["avg"] = itemPrice;
    	  //     stats[itemMin]["close"] = 0.00; //default
//	       }
	       stats.push(json);	    
           }
	}
        stats[minInd]["avg"] = parseFloat(stats[minInd]["sum"])/parseFloat(stats[minInd]["itemNum"])
	// key === {"id":3372361,"price":"16633.8200000000","timeprice":"1668853546"}

	//console.log(JSON.stringify(stats));
        minInd=0;
//	console.log(" mindind before = " + minInd);
//	console.log(" mindind len before = " + stats.length);
	for (var key in stats) {
		//console.log("minind = " + minInd );
		if (minInd < (stats.length -1)) {
                   statsmod.priceUpDown(stats[minInd]["close"], stats[minInd+1]["close"]);
                   minInd++;
                   statsmod.addPriceMove();
		}
	}
        let priceMoves = statsmod.getPriceMoves();
	//console.log(" price moves " + JSON.stringify(priceMoves));
        statsmod.calcRSI();
	//console.log("rsi ======= " + statsmod.getRSI() + " ");
	let prevSecs = 0;
	statsmod.setStats(stats);
        await processData();
}
function isNumber(val) {
    return !isNaN(val);
        //&& parseFloat(Number(val)) === val && !isNaN(parseInt(val, 10));
}



async function processData() {
     let firstTime = true;
	await sqlmod.getLastIdCurrPrice(); // set instance var
    let id  = sqlmod.getLastIdCurrPriceVar();
    //let currId = id;
    sqlmod.setCurrId(id);
    await sqlmod.selectPriceRec(id); // loop here to get a full min into stats and priceMoves
    // this updates the current stats when the db is mid-way in a min candlestick    
    while (statsmod.getCycle()<runCycle) {
	    console.log("main processing ");
        await processStats()
	    //loggerp.error("new stats rec ");
	//console.log(JSON.stringify(statsmod.getStats()));
	// calc rsi
	// store in a db - use just current rec except first time, then insert entire 15 recs - need to ensure full min (first one)
	    // is inserted - initial select from db will not guarantee that
        //   await priceProcess()	
	 let stats = statsmod.getStats();
	//    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
	//    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
	//    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
	//    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
	//    console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");
	//    console.log("stats ====> " + JSON.stringify(stats));
	    if (firstTime) {
	        firstTime = false;	    
// insert the entire json obj
                     //loggerp.error("stats len error === ", stats.length);    
	//	for (let i=stats.length-1;i<0;i--) {
		    let i = stats.length-1;
                     //loggerp.error("stats len error === ", stats.length, i);    
	       while (i>=0) {		
                     //loggerp.error("loop error === ", i);    
	             sqlmod.createStatsSQL(stats[i]["min"], stats[i]["max"], stats[i]["open"],stats[i]["avg"],stats[i]["close"],
		                                 stats[i]["timemin"], stats[i]["sum"], stats[i]["itemNum"], stats[i]["qty"]);
	             await sqlmod.exSQL();
		     i--;  
		}
	    } else {
                     //loggerp.error("loop error === 0 ");    
	         sqlmod.createStatsSQL(stats[0]["min"], stats[0]["max"], stats[0]["open"],stats[0]["avg"],stats[0]["close"],
		 stats[0]["timemin"], stats[0]["sum"], stats[0]["itemNum"], stats[0]["qty"]);
	             await sqlmod.exSQL();
	    }
        shuffleStats(sqlmod.getLastCurrPrice(), parseInt(sqlmod.getLastCurrPriceTime()/60), sqlmod.getLastCurrQty());
//	statsmod.incCycle(); inf loop
//{"min":16683.59,"max":16687.24,"open":16685.52,"avg":16685.498238172957,"close":16686.56,"timemin":27815465,"sum":20456420.840000045,"itemNum":1226},{
//     createStatsSQL = (minprice, maxprice, openprice, avgprice, closeprice, sumprice, timemin, itemnum) => {


    }
}

async function processStats() {
// update a new mins recs
       let itemPrice =sqlmod.getLastCurrPrice();
       let qty =sqlmod.getLastCurrQty();
	//console.log("*************** qty = "+ qty);
       let minInd = 0;
       let currentMin = parseInt(sqlmod.getLastCurrPriceTime()/60);
       var id = sqlmod.getCurrId();
       var currId = id;
       let stats = statsmod.getStats();	
	//console.log("stats == "+ JSON.stringify(stats));
	     //  loggerp.warn("orginal ====== current min "+ currentMin);
       while (stats[minInd]["timemin"] == currentMin) {
	 //      console.log(" minInd == " + minInd);
//	 console.log(" current min " + currentMin);
	       //loggerp.warn("current min "+ currentMin);
         if (itemPrice < parseFloat(stats[minInd]["min"])) {
           stats[minInd]["min"] = itemPrice;
         }
         if (itemPrice > parseFloat(stats[minInd]["max"])) {
           stats[minInd]["max"] = itemPrice;
         }
         stats[minInd]["sum"] += itemPrice;
         stats[minInd]["itemNum"]++;
         stats[minInd]["qty"]+=qty;

         stats[minInd]["close"] = itemPrice;
	 while (id == currId) {
          //  console.log("id ==== "+ id);
          //  console.log("curr id ==== "+ currId);
            await sqlmod.getLastIdCurrPrice(); // set instance var
            id  = sqlmod.getLastIdCurrPriceVar();
            sqlmod.setCurrId(id);
            await sqlmod.selectPriceRec(id); // loop here to get a full min into stats and priceMoves
	    //loggerp.error("id loop = " + id);
	 }
	 currId = id;
	 //loggerp.error("curr id = " + currId);
	 //loggerp.error("id = " + id);
         itemPrice =  sqlmod.getLastCurrPrice();
        qty =  sqlmod.getLastCurrQty();
	       
         let numberSecs =  sqlmod.getLastCurrPriceTime();
	 currentMin = parseInt(numberSecs/60); 
	 //loggerp.warn("number secs - ", numberSecs);      
       } 	
        stats[minInd]["avg"] = parseFloat(stats[minInd]["sum"])/parseFloat(stats[minInd]["itemNum"]);
// calc rsi
	//console.log(" stats == " + JSON.stringify(stats));
	statsmod.setStats(stats);
}

async function shuffleStats(itemPrice, itemMin, itemQty) {

    let stats = statsmod.getStats();	
      let i = stats.length;
        while (i>1) {
        stats[i] = stats[i-1];
        i--;
    }


//	for (let i=stats.length-1;i>1;i--) {
//        stats[i] = stats[i-1];
//    }

    stats[0]= { min: itemPrice, max: itemPrice, open: itemPrice, avg: itemPrice, close: itemPrice,
		       timemin: itemMin, sum: itemPrice, itemNum: 1,qty: itemQty}

    statsmod.setStats(stats);
}







