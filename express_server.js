var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
	return((user ==='cs360')&&(pass==='test'));
});
var bodyParser = require('body-parser');
var app = express();
app.use('/', express.static('./html', {maxAge: 60*60*1000}));
app.use(bodyParser());
var options = {
	host: '127.0.0.1',
	key: fs.readFileSync('ssl/server.key'),
	cert: fs.readFileSync('ssl/server.crt')
};

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/', function(req, res) {
	res.send("Try /getcity or /dbquery.html");
});
app.get('/getcity', function(req, res) {
	res.send("Get city not implemented. Sorry!");
});
app.get('/comment', function(req, res) {
	//console.log("comment route");
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
		if(err) throw err;
		db.collection("comments", function(err, comments){
		  if(err) throw err;
		  comments.find(function(err, items){
		    items.toArray(function(err, itemArr){
		      //console.log("Doc arr: ");
		      //console.log(itemArr);
		      res.status(200);
		      res.end(JSON.stringify(itemArr));
		    });
		  });
		});
	});
});
app.post('/comment', auth, function(req,res) {
	//console.log("comment route");
	/*var jsonData = "";
	req.on('data',function(chunk) {
		jsonData += chunk;
	});
	req.on('end', function() {
		var reqObj = JSON.parse(jsonData);
		console.log(reqObj);
		console.log(reqObj.body.Name);
		console.log(reqObj.body.Comment);
	});*/
	
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
		if(err) throw err;
		db.collection('comments').insert(req.body, function(err, records) {
			//console.log("record added as "+records[0]._id);
		});
		res.writeHead(200);
		res.end();
	});
	//res.send("post stuff");
	//res.status(200);
	//res.end();
});

