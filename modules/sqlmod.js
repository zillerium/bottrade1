class SQLMod {
  constructor( 
    )   
    {
	    this.statsPeaks=[];
	    this.currentStatsMins={};
	     this.lastMinRecSingle={};
	    this.StatsRangeData = {};
	    this.statsRangeId = 0;
	    this.LinearRegTrend = [];
		 this.statsPeriodRec= [];
		 this.avgMaxMinRec = [];
	    this.lastMinRec = {};
	    this.statsRangeExists = false;
	    this.lastIdStatsPrice=0;
	    this.pid=0;
	    this.lastIdCurrPrice=0;
        this.dbRes ={};
        this.lastVal = null;
        this.lastPriceRow= null;
this.tradeprofitDB;
	    this.avgQtyDB = 0; 
	    this.rangeAvgDB = 0;
        this.sql = null;
        this.periodStatsDB = {};
        this.histId = 0;
        this.currId = 0;
        this.profitByDate = 0.00;
        this.clientidExists = false;
        this.statsDB = [];
        this.priceDB = [];
        this.priceOrderDB = [];
        this.priceOrderRec = [];
        this.statsSQL = null;
        this.pool = null;
	    this.statsRecTime = 0;
        this.priceJson = {};
        this.priceSQL = null;
	this.lastCurrPrice =0.00; 
	this.lastCurrQty =0.00; 
        this.lastCurrPriceTime = 0;
	this.statsDirRec={};
    }
// sqlmod.getPeriodStatsDB
	// sqlmod.getLinearRegTrend
     //this.statsRangeId - sqlmod.getStatsDirRec
     getStatsPeaks= () => { return   this.statsPeaks}
     getStatsDirRec= () => { return   this.statsDirRec}
     getCurrentStatsMins= () => { return   this.currentStatsMins}
     getLastMinRecSingle= () => { return  this.lastMinRecSingle }
     getStatsRangeData= () => { return this.StatsRangeData }
     getStatsRangeId= () => { return this.statsRangeId }
     getLinearRegTrend= () => { return this.LinearRegTrend }
     getStatsPeriodRec= () => { return this.statsPeriodRec }
     getProfitByDate= () => { return this.profitByDate }
     getAvgMaxMinRec= () => { return this.avgMaxMinRec }
     getPid= () => { return this.pid }
     getStatsRecTime= () => { return this.statsRecTime }
     getLastMinAvg= () => { return this.lastMinRec }
     getStatsRangeExists= () => { return this.statsRangeExists }
     getLastIdStatsPriceDB = () => { return this.lastIdStatsPrice }
     getPeriodStatsDB = () => { return this.periodStatsDB }
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
		// console.log ("nnnnnnnnnnnnnnnnnnnnnnnn = " + JSON.stringify(rtn));
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
     createChannelSQL = (beforepeakprice, 
	     beforepeaktime, 
	     peakprice, 
	     peaktime, 
	     afterpeakprice, 
	     afterpeaktime 
) => {
//  id | beforepeakprice | beforepeaktime | peakprice | peaktime | afterpeakprice | aftepeaktime 

         this.sql =
             "insert into currprice (beforepeakprice, beforepeaktime, peakprice, peaktime, afterpeakprice, afterpeaktime) " +
             " values " +
             "( " +
		beforepeakprice + "," + 
		beforepeaktime + ", " + 
		peakprice + ", " + 
		peaktime + ", " + 
		afterpeakprice + "," + 
		afterpeaktime + " " + 
		")";
//         console.log(this.sql); 
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

//select sr1.timemin, sr1.peak, sr1.avgprice, sr2.peak, sr2.timemin, sr2.avgprice from stats sr1 inner join stats sr2 on sr2.timemin+1 = sr1.timemin and sr2.peak<0 and sr1.peak > 0 limit 10;
// timemin  | peak |     avgprice     | peak | timemin  |     avgprice     
//----------+------+------------------+------+----------+------------------
// 27844134 |    1 | 17155.1412468194 |   -3 | 27844133 | 17154.9768237705
// 27844138 |    1 | 17155.3069778870 |   -3 | 27844137 | 17152.8323076923
// 27844140 |    1 | 17155.4614071857 |   -1 | 27844139 | 17153.1876285240
// 27844144 |    1 | 17150.9740466926 |   -3 | 27844143 | 17150.5589870130
// 27844149 |    1 | 17150.9774912892 |   -2 | 27844148 | 17150.8949127907
// 27844156 |    1 | 17148.3033993399 |   -2 | 27844155 | 17147.8951737452
// 27844162 |    1 | 17143.3680294118 |   -5 | 27844161 | 17143.2608913044
// 27844166 |    1 | 17144.4829401408 |   -2 | 27844165 | 17144.4284663537
// 27844169 |    1 | 17143.2485347986 |   -2 | 27844168 | 17143.0580528846
// 27844178 |    1 | 17141.6847735192 |   -7 | 27844177 | 17141.6617910448
// ((sr2.peak>0 and sr1.peak < 0) or (sr2.peak<0 and sr1.peak>0))
     getStatsPeaksAndTroughsSQL = async(lim, pkValue, trValue) => {
//crypto=# select sum(peak), sum(pricec) from (select peak, pricec, avgprice, timemin, minprice, maxprice from stats order by id desc limit 15) as t;

           let sql = "select sr1.timemin as sr1timemin, " +
		     " sr1.peak as sr1peak, "+
		     " sr1.minprice as sr1minprice, " +
		     " sr1.maxprice as sr1maxprice, " +
		     " sr1.avgprice as sr1avgprice, " +
		     " sr2.peak as sr2peak, " +
		     " sr2.timemin as sr2timemin, " +
		     " sr2.avgprice as sr2avgprice, " +
		     " sr2.minprice as sr2minprice, " +
		     " sr2.maxprice as sr2maxprice, " +
		     " from stats sr1 " +
		     " inner join stats sr2 on sr2.timemin+1 = sr1.timemin "+
                     " ((sr2.peak> " + pkValue + " and sr1.peak < 0)  " +
		     " or (sr2.peak < " + trValue + " and sr1.peak>0)) " +
		     //" order by sr1.timemin desc " +
		     " order by sr2.id desc " +
		     " limit " + lim;

         console.log("sql==" + sql);
         //console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.statsPeaksTroughs = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     getStatsPeaksSQL = async(lim, pkValue) => {
//crypto=# select sum(peak), sum(pricec) from (select peak, pricec, avgprice, timemin, minprice, maxprice from stats order by id desc limit 15) as t;
// select sr2peak, sr2maxprice, sr2timemin from (select sr1.timemin as sr1timemin,  sr1.peak as sr1peak,  sr1.minprice as sr1minprice,  sr1.maxprice as sr1maxprice,  sr1.avgprice as sr1avgprice,  sr2.peak as sr2peak,  sr2.timemin as sr2timemin,  sr2.avgprice as sr2avgprice,  sr2.minprice as sr2minprice,  sr2.maxprice as sr2maxprice  from stats sr1  inner join stats sr2 on sr2.timemin+1 = sr1.timemin  and sr2.peak> 3 and sr1.peak < 0  order by sr2.id desc  limit 15) as t order by sr2timemin asc;

           let sql = "select sr2peak, sr2maxprice, sr2timemin from " +
		     " (select "+
		    // " sr1.timemin as sr1timemin, " +
		   //  " sr1.peak as sr1peak, "+
		  //   " sr1.minprice as sr1minprice, " +
		  //   " sr1.maxprice as sr1maxprice, " +
		  //   " sr1.avgprice as sr1avgprice, " +
		     " sr2.peak as sr2peak, " +
		     " sr2.timemin as sr2timemin, " +
		  //   " sr2.avgprice as sr2avgprice, " +
		  //   " sr2.minprice as sr2minprice, " +
		     " sr2.maxprice as sr2maxprice " +
		     " from stats sr1 " +
		     " inner join stats sr2 on sr2.timemin+1 = sr1.timemin "+
		     " and sr2.peak> " + pkValue +
	             " and sr1.peak < 0 " +
		     " order by sr2.id desc " +
		   //  " order by sr1.timemin asc " +
		     " limit " + lim + ") as t order by sr2timemin asc";

         console.log("sql==" + sql);
         //console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.statsPeaks = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     getStatsTroughsSQL = async(lim, trValue) => {
//crypto=# select sum(peak), sum(pricec) from (select peak, pricec, avgprice, timemin, minprice, maxprice from stats order by id desc limit 15) as t;

// trValue is defaulted as zero but large declines can have -1 (ie < -1)
           let sql = "select sr1.timemin as sr1timemin, " +
		     " sr1.peak as sr1peak, "+
		     " sr1.avgprice as sr1avgprice, " +
		     " sr1.minprice as sr1minprice, " +
		     " sr1.maxprice as sr1maxprice, " +
		     " sr2.peak as sr2peak, " +
		     " sr2.timemin as sr2timemin, " +
		     " sr2.avgprice as sr2avgprice, " +
		     " sr2.minprice as sr2minprice, " +
		     " sr2.maxprice as sr2maxprice, " +
		     " from stats sr1 " +
		     " inner join stats sr2 on sr2.timemin+1 = sr1.timemin "+
		     " and sr2.peak< " + trValue + 
	             " and sr1.peak > 0 " +
		    // " order by sr1.timemin desc " +
		     " order by sr2.id desc " +
		     " limit " + lim;
         console.log("sql==" + sql);
         //console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.statsTroughs = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     selectStatsDirection = async(lim) => {
//crypto=# select sum(peak), sum(pricec) from (select peak, pricec, avgprice, timemin, minprice, maxprice from stats order by id desc limit 15) as t;

       let sql = "select sum(peak) as peakc, sum(pricec) as pricev "+
		     " from (select peak, pricec, avgprice, timemin, minprice, " +
		     " maxprice from stats order by id desc limit "+ lim +" ) as t ";

         console.log("sql==" + sql);
         //console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.statsDirRec = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     selectPriceOrderRecByIdShort = async(id) => {
       let sql = "select id,clientorderid, price, qty, ordertype, exitprice" +
		     " from priceordershort where id =    " + parseInt(id);

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


     selectPriceOrderRecById = async(id) => {
       let sql = "select id,clientorderid, price, qty, ordertype, exitprice" +
		     " from priceorder where id =    " + parseInt(id);

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

// calcPeriodStats
     insertPeriodStatsDB = async(n1, n2) => {
      // let sql = "select id,clientorderid, price, qty, ordertype, exitprice from priceorder   " +
	//	     " by id desc limit " + n;
       this.insertPeriodStats(n1, n2);
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(this.sql)
//	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
//		 this.periodStatsDB = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
//	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
      existsStatsRange= async(id, avgperiod) => {
            let sql = "select statsid from statsrange where statsid = " +id + " and avgperiod = " + avgperiod;
            this.statsRangeExists=false;
	    try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.statsRangeExists =true;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }

//select sum(p) from (select (exitprice-price)*qty as p from priceorder where ordertype = 'BUY' and txndate >='2022-11-30' order by id desc limit 100) as t;
        //  
        //  
     getProfitByDateSQL = async (dateStr) => {
         let sql = "select sum(p) as sump from (select (exitprice-price)*qty as p from priceorder "+
                     " where ordertype = 'BUY' and txndate >='" + dateStr + "' " +
                     " order by id desc) as t";
 //console.log(sql);
            
	    try {
	       let pool = this.pool;
               let res=await pool.query(sql)
	       if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		    this.profitByDate =parseFloat(res.rows[0]["sump"]);
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	       }
           //pool.end();
             } catch (err) { throw(err);
             }

     }  


     selectCurrentStatsMins = async(timemin) => {
       let sql = "select minprice, maxprice, avgprice, timemin, peak, pricec from stats where timemin = "+ timemin;
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.currentStatsMins = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }

	//  id | lasttimemin |   avgminprice    |   avgmaxprice    |   avgrange    | avgperiod | statsid 

     selectTimeMinStatsDB = async(id) => {
       let sql = "select timemin from stats where id = "+ id;
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.statsRecTime = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }

     updateLinearReg = (period, timemin, minm, minb, maxm, maxb, rangem, rangeb) => {
	     
	     this.sql = "update statsrange  " +
		     " set minm =" + minm + "," + 
		     " maxm =" + maxm + "," + 
		     " rangem =" + rangem + "," + 
		     " minb =" + minb + "," + 
		     " maxb =" + maxb + "," + 
		     " rangeb =" + rangeb + 
		     " where lasttimemin=" + timemin + " and avgperiod= " + period; 

          //console.log(this.sql);
     }

	//  id   | lasttimemin |   avgminprice    |   avgmaxprice    |   avgrange   | avgperiod | statsid 
// select avgminprice, id as id1 from (select id, lasttimemin, avgminprice, avgmaxprice, avgrange, avgperiod from statsrange where avgperiod = 60 order by id desc limit 10) as t order by id1 asc;
     getLinearReg = async(timePeriod, numberRecs) => {
	     let sql = "select lasttimemin, avgminprice, avgmaxprice, avgrange, avgperiod, id as id1 from (select id, " +
		     " lasttimemin, avgminprice, avgmaxprice, avgrange, avgperiod " +
		     " from statsrange where avgperiod = " + timePeriod + " order by id desc " +
		     " limit "+ numberRecs + " ) as t order by id1 asc";
	     let sql1 = "select lasttimemin, avgminprice, avgmaxprice, avgrange, avgperiod " +
	     "  from statsrange where avgperiod = " + timePeriod + " order by id desc limit " + numberRecs;

	//	     " by id desc limit " + n;
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.statsPeriodRec = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     getStatsRangeById = async(id) => {
       let sql = "select id, lasttimemin, avgminprice, avgmaxprice, "+
		     " avgrange, avgperiod, statsid, minm, minb, maxb, maxm, rangem, rangeb " +
		     " from statsrange where id =  " + id;
	//	     " by id desc limit " + n;
console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.StatsRangeData = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     getLastStatsRange = async() => {
       let sql = "select id, lasttimemin, avgminprice, avgmaxprice, "+
		     " avgrange, avgperiod, statsid, minm, minb, maxb, maxm, rangem, rangeb " +
		     " from statsrange " +
		     " order by id desc limit 1";
	//	     " by id desc limit " + n;
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.StatsRangeData = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }

// select sr1.avgminprice, sr1.avgperiod, sr1.lasttimemin, sr1.minm - t.minm as diff, sr1.minm, t.minm from statsrange sr1 inner join (select sr.lasttimemin, minm, avgperiod from statsrange sr where sr.avgperiod = 10 order by sr.lasttimemin desc limit 20) as t on t.lasttimemin+1  = sr1.lasttimemin and t.avgperiod = sr1.avgperiod and sr1.avgperiod = 10;

// select sr1.avgminprice, sr1.avgperiod, sr1.lasttimemin, sr1.minm - t.minm as diff, sr1.minm as sr1min, t.minm as tmin from statsrange sr1 inner join (select sr.lasttimemin, minm, avgperiod from statsrange sr where sr.avgperiod = 10 order by sr.lasttimemin desc limit 20) as t on t.lasttimemin+1  = sr1.lasttimemin and t.avgperiod = sr1.avgperiod and sr1.avgperiod = 10;


     getDiffLinearRegDataDB = async(period, nrecs) => {
       let sql = "select id, lasttimemin, avgminprice, avgmaxprice, "+
		     " avgrange, avgperiod, statsid, minm, minb, maxb, maxm, rangem, rangeb " +
		     " from statsrange " +
		     " where avgperiod = " + period + " order by lasttimemin desc limit " + nrecs;
	//	     " by id desc limit " + n;
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.LinearRegTrend = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     getLinearRegDataDB = async(period, nrecs) => {
       let sql = "select id, lasttimemin, avgminprice, avgmaxprice, "+
		     " avgrange, avgperiod, statsid, mind, maxd, ranged, minm, minb, maxb, maxm, rangem, rangeb " +
		     " from statsrange " +
		     " where avgperiod = " + period + " order by lasttimemin desc limit " + nrecs;
	//	     " by id desc limit " + n;
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.LinearRegTrend = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     selectLastMinAvgDBByPeriod = async(timemin, period) => {
       let sql = "select lasttimemin, avgminprice, avgmaxprice, avgrange, avgperiod, statsid from statsrange "+
		     " where lasttimemin = " + timemin + " and avgperiod = "+ period;
	//	     " by id desc limit " + n;
console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.lastMinRecSingle = res.rows;
           //   this.lastCurrPrice = parseFloat(res.rows[0]["price"]);
           //   this.lastCurrPriceTime = parseInt(res.rows[0]["timeprice"]);
	   }
           //pool.end();
       } catch (err) { throw(err);
       }
     }
     selectLastMinAvgDB = async(timemin) => {
       let sql = "select lasttimemin, avgminprice, avgmaxprice, avgrange, avgperiod, statsid from statsrange "+
		     " where lasttimemin = " + timemin + " order by avgperiod asc";
	//	     " by id desc limit " + n;
//console.log(sql);
       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.lastMinRec = res.rows;
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


     getLastIdStats = async() => {
       let sql = "select last_value from stats_id_seq";

       try {
	       //console.log("start qiuery");
	       let pool = this.pool;
           let res=await pool.query(sql);

	       //console.log("start qiuery 33");
	       //console.log(res);
           this.lastIdStatsPrice = parseInt(res.rows[0]["last_value"]);
          // console.log(" last -- " + this.lastPriceRow);
	  //    pool.end();
       } catch (err) { throw(err);
       }

     }
/*
 * crypto=# select count(*) from stats where avgprice >  (select avg(avgprice) as avgc from (select avgprice, txndate from stats where mod(timemin,60)=0 order by id desc limit 24) as t);
 count
-------
  2848
(1 row)

crypto=# (select avg(avgprice) as avgc from (select avgprice, txndate from stats where mod(timemin,60)=0 order by id desc limit 24) as t);
        avgc
--------------------
 16554.614211447663
(1 row)
*/

/*(select avg(avgprice) as avgc, max(maxprice) as maxp, min(minprice) as minp from (select avgprice, txndate, minprice, maxprice from stats order by id desc limit 1440) as t);
        avgc        |       maxp       |       minp       
--------------------+------------------+------------------
 16556.965376671378 | 16701.4600000000 | 16436.7900000000
(1 row)
*/
	// sql queries

     getAvgMaxMin = async(period) => {
       let sql = "(select avg(avgprice) as avgc, max(maxprice) as maxp, "+
		     " min(minprice) as minp from (select avgprice, txndate, " +
		     " minprice, maxprice from stats order by id desc limit " + period + ") as t)";

       try {
	       //console.log("start qiuery");
	       let pool = this.pool;
           let res=await pool.query(sql);

	   if ((res) && (res.rowCount>0)) {
          //    console.log(JSON.stringify(res));
		 this.avgMaxMinRec = res.rows;
	       //console.log("start qiuery 33");
	   }
		   //console.log(res);
          // console.log(" last -- " + this.lastPriceRow);
	  //    pool.end();
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

//  id  |          txndate           |     minprice     |     maxprice     |    openprice     |    closeprice    |     avgprice     |       sumprice       | timemin  | itemnum |      qty       
//crypto=# select avg(maxprice), avg(minprice), avg(diff) from (select maxprice, minprice, (maxprice - minprice) as diff, id from stats order by id desc limit 60) as t;
 //       avg         |        avg         |        avg         
//--------------------+--------------------+--------------------
// 16543.555833333333 | 16535.184333333333 | 8.3715000000000000
// 7103 | 2022-11-25 01:57:00.328209 | 16532.0000000000 | 16540.2100000000 | 16539.1100000000 | 16532.5900000000 | 16535.2350314465 |  18403716.5899999740 | 27822356 |    1113 |  20.6858400000
//  id | timemin | avgminprice | avgmaxprice | avgspreadprice | avgperiod 
// insert into statsrange (lasttimemin, avgminprice, avgmaxprice, avgrange, avgperiod) select  max(timemin) as lasttimemin, avg(minprice) as avgminprice, avg(maxprice) as avgmaxprice,  avg(diff) as avgrange, 60 as avgperiod from (select maxprice, minprice,  (maxprice - minprice) as diff, id, timemin from stats where id  between 7100 and 7160 )  as t;

	// select statsrange.avgminprice, statsrange.avgperiod, forecast.forecastminprice-statsrange.avgminprice,statsrange.lasttimemin from forecast  inner join statsrange on forecast.lasttimemin =  statsrange.lasttimemin and forecast.avgperiod = statsrange.avgperiod and forecast.devminprice = 0 order by forecast.lasttimemin desc, forecast.avgperiod desc;
// update forecast set devminprice=t.forecastminprice-avgminprice, devmaxprice=t.forecastmaxprice-avgmaxprice,devrangeprice=t.forecastrangeprice-avgrange from ( select forecastminprice, forecastmaxprice, forecastrangeprice, avgminprice, avgmaxprice, avgrange from forecast  inner join statsrange on forecast.lasttimemin =  statsrange.lasttimemin and forecast.avgperiod = statsrange.avgperiod and forecast.devminprice = 0) as t;

	// update forecast set devminprice = t.mind from ((select f.avgperiod, f.lasttimemin, f.forecastminprice, statsrange.avgminprice, (f.forecastminprice-statsrange.avgminprice) as mind from forecast as f inner join statsrange on f.lasttimemin =  statsrange.lasttimemin and f.avgperiod = statsrange.avgperiod)) as t where t.lasttimemin = forecast.lasttimemin and t.avgperiod= forecast.avgperiod;

// select * from (select f.avgperiod, f.lasttimemin, f.forecastminprice, statsrange.avgminprice, (f.forecastminprice-statsrange.avgminprice) as mind from forecast as f inner join statsrange on f.lasttimemin =  statsrange.lasttimemin and f.avgperiod = statsrange.avgperiod and f.lasttimemin = 27836136) as t;
      updateForecastSQL = (lasttimemin) => {
         this.sql = "update forecast set " +
		      " devminprice = t.mind, " +
		      " devmaxprice = t.maxd, " +
		      " devrangeprice = t.ranged " +
		      " from " + 
		      " ((select f.avgperiod, f.lasttimemin, f.forecastminprice, statsrange.avgminprice, " +
		      " (f.forecastminprice-statsrange.avgminprice) as mind, " +
		      " (f.forecastmaxprice-statsrange.avgmaxprice) as maxd, " +
		      " (f.forecastrangeprice-statsrange.avgrange) as ranged " +
		      " from forecast as f inner join statsrange on " +
		      " f.lasttimemin =  statsrange.lasttimemin " + 
		      " and f.avgperiod = statsrange.avgperiod)) as t " +
		      " where t.lasttimemin = forecast.lasttimemin " +
		      " and t.avgperiod= forecast.avgperiod " +
		      " and forecast.lasttimemin=" + lasttimemin;
 //console.log("sql == " + this.sql);

      }
// pdate statsrange sru set mind = mindiff, maxd = maxdiff, ranged = rangediff from (select sr1.avgminprice, sr1.avgperiod, sr1.lasttimemin, sr2.minm - sr1.minm as mindiff, sr2.maxm - sr1.maxm as maxdiff, sr2.rangem - sr1.rangem as rangediff, sr1.minm as sr1min, sr2.minm as sr2min from statsrange sr1 inner join statsrange sr2 on sr2.lasttimemin-1 = sr1.lasttimemin and sr2.avgperiod = sr1.avgperiod and sr1.lasttimemin = 27837309)  as t where sru.lasttimemin = t.lasttimemin and sru.avgperiod = t.avgperiod;
// update statsrange sru set mind = mindiff, maxd = maxdiff, ranged = rangediff  from (select sr1.avgminprice, sr1.avgperiod, sr1.lasttimemin,   sr1.minm - sr2.minm as mindiff, sr1.maxm - sr2.maxm as maxdiff,  sr1.rangem - sr2.rangem as rangediff, sr1.minm as sr1min,  sr2.minm as sr2min from statsrange sr1 inner join  statsrange sr2 on sr2.lasttimemin+1 = sr1.lasttimemin  and sr2.avgperiod = sr1.avgperiod and sr1.lasttimemin = 27837356)  as t where sru.lasttimemin = t.lasttimemin and sru.avgperiod = t.avgperiod;

      updateDiffStatsRangeSQL = (lasttimemin) => {
         
 this.sql = "update statsrange sru set mind = mindiff, maxd = maxdiff, ranged = rangediff " +
		      " from (select sr1.avgminprice, sr1.avgperiod, sr1.lasttimemin,  " +
		      " sr1.minm - sr2.minm as mindiff, sr1.maxm - sr2.maxm as maxdiff, " +
		      " sr1.rangem - sr2.rangem as rangediff, sr1.minm as sr1min, " +
		      " sr2.minm as sr2min from statsrange sr1 inner join " +
		      " statsrange sr2 on sr2.lasttimemin+1 = sr1.lasttimemin " +
		      " and sr2.avgperiod = sr1.avgperiod and   sr1.lasttimemin = " + lasttimemin + ") " +
		      //" and sr2.avgperiod = sr1.avgperiod ) " +
		      " as t where sru.lasttimemin = t.lasttimemin and sru.avgperiod = t.avgperiod  ";
		      //" and t.lasttimemin = " + lasttimemin;

 //console.log("sql == " + this.sql);
/*	this.sql = "update forecast set " +
		      " devminprice = t.mind, " +
		      " devmaxprice = t.maxd, " +
		      " devrangeprice = t.ranged " +
		      " from " + 
		      " ((select f.avgperiod, f.lasttimemin, f.forecastminprice, statsrange.avgminprice, " +
		      " (f.forecastminprice-statsrange.avgminprice) as mind, " +
		      " (f.forecastmaxprice-statsrange.avgmaxprice) as maxd, " +
		      " (f.forecastrangeprice-statsrange.avgrange) as ranged " +
		      " from forecast as f inner join statsrange on " +
		      " f.lasttimemin =  statsrange.lasttimemin " + 
		      " and f.avgperiod = statsrange.avgperiod)) as t " +
		      " where t.lasttimemin = forecast.lasttimemin " +
		      " and t.avgperiod= forecast.avgperiod " +
		      " and forecast.lasttimemin=" + lasttimemin;
 console.log("sql == " + this.sql);
*/
      }

//update statsrange sru set mind = diff from (select sr1.avgminprice, sr1.avgperiod, sr1.lasttimemin, sr1.minm - sr2.minm as diff, sr1.minm as sr1min, sr2.minm as sr2min from statsrange sr1 inner join statsrange sr2 on sr2.lasttimemin+1 = sr1.lasttimemin and sr2.avgperiod = sr1.avgperiod and sr2.avgperiod = 10)  as t where sru.lasttimemin = t.lasttimemin and sru.avgperiod = t.avgperiod;
// current update statsrange sru set mind = mindiff, maxd = maxdiff, ranged = rangediff from (select sr1.avgminprice, sr1.avgperiod, sr1.lasttimemin, sr1.minm - sr2.minm as mindiff, sr1.maxm - sr2.maxm as maxdiff, sr1.rangem - sr2.rangem as rangediff, sr1.minm as sr1min, sr2.minm as sr2min from statsrange sr1 inner join statsrange sr2 on sr2.lasttimemin+1 = sr1.lasttimemin and sr2.avgperiod = sr1.avgperiod and sr2.avgperiod = 10)  as t where sru.lasttimemin = t.lasttimemin and sru.avgperiod = t.avgperiod;


	// update forecast set devminprice = t.mind from ((select f.avgperiod, f.lasttimemin, f.forecastminprice, statsrange.avgminprice, (f.forecastminprice-statsrange.avgminprice) as mind from forecast as f inner join statsrange on f.lasttimemin =  statsrange.lasttimemin and f.avgperiod = statsrange.avgperiod)) as t where t.lasttimemin = forecast.lasttimemin and t.avgperiod= forecast.avgperiod and forecast.lasttimemin=27836136;

// id | lasttimemin | forecastminprice | forecastmaxprice | forecastrangeprice | avgperiod 
     insertForecastSQL = (lasttimemin,
	     forecastminprice,
	     forecastmaxprice,
	     forecastrangeprice,
	     avgperiod, devminprice, devmaxprice, devrangeprice) => {
                 this.sql = "insert into forecast (lasttimemin, forecastminprice, " +
			     " forecastmaxprice, forecastrangeprice, avgperiod, devminprice, devmaxprice, devrangeprice "+ 
			     " ) " +
                 " values (" + lasttimemin + "," + forecastminprice +"," +
			     forecastmaxprice + "," + forecastrangeprice + "," + avgperiod + "," +
			     devminprice + "," + devmaxprice + "," + devrangeprice +
			     ")" + " on conflict on constraint clasttimemin do nothing";

		//	     " where not exists ( select lasttimemin from forecast where lasttimemin = " + lasttimemin + ")";
//		     console.log("sql == "+ this.sql);
	     }


     insertPeriodStats = (n1, n2) => {
	     // n- time in mins - 1 min slots on table
	     // p1 - diff avg for the min define the price moves on the min
	     // r1 - for the entire period - define the band of trade
             let period = n2 - n1;
	     this.sql = "insert into statsrange (statsid, lasttimemin, avgminprice, avgmaxprice, avgrange, avgperiod) "+
		" select max(id) as statsid,  max(timemin) as lasttimemin, avg(minprice) as avgminprice, avg(maxprice) " +
		" as avgmaxprice,  avg(diff) as avgrange, " + period + " as avgperiod from " +
		" (select maxprice, minprice,  (maxprice - minprice) as diff, id, timemin " +
		" from stats where id  between " + n1 + " and " + n2 + ")  as t";
         // console.log(this.sql);
     }
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
//  id | txndate | opensellslot | opensellval | opensellper 

     insertOpenSell = (opensellslot, opensellval, opensellper) => {
         this.sql = "insert into opensell (txndate, opensellslot, opensellval, opensellper) " +
         "values ( ' NOW()'," + opensellslot + "," + opensellval + ","+ opensellper+ ")";
     }

//  id | txndate | openbuyval | opensellval | capitalreserves | cash | totval 

     insertCapital = (openbuyval, opensellval, capitalreserves, cash, totval, btcBal) => {
         this.sql = "insert into capital (txndate,openbuyval, opensellval, capitalreserves, cash, totval, btcBal ) " +
         "values ( ' NOW()'," + openbuyval + "," + opensellval + ","+ capitalreserves + "," + cash + "," 
		     +totval + "," + btcBal + ")";
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


     insertPriceOrderSQLShort = (clientorderid, price, qty, ordertype, exitprice) => {
         this.sql = "insert into priceordershort (txndate, clientorderid, price, qty, ordertype, exitprice) " +
         "values ( NOW(), " + clientorderid + "," + price + "," + qty + ",'" + ordertype + "'," + exitprice+ ")";
     }
     insertPriceOrderSQL = (clientorderid, price, qty, ordertype, exitprice) => {
         this.sql = "insert into priceorder (txndate, clientorderid, price, qty, ordertype, exitprice) " +
         "values ( NOW(), " + clientorderid + "," + price + "," + qty + ",'" + ordertype + "'," + exitprice+ ")";
     }
     createRSISQL = (timemin, rsi) => {
         this.sql = "insert into trends (txndate, timemin, rsi) values ( NOW(), " + timemin + "," + rsi + ")";
     }

     updateStatsSQL = (timec, peak, pricec) => {

          this.sql =
              "update stats set peak = " + peak + ", pricec=" + pricec + " where timemin = " + timec;
          console.log(this.sql);
     }
     createStatsSQL = (minprice, maxprice, openprice, avgprice, 
	     closeprice, timemin, sumprice, itemnum, qty, peak, pricec) => {

          this.sql =
              "insert into stats (txndate, minprice, maxprice, openprice," +
		     " closeprice, avgprice, sumprice, timemin, itemnum, qty, peak, pricec) " +
              " values " +
              "( NOW()," + minprice + "," + maxprice + "," + openprice + "," + closeprice + "," + avgprice + "," + 
		     sumprice + "," + timemin + "," + itemnum + ", " + 
			     qty + "," + peak + "," + pricec + ")" +  " on conflict on constraint ctimemin do nothing";
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



    getStatsRangeLastId = async() => {
       let sql = "select last_value from statsrange_id_seq";

       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
           this.statsRangeId = parseInt(res.rows[0]["last_value"]);

       } catch (err) { throw(err);
       }
    }
    getPriceOrderLastIdShort = async() => {
       let sql = "select last_value from priceordershort_id_seq";

       try {
	       let pool = this.pool;
           let res=await pool.query(sql)
           this.pid = parseInt(res.rows[0]["last_value"]);

       } catch (err) { throw(err);
       }
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
