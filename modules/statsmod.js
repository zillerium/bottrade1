class StatsMod {
  constructor( 
    )   
    {   
        this.priceUD = {};
        this.priceUDdef = { "up": 0.00, "down": 0.00};
        this.priceMoves = [];
        this.jsonAvg = {};
        this.cycle = 0;
        this.RSIN = 0;
        this.RSI = 0;
        this.minPrice= 0.00; // for a candlestick
        this.maxPrice= 0.00; // for a candlestick
        this.openPrice= 0.00; // for a candlestick
        this.closePrice= 0.00; // for a candlestick
        this.prevClosePrice= 0.00; // 
        this.currentPrice= 0.00; // current price
        this.avgPrice= 0.00; // 
        this.prevAvgPrice= 0.00; // 
        this.varPrice= 0.00; 
        this.buyPrice= 0.00; // buying price for trade
        this.sellPrice= 0.00; 
        this.tvr= 0.00; 
        this.priceRatio= 0.00;
        this.numberTxns= 0;
        this.numberSecs= 0;
        this.prevSecs= 0;
        this.priceVars= {};
    }

     getPriceVars = () => { return this.priceVars; }
     setPriceVars = () => { this.priceVars = 
              {"open":this.openPrice, "close": this.closePrice, "txns": this.numberTxns,
               "min":this.minPrice, "max":this.maxPrice, "avg":this.avgPrice, "var":this.varPrice,
               "ratio": this.priceRatio, "rsi": this.RSI, "tvr": this.tvr, "buy": this.buyPrice, "sell": this.sellPrice
               };


     }

     getPrevClosePrice = () => { return this.prevClosePrice; }
     setPrevClosePrice = () => { this.prevClosePrice = this.closePrice; }
     getNumberSecs = () => { return this.numberSecs; }
     setNumberSecs = (numberSecs) => { this.numberSecs = numberSecs; }
     getPrevSecs = () => { return this.prevSecs; }
     setPrevSecs = (prevSecs) => { this.prevSecs = prevSecs; }
     setPrevSecsToNumber = () => { this.prevSecs = this.numberSecs; }
     getRSI = () => { return this.RSI; }
     getBuyPrice= () => { return this.buyPrice; }
     setBuyPrice = () => { this.buyPrice = this.minPrice.toFixed(2); }
     getSellPrice= () => { return this.sellPrice; }

     setSellPrice = () => { this.sellPrice = this.maxPrice.toFixed(2); }
     getOpenPrice = () => { return this.openPrice; }
     setOpenPrice = (openPrice) => { this.openPrice=openPrice; }
     getClosePrice = () => { return this.closePrice; }
     setClosePrice = (closePrice) => { this.closePrice=closePrice; }
     getMinPrice = () => { return this.minPrice; }
     setMinPrice = (minPrice) => { this.minPrice=minPrice; }
     getMaxPrice = () => { return this.maxPrice; }
     setMaxPrice = (maxPrice) => { this.maxPrice=maxPrice; }
     getCurrentPrice = () => { return this.currentPrice; }
     setCurrentPrice = (currentPrice) => { this.currentPrice=currentPrice; }

     getVarPrice= () => { return this.varPrice; }
     setVarPrice = () => {
       this.varPrice=this.maxPrice - this.avgPrice;

     }


     getTVR= () => { return this.tvr; }
     setTVR = () => {
       this.tvr = this.numberTxns/this.varPrice;

     }
     getJsonAvg = () => { return this.jsonAvg; }
     getPrevAvgPrice = () => { return this.prevAvgPrice; }
     setPrevAvgPrice = (prevAvgPrice) => { this.prevAvgPrice=prevAvgPrice; }
     getCycle = () => { return this.cycle; }
     setCycle = (cycle) => {this.cycle=cycle; }
     incCycle = () => {this.cycle++; }
     getNumberTxns = () => { return this.numberTxns; }
     setNumberTxns = (numberTxns) => { this.numberTxns=numberTxns; }
     incNumberTxns = () => {this.numberTxns++; }
     getRSIN = () => { return this.RSIN; }
     setRSIN = (rsin) => {this.RSIN=rsin; }

     getAvgPrice = () => { return this.avgPrice; }
     calcAvgPrice = () => {
        this.avgPrice=(this.minPrice+this.maxPrice)/2;
     }

     getPriceRatio = () => { return this.priceRatio; }
     calcPriceRatio = () => {
          if (this.maxPrice > 0) {
               this.priceRatio = (this.maxPrice-this.avgPrice)/this.maxPrice;

           }

     }

     setMinMaxPrices = () => {
       if (this.currentPrice < this.getMinPrice())  this.minPrice = parseFloat(this.currentPrice);
       if (this.currentPrice > this.getMaxPrice())  this.maxPrice = parseFloat(this.currentPrice);

     }

     calcRSI = () => {
       if (this.getPriceMoves().length > this.getRSIN()) {
           this.SAMoves();
           let rs = this.getJsonAvg().upAvg/this.getJsonAvg().downAvg;
           this.RSI= 100 - 100/(1+rs);

       }

     }
     getPriceMoves = () => { return this.priceMoves; }
     removePriceMove = () => { this.priceMoves.splice(0, 1); }
     addPriceMoveItem = (priceMove) => { this.priceMoves.push(priceMove); }
   
     addPriceMove = () => {
    
	if (this.getPriceMoves().length > this.RSIN) this.removePriceMove(); // remove first entry for that RS period
        if (this.cycle>1)
            this.addPriceMoveItem(this.getPriceUD());
        else
            this.addPriceMoveItem(this.getPriceUDdef());
     }

	getPriceUD = () => { return this.priceUD; }
	getPriceUDdef = () => { return this.priceUDdef; }
    priceUpDown =  (priceCloseT, priceCloseT_1) => {
        let priceUp=0;
        let priceDown=0;
        let priceChange = priceCloseT - priceCloseT_1;
        if (priceChange == 0) {
            priceUp=0;
            priceDown=0;
        } else {
            if (priceChange > 0) {
                priceUp=priceChange;
                priceDown=0;
            } else {
                priceUp=0; 
                priceDown=Math.abs(priceChange);    
            }
        }   
        this.priceUD = { "up": priceUp, "down": priceDown};
    }

    SAMoves = () => {
        let udMoves=this.priceMoves;
        let sumUp=0;
        let sumDown=0;
        for (let i=0; i<udMoves.length;i++) {
            let upP = udMoves[i]["up"];
            let downP = udMoves[i]["down"];
            sumUp += upP;
            sumDown += downP;
         }
        let avgUp = sumUp/udMoves.length;
        let avgDown = sumDown/udMoves.length;
        this.jsonAvg = {"upAvg": avgUp, "downAvg": avgDown};
    }




}

export { StatsMod };
