var express = require('express');
var bodyParser = require('body-parser');
var jade = require('jade');
var router = express.Router();

module.exports = router;

var app=express();


app.use(express.static("node_modules/bootstrap/dist"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("views", "./views");
app.set('view engine', 'jade');

app.get('/', function (req,res) {
	res.render("start", { title: "Home"});
});

var apiRouter = require("./api");

app.use("/users", apiRouter);


app.listen(3000,function(){
	console.log("Sever listening on port 3000");

});