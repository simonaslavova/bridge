
//jQuery method
$.getJSON('/getGame/:gameName',show);

function show(data){

document.getElementById('nameGame').innerHTML = data[0].username;

}
//jQuery method

var bt = document.getElementById('submit');

bt.onclick = function send(){ 

var txt = document.getElementById('txt').value;

$.post('/post',{data:txt},success,'json');

function success(data){

console.log(data);

}

}