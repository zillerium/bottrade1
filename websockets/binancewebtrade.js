const WebSocket = require('ws');
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
var prevSecs = 0; // second value for streamed txn - streamed in millisecs
var minPrice = 0.00; // min price in a candlestick
var maxPrice = 0.00; // max price in a candlestick
var k=0; // number of candlesticks processed
var numberTxns=0; // number txns in a candlestick
var openPrice=0.00; // open price on a candlestick
var closePrice=0.00; // close price on a candlestick
var prevClosePrice=0.00; // prev close price on a candlestick
var prices = []; // prices from stream
var runCycle=16;
var rsiPeriod=5;
var rsiCurrent=0;
var priceMoves=[]; // open and closes - json format
var RSIN=5; // period for RS
var numberPeriods=0; // number of candlesticks
var profitMargin = 0.005; // profit from the txn
var capital = 100; // capital available for the trade
var orderRef = 99999;
var sold = true;
var btcQty = 0.0007;
require('dotenv').config();
const { Spot } = require('@binance/connector')
const apiSecret = process.env.API_SECRET;
const apiKey = process.env.API_KEY;
//const Spot = require('./binance-connector-node/src/spot')
const Pool = require("pg").Pool;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "crypto",
  password: "password",
  port: 5432,
});

pool.connect();
getId();

console.log("secret " + apiSecret);

//process.exit();

const client = new Spot(apiKey, apiSecret)
console.log(client);
var numTries=0;


ws.onmessage = (event) => {

// get the streamed data	
   let obj = JSON.parse(event.data); // data stream of prices
 //  console.log(JSON.stringify(obj));

// get the price 
   let price = parseFloat(obj.p).toFixed(2); // price
//   console.log("price = " +price);

// Calc the sec value for the candlestick

   let orgTime = parseInt(obj.E); // time - in millisecs
   let tradeTime = parseInt(obj.E/1000);
//   console.log("trade time = " + tradeTime);

   let d = new Date(orgTime);
//   console.log("local time in date - " + d);
   //let timeCheck = d.setUTCSeconds(orgTime);
   let numberSecs = (d.getTime() - d.getMilliseconds())/1000; // number of secs for that candlestick
//   console.log("local time in secs - " + numberSecs);

   if (prevSecs == 0) {
       // first time
       openPrice = parseFloat(price); // first price for candlestick
       closePrice = parseFloat(price); // init close price for candlestick
       prevPrice = parseFloat(price); // init prev close price for candlestick
       prevSecs = numberSecs; // sec value for candlestick
       minPrice = parseFloat(price); // initialize to defaults
       maxPrice = parseFloat(price);
       numberTxns=1; // initialize to 1	   
       k++;
       rsiCurrentPeriod=1; // start of rsi period
   }
       // data streams in millisecs - only take sec blocks	   
   if (numberSecs > prevSecs) {
	   // new candletick
       let priceUDdef = { "up": 0.00, "down": 0.00};
 
       let priceUD = priceUpDown(closePrice, prevClosePrice); // [up, down] prices
       if (priceMoves.length > RSIN) priceMoves.splice(0, 1); // remove first entry for that RS period
       if (k>1)
          priceMoves.push(priceUD);
       else 
	  priceMoves.push(priceUDdef);

       console.log("min price = " + minPrice);
       console.log("max price = " + maxPrice);
       let totPrice=parseFloat(minPrice)+parseFloat(maxPrice);
       console.log("tot price = " + totPrice);
       let avgPrice = totPrice/2;
       let varPrice=maxPrice-avgPrice;
       console.log("avg price = " + avgPrice);
       let priceRatio = 0;
       if (maxPrice > 0) { 	   
           priceRatio = (maxPrice-avgPrice)/maxPrice;
       
       }
       let rsi = 0.00;	   
       if (priceMoves.length > RSIN) {
           let avgP = SAMoves(priceMoves);
           console.log("price moves data ===== array = " + JSON.stringify(priceMoves));
	   console.log("avg prices rsi " + JSON.stringify(avgP));
	   let rs = calcRS(avgP["upAvg"], avgP["downAvg"]);
	   console.log("rs value = " + rs);
	   rsi = calcRSI(rs);
	   console.log("rsi value = " + rsi);
       }
       let tvr = numberTxns/varPrice; // ratio => more txns more variation
	   // max":20708.57,"avg":20707.585,"var":0.9850000000005821
       let buyP = parseFloat(maxPrice - 2*varPrice).toFixed(2); // var taken from the average, so *2
       let sellPx = parseFloat(profitMargin + capital)*parseFloat(buyP/capital)
       let sellP = parseFloat(sellPx).toFixed(2);
       let pricevar = {"open":openPrice, "close": closePrice, "txns": numberTxns, 
	       "min":minPrice, "max":maxPrice, "avg":avgPrice, "var":varPrice, 
	       "ratio": priceRatio, "rsi": rsi, "tvr": tvr, "buy": buyP, "sell": sellP
               };
       console.log("price data ===== array = " + JSON.stringify(pricevar));
       //let orderRef = 1;
       console.log("start wait ....");
       if (sold) {
	   orderRef=orderRef+2; // take into account the sell order    
	   sold=false;    
           newMarginOrder(buyP, sellP, btcQty, orderRef);
	   getId();    
       }
      // setTimeout(function() { console.log("waiting ...........");
     //  }, 10000);
       console.log("end wait ....");
       //process.exit();
       if (minPrice > 0) {
           prices.push(pricevar);

       }
       console.log("==================================== new time in secs ===================================");
       prevSecs = numberSecs; // init current sec value
       prevClosePrice = closePrice; // save prev close price
       minPrice = parseFloat(price); // init min price
       minPrice = parseFloat(price); // init min price
       maxPrice = parseFloat(price); // init max price
       openPrice = parseFloat(price); //reset for the new candletsick
       closePrice=parseFloat(price);  // reset for the new candlestick
       numberTxns=1;  // initialize number of txns	   
       k++;
   } else {
       numberTxns++;	   
       closePrice=parseFloat(price);	   
       if (price < minPrice) minPrice =parseFloat(price);
       if (price > maxPrice) maxPrice = parseFloat(price);


   }
   
   if (k>runCycle) {
      // let pricevar = {"min":minPrice, "max":maxPrice};
     //  prices.push(pricevar);
       console.log("price data ===== array = " + prices);
      let priceUp=0;
      let priceDown=0;
      let priceUpTot=0;
      let priceDownTot=0;
      let priceChange=0;
      for (let i=0;i < prices.length; i++) {
	  //  {"open":20867.08,"close":20866.87,"txns":50,"min":20866.16,"max":20867.1,"avg":20866.629999999997,"var":0.47000000000116415,"ratio":0.00002252349392110855}
          console.log("price data " + i + " " + JSON.stringify(prices[i]));
      }
      
      process.exit();
   }
   //console.log("min price = " + minPrice);
   //console.log("max price = " + maxPrice);

}


