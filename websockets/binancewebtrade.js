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
var runCycle=60;
var rsiPeriod=5;
var rsiCurrent=0;
var priceMoves=[]; // open and closes - json format
var RSIN=5; // period for RS
var numberPeriods=0; // number of candlesticks
var profitMargin = 0.005; // profit from the txn
var capital = 100; // capital available for the trade
var orderRefGlobal = 99999;
var sold = true;
var totOrders = 0;
var totOrderLimit = 20;
var btcQty = 0.0025;
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
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/trade');
//
/*{
  orderId: '15332223862',
  symbol: 'BTCUSDT',
  origClientOrderId: '422',
  clientOrderId: 'itEIHMvGHrjk9McY34OXFx',
  price: '16725.2',
  origQty: '0.0025',
  executedQty: '0',
  cummulativeQuoteQty: '0',
  status: 'CANCELED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  isIsolated: true
}
*/

var cancelSchema = new mongoose.Schema({
  orderId : { type: String, default: null},
  symbol : {type: String, default: null},
  origClientOrderId : {type: String, default: null},  
  clientOrderId : {type: String, default: null},
  price : {type: String, default: null},
  origQty : {type: String, default: null},
  executedQty : {type: String, default: null},
  cummulativeQuoteQty : {type: String, default: null},
  status : {type: String, default: null},
  timeInForce : {type: String, default: null},
  type : {type: String, default: null},
  side : {type: String, default: null},
  isIsolated : {type: Boolean, default: null}
});

/*
  symbol: 'BTCUSDT',
  orderId: 15332223130,
  clientOrderId: '421',
  transactTime: 1668060352219,
  price: '16728.89',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '41.8179',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  fills: [
    {
      price: '16727.16',
      qty: '0.0025',
      commission: '0',
      commissionAsset: 'BNB'
    }
  ],
  isIsolated: true
}
*/

var openOrderSchema = new mongoose.Schema({
  orderId : { type: Number, default: null},
  symbol : {type: String, default: null},
  clientOrderId : {type: String, default: null},
  transactTime : {type: Number, default: null},
  price : {type: String, default: null},
  origQty : {type: String, default: null},
  executedQty : {type: String, default: null},
  cummulativeQuoteQty : {type: String, default: null},
  status : {type: String, default: null},
  timeInForce : {type: String, default: null},
  type : {type: String, default: null},
  side : {type: String, default: null},
  isIsolated : {type: Boolean, default: null},
  fills: [
	  {
	      price: {type:String, default: null},
              qty: {type:String, default: null},
              commission: {type:String, default: null},
              commissionAsset: {type:String, default: null},
	  }
  ]
});


/*  symbol: 'BTCUSDT',
  orderId: 15332222142,
  clientOrderId: '420',
  price: '16729.81',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '41.825325',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'SELL',
  stopPrice: '0',
  icebergQty: '0',
  time: 1668060350580,
  updateTime: 1668060350580,
  isWorking: true,
  accountId: 33,
  isIsolated: true
}
*/

var queryOrderSchema = new mongoose.Schema({
  orderId : { type: Number, default: null},
  symbol : {type: String, default: null},
  clientOrderId : {type: String, default: null},
  price : {type: String, default: null},
  origQty : {type: String, default: null},
  executedQty : {type: String, default: null},
  cummulativeQuoteQty : {type: String, default: null},
  status : {type: String, default: null},
  timeInForce : {type: String, default: null},
  type : {type: String, default: null},
  side : {type: String, default: null},
  stopPrice : {type: String, default: null},
  icebergQty : {type: String, default: null},
  time : {type: Number, default: null},
  updateTime : {type: Number, default: null},
  isWorking : {type: Boolean, default: null},
  accountId : {type: Number, default: null},
  isIsolated : {type: Boolean, default: null},
});

var  cancelModel = mongoose.model("cancelModel", cancelSchema);
var  openOrderModel = mongoose.model("openOrderModel", openOrderSchema);
var  queryOrderModel = mongoose.model("queryOrderModel", queryOrderSchema);

