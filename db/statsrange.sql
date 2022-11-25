CREATE TABLE statsrange(
   ID SERIAL PRIMARY KEY,
   lasttimemin bigint,
   avgminprice numeric(20,10),
   avgmaxprice numeric(20,10),
   avgsrangeprice numeric(20,10),
    avgperiod int,
    statsid int
);
