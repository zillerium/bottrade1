const fs = require("fs");
const http = require("http");
const https = require("https");

const express = require("express");

const app = express();
const asyncHandler = require("express-async-handler");
const result = require("dotenv").config();

request = require("request");
const bodyParser = require("body-parser");
var wget = require("node-wget");
var url = require("url");
var path = require("path");



app.get("/api/ping", function (req, res) {
  res.json({ message: "pong" });
});

app.use("/", express.static(path.join(__dirname, "/html")));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(
  "/api/testapi",
  asyncHandler(async (req, res, next) => {
    var walletId = req.body.walletId;
   
    console.dir(walletId);
    res.json({ response: "ok", message: walletId });
  })
);


app.post(
    "/api/settestapi",
    asyncHandler(async (req, res, next) => {
      var walletId = req.body.walletId;
      var msg = "wallet was set " + walletId;
      console.dir(walletId);
      res.json({ response: "ok", message: msg });
    })
  );
  
  

const httpServer = http.createServer(app);

httpServer.listen(3000, () => {
  console.log("HTTPS Server running on port 3000");
});
