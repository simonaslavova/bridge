var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bodyParser = require('body-parser');

var multer = require('multer'); 
var path   = require('path');

var idMaster;
var router = express.Router();
module.exports = router; 

//Bcrypt
var bcrypt = require('bcrypt');
const saltRounds = 10;

//Pasport
var cookieParser = require('cookie-parser')
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

router.use(cookieParser());
router.use(passport.initialize());
router.use(passport.session());
router.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

passport.use(new LocalStrategy(function(username, password, done){
	console.log(username);
	console.log(password);
	return done(null, 'lala');
    }
));

const options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "Bridge",
  //socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
};
var sessionStore = new MySQLStore(options);

router.use(session({
	secret: 'keyboard cat',
	resave: false,
	store: sessionStore,
	saveUnitialized: false ,
	//cookie:{secure:true}
}))

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

/*Local - for local database strategy
router.post('/start', passport.authenticate('local', {

successRedirect: 'users/login',
failureRedirect: 'users/start'

}));
*/

router.get('/start', (req,res)=>{
//  deserializeUser ... if so - creates a session and returns a session key
  console.log(req.user);
  console.log(req.isAuthenticated());
  res.render('start');
});

router.get("/profile", function(req,res){
	res.render('profile');
	/*con.query("SELECT * FROM `Users` WHERE `id_user`=id_user", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
	    res.render('profile',{result: JSON.stringify(result)});
	});
	*/
});

router.get("/start", function(req,res){
	con.query("SELECT * FROM `Users`", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
	    res.render('start',{result: JSON.stringify(result)});
	});
});

router.post('/start',urlencodedParser, function(req, res) {
    var pass = req.body.pass;

	if(req.body.pass==req.body.passC && req.body.name!="" && req.body.email!=""){
		//pass=req.body.pass;
		//console.log("second");
		

		bcrypt.hash(pass, saltRounds, function(err, hash){

			let sql = "INSERT INTO `Users`(`id_user`, `username`, `email`, `password`) VALUES (NULL, ?, ?, ?)";
			var vals = [req.body.name, req.body.email, hash];

			con.query(sql, vals, function(err, result)  {
				if(err) throw err;
				//console.log("user created");
				let sql = "SELECT LAST_INSERT_ID() as id_user";

				con.query(sql,(err,result)=>{
                  if(err)throw err;

                  var id_user = result[0];
                  console.log(result[0]);

                  //LOGIN USER-create a session
                     req.login(id_user,function(err){

                     //res.redirect('/users/login');  

                     });
			     });
		    });
		res.redirect("/users/login");
	    });
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

router.get("/main", function(req,res){
	res.render('main');
});

router.get("/login", function(req,res){
	res.render('login');
});

router.post("/login"
	/*, passport.authenticate('local',{
	successRedirect: '/profile',
	failureRedirect: '/login'
    })*/
    , urlencodedParser, function(req,res){
	var username = req.body.username;
	var password = req.body.pass;
	let vals=[req.body.username];
	con.query("SELECT * FROM `Users` WHERE `username`=?", vals, function (err, result, fields) {
		if(result.length>0){
			if (bcrypt.compareSync(password, result[0].password))
				res.redirect("/users/profile");
			else
				res.redirect("/users/login");
		}
		else
			res.redirect("/users/login");
	});
});

router.get("/logout", function(req,res){
	req.logout();
	req.session.destroy();
	res.render('login');
});

/*router.get("/profile", authenticationMiddleware(), function(req,res){
	res.render('profile');
	//console.log(idMaster);
	//var tagID;
	var userFriends=[];
	var userFriendlist=[];

	//this is just a query check to make sure the right userID is getting passed from the login, could be commented out later
	con.query("SELECT * FROM `Users` WHERE `id_user`= '"+idMaster+"'", function (err, result, fields) {
		if (err) throw err;
		console.log(result);
	});

//<<<<<<< HEAD
	

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
	//});


	//create query to find all chats the user is in and inside who each person inside that chat is

//=======
});
//>>>>>>> 0ed60bdb3005505bfd42b1a406d868b31eb1ffd6
*/

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

router.get('/findRandomChat',(req,res)=>{
	let sql = 'SELECT * FROM Users';
	db.query(sql,(err,result)=>{
		if(err)throw err;
		console.log(result);
		res.send(result);

	});
});


//writing user data in the session
passport.serializeUser(function(id_user, done) {
  done(null, id_user);
});

//retrieving user datafrom the session
passport.deserializeUser(function(id_user, done) {
  done(null, id_user);
});

function authenticationMiddleware() {  
  return (req, res, next) => {
    console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

      if (req.isAuthenticated()) return next();
      res.redirect('/users/login')
  }
}

//upload pics

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploaded')
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

router.get('/imginsert', function(req,res){
	res.render('profile');
});


router.post('/imginsert',multer({
    storage: storage,
    fileFilter: function(req, file, callback) {
        var ext = path.extname(file.originalname)
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') 
                    {
            return callback(res.end('Only images are allowed'), null)
        }
        callback(null, true)
    }
}).single('file'), function(req, res) {
 /*img is the name that you define in the html input type="file" name="img" */       
 
        var query = con.query("INSERT INTO `Pictures`(`profile_picture`) VALUES ('"+req.file.path+"')" ,function(err, rows)      
        {                                                      
          if (err)
            throw err;
         res.redirect('/users/profile');
        });

        //console.log(query.sql);
        //console.log(req.file);
    });