pool.connect();
getId();
let u=1;
for (let i=0;i< 99999;i++) {
	u=u+1;
}
console.log("id " + orderRefGlobal);
console.log("secret " + apiSecret);


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
    //  buyP = 17200.00;
	   if (orderRefGlobal == 671) orderRefGlobal = 672;
	   if (sold) {
	       numTries = 0; //reset when considering new orders
	   console.log("order ref at invoke 111111111111111111111111111" + orderRefGlobal);
	   orderRefGlobal++; // take into account the sell order    
	   console.log("order ref at invoke 000000000000000000000000000" + orderRefGlobal);
	   sold=false;    
           newMarginOrder(buyP, sellP, btcQty, orderRefGlobal);
	   //getId();    
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

function cancelBuyOrder(orderId, orderRef, OrderPair, Pair, Type, Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                   stopPrice,
                   icebergQty,
                   timeRes,
                   updateTime,
                   isWorking,
                   accountId,
                   isIsolated

) {
console.log("ggggggggggggggggggggggggggggggggggg cancel buy order ggggggggggggg");
client.cancelMarginOrder(
  'BTCUSDT', // symbol
  {
    isIsolated: 'TRUE',
	  orderId: orderId
   // origClientOrderId: orderRef.toString()
  }
).then(response => {client.logger.log(response.data);
let sql = buildSQLInsertBuy(orderRef, OrderPair, Pair, Type, Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                   stopPrice,
                   icebergQty,
                   timeRes,
                   updateTime,
                   isWorking,
                   accountId,
                   isIsolated
	
);

            insertOrder(sql);
	    
})
  .catch(error => {client.logger.error(error); })


}

function newMarginOrder(buyPrice, sellPrice, btcQty, orderRef) {

    sold = false;
    let buyPriceStr = buyPrice.toString();
    let sellPriceStr = sellPrice.toString();
    let orderRefStr = orderRef.toString();
    console.log("price order reference global " + orderRefGlobal);
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
	addOpenOrder(response.data);
        getOrder(buyPrice, sellPrice, btcQty, orderRef, orderRef); // order ref = pair ref for order
     })
    .catch(error => client.logger.error(error))
}

