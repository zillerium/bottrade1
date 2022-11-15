class DBMod {
  constructor( 
    )   
    {   
        this.queryJson = {};
        this.cancelJson = {};
        this.openOrderJson = {};
        this.openOrderModel = null;
        this.cancelModel = null;
        this.queryOrderModel = null;
    }


    queryJsonGet = () => {
        return this.queryJson;
     }

    queryJsonSet = () => {

        let queryOrderSchemaJson = {
            orderId : { type: Number, default: null},
            symbol : {type: String, default: null},
            clientOrderId : {type: String, default: null},
            price : {type: String, default: null},
            origQty : {type: String, default: null},
            executedQty : {type: String, default: null},
            cummulativeQuoteQty : {type: String, default: null},
            status : {type: String, default: null},
            timeInForce : {type: String, default: null},
            type : {type: String, default: null},
            side : {type: String, default: null},
            //stopPrice : {type: String, default: null},
            // icebergQty : {type: String, default: null},
            //  time : {type: Number, default: null},
            //  updateTime : {type: Number, default: null},
            //  isWorking : {type: Boolean, default: null},
            //  accountId : {type: Number, default: null},
            isIsolated : {type: Boolean, default: null},
        };
        this.queryJson = queryOrderSchemaJson;
    }
    cancelJsonSet = () => {
        let cancelSchemaJson = {
            orderId : { type: String, default: null},
            symbol : {type: String, default: null},
            origClientOrderId : {type: String, default: null},
            clientOrderId : {type: String, default: null},
            price : {type: String, default: null},
            origQty : {type: String, default: null},
            executedQty : {type: String, default: null},
            cummulativeQuoteQty : {type: String, default: null},
            status : {type: String, default: null},
            timeInForce : {type: String, default: null},
            type : {type: String, default: null},
            side : {type: String, default: null},
            isIsolated : {type: Boolean, default: null}
        };
	this.cancelJson = cancelSchemaJson;
    }

    cancelJsonGet = () => {
        return this.cancelJson;
    }

    openOrderSet = () => {
	let openOrderSchemaJson = {
	  orderId : { type: Number, default: null},
	  symbol : {type: String, default: null},
	  clientOrderId : {type: String, default: null},
	  transactTime : {type: Number, default: null},
	  price : {type: String, default: null},
	  origQty : {type: String, default: null},
	  executedQty : {type: String, default: null},
	  cummulativeQuoteQty : {type: String, default: null},
	  status : {type: String, default: null},
	  timeInForce : {type: String, default: null},
	  type : {type: String, default: null},
	  side : {type: String, default: null},
	  isIsolated : {type: Boolean, default: null},
	  fills: [
		  {
		      price: {type:String, default: null},
		      qty: {type:String, default: null},
		      commission: {type:String, default: null},
		      commissionAsset: {type:String, default: null},
		  }
	  ]
       };
       this.openOrderJson = openOrderSchemaJson;
    }

    openOrderGet = () => {
        return this.openOrderJson;
    }
    
    cancelModelGet = () => {
        return this.cancelModel;
    }
    cancelModelSet = (cancelModel) => {
        this.cancelModel = cancelModel;
    }
    openModelGet = () => {
        return this.openOrderModel;
    }
    openModelSet = (openOrderModel) => {
        this.openOrderModel = openOrderModel;
    }
    queryModelGet = () => {
        return this.queryOrderModel;
    }
    queryModelSet = (queryOrderModel) => {
        this.queryOrderModel = queryOrderModel;
    }



    addOpenOrder = async (jsonDB) => {
        try {
            let openOrderModel = this.openOrderModel;
	    let rec = new openOrderModel(jsonDB);
	    return await rec.save(function(err, doc){
    		       if(err) throw err;
	  	           // console.log("open order db done" + jsonOpenResponse);
	           });
	} catch (e) {
		throw(e);
	}
		
    }
    addCancelOrder = async (jsonDB) => {
        try {
	    let cancelModel = this.cancelModel;
	    let rec = new cancelModel(jsonDB);
	    return await rec.save(function(err, doc){
    		       if(err) throw err;
	  	           // console.log("open order db done" + jsonOpenResponse);
	           });
	} catch (e) {
		throw(e);
	}
		
    }
    addQueryOrder = async (jsonDB) => {
        try {
            let queryOrderModel=this.queryOrderModel;		
	    let rec = new queryOrderModel(jsonDB);
	    return await rec.save(function(err, doc){
    		       if(err) throw err;
	  	           // console.log("open order db done" + jsonOpenResponse);
	           });
	} catch (e) {
		throw(e);
	}
		
    }

}

export { DBMod };
