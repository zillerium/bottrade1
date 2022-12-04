CREATE TABLE forecast(
   ID SERIAL PRIMARY KEY,
   lasttimemin bigint,
   forecastminprice numeric(20,10),
   forecastmaxprice numeric(20,10),
   forecastrangeprice numeric(20,10),
   devminprice numeric(20,10),
   devmaxprice numeric(20,10),
   devrangeprice numeric(20,10),
   avgperiod int
);

crypto=# alter table forecast add constraint clasttimemin unique (lasttimemin, avgperiod);