function priceUpDown(priceCloseT, priceCloseT_1) {
    let priceUp=0;
    let priceDown=0;
    priceChange = priceCloseT - priceCloseT_1;
    if (priceChange == 0) {
        priceUp=0;
        priceDown=0;
    } else {
        if (priceChange > 0) {
            priceUp=priceChange;
            priceDown=0;
        } else {
            priceUp=0; 
            priceDown=Math.abs(priceChange);	  
        }
    }
    let priceUD = { "up": priceUp, "down": priceDown};
    return priceUD;
}

function SAMoves(udMoves) {

    let sumUp=0;
    let sumDown=0;
    for (i=0; i<udMoves.length;i++) {
        let upP = udMoves[i]["up"];
        let downP = udMoves[i]["down"];
	sumUp += upP;
	sumDown += downP;
    }
  //  upMoves.forEach(p => {sumUp += p;});
  //  downMoves.forEach(p => {sumDown += p;});
    let avgUp = sumUp/udMoves.length;
    let avgDown = sumDown/udMoves.length;
    let jsonAvg = {"upAvg": avgUp, "downAvg": avgDown};
    return jsonAvg; 	
}

function calcRS(avgUp, avgDown) {
    return avgUp/avgDown;
}

function calcRSI(RS) {
    let RSIval = 100 - 100/(1+RS);
    return RSIval;
}

function newMarginOrder1(buyPrice, sellPrice, btcQty, orderRef) {
      sold=false;
      console.log("****************************** first new order ***********************");	
      setTimeout(function() { sold=true;console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& waiting ...........");
       }, 5000);
      console.log("****************************** second new order ***********************");	
}

function newMarginOrder(buyPrice, sellPrice, btcQty, orderRef) {

    sold = false;
    let buyPriceStr = buyPrice.toString();
    let sellPriceStr = sellPrice.toString();
    let orderRefStr = orderRef.toString();
    console.log("price str buy " + buyPriceStr);
    console.log("price str sell "+ sellPriceStr);
 
    //process.exit()
    console.log("++++++++++++++++++++++++ margin order ++++++++++++++++++++++++++++++");	
    client.newMarginOrder(
      'BTCUSDT', // symbol
      'BUY',
      'LIMIT',
    {
        quantity: btcQty,
        isIsolated: 'TRUE',
        price: buyPrice.toString(),
        //price: '20000',
        newClientOrderId: orderRef.toString(),
        newOrderRespType: 'FULL',
        timeInForce: 'GTC'
    }
    ).then(response => {
        client.logger.log(response.data); 
        getOrder(buyPrice, sellPrice, btcQty, orderRef)
     })
    .catch(error => client.logger.error(error))
}

