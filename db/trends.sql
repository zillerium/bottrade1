CREATE TABLE trends(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   rsi numeric(20,10),
   timemin bigint
);

