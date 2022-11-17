// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"r
const __dirname = path.dirname(__filename);

// Load the AWS SDK for Node.js
var fs = require('fs');
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create S3 service object
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
const filepath = "bucketname.json";
const params = {
	Bucket: 'kkkkkk1',
	Key: 'bucket1.txt'
};

s3.getObject(params, (err, res) => {
    if (err === null) {
        //res.attachment('file1.txt');
	console.log(res.Body.toString('utf-8'));
	    fs.writeFileSync(filepath, res.Body.toString('utf-8'));
    } else {
	    console.log("error ---> " + err);
    }
}
);
