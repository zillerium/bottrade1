CREATE TABLE profit(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   Buyprice numeric(20,10),
   sellprice numeric(20,10),
   qty numeric(12,8),
   profit numeric(20,10)
);
