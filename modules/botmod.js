class BotMod {
  constructor(client 
    )   
    {   
        this.client = client;
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

// OrderType - 'BUY' or 'SELL'
    newMarginOrder = async (price, quantity, clientOrderId, timeInForce, orderType) => {
        let orderParams = {
            quantity: quantity,
            isIsolated: 'TRUE',
            price: price.toString(),
            newClientOrderId: clientOrderId.toString(),
            newOrderRespType: 'FULL',
            timeInForce: timeInForce // FOK did not work in testing 
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
