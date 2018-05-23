$.getJSON('/profile',show);

function show(data){

	//document.getElementById('id').innerHTML = data[43].id_user;
	document.getElementById('username').innerHTML = data[43].username;
	//document.getElementById('email').innerHTML = data[43].email;

}

//var button = document.getElementById('submit');

//button.onclick = function send(){ 

var data = document.getElementById('post').value;

$.post('/post', {data:data}, success,'json');

function success(data){

console.log(data);

}

}