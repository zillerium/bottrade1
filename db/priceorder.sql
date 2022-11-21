CREATE TABLE priceorder(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   clientOrderId varchar(64),
   price numeric(20,10),
   qty int,
   ordertype varchar(10),
   exitprice numeric(20,10) 
);
