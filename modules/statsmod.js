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
        this.statsDb= [];
	    this.totTakeVal = 0;
	    this.takeLimit = 0;
	    this.inRange = false;
	    this.saleDone = false;
	    this.changeRange = false;
	    this.inBuyRange = false;
	    this.dupSale = false;
	    this.errJson = [];
	    this.orderJson = [];
	    this.botBuyRange = 0;
	    this.topBuyRange = 0;
	    this.orderCat= 0;
	    this.priceBuyVariant= 0;
	    this.priceVariant= 0;
	    this.rangePrice= 0;
	    this.txnType = 'BUY';
	    this.keyOrderVars = {};
    }
     setKeyOrderVars = () => {

        this.keyOrderVars = {
		priceBuyVariant: this.priceBuyVariant,
		priceVariant: this.priceVariant,
             rangePrice: this.rangePrice,
        topBuyRange: this.topBuyRange,
        botBuyRange: this.botBuyRange,
        inBuyRange: this.inBuyRange,
        changeRange: this.changeRange,
        saleDone: this.saleDone,
        dupSale: this.dupSale,
        orderRef: this.orderRef,
        inRange: this.inRange,
        totTakeVal: this.totTakeVal,
        takeLimit: this.takeLimit
            


	}

     }
     getKeyOrderVars = () => {return this.keyOrderVars };
     getRangePrice = () => {return this.rangePrice };
     setRangePrice = (price) => { this.rangePrice= price };
     getPriceVariant = () => {return this.priceVariant };
     setPriceVariant = (price) => { this.priceVariant= price };
     getPriceBuyVariant = () => {return this.priceBuyVariant };
     setPriceBuyVariant = (price) => { this.priceBuyVariant= price };
     getTotTakeVal = () => {return this.totTakeVal };
     setTotTakeVal = (total) => { this.totTakeVal = total };
     getTakeLimit = () => {return this.takeLimit };
     setTakeLimit = (limit) => { this.takeLimit = limit };
     getInRange = () => {return this.inRange };
     setInRange = (range) => { this.inRange = range };
     getSaleDone = () => {return this.saleDone };
     setSaleDone = (sale) => { this.saleDone = sale };
     getChangeRange= () => {return this.changeRange };
     setChangeRange = (range) => { this.changeRange = range };
     getOrderCat= () => {return this.orderCat };
     setOrderCat = (cat) => { this.orderCat = cat };
     getInBuyRange= () => {return this.inBuyRange };
     setInBuyRange = (range) => { this.inBuyRange = range };
     
     getOrderRef= () => {return this.orderRef };
     setOrderRef = (ref) => { this.orderRef = ref };
     getBotBuyRange= () => {return this.botBuyRange };
     setBotBuyRange = (range) => { this.botBuyRange = range };
     getTopBuyRange= () => {return this.topBuyRange };
     setTopBuyRange = (range) => { this.topBuyRange = range };
     getTxnType= () => {return this.txnType };
     setTxnType = (type) => { this.txnType = type };


	getDupSale= () => {return this.dupSale };
     getErrJson= () => {return this.errJson };
     getOrderJson= () => {return this.orderJson };
     setDupSale = (dup) => { this.dupSale = dup };
     setErrJson = () => {

          this.errJson.push({ 
		  totTakeVal: this.totTakeVal, 
		  takeLimit: this.takeLimit, 
		  inRange: this.inRange, 
		  saleDone: this.saleDone, 
		  changeRange: this.changeRange,
		  inBuyRange: this.inBuyRange, 
		  dupSale: this.dupSale, 
		  err: null 
	      });


      }
	setOrderJson = () => {
             let p = {
                 sellPrice: this.sellPrice,
                 buyPrice: this.buyPrice,
                 orderRef: this.orderRef,
                 topBuyRange: this.topBuyRange,
                 botBuyRange: this.botBuyRange,
                 inRange: this.inRange,
                 qty: this.buyQty,
                 txnType: this.txnType,
                 cat: this.orderCat
            };
		this.orderJson.push(p);
           console.log("ppppppppppppppppppppp => "+ JSON.stringify(p));
	}
   setErrForJson = () => {
                          this.errJson.map(m => {
                               m["err"]= 
			       !(!m["inRange"] &&
                                !m["saleDone"] &&
                                (m["totTakeVal"] < m["takeLimit"]) &&
                                !m["changeRange"] &&
                                !m["saleDone"] &&
                                 m["inBuyRange"] &&
                                !m["dupSale"])}
                                 )


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
     getStatsDb = () => {return this.statsDb };
     setStatsDb = (stats) => { this.statsDb = stats };
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
     setBuyPriceVal = (val) => { this.buyPrice = val; }
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
     setSellPriceVal = (price) => { this.sellPrice = price; }
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
      console.log(" get moves len = " + this.getPriceMoves().length);
      console.log(" get moves len rsin = " + this.getRSIN());

      if (this.getPriceMoves().length >= this.getRSIN()) {
           this.SAMoves();
           let rs = this.getJsonAvg().upAvg/this.getJsonAvg().downAvg;
           console.log("**************** rs === " + rs);
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
