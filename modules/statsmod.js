class StatsMod {
  constructor( 
    )   
    {   
        this.priceUD = {};
        this.priceUDdef = { "up": 0.00, "down": 0.00};
        this.priceMoves = [];
        this.jsonAvg = {};
        this.cycle = 0;
        this.RSIN = 14;
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
        this.highSellPrice= 0.00; 
        this.buyQty= 0.00; 
        this.sellQty= 0.00; 
        this.highSellQty= 0.00; 
        this.qtyFactor= 0.500; // how to split the qtys for low and high buys 
        this.tvr= 0.00; 
        this.priceRatio= 0.00;
        this.numberTxns= 0;
        this.numberSecs= 0;
        this.prevSecs= 0;
        this.highProfitFactor= 10.00;
        this.directionPrice= 0;
        this.chgPrice= 0.00;
        this.avgPriceDB= 0.00;
        this.changePriceDB= 0.00;
        this.percentChange= 0.00;
        this.prices= [];
        this.priceVars= {};
        this.stats= [];
    }

    initializeTxns = () => {	
      this.setOpenPrice(parseFloat(this.currentPrice)); //reset for the new candletsick
      this.setClosePrice(parseFloat(this.currentPrice));  // reset for the new candlestick
      this.setPrevSecsToNumber();
      this.setMinPrice(parseFloat(this.currentPrice)); // init min price
      this.setMaxPrice(parseFloat(this.currentPrice)); // init min price
      this.setPrevAvgPrice(parseFloat(this.currentPrice));
      this.setNumberTxns(1); // initialize to 1       
      this.incCycle();
    }


     newCandleStick = () => {
       this.priceUpDown(this.closePrice, this.prevClosePrice); // [up, down] prices
       this.addPriceMove();
       this.calcAvgPrice();
       this.setVarPrice();
       this.calcPriceRatio();
       this.calcRSI();

       this.setTVR();    
       this.setBuyPrice(); 
       this.setSellPrice(); 
       this.setHighSellPrice(this.sellPrice - this.buyPrice); 
       this.setPriceVars();

       console.log("price data ===== array = " + JSON.stringify(this.priceVars));
    
       this.setChgPrice();
       this.setPrevAvgPrice(this.avgPrice);

       this.addAvgPriceDB();
       this.addChangePriceDB();
       this.addPercentChange();

       this.setDirectionPrice();

     }

     getAvgPriceDB = () => { return this.avgPriceDB; }
     getChangePriceDB = () => { return this.changePriceDB; }
     getPercentChange = () => { return this.percentChange; }
     setAvgPriceDB = (avgPriceDB) => { this.avgPriceDB = avgPriceDB };
     getStats = () => {return this.stats };
     setStats = (stats) => { this.stats = stats };
     setChangePriceDB = (changePriceDB) => { this.changePriceDB = changePriceDB };
     setPercentChange = (percentChange) => { this.percentChange = percentChange };

     addAvgPriceDB = () => {
	     console.log("00000000000 avgPrice db = " + this.avgPriceDB);
	     console.log("00000000000 avgPrice  = " + this.avgPrice);
	     this.avgPriceDB = (this.avgPriceDB + this.avgPrice)/2;
     }

     addChangePriceDB = () => {
	     console.log("change price db = " + this.changePriceDB);
	     console.log("change price = " + this.chgPrice);
         this.changePriceDB = (this.changePriceDB + this.chgPrice)/2;

     }
     addPercentChange = () => {
         this.percentChange = parseFloat(this.changePriceDB/this.avgPriceDB);
     }


     getPrices = () => { return this.prices; }
     setPrices = () => { 
        this.prices.push(this.priceVars);
	    // console.log("   prices mod === " + JSON.stringify(this.prices));
     }
     getPriceVars = () => { return this.priceVars; }
     setPriceVars = () => { this.priceVars = 
              {"open":this.openPrice, "close": this.closePrice, "txns": this.numberTxns,
               "min":this.minPrice, "max":this.maxPrice, "avg":this.avgPrice, "var":this.varPrice,
               "ratio": this.priceRatio, "rsi": this.RSI, "tvr": this.tvr, "buy": this.buyPrice, "sell": this.sellPrice
               };


     }

     getDirectionPrice = () => { return this.directionPrice; }
     setDirectionPrice = () => {
         if (this.chgPrice > 0) this.directionPrice = 1; else this.directionPrice = -1;

     }
     getChgPrice = () => { return this.chgPrice; }
     setChgPrice = () => {
	     console.log(" tttttt avg price == " + this.avgPrice);
	     console.log(" prev avg price == " + this.prevAvgPrice);
	     this.chgPrice = this.avgPrice - this.prevAvgPrice; }
     
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
     getHighProfitFactor= () => { return this.highProfitFactor; }
     getSellPrice= () => { return this.sellPrice; }
     getHighSellPrice= () => { return this.highSellPrice; }
     setQtys = () => {
         this.sellQty = this.buyQty * this.qtyFactor;
	 this.highSellQty = this.buyQty * (1-this.qtyFactor);
     }
     getBuyQty =( ) => {return this.buyQty; }
     getSellQty =( ) => {return this.sellQty; }
     getHighSellQty =( ) => {return this.highSellQty; }
     getHighProfitFactor =( ) => {return this.highProfitFactor; }
     setBuyQty = (qty) => { this.buyQty = qty; }
     setSellQty = (qty) => { this.sellQty = qty; }
     setHighSellQty = (qty) => { this.highSellQty = qty; }
     setHighProfitFactor = (factor) => { this.highProfitFactor = factor; }
     setSellPrice = () => { this.sellPrice = this.maxPrice.toFixed(2); }
     setHighSellPrice = (lowProfit) => {
	     let lp = parseFloat(lowProfit);
	     let sp = parseFloat(this.sellPrice);
	     let hpfactor = parseFloat(this.highProfitFactor);
	     let hsp = sp + (lp*hpfactor);
	     this.highSellPrice = hsp.toFixed(2);
     }
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
