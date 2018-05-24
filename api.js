var express = require('express');
var router = express.Router();

var multer = require('multer'); 
var path   = require('path');
var passport   = require('passport');
const Chatkit = require('pusher-chatkit-server');
var $ = require('jquery');

var idMaster;

//Bcrypt
var bcrypt = require('bcrypt');
const saltRounds = 10;

var { con, options } = require('./db.js');

router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/users/profile',
	failureRedirect: '/users/login'
}));

const chatkit = new Chatkit.default({
	instanceLocator: 'v1:us1:81941ebe-9108-491a-9404-a72023fce067',
	key: 'afd9316a-e943-4b38-a2d7-7490bd5669ad:L1R/w+BIYaKu11tgjAMCHRNz3LYtGJ9eUSBdV1/M7X8=',
});

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

router.get("/start", (req,res)=>{
	res.render('start');
});

router.post('/start', function(req, res) {
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
                  //chatkit begin
                  const { username } = req.body
                  chatkit.createUser({ 
                  	id: req.body.email, 
                  	name: req.body.name 
                  })
                  .then(() => res.sendStatus(201)).catch(error => {
                  	if (error.error_type === 'services/chatkit/user_already_exists') {
                  		//res.sendStatus(200)
                  		console.log("user already exists")
                  	} else {
                  		//res.status(error.status).json(error)
                  		console.log(error.status)
                  		//this section still gives the catch error, dont know why, uncomment the res.status to see message
                  	}
                  	return null
                  })
                  //chatkit end
              });
			});
			res.redirect("/users/login");
		});
	}
	else
		res.redirect("/users/start");
});

router.get("/chat", authenticationMiddleware(), function(req,res){
	res.render('chatkit');
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

//THALES FUNCTIOS
router.get('/randomUser', authenticationMiddleware(), function(req,res){

	var id =req.user.id_user;
	var fullTaglist=[];
	var userTags=[];
	var foundUser;
	var x=id;

	con.query("SELECT `id_tag` FROM `taglist` WHERE `id_user`="+x+"", function (err, result, fields) {
		userTags=result;
		console.log(userTags);

		if(userTags.length>0)//if above query returns that the user has tags
		{
			con.query("SELECT * FROM `taglist` WHERE `id_user`!="+x+" ORDER BY `id_user` ASC, `id_tag` ASC", function (err, result, fields) {
				fullTaglist=result;
				console.log(fullTaglist);
				console.log(fullTaglist[0].id_user);
				var idTracker=fullTaglist[0].id_user;
				var match=0;
				var match_list=[];

				for(var a=0; a<fullTaglist.length; a++)//go through each element of the fullTaglist
				{
					//console.log("currentID " +fullTaglist[a].id_user + " tracker: " +idTracker);
					if(fullTaglist[a].id_user==idTracker)//skipping over one match for some reason when switching id's
					{
						for(var z=0; z<userTags.length; z++)//check if current id matches with tags
						{
							if(fullTaglist[a].id_tag == userTags[z].id_tag)//if match, increase match
							{
								match++; 
								console.log("this id: "+idTracker+" matchTotal: "+ match +" tag Value: " +fullTaglist[a].id_tag);
							}
						}
						if(match==userTags.length)//if match with all, push this user into a matched array
						{
							match_list.push(fullTaglist[a].id_user);
							console.log("pushed "+fullTaglist[a].id_user+" at if");
							match=0;
						}
					}
					else
					{
						idTracker=fullTaglist[a].id_user;
						match=0;

						if(fullTaglist[a].id_tag == userTags[0].id_tag)//if match, increase match
						{
							match++; 
							console.log("this id: "+idTracker+" matchTotal: "+ match +" tag Value: " +fullTaglist[a].id_tag);
						}
						if(match==userTags.length)//if match with all, push this user into a matched array
						{
							match_list.push(fullTaglist[a].id_user);
							console.log("pushed "+fullTaglist[a].id_user+" at else");
							match=0;
						}
					}
				}//end of top for

				console.log(match_list);

				foundUser = match_list[Math.floor(Math.random() * match_list.length)];//picks random user out of the list of matches
				console.log("randomly chosen user: " +foundUser);

				con.query("SELECT `email` FROM `users` WHERE `id_user`="+foundUser+"", function (err, result, fields) {
					if (err) throw err;
					console.log("email to return: "+result[0].email);//THIS RESULT HERE IS THE ID THAT NEEDS TO GET SENT TO NEXT FUNCTION
					res.send(result[0].email);
				});

				
			});
		}//end of if user has taglist>0
		else//if the query returns that the user does not have tags in the list, doesnt work as it should.
		{
			
			var list=[];
			

			con.query("SELECT * FROM `Users` WHERE `id_user`!="+x+"", function (err, result, fields) {
				list=result;

				foundUser = list[Math.floor(Math.random() * list.length)].email;//picks random user out of the list of matches
				console.log("randomly chosen user: " +foundUser);

				
				res.send(foundUser);
			});
		}
	});

});

router.get('/whoLog', authenticationMiddleware(), function(req,res){
	var loggedUserEmail =req.user.email;
	res.send(loggedUserEmail);


});
module.exports = router; 
