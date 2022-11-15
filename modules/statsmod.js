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
        this.currentPrice= 0.00; // current price
        this.avgPrice= 0.00; // current price
        this.priceRatio= 0.00;
    }

     getRSI = () => { return this.RSI; }
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


     getJsonAvg = () => { return this.jsonAvg; }
     getCycle = () => { return this.cycle; }
     setCycle = (cycle) => {this.cycle=cycle; }
     incCycle = () => {this.cycle++; }
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
