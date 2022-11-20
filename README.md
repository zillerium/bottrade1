# bottrade1

The modules dir has the main module for performing trades via the Binance Connector API.

Service 

To create a service, create a file at /etc/systemd/service/bot.service 

Then to reload -
sudo systemctl daemon-reload

Services
========

1. botdb - streams into the db (price, currprice)
2. bottraderdb - reads currprice and creats stats - saves to db
3. bottradermin - trader by min
4. bottradersec - trader by sec
