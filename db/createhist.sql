CREATE TABLE TRADEhist(
   ID SERIAL PRIMARY KEY,
   avg_price numeric(30, 10),
   time_price bigint,
   chg_price numeric(30, 10),
   direction_price int,
   time_sec varchar(40);

);