function getSellOrder(sellPrice, btcQty, orderRef, OrderPair) {
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
      addQueryOrder(response.data);
      let orderId = response.data.orderId;
      let clientOrderId = response.data.orderId;
      let priceRes = response.data.price;
      let origQty = response.data.origQty;
      let executedQty = response.data.executedQty;
      let cummulativeQuoteQty = response.data.cummulativeQuoteQty;
      let statusRes = response.data.status;
      let timeInForce = response.data.timeInForce;
      let typeRes = response.data.type;
      let sideRes = response.data.side;
      let stopPrice = response.data.stopPrice;
      let icebergQty = response.data.icebergQty;
      let timeRes = response.data.time;
      let updateTime = response.data.updateTime;
      let isWorking = response.data.isWorking;
      let accountId = response.data.accountId;
      let isIsolated = response.data.isIsolated;
      if (numTries> 20) { // async needed later
	    Status = 'Open';
            let sql = buildSQLInsertBuy(sellOrderRef, OrderPair, Pair, Type, Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                   stopPrice,
                   icebergQty,
                   timeRes,
                   updateTime,
                   isWorking,
                   accountId,
                   isIsolated);
            insertOrder(sql);
	    //sold=true; // simulates a sale to allow a new buy order
            totOrders++;
	    numTries = 0;
	    console.log(" tot orders 999999999999999999999999 " + totOrders);
	    if (totOrders>totOrderLimit) sold=false; else sold=true;
	    return;  
	   //process.exit();
      } else {
	
        client.logger.log(response.data);
        console.log("exec qty "+response.data.executedQty); 
        if (response.data.executedQty == btcQty) {
            console.log("------- sold order now -------");
          //  let sql = buildSQLInsert(sellOrderRef, OrderPair, Pair, Type, Price, Qty, Status);
          //  insertOrder(sql)
            let sql = buildSQLInsertBuy(sellOrderRef, 
		    OrderPair, Pair, Type, 
		    Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                   stopPrice,
                   icebergQty,
                   timeRes,
                   updateTime,
                   isWorking,
                   accountId,
                   isIsolated
	    );
            insertOrder(sql) 
            totOrders++;
	    console.log(" tot orders 999999999999999999999999 " + totOrders);
	    if (totOrders>totOrderLimit) sold=false; else sold=true;
            numTries = 111;
        } else {
	    console.log("------- no match for sell order ------");
            getSellOrder(sellPrice, btcQty, orderRef, OrderPair);
            numTries++;
        } 
        return;
       }
     })
  .catch(error => client.logger.error(error))

}
function getOrder(buyPrice, sellPrice, btcQty, orderRef, OrderPair) {
    console.log("order reference global in get order  "+ orderRefGlobal);
    console.log("order reference  in get order  "+ orderRef);
	
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
	    addQueryOrder(response.data);

  /*symbol: 'BTCUSDT',
  orderId: 15302691247,
  clientOrderId: '393',
  price: '17180.29',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '42.947475',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  stopPrice: '0',
  icebergQty: '0',
  time: 1668012106653,
  updateTime: 1668012106653,
  isWorking: true,
  accountId: ,
  isIsolated: true
*/
      let orderId = response.data.orderId;
      let clientOrderId = response.data.orderId;
      let priceRes = response.data.price;
      let origQty = response.data.origQty;
      let executedQty = response.data.executedQty;
      let cummulativeQuoteQty = response.data.cummulativeQuoteQty;
      let statusRes = response.data.status;
      let timeInForce = response.data.timeInForce;
      let typeRes = response.data.type;
      let sideRes = response.data.side;
      let stopPrice = response.data.stopPrice;
      let icebergQty = response.data.icebergQty;
      let timeRes = response.data.time;
      let updateTime = response.data.updateTime;
      let isWorking = response.data.isWorking;
      let accountId = response.data.accountId;
      let isIsolated = response.data.isIsolated;


      if (numTries> 20) { // async needed later
//	    let orderId = response.data.orderId;
	    addCancelOrder(response.data);
	    Status = 'Cancelled';
	    console.log(" cancel orderid = " + orderId);
	    console.log(" cancel buy order = " + buyOrderRef);

	      cancelBuyOrder(orderId, buyOrderRef, OrderPair, Pair, Type, Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                   stopPrice,
                   icebergQty,
                   timeRes,
                   updateTime,
                   isWorking,
                   accountId,
                   isIsolated
	    ); 
	    numTries =0; // reset for next buy order
            totOrders++;
	    console.log(" tot orders 999999999999999999999999 " + totOrders);
	    if (totOrders>totOrderLimit) sold=false; else sold=true;
	    return;  
	   //process.exit();
      } else {
	
        client.logger.log(response.data);
        console.log("exec qty "+response.data.executedQty); 
        console.log("exec order id == "+response.data.orderId);
//	let orderId = response.data.orderId;
        if (response.data.executedQty == btcQty) {
            console.log("------- sell order now, buy was done -------");
            console.log("????????????? global order ref before ???????????? " + orderRefGlobal );
            console.log("????????????? local order ref ???????????? " + orderRef );
		orderRefGlobal++; // global var
            console.log("????????????? global order ref after ??????????? " + orderRefGlobal );
	    sellOrder(sellPrice, btcQty, orderRefGlobal, orderRef); // order ref for the buy is the ref for the order pair
	    //insert buy order - do after sell to save time
            let sql = buildSQLInsertBuy(buyOrderRef, 
		    OrderPair, Pair, Type, 
		    Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                   stopPrice,
                   icebergQty,
                   timeRes,
                   updateTime,
                   isWorking,
                   accountId,
                   isIsolated
	    );
            insertOrder(sql) 
            numTries = 111;
        } else {
	    console.log("------- no match for sell ------");
            getOrder(buyPrice, sellPrice, btcQty, orderRef, OrderPair);
            numTries++;
        } 
        return;
      }	      
     })
  .catch(error => client.logger.error(error))

}


function sellOrder(sellPrice, btcQty,  orderRefSell, OrderPair) {
console.log("kkkkkkkkkkkkk global ref ======" + orderRefGlobal);	
console.log("kkkkkkkkkkkkk local ref ======" + orderRefSell);	

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
	addOpenOrder(response.data);
	    numTries = 0;
	    getSellOrder(sellPrice, btcQty, orderRefSell, OrderPair);
            //totOrders++;
	    return})
    .catch(error => client.logger.error(error))
}


