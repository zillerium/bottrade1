class RiskMod {
  constructor( 
    )   
    {
	    this.lastMinRec = {};
	    this.statsRecTime = 0;
    }
// sqlmod.getPeriodStatsDB
//  riskmod.calcAvg(id, timemin, lastminAvg);

calcAvg = (id, timemin, lastminAvg, buyprice, minprice, maxprice) => {

/*crypto=# select * from statsrange where avgperiod = 30 order by lasttimemin limit 1;
 id | lasttimemin |   avgminprice    |   avgmaxprice    |   avgrange    | avgperiod | statsid 
----+-------------+------------------+------------------+---------------+-----------+---------
 48 |    27822531 | 16458.1151612903 | 16473.1200000000 | 15.0048387097 |        30 |    7280
(1 row)

crypto=# select * from statsrange where avgperiod = 10 order by lasttimemin limit 1;
 id | lasttimemin |   avgminprice    |   avgmaxprice    |   avgrange    | avgperiod | statsid 
----+-------------+------------------+------------------+---------------+-----------+---------
 45 |    27822523 | 16453.5818181818 | 16476.1918181818 | 22.6100000000 |        10 |    7272
(1 row)

crypto=# select * from statsrange where avgperiod = 5 order by lasttimemin limit 1;
 id | lasttimemin |   avgminprice    |   avgmaxprice    |   avgrange    | avgperiod | statsid 
----+-------------+------------------+------------------+---------------+-----------+---------
 46 |    27822531 | 16414.3633333333 | 16432.1733333333 | 17.8100000000 |         5 |    7280
(1 row)

crypto=# select * from stats order by id limit 1;
crypto=# select minprice, maxprice from stats order by id limit 1;
     minprice     |     maxprice     
------------------+------------------
 16625.3900000000 | 16634.2400000000
*/
//     await selectLastMinAvgDB();
//     let lastminAvg = sqlmod.getLastMinAvg();
//id = 7369
/*avg1 == [{"timemin":"27822620"}]
avg == [{"lasttimemin":"27822620","avgminprice":"16393.9483333333","avgmaxprice":"16403.6150000000","avgrange":"9.6666666667","avgperiod":5,"st
atsid":7369},{"lasttimemin":"27822620","avgminprice":"16388.9445454545","avgmaxprice":"16398.5872727273","avgrange":"9.6427272727","avgperiod":
10,"statsid":7369},{"lasttimemin":"27822620","avgminprice":"16384.4454838710","avgmaxprice":"16396.6651612903","avgrange":"12.2196774194","avgp
eriod":30,"statsid":7369},{"lasttimemin":"27822620","avgminprice":"16394.0921311475","avgmaxprice":"16404.6422950820","avgrange":"10.5501639344
","avgperiod":60,"statsid":7369}]
*/

       let defJson = { avgrange: 1, inrange: false, inrangebuy: false };
       if (lastminAvg) {
           if (lastminAvg.length == 0) return defJson;
       } else {
           return defJson;
       }

       let range5minLow = parseFloat(lastminAvg[0]["avgminprice"])- parseFloat(lastminAvg[0]["avgrange"]);
       let range5minHigh = parseFloat(lastminAvg[0]["avgminprice"])+ parseFloat(lastminAvg[0]["avgrange"]);
       let minprice10min = parseFloat(lastminAvg[1]["avgminprice"]);
      
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
       console.log("& RANGE CHECK                          &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
       console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");

       console.log("buy price - ---- " + buyprice);
       console.log("min price - ---- " + minprice),
       console.log("max price - ---- " + maxprice),
       console.log("5 mins low - ---- " + range5minLow);
       console.log("5 mins high - ---- " + range5minHigh);
       console.log("10 mins low - ---- " + minprice10min);


       let inrangeval = false;
       let inrangebuyval = false;
       if ((minprice10min > range5minLow) && (minprice10min < range5minHigh)) {
           console.log("min10 in the 5 min range ==== "); inrangeval = true;
       } else {
           console.log("min10 not in 5 min range =="); inrangeval = false;
       }

       if ((buyprice> range5minLow) && (buyprice < range5minHigh)) {
           console.log("buy price in the 5 min range ==== "); inrangebuyval = true;
       } else {
           console.log("buy price outside 5 mins range  =="); inrangebuyval = false;
       }


    let avgrange = parseFloat(lastminAvg[0]["avgrange"]);
    let jsonout = { avgrange: avgrange, inrange: inrangeval, inrangebuy: inrangebuyval };
    return jsonout;

}

}
export { RiskMod };
