var express = require('express');
var bodyParser = require('body-parser');
var Pusher = require('pusher');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var pusher = new Pusher({
	appId: '523701',
	key: 'c292f2fa79e14441f061',
	secret: '21fe17d562d2de74f928',
	cluster: 'eu',
	encrypted: true
});

app.post('/message', function(req, res) {
	var message = req.body.message;
	pusher.trigger( 'public-chat', 'message-added', { message });
	res.sendStatus(200);
});

app.get('/',function(req,res){      
	res.sendFile('/public/index.html', {root: __dirname });
});

app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 5000;
app.listen(port, function () {
	console.log(`app listening on port ${port}!`)
});