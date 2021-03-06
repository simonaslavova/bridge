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
	var hashedPass;

	console.log("connected");
	if(req.body.pass==req.body.passC && req.body.name!="" && req.body.email!=""){
		hashedPass=req.body.pass;

		bcrypt.hash(hashedPass, saltRounds, function(err, hash){

			//var sql = "INSERT INTO `Users`(`username`, `email`, `pass_word`) VALUES ('"+req.body.name+"', '"+req.body.email+"', '"+hash+"')";

			var sql = "INSERT INTO `Users`(`username`, `email`, `pass_word`) VALUES (?, ?, ?)";
			var vals = [req.body.name, req.body.email, hash];

			con.query(sql, vals, function(err, result)  {
				if(err) throw err;
				console.log("table created");
			});
		});
		res.redirect("/users/login");
	}
	else
		res.redirect("/users/start");
});


router.get("/login", function(req,res){
	res.render('login');
});
//use the "?" notation to circumvent security flaws, apply to rest of code later
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

	//finds the tag associated with the logged in user in the "taglist" intermediate table and then gets the tag name from the "tags" table
	//DOESNT WORK IF USER DOESNT HAVE TAGS ON LOGIN
	// con.query("SELECT * FROM `taglist` WHERE `id_user`='"+idMaster+"'", function (err, result, fields) {
	// 	if (err) throw err;
	// 	if(result!=null)
	// 	{
	// 		console.log(result);
	// 		tagID=result[0].id_tag;
	// 		con.query("SELECT `tag_name` FROM `tags` WHERE `id_tag`='"+tagID+"'", function (err, result, fields){
	// 			if (err) throw err;
	// 			console.log(result);
	// 		});
	// 	}
	// });

	// //create query to find all of the users friends. FIND WAY TO MAKE FRIENDLIST AN ARRAY WHERE IT STORES FRIEND ID AND FRIEND NAME, MAYBE CHANGE DATABSE
	// con.query("SELECT * FROM `friendlist` WHERE `id_user`= '"+idMaster+"'", function (err, result, fields) {
	// 	if (err) throw err;
	// 	if(result!=null)
	// 	{
	// 		for(z=0;z<result.length;z++)
	// 			userFriends.push(result[z].id_friend);
	// 		console.log(userFriends);

	// 		for(z=0;z<userFriends.length;z++)
	// 		{
	// 			con.query("SELECT `username` FROM `users` WHERE `id_user`='"+userFriends[z]+"'", function (err, result, fields){
	// 				if (err) throw err;
	// 				console.log(result);
	// 			});
	// 		}

	// 	}
	// });


	//create query to find all chats the user is in and inside who each person inside that chat is

});

router.get('/submitTag',function(req,res){
	var taglist;

	con.query("SELECT * FROM `Tags`", function (err, result, fields) {
		if (err) throw err;
		taglist = result;
		console.log(taglist);
		displayTags(taglist);
		//console.log("idMaster" + idMaster);

     //res.json(result);
     res.render('submitTag');
 });
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


//SHOULD UPLOAD TO TAGLIST CURRENT LOGGED IN USER AND THE INPUT OF WHATVER TAG ID WE PUT IN		
router.get('/tagToUser',function(req,res) {

	con.query("SELECT `tag_name` FROM `Tags`", function (err, result, fields) {
		if (err) throw err;
		console.log(result);

		res.render('tagToUser');
		//res.render('tagToUser', {data: "studff"}); can send info inside of render as if it was a res.send into the html/jade file
	});
});

router.post('/tagToUser',urlencodedParser, function(req, res, next) {
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

router.post('/messageToChat',urlencodedParser, function(req, res, next) {
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


// router.get('/taglist', function(req,res){

// 	con.query("SELECT * FROM ´Tags`", function (err, result, fields){
// 		if (err) throw err;
// 		console.log(result);
// 		res.render(result);



// 	});

// });

function displayTags (taglist)
{
	for(var z=0; z<taglist.length; z++)
	{
		console.log(taglist[z].tag_name);
	}
	console.log("function working");
}

/*function find_chat_random (tagid)
{
	var match_list = [];
	var t= 0;

	con.query("SELECT * FROM `taglist` WHERE `id_tag`='"+tagid+"' AND `id_user`!='"+idMaster+"'", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
		result = result[Math.floor(Math.random() * result.length)];
		console.log(result);

	});

		for(var z=0; z < user_list.length; z++)//goes through each user
		{
			for(var y=0; y < user_list[z].tags.length; y++)//goes through each tag of the user
			{
				for(var x=0; x<tag_names.length; x++)
				{
					if(user_list[z].tags[y].name==tag_names[x])
						t++;
					//console.log("comparing tags to given list");
				}
				//console.log("each tag of each user");
			}

			if(t==tag_names.length)
			{
				match_list.push(user_list[z]);
				console.log("match");
			}
			//console.log("user list loop");

			t=0;
		}
		//console.log("full function");

		var result = match_list[Math.floor(Math.random() * match_list.length)];//picks random user out of the list of matches
		//setup chat with 'result'
	}

	*/


router.get('/findChat',function(req,res){

	con.query("SELECT * FROM `taglist` WHERE `id_tag`='"+tagid+"' AND `id_user`!='"+idMaster+"'", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
		res.send(result);

	});
});
