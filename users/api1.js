var express = require('express');
var router = express.Router();
var BDB = require("../data/BDB");

var router = express.Router();
module.exports = router; 

router.route("/users/submit"){
.get(function(req,res){
	res.render('index');
})
.post(function(req, res, next) {
	BDB.con.connect(function(err) {
		if (err) throw  err;
		console.log("connected");
		var sql = "INSERT INTO `Users`(`username`, `email`, `pass_word`) VALUES ('"+req.body.name+"', '"+req.body.email+"', '"+req.body.pass+"')";
		BDB.con.query(sql, function(err, result)  {
			if(err) throw err;
			console.log("table created");
		});
	});
	
});