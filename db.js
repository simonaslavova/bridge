var mysql = require('mysql');

const options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "Bridge",
};

var con = mysql.createConnection(options);

con.connect(function(err) {
	if (err) throw err
});

module.exports = {
	con,
	options
};