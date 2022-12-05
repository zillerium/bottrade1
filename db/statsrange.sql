CREATE TABLE statsrange(
   ID SERIAL PRIMARY KEY,
   lasttimemin bigint,
   avgminprice numeric(20,10),
   avgmaxprice numeric(20,10),
   avgsrangeprice numeric(20,10),
   minm numeric(20,10),
   maxm numeric(20,10),
   rangem numeric(20,10),
   minb numeric(20,10),
   maxb numeric(20,10),
   rangeb numeric(20,10),
   ranged numeric(20,10),
   mind numeric(20,10),
   maxd numeric(20,10),
    avgperiod int,
    statsid int
);
