class BotMod {
  constructor(client, minSellPrice, maxBuyPrice, tradeDiffLimit 
    )   
    {   
        this.client = client;
	this.minSellPrice = minSellPrice; // safety price
	this.maxBuyPrice = maxBuyPrice; // safety price
	this.tradeDiffLimit = tradeDiffLimit; // bal of buys and sells ie not too many buys without selling
	this.numberBuys = 0;
	this.numberSells = 0;
    }


    getAllOrdersSelect = async (isIsolated, num) => {
        try {
            return await this.client.marginAllOrders(
                'BTCUSDT', // symbol
            {
                isIsolated: 'TRUE',
        	limit: num
                //origClientOrderId: orderRef.toString(),
            }
            )
      //  await addQueryOrder(response.data);
         }
         catch (e) {
             this.client.logger.error(e);
             throw(e);
         }

    }
    getAllOrders = async (isIsolated) => {
        try {
            return await this.client.marginAllOrders(
                'BTCUSDT', // symbol
            {
                isIsolated: 'TRUE',
        	limit: 500
                //origClientOrderId: orderRef.toString(),
            }
            )
      //  await addQueryOrder(response.data);
         }
         catch (e) {
             this.client.logger.error(e);
             throw(e);
         }

    }
    getOpenOrders = async (isIsolated) => {
        try {
            return await this.client.marginOpenOrders(
            {
                isIsolated: 'TRUE',
        	symbol: 'BTCUSDT'
                //origClientOrderId: orderRef.toString(),
            }
            )
      //  await addQueryOrder(response.data);
         }
         catch (e) {
             this.client.logger.error(e);
             throw(e);
         }
    }
    getOrder = async (orderId, isIsolated) => {

        try {
            return await this.client.marginOrder(
                'BTCUSDT', // symbol
            {
                isIsolated: 'TRUE',
		orderId: orderId
                //origClientOrderId: orderRef.toString(),
            }
            )
      //  await addQueryOrder(response.data);
         }
         catch (e) {
             this.client.logger.error(e);
             throw(e);
         }
    }

    isSafeTrade = () => {
        let tradeDiff = Math.abs(numberBuys - numberSells);
	   // console.log("differ = "+ tradeDiff);
	if (tradeDiff > tradeDiffLimit) return false; else return true;

    }	    

    isSafeSellPrice = (price) => {
        if (price < this.minSellPrice) return false; else return true;
    }

    isSafeBuyPrice = (price) => {
        if (price > this.maxSellPrice) return false; else return true;
    }
// client.marginMyTrades('BTCUSDT', {endTime: d, limit: 3, isIsolated: 'TRUE' }).then(response => client.logger.log(response.data))

    getTrades = async (assetPair, limit, isIsolated) => {

        let queryParams = { limit: limit, isIsolated: isIsolated};

	try {
            return await this.client.marginMyTrades( assetPair, queryParams);
	} catch (e) {
            this.client.logger.error(e);
            throw(e);
	}

    }


//client.isolatedMarginAccountInfo({symbols: 'BTCUSDT'})

    getAccountDetails = async (assetPair) => {

	let queryParams = { symbols: assetPair }    
        try {
            return await this.client.isolatedMarginAccountInfo(queryParams); 
        } catch (e) {
            this.client.logger.error(e);
            throw(e);
        }
    }


// OrderType - 'BUY' or 'SELL'
    newMarginOrder = async (price,  quantity, clientOrderId, timeInForce, orderType) => {
        if ((orderType == 'SELL') && (!this.isSafeSellPrice(price))) {this.client.logger.error("too low price - sale");return null};
        if ((orderType == 'BUY') && (!this.isSafeBuyPrice(price))) {this.client.logger.error("too high price - buy");return null};
      //  this.client.logger.error(this.numberBuys);
      //  this.client.logger.error(this.numberSells);
      //  this.client.logger.error(this.tradeDiffLimit);
	if (!this.isSafeTrade) {this.client.logger.error("trade not balanced");return null};

        switch (orderType) {
            case 'BUY':
                this.numberBuys++; break;
	    case 'SELL':		
                this.numberSells++; break;
	    default:
		break;
	}

	let orderParams = {
            quantity: quantity,
            isIsolated: 'TRUE',
	//    stopPrice: stopPrice.toString(),	
            price: price.toString(),
            newClientOrderId: clientOrderId.toString(), // binance will generate the id
            newOrderRespType: 'FULL',
            timeInForce: timeInForce //'FOK' // FOK did not work in testing 
	}
	try {
            return await this.client.newMarginOrder('BTCUSDT', orderType, 'LIMIT', orderParams)

		
        //client.logger.log(resp.data);
        //return { "resp": resp.data, "error": false};
        }
        catch (e) {
            this.client.logger.error(e);
	    throw(e);
//            return {"resp": null, "error": true};
        }
    }

    cancelClientOrder = async (clientorderId, isIsolated) => {
        let cancelParams = { isIsolated: 'TRUE', origClientOrderId: clientorderId.toString() };	
        try {
            return await this.client.cancelMarginOrder('BTCUSDT', cancelParams)
//                console.log(client.logger.log(response.data));
        }
        catch (e) {
            this.client.logger.error(e);
            throw(e);
        }
    }
    cancelOrder = async (orderId, isIsolated) => {
        let cancelParams = { isIsolated: 'TRUE', orderId: orderId };	
        try {
            return await this.client.cancelMarginOrder('BTCUSDT', cancelParams)
//                console.log(client.logger.log(response.data));
        }
        catch (e) {
            this.client.logger.error(e);
            throw(e);
        }
    }


}

export { BotMod };
