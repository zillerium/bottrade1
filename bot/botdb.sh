#!/bin/bash

##for i in {1..3}
while :	
do
	d=`date +%c`
        echo $d
        echo "###################### start of exec ##################"
        /home/ubuntu/.nvm/versions/node/v19.0.1/bin/node  /home/ubuntu/binance/botdb.js
        sleep 10 # to allow for when the range changes and the bot waits
        d1=`date +%c`
        echo $d1
        echo "###################### end of exec ##################"
done
