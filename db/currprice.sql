CREATE TABLE currprice(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   timeprice bigint, 
   price numeric(20,10),
);