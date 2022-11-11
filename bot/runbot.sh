#!/bin/bash

for i in {1..2}
do
	d=`date +%c`
echo $d
  echo "###################### start of exec ##################"
  node bottrader.js
  sleep 10
  d1=`date +%c`
echo $d1
  echo "###################### end of exec ##################"
done