function buildSQLInsertBuy(OrderRef, OrderPair, Pair, Type, Price, Qty, Status,
                   orderId,
                   clientOrderId,
                   priceRes,
                   origQty,
                   executedQty,
                   cummulativeQuoteQty,
                   statusRes,
                   timeInForce,
                   typeRes,
                   sideRes,
                   stopPrice,
                   icebergQty,
                   timeRes,
                   updateTime,
                   isWorking,
                   accountId,
                   isIsolated
) {

  /*symbol: 'BTCUSDT',
  orderId: 15302691247,
  clientOrderId: '393',
  price: '17180.29',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '42.947475',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  stopPrice: '0',
  icebergQty: '0',
  time: 1668012106653,
  updateTime: 1668012106653,
  isWorking: true,
  accountId: ,
  isIsolated: true
  */
    var sql =
    "insert into trade (orderref, orderpair, pair, type, price, qty, txndate, status, " +
    "orderId, clientOrderId, priceRes, origQty, executedQty, cummulativeQuoteQty, " +
    " statusRes, timeInForce, typeRes, sideRes, stopPrice, icebergQty, timeRes, " +
    "updateTime, isWorking, accountId, isIsolated " +

    ") values (" +
    OrderRef + ", " + OrderPair + 
    ",'" +
    Pair + "','" + Type + "'," + Price + "," + Qty + "," + "NOW()" + ",'"+ Status + "'," +
    
                    + orderId + "," +
                  "'"+ clientOrderId + "'," +
                  "'" + priceRes +  "'," +
                  "'" + origQty  + "'," +
                   "'" + executedQty + "'," +
                   "'" + cummulativeQuoteQty + "'," +
                   "'" + statusRes + "'," +
                   "'" + timeInForce + "'," +
                   "'" + typeRes + "'," +
                   "'" + sideRes + "'," +
                   "'" + stopPrice + "'," +
                   "'" + icebergQty + "'," +
                   timeRes + "," +
                   updateTime + "," +
                   isWorking + "," +
                   accountId + "," +
                   isIsolated +
  /*symbol: 'BTCUSDT',
  orderId: 15302691247,
  clientOrderId: '393',
  price: '17180.29',
  origQty: '0.0025',
  executedQty: '0.0025',
  cummulativeQuoteQty: '42.947475',
  status: 'FILLED',
  timeInForce: 'GTC',
  type: 'LIMIT',
  side: 'BUY',
  stopPrice: '0',
  icebergQty: '0',
  time: 1668012106653,
  updateTime: 1668012106653,
  isWorking: true,
  accountId: ,
  isIsolated: true*/

    ")";
    console.log('sql ==== ' + sql);
    return sql;

}


function buildSQLInsert(OrderRef, OrderPair, Pair, Type, Price, Qty, Status) {

    var sql =
    "insert into trade (orderref, orderpair, pair, type, price, qty, txndate, status) values (" +
    OrderRef + ", " + OrderPair + 
    ",'" +
    Pair + "','" + Type + "'," + Price + "," + Qty + "," + "NOW()" + ",'"+ Status + "'" +
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
        console.log("test");
//sql = "select currval('trade_id_seq')";
sql = "select last_value from trade_id_seq";

//sql = "select * from trade";
try {
        let res=pool.query(sql)
        .then((data) => {console.log(" order ref " + JSON.stringify(data));
	orderRefGlobal = parseInt(data["rows"][0]["last_value"]);
	console.log("order ref == "+ orderRefGlobal);
	 //orderRef++;
	return data})

} catch (err) {
        console.log(err);
        return 0;
}

}
//var  cancelModel = mongoose.model("cancelModel", cancelSchema);
//166 var  openOrderModel = mongoose.model("openOrderModel", openOrderSchema);
//167 var  queryOrderModel = mongoose.model("queryOrderModel", queryOrderSchema);
//168 

function addOpenOrder(jsonOpenResponse) {
  var openOrderRec = new openOrderModel( jsonOpenResponse);
    openOrderRec.save(function(err, doc){
        if(err) throw err;
         console.log("open order db done" + jsonOpenResponse);
      });
}
function addCancelOrder(jsonCancelResponse) {
  var cancelRec = new cancelModel( jsonCancelResponse);
    cancelRec.save(function(err, doc){
        if(err) throw err;
         console.log("cancel order db done" + jsonCancelResponse);
      });
}
function addQueryOrder(jsonQueryResponse) {
  var queryRec = new queryOrderModel( jsonQueryResponse);
    queryRec.save(function(err, doc){
        if(err) throw err;
         console.log("query order db done" + jsonQueryResponse);
      });
}
//ws.on('message', function incoming(data) {
//    console.log(data);
//})
