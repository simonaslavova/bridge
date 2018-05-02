var mysql = require('mysql');

var con = mysql.createConnection({
	host: "localhost",
	port: "3306",
	user: "root",
	password: "",
	database: "Bridge",
});

module.exports = {
	con
};

exports.getConnection = function(callback)  {
 	con.getConnection(function (err, conn) {
 		if(err) {
 			return callback(err);
 		}
 		callback(err,conn);
 	});
 };