var json = [{"symbol":"BTCUSDT","orderId":15104494125,"clientOrderId":"web_1e3d4378460b4bc88627c6a89cc18ae9","price":"17451.43","origQty":"0.025","executedQty":"0","cummulativeQuoteQty":"0","status":"NEW","timeInForce":"GTC","type":"LIMIT","side":"SELL","stopPrice":"0","icebergQty":"0","time":1667623112373,"updateTime":1667623112373,"isWorking":true,"isIsolated":true},{"symbol":"BTCUSDT","orderId":15146549389,"clientOrderId":"web_4ce92a216f074d8a92395edc668345e2","price":"21400","origQty":"0.025","executedQty":"0","cummulativeQuoteQty":"0","status":"NEW","timeInForce":"GTC","type":"LIMIT","side":"SELL","stopPrice":"0","icebergQty":"0","time":1667750973187,"updateTime":1667750973187,"isWorking":true,"isIsolated":true}];


main();
function main() {
let arr = [[2,1], [3,3]];
	json.map(m =>{
           console.log(m["price"]);
           console.log(m["origQty"]);
		let val = parseFloat(m["price"])*parseFloat(m["origQty"]);
	        let	priceInt = parseInt(parseFloat(m["price"])/100)*100;
		console.log("val int " + priceInt);
		let m1 = arr.some(n=>n[0]==priceInt);
		console.log("m1 == "+ m1);
		if (m1) {
                       arr.map(n=>{
			       if (n[0] == priceInt) n[1] +=val;
		       })
		} else {
			arr.push([priceInt,val]); 
		}
	})
console.log("json == " + JSON.stringify(json));
console.log("arr key == " + arr[2][0]);
console.log("arr key == " + Object.keys(arr));
console.log("arr val == " + Object.values(arr));
}
