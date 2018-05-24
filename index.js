var express = require('express');
var bodyParser = require('body-parser');
var jade = require('jade');
var router = express.Router();
var bcrypt = require('bcrypt');

var cookieParser = require('cookie-parser')
var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

var {con, options} = require('./db.js')

var app = express();
var sessionStore = new MySQLStore(options);

app.use(express.static("node_modules/bootstrap/dist"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.use('local-login', new LocalStrategy(
  function(username, password, done) {
    console.log("Local username: ",username);

    con.query('SELECT * FROM Users WHERE username = ?',[username], (err,result)=>{
      if(err)throw err;

      //if nothing is returned
      if(result.length === 0){
        console.log("Empty");
        done(null, false);
        return;
      }

      console.log("Result", result[0]);

      const hash = result[0].password.toString();
      var res = bcrypt.compareSync(password, hash);
        if(res===true){
          console.log("Match")
          done(null, result[0]);
        }else{
        	console.log("Fail")
          done(null,false);
        }
    });
  }
));

//writing user data in the session
passport.serializeUser(function(user, done) {
  done(null, user);
});

//retrieving user datafrom the session
passport.deserializeUser(function(user, done) {
  let userQuery = "SELECT id_user FROM users WHERE id_user = ?;";
  let vals = [user.id_user];

  con.query(userQuery, vals, function (sqlerr, result) {
   	done(null, result[0]);
  });
});

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false
}));

app.set("views", "./views");
app.set('view engine', 'jade');


// Routes
app.get('/', function (req,res) {
	res.render("start", { title: "Home"});
});

var apiRouter = require("./api");
app.use("/users", apiRouter);

// Start
app.listen(3000,function(){
	console.log("Sever listening on port 3000");	
});

module.exports = router;