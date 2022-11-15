class StatsMod {
  constructor( 
    )   
    {   
        this.priceUD = {};
        this.priceUDdef = { "up": 0.00, "down": 0.00};
        this.priceMoves = [];
        this.jsonAvg = {};
    }

     getJsonAvg = () => { return this.jsonAvg; }
     getPriceMoves = () => { return this.priceMoves; }
     removePriceMove = () => { this.priceMoves.splice(0, 1); }
     addPriceMove = (priceMove) => { this.priceMoves.push(priceMove); }
     

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
