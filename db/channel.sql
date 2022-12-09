CREATE TABLE channel(
   ID SERIAL PRIMARY KEY,
   beforepeakprice numeric(20,10),
   beforepeaktime int,
   peakprice numeric(20,10),
   peaktime int,
   afterpeakprice numeric(20,10),
   aftepeaktime int
);


