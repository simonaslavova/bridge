var fs = require('fs');
var express = require('express');
var app = express();
var router =express.Router();
var bodyParser = require('body-parser');
var mysql = require('mysql');
var jade = require('jade');


var db = mysql.createConnection({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "",
	database: "Bridge",

});
var bparser = bodyParser.urlencoded({ extended: false});
app.set('view engine' , 'jade');
app.get('/register', function(req,res){
	res.render('start');
});

app.post('/start', bparser, function(req, res, next){
	console.log(req.body.username);
	console.log(req.body.email);
	console.log(req.body.password);
	db.connect(function(err){
		if (err) throw err;
		console.log("connected");
		var sql = "INSERT INTO `Users` (`username`) VALUES ('"+req.body.username+"')";
		db.query(sql, function(err, result) {
			if(err) throw err;
			console.log("record inserted");
		});
	});
	res.render('start',{title:'Express'});
});

app.listen(3000, function(){
	console.log("HAPPY BDAY");
});




//register new user
/*	db.connect(function(err) {
		if (err) throw err;
		console.log("Connected!");
		var sql = "INSERT INTO Users (username, email, pass_word ) VALUES ('uname', 'email', 'pass')";

		db.query(sql, function (err, result) {
			if (err) throw err;
			console.log("new user inserted: " + result.insertId);
		});
	});
	*/


/*db.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	var sql = "INSERT INTO Users (username, email ) VALUES ('Carlos e Rui MVP', 'google@gmail.com')";

	db.query(sql, function (err, result) {
		if (err) throw err;
		console.log("1 record inserted");
	});
});

db.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	var sql = "INSERT INTO Users (username, email ) VALUES ('Carlos e Rui MVP', 'google@gmail.com')";

	db.query(sql, function (err, result) {
		if (err) throw err;
		console.log("1 record inserted");
	});
});

db.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	var sql = "INSERT INTO Users (username, email ) VALUES ('Carlos e Rui MVP', 'google@gmail.com')";

	db.query(sql, function (err, result) {
		if (err) throw err;
		console.log("1 record inserted");
	});
});

db.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	var sql = "INSERT INTO Users (username, email ) VALUES ('Carlos e Rui MVP', 'google@gmail.com')";

	db.query(sql, function (err, result) {
		if (err) throw err;
		console.log("1 record inserted");
	});
});

db.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
	var sql = "INSERT INTO Users (username, email ) VALUES ('Carlos e Rui MVP', 'google@gmail.com')";

	db.query(sql, function (err, result) {
		if (err) throw err;
		console.log("1 record inserted");
	});
});


*/