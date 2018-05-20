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
router.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
router.use(bodyParser.json());

var cookieParser = require('cookie-parser')
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

router.use(cookieParser());
router.use(passport.initialize());
router.use(passport.session());
router.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});


/*passport.use(new LocalStrategy(
	function(username, password, done){
	console.log(username);
	console.log(password);

    db.query('SELECT id_user, password FROM user WHERE username = ?',[username], (err,result)=>{
      if(err)throw err;

          console.log(result[0]);

      //if nothing is returned
      if(result.length===0){
        console.log("Empty");
        done(null,false);
      }

      const hash = result[0].password.toString();
      var res = bcrypt.compareSync(password, hash);

            if(res===true){

              return done(null, {user_id:result[0].id});

            }else{

              done(null,false);
            }

    });
	return done(null, 'lala');
    }
));*/

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
	})
);

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

router.get("/start", (req,res)=>{
	res.render('start');
});

router.post("/start", function(req, res) {
    var pass = req.body.pass;

	if(req.body.pass==req.body.passC && req.body.name!="" && req.body.email!=""){

		bcrypt.hash(pass, saltRounds, function(err, hash){

			let sql = "INSERT INTO `Users`(`id_user`, `username`, `email`, `password`) VALUES (NULL, ?, ?, ?)";
			var vals = [req.body.name, req.body.email, hash];

			con.query(sql, vals, function(err, result)  {
				if(err) throw err;
				let sql = "SELECT LAST_INSERT_ID() as id_user";

				con.query(sql,(err,result)=>{
                  if(err)throw err;

                  var id_user = result[0].id_user;
                  console.log(result[0]);

                  //LOGIN USER-create a session
                    req.login(id_user,function(err){
                    	res.redirect('/users/profile');  
                    });
			     });
		    });
	    });
	    res.redirect('/users/login');
	}
	else
		res.redirect('/users/start');
	
});

router.get("/profile", authenticationMiddleware(), function(req,res){
	console.log(req.user);
	res.render('profile');
	/*con.query("SELECT * FROM `Taglist`", function (err, rows, fields) {
	if (err) throw err;
	res.render('profile',{tags: rows});
	console.log(rows.tag_name);
	});*/
});

router.get("/login", function(req,res){
	res.render('login');
});

router.post("/login", function(req,res){
	var username = req.body.username;
	var password = req.body.pass;

	con.query("SELECT * FROM `Users` WHERE `username`=?", username, function (err, result, fields) {
		if(result.length>0){
			console.log("1");
			if (bcrypt.compare(password, result[0].password)){
				console.log("2");
				var id_user = result[0].id_user;
					req.login(id_user, function(err){
						console.log(req.user);
						//res.render('profile',{user: result});
						res.redirect('/users/profile');
					});
			else
			console.log("5");
			res.redirect('/users/login');
			}
			
		}
	});
});

router.get("/logout", function(req,res){
	req.logout();
	req.session.destroy();
	res.render('login');
});

passport.serializeUser(function(id_user, done) {
  done(null, id_user);
});

//retrieving user datafrom the session
passport.deserializeUser(function(id_user, done) {
  done(null, id_user);
});

function authenticationMiddleware() {  
  return (req, res, next) => {
    //console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

      if (req.isAuthenticated()) return next();
      res.redirect('/users/login')
  }
}
