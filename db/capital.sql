CREATE TABLE capital(
   ID SERIAL PRIMARY KEY,
   TXNDATE TIMESTAMP,
   openbuyval numeric(20,10),
   opensellval numeric(20,10),
   capitalreserves numeric(20,10),
   cash numeric(20,10),
   totval numeric(20,10) 
);
