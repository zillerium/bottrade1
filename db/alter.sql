alter table trade add column  orderId Integer;
alter table trade add column clientOrderId Varchar(20);
alter table trade add column priceRes money;
alter table trade add column  origQty VarChar(10);
alter table trade add column  executedQty VarChar(10);
alter table trade add column  cummulativeQuoteQty VarChar(15);
alter table trade add column  statusRes VarChar(10);
alter table trade add column  timeInForce VarChar(6);
alter table trade add column  typeRes VarChar(8);
alter table trade add column  sideRes VarChar(5);
alter table trade add column  stopPrice VarChar(10);
alter table trade add column  icebergQty Varchar(10);
alter table trade add column  timeRes Integer;
alter table trade alter column  timeRes type bigint;
alter table trade alter column  timeRes type bigint;
alter table trade alter column  updatetime type bigint;
alter table trade alter column  orderid type bigint;
alter table trade alter column  clientorderid type varchar(20);

alter table trade add column  updateTime Integer;
alter table trade add column  isWorking Boolean;
alter table trade add column  accountId Integer;
alter table trade add column  isIsolated Boolean;