#!/bin/bash

##for i in {1..3}
for i in 1 2 3 4 5 6
do
	d=`date +%c`
        echo $d
        echo "###################### start of exec ##################"
	##buy
        #/home/ubuntu/.nvm/versions/node/v19.0.1/bin/node  /home/ubuntu/binance/bottradersecs.js >> /home/ubuntu/binance/botout
        /home/ubuntu/.nvm/versions/node/v19.0.1/bin/node  /home/ubuntu/binance/bottradersecs.js
        /home/ubuntu/.nvm/versions/node/v19.0.1/bin/node  /home/ubuntu/binance/bottradersecs.js
       sleep 1	
        ##sell
	##/home/ubuntu/.nvm/versions/node/v19.0.1/bin/node  /home/ubuntu/binance/bottradersecs.js
       ## sleep 30 # to allow for when the range changes and the bot waits
        d1=`date +%c`
        echo $d1
        echo "###################### end of exec ##################"
done
