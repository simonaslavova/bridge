var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var BDB = require("./data/BDB");
var bodyParser = require('body-parser');

var router = express.Router();
module.exports = router; 

var con = mysql.createConnection({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "",
	database: "Bridge",
});

var urlencodedParser = bodyParser.urlencoded({ extended: false });

con.connect(function(err) {
	if (err) throw err
});

router.get("/start", function(req,res){
	 con.query("SELECT * FROM `Users`", function (err, result, fields) {
     if (err) throw err;
     console.log(result);
   });

		res.render('start');
	});



router.post('/start',urlencodedParser, function(req, res, next) {

		console.log("connected");
		var sql = "INSERT INTO `Users`(`username`, `email`, `pass_word`) VALUES ('"+req.body.name+"', '"+req.body.email+"', '"+req.body.pass+"')";
		con.query(sql, function(err, result)  {
			if(err) throw err;
			console.log("table created");
		});
		res.redirect("/users/login");
});
router.get("/login", function(req,res){
		res.render('start');
	});
	
router.get("/login", function(req,res){
		res.render('login');
	});
	
router.get("/profilepage", function(req,res){
		res.render('profilepage');
	});
	
router.post("/login",urlencodedParser, function(req,res){
     	var username = req.body.username;
		console.log(username);
		var password = req.body.pass;
	con.query("SELECT * FROM `Users`", function (err, result, fields) {
		
		for(var i =0; i<result.length; i++){
			if(result[i].username == username){
				console.log("thats me");
			}
		}
	});
	res.redirect("/users/login");
});


router.get('/submitTag',function(req,res){

	 con.query("SELECT * FROM `Tags`", function (err, result, fields) {
     if (err) throw err;
     console.log(result);
     //res.json(result);
     res.render('submitTag');
   });

	//res.render('submitTag');

});

router.post('/submitTag',urlencodedParser, function(req, res, next) {
	// con.connect(function(err) {
	// 	if (err) throw  err;
		console.log("connected");
		var sql = "INSERT INTO `Tags`(`tag_name`) VALUES ('"+req.body.Tname+"')";
		con.query(sql, function(err, result)  {
			if(err) throw err;
			console.log("tag submit");
			//console.log(result);
		});
				res.redirect("/users/submitTag");

	//});
	//res.render('createTag', { title: 'Express' });
});



