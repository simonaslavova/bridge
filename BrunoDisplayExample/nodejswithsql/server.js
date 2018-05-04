const express = require('express');
var bodyParser = require('body-parser')

const mysql = require('mysql');

const app = express();


const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "Bridge",
  //socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));

app.use(express.static('web'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.get('/select',(req,res)=>{
	let sql = 'SELECT * FROM Users';
	db.query(sql,(err,result)=>{
		if(err)throw err;
		console.log(result);
		res.send(result);

	});
});


app.post('/post',(req,res)=>{

console.log(req.body.data);

res.send(req.body);
  
});