function getSellOrder(sellPrice, btcQty, orderRef) {
    console.log("selling price == "+ sellPrice);
    let sellOrderRef = orderRef;
    let Pair = 'BTCUSDT';
    let Type = 'SELL';
    let Price = sellPrice;
    let Qty = btcQty;
    let Status = 'Closed'; // buy order
    client.marginOrder(
        'BTCUSDT', // symbol
        {
            isIsolated: 'TRUE',
            origClientOrderId: orderRef.toString(),
        }
    ).then(response => {
      if (numTries> 10) { // async needed later
	    Status = 'Open';
            buildSQLInsert(sellOrderRef, Pair, Type, Price, Qty, Status);
            insertOrder(sql);
	    return;  
	   //process.exit();
      }
	
        client.logger.log(response.data);
        console.log("exec qty "+response.data.executedQty); 
        if (response.data.executedQty == btcQty) {
            console.log("------- sold order now -------");
           // sellOrder(sellPrice, btcQty, orderRef+1);
	    //insert buy order - do after sell to save time
            buildSQLInsert(sellOrderRef, Pair, Type, Price, Qty, Status);
            insertOrder(sql) 
            numTries = 11;
        } else {
	    console.log("------- no match for sell order ------");
            getSellOrder(sellPrice, btcQty, orderRef);
            numTries++;
        } 
        return;
     })
  .catch(error => client.logger.error(error))

}
function getOrder(buyPrice, sellPrice, btcQty, orderRef) {
    console.log("selling price == "+ sellPrice);
    let buyOrderRef = orderRef;
    let Pair = 'BTCUSDT';
    let Type = 'BUY';
    let Price = buyPrice;
    let Qty = btcQty;
    let Status = 'Closed'; // buy order
    client.marginOrder(
        'BTCUSDT', // symbol
        {
            isIsolated: 'TRUE',
            origClientOrderId: orderRef.toString(),
        }
    ).then(response => {
      if (numTries> 10) { // async needed later
	    Status = 'Open';
            buildSQLInsert(buyOrderRef, Pair, Type, Price, Qty, Status);
            insertOrder(sql);
	    return;  
	   //process.exit();
      }
	
        client.logger.log(response.data);
        console.log("exec qty "+response.data.executedQty); 
        if (response.data.executedQty == btcQty) {
            console.log("------- sell order now -------");
            sellOrder(sellPrice, btcQty, orderRef+1);
	    //insert buy order - do after sell to save time
            buildSQLInsert(buyOrderRef, Pair, Type, Price, Qty, Status);
            insertOrder(sql) 
            numTries = 11;
        } else {
	    console.log("------- no match for sell ------");
            getOrder(buyPrice, sellPrice, btcQty, orderRef);
            numTries++;
        } 
        return;
     })
  .catch(error => client.logger.error(error))

}


function sellOrder(sellPrice, btcQty,  orderRefSell) {
    let buyOrderRef = orderRefSell;
    let Pair = 'BTCUSDT';
    let Type = 'SELL';
    let Price = sellPrice;
    let Qty = btcQty;
    let Status = 'Open'; // sell order
	
    let sellPriceStr = sellPrice.toString();
    client.newMarginOrder(
      'BTCUSDT', // symbol
      'SELL',
      'LIMIT',
    {
        quantity: btcQty,
        isIsolated: 'TRUE',
        price: sellPrice.toString(),
        newClientOrderId: orderRefSell.toString(),
        newOrderRespType: 'FULL',
        timeInForce: 'GTC'
    }
    ).then(response => {client.logger.log(response.data);
	    getSellOrder(sellPrice, btcQty, orderRef);
            sold=false; // move global flag to getSellOrder when async is implemented
	    return})
    .catch(error => client.logger.error(error))
}

function buildSQLInsert(OrderRef, Pair, Type, Price, Qty, Status) {

    var sql =
    "insert into crypto (orderref, pair, type, price, qty, txndate, status) values (" +
    OrderRef +
    ",'" +
    Pair + "','" + Type + "'," + Price + "," + Qty + "," + NOW() + ",'"+ Status + "'" +
    ")";
    console.log('sql ==== ' + sql);
    return sql;

}

function insertOrder(sql) {
// need to add async await later into this db

/*crypto=# CREATE TABLE TRADE(
   ID SERIAL PRIMARY KEY,
   ORDERREF INTEGER,
   PAIR VARCHAR(8),
   TYPE CHAR(4),
   PRICE MONEY,
   QTY NUMERIC(5,10),
   TXNDATE TIMESTAMP,
   STATUS VARCHAR(6)
);
*/

  console.log("insert db");
  //  var sql = "select user_name from account where user_name = '" + userName +"' ";
  var res;
  try {
    pool.query(sql);
  //  pool.end;
   // return res.rows;
  } catch (err) {
    console.log(err);
  }
}

function getId() {
sql = "select currval('trade_id_seq')";
try {
	let res=pool.query(sql);
	orderRef = res;
	return res;
} catch (err) {
	console.log(err);
	return 0;
}

}


//ws.on('message', function incoming(data) {
//    console.log(data);
//})
