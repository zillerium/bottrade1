class SQLMod {
  constructor( 
    )   
    {   
        this.sql = null;
        this.statsSQL = null;
        this.pool = null;
    }

     getSQL = () => { return this.sql }
     getStatsSQL = () => { return this.statsSQL }
     getPool = () => { return this.pool }
     setPool = (pool) => { this.pool = pool; }

     insertOrder = async () => {
         try {
             let pool = this.pool;		 
             let rtn = await  pool.query(this.sql);
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


}

export { SQLMod };
