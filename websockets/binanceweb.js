const WebSocket = require('ws');
const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
var prevSecs = 0;
var minPrice = 0.00;
var maxPrice = 0.00;
var k=0;
var prices = [];
ws.onmessage = (event) => {
   let obj = JSON.parse(event.data);
   console.log(JSON.stringify(obj));
   let price = parseFloat(obj.p).toFixed(2);
   console.log("price = " +price);

   let orgTime = parseInt(obj.E);
   let tradeTime = parseInt(obj.E/1000);
   console.log("trade time = " + tradeTime);
   let d = new Date(orgTime);
   console.log("local time in date - " + d);
   //let timeCheck = d.setUTCSeconds(orgTime);
   let numberSecs = (d.getTime() - d.getMilliseconds())/1000;
   console.log("local time in secs - " + numberSecs);
   if (numberSecs > prevSecs) {
       console.log("min price = " + minPrice);
       console.log("max price = " + maxPrice);
       let totPrice=parseFloat(minPrice)+parseFloat(maxPrice);
       console.log("tot price = " + totPrice);
       let avgPrice = totPrice/2;
       let varPrice=maxPrice-avgPrice;
       console.log("avg price = " + avgPrice);
       let pricevar = {"min":minPrice, "max":maxPrice, "avg":avgPrice, "var":varPrice};
       console.log("price data ===== array = " + prices);
       if (minPrice > 0) {
           prices.push(pricevar);

       }
       console.log("==================================== new time in secs ===================================");
       prevSecs = numberSecs;
       minPrice = parseFloat(price);
       maxPrice = parseFloat(price);
       k++;
   } else {
       if (price < minPrice) minPrice =parseFloat(price);
       if (price > maxPrice) maxPrice = parseFloat(price);


   }
   if (k>10) {
      // let pricevar = {"min":minPrice, "max":maxPrice};
     //  prices.push(pricevar);
       console.log("price data ===== array = " + prices);
      for (let i=0;i < prices.length; i++) {
          console.log("price data " + i + " " + JSON.stringify(prices[i]));
      }

      process.exit();
   }
   //console.log("min price = " + minPrice);
   //console.log("max price = " + maxPrice);

}
//ws.on('message', function incoming(data) {
//    console.log(data);
//})
