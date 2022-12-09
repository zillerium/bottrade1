CREATE TABLE stats(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   minprice numeric(20,10),
   maxprice numeric(20,10),
   openprice numeric(20,10),
   closeprice numeric(20,10),
   avgprice numeric(20,10),
   sumprice numeric(20,10),
   timemin bigint,
   itemNum int,
   peak int,
   pricec numeric(20,10)
);

