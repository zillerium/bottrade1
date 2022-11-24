CREATE TABLE tradelog(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   toprange numeric(20,10),
   botrange numeric(20,10),
   buyprice numeric(20,10),
   sellprice numeric(20,10),
   clientorderid bigint,
   ordertype varchar(10),
   inrange boolean
);
