CREATE TABLE openorders(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   clientorderid bigint,
   ordertime bigint,
   orderprice numeric(20,10),
   ordertype varchar(10),
   orderstatus varchar(20)
);
