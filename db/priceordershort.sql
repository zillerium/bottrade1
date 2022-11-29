CREATE TABLE priceordershort(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   clientOrderId varchar(64),
   price numeric(20,10),
   qty numeric(20,10),
   ordertype varchar(10),
   exitprice numeric(20,10) 
);
