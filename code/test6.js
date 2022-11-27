// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"r
const __dirname = path.dirname(__filename);
var x=999;
const test1 = [{name: 'john'}, {name: 'fred'}, {name: 'll'}];

let g = test1.map(item => {
	let g=[];
    console.log("item = "+ JSON.stringify(item));
    if (item["name"] == 'fred') { console.log("fred fnd");x=10; g.push(item);
	
    }
	return g;
})

let y1 = test1.some(item => item["name"] == 'fred');

console.log(test1);
console.log(JSON.stringify(g));
console.log(x);
