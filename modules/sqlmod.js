class SQLMod {
  constructor( 
    )   
    {  
	    this.lastIdCurrPrice=0;
        this.dbRes ={};
        this.lastVal = null;
        this.lastPriceRow= null;
this.tradeprofitDB;
	    this.avgQtyDB = 0; 
	    this.rangeAvgDB = 0;
        this.sql = null;
        this.histId = 0;
        this.currId = 0;
        this.clientidExists = false;
        this.statsDB = [];
        this.priceDB = [];
        this.priceOrderDB = [];
        this.priceOrderRec = [];
        this.statsSQL = null;
        this.pool = null;
        this.priceJson = {};
        this.priceSQL = null;
	this.lastCurrPrice =0.00; 
	this.lastCurrQty =0.00; 
        this.lastCurrPriceTime = 0;
    }

     getAvgQtyDb = () => { return this.avgQtyDB }
     getTradeProfitDb= () => { return this.tradeprofitDB }
     getRangeAvgDb= () => { return this.rangeAvgDB }
     getClientIdExists = () => { return this.clientidExists }
     getPriceOrderRec = () => { return this.priceOrderRec }
     getPriceOrderDb = () => { return this.priceOrderDB }
     getPriceDb = () => { return this.priceDB }
     getStatsDb = () => { return this.statsDB }
     getDbRes = () => { return this.dbRes }
     getLastIdCurrPriceVar = () => { return this.lastIdCurrPrice }
     getLastCurrQty = () => { return this.lastCurrQty }
     getLastCurrPrice = () => { return this.lastCurrPrice }
     getLastCurrPriceTime = () => { return this.lastCurrPriceTime }
     getHistId = () => { return this.histId }
     getCurrId = () => { return this.currId }
     setCurrId = (id) => { this.currId = id; }
     getSQL = () => { return this.sql }
     getPriceJson = () => { return this.priceJson }
     getPriceSQL = () => { return this.priceSQL }
     getStatsSQL = () => { return this.statsSQL }
     getPool = () => { return this.pool }
     setPool = (pool) => { this.pool = pool; }
     getLastPriceRow = () => { return this.lastPriceRow }
     getLastVal = () => { return this.lastVal }
     setLastVal = (lastVal) => { this.lastVal = lastVal; }
     setPriceSQL = (sql) => { this.priceSQL = sql; }

     insertOrder = async () => {
         try {
             let pool = this.pool;		 
             let rtn = await  pool.query(this.sql);
             //  pool.end;
            ////// return res.rows;
             } catch (err) { throw(err);
             }
     }

     exSQL = async () => {
	     
         try {
             let pool = this.pool;		 
             let rtn = await  pool.query(this.sql
	     );
             //  pool.end;
            // return res.rows;
             } catch (err) { throw(err);
             }
     }

     insertStats = async () => {
         try {
             let pool = this.pool;		 
             let rtn = await  pool.query(this.statsSQL);
             //  pool.end;
            // return res.rows;
             } catch (err) { throw(err);
             }
     }


     deletePriceSQLId = (id) => {

         this.sql =
             "delete from price where id < " + id ;
         console.log(this.sql); 
     }
     deletePriceSQL = (timeprice) => {

         this.sql =
             "delete from price where timeprice < " + timeprice ;
         console.log(this.sql); 
     }
     deleteCurrentPriceSQL = (timeprice) => {

         this.sql =
             "delete from currprice where timeprice < " + timeprice ;
    //     console.log(this.sql); 
     }
     createCurrentPriceSQL = (price, timeprice, qty) => {

         this.sql =
             "insert into currprice (txndate, price, timeprice, qty) " +
             " values " +
             "( NOW()," + price + "," + timeprice + ", " + qty +")";
//         console.log(this.sql); 
     }
//  id | txndate | minprice | maxprice | openprice | closeprice | avgprice | sumprice | timemin | itemnum 

//    id    |          txndate           | timeprice  |      price       
// id | txndate | clientorderid | price | qty | ordertype | exitprice 

     selectPriceOrderRec = async(clientorderid) => {
       let sql = "select id,clientorderid, price, qty, ordertype, exitprice" +
		     " from priceorder where clientorderid =    " + parseInt(clientorderid);

 console.log("sql==" + sql);
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.priceOrderRec = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }


     tradeProfitExists = async(id) => {
       let sql = "select clientorderid from tradeprofit where clientorderid = " + id;
       this.clientidExists = false;
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.clientidExists = true;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }


     selectRangeAvgDB = async(n) => {
      // let sql = "select id,clientorderid, price, qty, ordertype, exitprice from priceorder   " +
	//	     " by id desc limit " + n;
       this.calcRangeDiffSQL(n);
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(this.sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.rangeAvgDB = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
//crypto=# select * from tradeprofit order by id desc;

//  id |          txntime          | clientorderid |    profit    | percent 




     //calcAvgQtySQL = (n) => {

     selectAvgQtyDB = async(n) => {
          this.calcAvgQtySQL(n); 
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(this.sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.avgQtyDB = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }

     selectTradeProfitDB = async(n) => {
       let sql = "select id,clientorderid, profit, percent, txntime, txnsecs from tradeprofit order by txnsecs desc limit    " +n ;
		     " by id desc limit " + n;

//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.tradeprofitDB = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }	     
     selectPriceOrderDB = async(n) => {
       let sql = "select id,clientorderid, price, qty, ordertype, exitprice from priceorder   " +
		     " by id desc limit " + n;

//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.priceOrderDB = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }

     selectPriceDB = async(n, orderSeq) => {
       let sql = "select id, timeprice, price, qty  " +
		     " from price order by id " + orderSeq + " limit " + n;
	     // desc or asc

//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.priceDB = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     selectStatsDB = async(n) => {
       let sql = "select id, minprice, maxprice, openprice, closeprice, avgprice, " +
		     " sumprice, timemin, itemnum, qty from stats order by id desc limit " + n;

//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.statsDB = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     selectCurrMins = async(id) => {
       let sql = "select id, price, timeprice, qty from currprice order by timeprice desc, id desc";
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.dbRes = res;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }

     selectPriceRec = async(id) => {
       let sql = "select price, timeprice, qty from currprice where id = " + id;
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
           //   console.log(JSON.stringify(res));
              this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
              this.lastCurrQty = parseFloat(res.rows[0]["qty"]);
              this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }

     }
 //    sumPrices = async () => {
     getLastIdCurrPrice = async() => {
       let sql = "select last_value from currprice_id_seq";

       try {
	       //console.log("start qiuery");
	       let pool = this.pool;
           let res=await pool.query(sql);

	       //console.log("start qiuery 33");
	       //console.log(res);
           this.lastIdCurrPrice = parseInt(res.rows[0]["last_value"]);
          // console.log(" last -- " + this.lastPriceRow);
	  //    pool.end();
       } catch (err) { throw(err);
       }

     }

/*CREATE TABLE stats(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   minprice numeric(20,10),
   maxprice numeric(20,10),
   openprice numeric(20,10),
   closeprice numeric(20,10),
   avgprice numeric(20,10),
   sumprice numeric(20,10),
   timemin bigint,
   itemNum int
);
*/
// id | txndate | clientorderid | price | qty | ordertype | exitprice 
// id | txntime | clientid | percent | profit 
// select (diff) from (select minprice, maxprice, (maxprice-minprice) as diff, qty, txndate from stats order by id desc limit 3) as t;
i//crypto=# select avg(diff), min(minprice), max(maxprice), (max(maxprice) - min(minprice)) from (select minprice, maxprice, (maxprice-minprice) as diff, qty, txndate from stats order by id desc limit 60) as t;
//         avg         |       min        |       max        |    ?column?    
//---------------------+------------------+------------------+----------------
// 12.8806666666666667 | 16533.7800000000 | 16674.4100000000 | 140.6300000000
	//
	// crypto=# select avg(diff) as pd, min(minprice), max(maxprice), (max(maxprice) - min(minprice))  as der from (select minprice, maxprice, (maxprice-minprice) as diff, qty, txndate from stats order by id desc limit 60) as t;
  //       pd          |       min        |       max        |      der
//---------------------+------------------+------------------+----------------
// 13.8051666666666667 | 16533.7800000000 | 16707.6500000000 | 173.8700000000

//select ((der/min)*100) as per1, pd from (select avg(diff) as pd, min(minprice), max(maxprice), (max(maxprice) - min(minprice))  as der from (select minprice, maxprice, (maxprice-minprice) as diff, qty, txndate from stats order by id desc limit 180) as t) as t1;
//         per1          |         pd          
//------------------------+---------------------
// 1.72532203930240325500 | 15.8178333333333333
//select (pd/2) as p1, (der/20) as r1, ((der/min)*100) as per1, pd from (select avg(diff) as pd, min(minprice), max(maxprice), (max(maxprice) - min(minprice))  as der from (select minprice, maxprice, (maxprice-minprice) as diff, qty, txndate from stats order by id desc limit 180) as t) as t1;
 //        p1         |         r1          |          per1          |         pd          
//--------------------+---------------------+------------------------+---------------------
// 8.5761388888888889 | 14.9780000000000000 | 1.81409246324397714800 | 17.1522777777777778
//(1 row)


     calcRangeDiffSQL = (n) => {
	     // n- time in mins - 1 min slots on table
	     // p1 - diff avg for the min define the price moves on the min
	     // r1 - for the entire period - define the band of trade
         this.sql = "select (pd/2) as p1, (der/20) as r1, ((der/min)*100) " +
		     " as per1, pd from (select avg(diff) as pd, min(minprice), " +
		     " max(maxprice), (max(maxprice) - min(minprice))  as der " +
		     " from (select minprice, maxprice, (maxprice-minprice) as diff," +
		     " qty, txndate from stats order by id desc limit "+ n + ") as t) as t1;"

     }



     calcPercentAvgDiffSQL = (n) => {
         this.sql = "select ((der/min)*100) as per1, pd from (select avg(diff) " +
		     " as pd, min(minprice), max(maxprice), (max(maxprice) - min(minprice)) " +
		     " as der from (select minprice, maxprice, (maxprice-minprice) " +
		     " as diff, qty, txndate from stats order by id desc limit 180) as t) as t1 ";
     }

     calcAvgDiffSQL = (n) => {
         this.sql = "select avg(diff) from (select minprice, maxprice, (maxprice-minprice) "+
		     " as diff, qty, txndate from stats order by id desc limit "+ n +") as t ";
     }

     calcVelDiffSQL = (n) => {
         this.sql = "select avg(diff) as pd, min(minprice), max(maxprice), (max(maxprice) - min(minprice)) " +
		     " as der from (select minprice, maxprice, (maxprice-minprice) as diff, qty, txndate " +
		     " from stats order by id desc limit 60) as t ";

     }

//select avg(qty) from (select qty, id from stats order by id desc limit 60) as t;
//         avg         
//---------------------
// 46.8803835000000000
//(1 row)


     calcAvgQtySQL = (n) => {
         this.sql = "select avg(qty) from (select qty, id from stats order by id desc limit "+ n + ") as t";

     }

//  id | txndate | clientorderid | ordertime | orderprice | ordertype | orderstatus 

     insertOpenOrderSQL = (clientorderid, ordertime, orderprice, orderType, orderstatus) => {
         this.sql = "insert into openorders (txndate, clientorderid, ordertime, orderprice, orderType, orderstatus) " +
         "values ( ' NOW()'," + clientorderid + "," + ordertime + ","+ orderprice + ",'" + orderType + "','" + orderstatus + "')";
     }
//  id | txndate | toprange | botrange | buyprice | sellprice | clientid | ordertype | inrange 

     insertTradeProfitLogSQL = (toprange, botrange, buyprice, sellprice, clientorderid, orderType1, inrange) => {
         this.sql = "insert into tradelog (txndate, toprange, botrange, buyprice, sellprice, clientorderid, ordertype, inrange) " +
         "values ( ' NOW()'," + toprange + "," + botrange + ","+ buyprice + ", " + sellprice + "," + clientorderid + ",'"+orderType1 + "'," +inrange+")";
     }
     insertTradeProfitSQL = (txntime, clientorderid, percent, profit, txnsecs) => {
         this.sql = "insert into tradeprofit (txntime, clientorderid, percent, profit, txnsecs) " +
         "values ( '" + txntime + "'," + clientorderid + "," + percent + ","+ profit + ", " +txnsecs+")";
     }

     insertAPISQL = (apicall, statusapi) => {
	 let timeapi = Math.floor(Date.now()/1000);    
         this.sql = "insert into apicall (txndate, apicall, timeapi, statusapi) " +
         "values ( NOW(), '" + apicall + "'," + timeapi + ",'" + statusapi + "'"+ ")";
     }


     insertPriceOrderSQL = (clientorderid, price, qty, ordertype, exitprice) => {
         this.sql = "insert into priceorder (txndate, clientorderid, price, qty, ordertype, exitprice) " +
         "values ( NOW(), " + clientorderid + "," + price + "," + qty + ",'" + ordertype + "'," + exitprice+ ")";
     }
     createRSISQL = (timemin, rsi) => {
         this.sql = "insert into trends (txndate, timemin, rsi) values ( NOW(), " + timemin + "," + rsi + ")";
     }

     createStatsSQL = (minprice, maxprice, openprice, avgprice, closeprice, timemin, sumprice, itemnum, qty) => {

          this.sql =
              "insert into stats (txndate, minprice, maxprice, openprice, closeprice, avgprice, sumprice, timemin, itemnum, qty) " +
              " values " +
              "( NOW()," + minprice + "," + maxprice + "," + openprice + "," + closeprice + "," + avgprice + "," + 
		     sumprice + "," + timemin + "," + itemnum + ", " + qty +")";
          console.log(this.sql);
     }
 //    sumPrices = async () => {
     createPriceSQL = (price, timeprice, qty) => {

          this.sql =
              "insert into price (txndate, price, timeprice, qty) " +
              " values " +
              "( NOW()," + price + "," + timeprice + "," + qty + ")";
  //        console.log(this.sql)/;
     }

     createProfitSQL = (buyPrice, sellPrice, qty, profit) => {

          this.sql =
              "insert into profit (buyPrice, sellPrice, qty, profit, txnDate) " +
              " values " +
              "( " + buyPrice + "," + sellPrice + "," + qty + "," + profit + "," + "NOW()" + ")";

     }
     createSQL = (orderRef, OrderPair, Pair, Type, Price, Qty, Status, responseMargin) => {
        let orderId = responseMargin.data.orderId;
        let clientOrderId = responseMargin.data.orderId;
        let priceRes = responseMargin.data.price;
        let origQty = responseMargin.data.origQty;
        let executedQty = responseMargin.data.executedQty;
        let cummulativeQuoteQty = responseMargin.data.cummulativeQuoteQty;
        let statusRes = responseMargin.data.status;
        let timeInForce = responseMargin.data.timeInForce;
        let typeRes = responseMargin.data.type;
        let sideRes = responseMargin.data.side;
     // let stopPrice = response.data.stopPrice;
     // let icebergQty = response.data.icebergQty;
     // let timeRes = response.data.time;
     // let updateTime = response.data.updateTime;
     // let isWorking = response.data.isWorking;
     // let accountId = response.data.accountId;
        let isIsolated = responseMargin.data.isIsolated;
        this.setSQL(
		  orderRef, 
		  OrderPair, 
                  Pair, 
                  Type, 
		  Price, 
		  Qty, 
		  Status,
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
             //   stopPrice,
             //   icebergQty,
             //   timeRes,
             //   updateTime,
             //   isWorking,
             //   accountId,
                  isIsolated
                  );
     }
     setSQL = (OrderRef, OrderPair, Pair, Type, Price, Qty, Status,
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
                //   stopPrice,
               //    icebergQty,
               //    timeRes,
               //    updateTime,
               //    isWorking,
               //    accountId,
                   isIsolated
                   ) => {
      this.sql =
          "insert into trade (orderref, orderpair, pair, type, price, qty, txndate, status, " +
          "orderId, clientOrderId, priceRes, origQty, executedQty, cummulativeQuoteQty, " +
          " statusRes, timeInForce, typeRes, sideRes," +
                //stopPrice, icebergQty, timeRes, " +
   // "updateTime, isWorking, accountId,
                "isIsolated " +

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
              //     "'" + stopPrice + "'," +
               //    "'" + icebergQty + "'," +
              //     timeRes + "," +
             //      updateTime + "," +
            //       isWorking + "," +
            //       accountId + "," +
                   isIsolated +
            ")";

    }

    buildSQLStats = (avgPrice, timePrice, chgPrice, directionPrice, timeSecs) => {

    this.statsSQL =
    "insert into tradehist (avg_Price, time_Price, chg_Price, direction_Price, time_secs ) values (" +
        avgPrice + "," + timePrice + "," + chgPrice + ", " + directionPrice + ",'" + timeSecs + "')";


    }
    getId = async() => {
       let sql = "select last_value from trade_id_seq";

       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
           this.lastVal = parseInt(res.rows[0]["last_value"]);

       } catch (err) { throw(err);
       }

     }
     sumPrices = async () => {

         try {
            let pool = this.pool;
            let res=await pool.query(this.priceSQL);
            let sum= parseFloat(res.rows[0]["sum"]);
            let avg=parseFloat(res.rows[0]["avg"]);
            this.priceJson = {"sum": sum, "avg": avg};

         } catch (err) { throw(err);
         }
      }
     setHistId = async () => {
          let sql = "select last_value from tradehist_id_seq";
          try {
	      let pool = this.pool;
              let res=await pool.query(sql)
              this.histId = parseInt(res.rows[0]["last_value"]);
          } catch (err) { throw(err);
          }

        }



}

export { SQLMod };
