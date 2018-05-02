var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var jade = require('jade');
var BDB = require('./data/BDB');


var app=express();

var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('view engine', 'jade');

app.get('/submitTag',function(req,res){
	res.render('createTag');
});

app.post('/submitTag',urlencodedParser, function(req, res, next) {
	BDB.con.connect(function(err) {
		if (err) throw  err;
		console.log("connected");
		var sql = "INSERT INTO `Tags`(`tag_name`) VALUES ('"+req.body.Tname+"')";
		BDB.con.query(sql, function(err, result)  {
			if(err) throw err;
			console.log("tag submit");
		});
	});
	res.render('createTag', { title: 'Express' });
});