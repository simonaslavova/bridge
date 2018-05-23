var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var multer = require('multer'); 
var path   = require('path');
var passport   = require('passport');

var idMaster;

//Bcrypt
var bcrypt = require('bcrypt');
const saltRounds = 10;

var { con, options } = require('./db.js');

router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/users/profile',
	failureRedirect: '/users/login'
}));

function authenticationMiddleware() {
  return (req, res, next) => {
  	// console.log(`New session : ${JSON.stringify(req.sessionID)}`);
  	if(req.session.passport) {
  		req.user = req.session.passport.user;
  	}
    if (req.isAuthenticated()) return next();
    //if user not authenticated:
    res.redirect("/");
  };
}

router.post("/start", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var email = req.body.email;

  bcrypt.hash(password, saltRounds, function (err, hash) {
    let sqlid =
      "INSERT INTO `Users`(`id_user`, `username`, `email`, `password`) VALUES (NULL, ?, ?, ?)";
    let vals = [username, email, hash];
    con.query(sqlid, vals, function (err, result) {
      let sql = "SELECT LAST_INSERT_ID() as id_user";

      con.query(sql, (err, result) => {
        if (err) throw err;

        var id_user = result[0].id_user;
        console.log("New user with ID: " + id_user);

        //LOGIN USER-create a session
        req.login(id_user, function (err) {
          if (err) {
            return next(err);
          }
          res.redirect("/users/profile");
        });
      });
    });
  });
});

// router.post("/login", function(req,res){
//   var username = req.body.username;
//   var password = req.body.password;

//   let loginquery = "SELECT * FROM users WHERE username = ?;";
//   let vals = [username];

//   con.query(loginquery, vals, function (sqlerr, result) {
//     if (sqlerr) {
//       res.status(500);
//     } else {
//       // console.log(result[0]);
//       let hash = result[0].password;
//       bcrypt.compare(password, hash, function (err, bres) {
//         if (bres) {
//           console.log("Valid login");
//           var id_user = result[0].id_user;
//           req.login(id_user, function (err) {
//             //res.render('profile',{user: result});
//           	console.log(req.user);
//             res.redirect('/users/profile');
//           });
//         } else {
//           console.log("Invalid login");
//           res.redirect('/users/login');
//         }
//       });
//     }
//   });
// });

router.get("/start", (req,res)=>{
	res.render('start');
});

router.get("/login", function(req,res){
	res.render('login');
});

router.get("/profile", authenticationMiddleware(), function(req,res){
	console.log("Profile: ", req.user);
	var id = req.user.id_user;
	con.query("SELECT * FROM `Users` WHERE id_user = ?", id, function (err, result , fields) {
	if (err) throw err;
	console.log(result);
		con.query("SELECT * FROM `taglist` WHERE  id_user = ?", id, function (err, bres , fields) {
		if (err) throw err;
		console.log(bres);
		/*var id_tag = bres.id_tag;
			con.query("SELECT * FROM `tags` WHERE id_tag = ?", id_tag, function (err, yes, fields){
			if (err) throw err;
			console.log(yes);
			res.render('profile', {users: result, tags: yes});
			});*/
			res.render('profile', {users: result, tags: bres});
		});
	});
});

router.get("/logout", function(req,res){
	req.logout();
	req.session.destroy();
	res.redirect('/users/login');
	console.log("Log out");
});


router.get("/main", authenticationMiddleware(), function(req,res){
	//console.log("User: ", req.user);
	res.render('main');
	/*var tag = req.body.tag;
	con.query("SELECT * FROM `Tags` WHERE tag_name = tag", tag, function (err, result, fields) {
		if (err) throw err;
		//console.log(result);
			con.query("SELECT * FROM `Users` WHERE id_user = id", function (err, bres , fields) {
			if (err) throw err;
			//console.log(bres);
			res.render('main', {tags: result, users: bres});
			});
	});*/
});

router.get("/search", authenticationMiddleware(), function(req,res){
	res.redirect('/users/tagToUser');
});

router.post("/search", authenticationMiddleware(), function(req, res) {
	var tag = req.body.tag;
	var id = req.user.id_user;
	con.query("SELECT tag_name FROM `Tags` WHERE tag_name LIKE '%+tag+%'", tag, function (err, result, fields) {
		if (err) throw err;
		//console.log(result);
		res.render('tagToUser', {tags: result});
	});
});

//SHOULD UPLOAD TO TAGLIST CURRENT LOGGED IN USER AND THE INPUT OF WHATVER TAG ID WE PUT IN		
router.get('/tagToUser', authenticationMiddleware(), function(req,res){
	res.render('tagToUser');
});

router.post('/tagToUser', authenticationMiddleware(), function(req, res, next) {
	//con.query("SELECT * FROM `Tags`", function (err, result, fields) {
		if (err) throw err;
		let vals = [result.id_tag, req.user.id_user];
		let sql = "INSERT INTO `taglist`(`id_tag`, `id_user`) VALUES (?, ?)";

		con.query(sql, vals, function(err, bres)  {
		if(err) throw err;
		});
	//});
	res.render('profile');
});

router.get("/submitTag", authenticationMiddleware(), function(req,res){
	con.query("SELECT * FROM `Tags`", function (err, result, fields) {
		if (err) throw err;
		//console.log(result);
		console.log("Profile:", req.user);
		res.render('submitTag', {tags: result});
	});

});

router.post("/submitTag", authenticationMiddleware(), function(req, res) {
	let sql = "INSERT INTO `Tags`(`tag_name`, `category`) VALUES (?,?)";
	var values = [req.body.Tname, req.body.Tcategory];
	con.query(sql, values, function(err, result) {
		if(err) throw err;
		console.log("tag submit");
	});
	res.redirect("/users/submitTag");
});
//send text message to defined chat
router.get('/messageToChat',function(req,res){
	res.render('messageToChat');
});

router.post('/messageToChat', function(req, res, next) {
	var sent= "sent";
	let sql = "INSERT INTO `ChatMessage`(`id_chat`, `id_user`, `content`, `sender`, `state`) VALUES ('"+req.body.Cid+"', '"+idMaster+"', '"+req.body.Cmessage+"', '"+idMaster+"', '"+sent+"')";

	con.query(sql, function(err, result)  {
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
	let sql = "INSERT INTO `Chat`(`title`) VALUES ('"+req.body.Title+"')";

	con.query(sql, function(err, result)  {
		if(err) throw err;
	});

	res.redirect("/users/InviteToChat");
});

//add user to a chat
router.get('/InviteToChat',function(req,res){
	res.render('InviteToChat');
});

router.post('/InviteToChat', function(req, res, next) {
	let sql = "INSERT INTO `userChat`(`id_user`, `id_chat`) VALUES ('"+req.body.InviteID+"', '"+req.body.chatID+"')";

	con.query(sql, function(err, result)  {
		if(err) throw err;
	});

	res.redirect("/users/InviteToChat");
});

router.get('/findRandomChat',(req,res)=>{
	let sql = 'SELECT * FROM Users';
	db.query(sql,(err,result)=>{
		if(err)throw err;
		console.log(result);
		res.send(result);

	});
});

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

        var query = con.query("INSERT INTO `Users`(`profile_picture`) WHERE `username`=`user.username` VALUES ('"+req.file.path+"')" ,function(err, rows)      
        {                                                      
          if (err)
            throw err;
         res.redirect('/users/profile');
        });
    });

module.exports = router; 
