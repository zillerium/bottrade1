// Dependencies
import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"r
const __dirname = path.dirname(__filename);

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'us-east-1'});

// Create S3 service object
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
const listObjectsInBucket = (bucketName) => {
    var bucketParams = {
	    Bucket: bucketName
    }

    s3.listObjects(bucketParams, function(err, data) {
        if (err) {
            console.log("error == ", err);
	} else {
            console.log("sucecss == ", data);
	}
    });


}
listObjectsInBucket('nnnnn1');
