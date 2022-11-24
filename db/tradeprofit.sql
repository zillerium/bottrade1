CREATE TABLE tradeprofit(
   ID SERIAL PRIMARY KEY,
   Txntime varchar(60),
clientorderid bigint,
   profit numeric(20,10),
   percent numeric(5,2),
   txnsecs bigint
);
