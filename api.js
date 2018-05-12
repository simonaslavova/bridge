var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

var router = express.Router();
module.exports = router; 

var idMaster;
const saltRounds = 10;


var con = mysql.createConnection({
	host: "localhost",
	port: 3306,
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
	var hashedPass;
	console.log("first");

	if(req.body.pass==req.body.passC && req.body.name!="" && req.body.email!=""){
		hashedPass=req.body.pass;
		console.log("second");

		bcrypt.hash(hashedPass, saltRounds, function(err, hash){

			var sql = "INSERT INTO `Users`(`username`, `email`, `pass_word`) VALUES (?, ?, ?)";
			var vals = [req.body.name, req.body.email, hash];

			con.query(sql, vals, function(err, result)  {
				if(err) throw err;
				console.log("user created");
			});
		});
		res.redirect("/users/login");
	}
	else
		res.redirect("/users/start");
});

router.get('/submitTag',function(req,res){
	con.query("SELECT * FROM `Tags`", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
		res.render('submitTag', {result: JSON.stringify(result)});
	});
});

router.post('/submitTag', function(req, res) {
	var q = "INSERT INTO `Tags`(`tag_name`, `category`) VALUES (?,?)";
	var values = [req.body.Tname, req.body.Tcategory];
	con.query(q, values, function(err, result) {
		if(err) throw err;
		console.log("tag submit");
	});
	res.redirect("/users/submitTag");
});

router.get("/login", function(req,res){
	res.render('login');
});

router.post("/login",urlencodedParser, function(req,res){
	var username = req.body.username;
	var password = req.body.pass;
	let vals=[req.body.username];
	con.query("SELECT * FROM `Users` WHERE `username`=?", vals, function (err, result, fields) {
		if(result.length>0){
			if (bcrypt.compareSync(password, result[0].pass_word))
				res.redirect("/users/profile");
			else
				res.redirect("/users/login");
		}
		else
			res.redirect("/users/login");
	});
});

router.get("/profile", function(req,res){
	res.render('profile');
	console.log(idMaster);
	var tagID;
	var userFriends=[];
	var userFriendlist=[];

	//this is just a query check to make sure the right userID is getting passed from the login, could be commented out later
	con.query("SELECT * FROM `Users` WHERE `id_user`= '"+idMaster+"'", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
	});
});


//SHOULD UPLOAD TO TAGLIST CURRENT LOGGED IN USER AND THE INPUT OF WHATVER TAG ID WE PUT IN		
router.get('/tagToUser',function(req,res){
	res.render('tagToUser');

	con.query("SELECT `tag_name` FROM `Tags`", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
	});
});

router.post('/tagToUser', function(req, res, next) {
	var sql5 = "INSERT INTO `taglist`(`id_tag`, `id_user`) VALUES ('"+req.body.Tid+"', '"+idMaster+"')";

	con.query(sql5, function(err, result)  {
		if(err) throw err;
		console.log("tag " + req.body.Tid + " added to user " + idMaster);
	});

	res.redirect("/users/Tagtouser");
});

//send text message to defined chat
router.get('/messageToChat',function(req,res){
	res.render('messageToChat');
});

router.post('/messageToChat', function(req, res, next) {
	var sent= "sent";
	var sql88 = "INSERT INTO `ChatMessage`(`id_chat`, `id_user`, `content`, `sender`, `state`) VALUES ('"+req.body.Cid+"', '"+idMaster+"', '"+req.body.Cmessage+"', '"+idMaster+"', '"+sent+"')";

	con.query(sql88, function(err, result)  {
		if(err) throw err;
	});

	con.query("SELECT * FROM `ChatMessage` WHERE `id_chat`= '"+req.body.Cid+"'", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
	});


	res.redirect("/users/MessageToChat");
});

//create a chat
router.get('/createChat',function(req,res){
	res.render('createChat');
});

router.post('/createChat', function(req, res, next) {
	var sq2 = "INSERT INTO `Chat`(`title`) VALUES ('"+req.body.Title+"')";

	con.query(sq2, function(err, result)  {
		if(err) throw err;
	});

	res.redirect("/users/InviteToChat");
});

//add user to a chat
router.get('/InviteToChat',function(req,res){
	res.render('InviteToChat');
});

router.post('/InviteToChat', function(req, res, next) {
	var sq9 = "INSERT INTO `userChat`(`id_user`, `id_chat`) VALUES ('"+req.body.InviteID+"', '"+req.body.chatID+"')";

	con.query(sq9, function(err, result)  {
		if(err) throw err;
	});

	res.redirect("/users/InviteToChat");
});

function displayTags (taglist)
{
	for(var z=0; z<taglist.length; z++)
	{
		console.log(taglist[z].tag_name);
	}
	console.log("function working");
}

app.get('/findRandomChat',(req,res)=>{
	let sql = 'SELECT * FROM Users';
	db.query(sql,(err,result)=>{
		if(err)throw err;
		console.log(result);
		res.send(result);

	});
});




