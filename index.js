var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public_html'));

app.listen(process.env.PORT || 3000);

// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/public/index.html');
// });

// io.on('connection', function(socket){
//   socket.on('chat message', function(msg){
//     io.emit('chat message', msg);
//   });
// });

// http.listen(3000, function(){
//   console.log('listening on *:3000');
// });
