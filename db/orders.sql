CREATE TABLE opensell(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   clientorderid bigint,
   ordertime int,
   updatetime int, 
   ordertype varchar(10)
);
