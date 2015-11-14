var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public_html'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public_html/index.html');
});

io.on('connection', function(socket){
  socket.on('youtube_url', function(url){
    io.emit('youtube_url', url);

    // After receiving data from client
    console.log('Server receive : ' + url);
    var exec = require('child_process').exec;
	var cmd = 'java -jar VideoDownloader/ytd.jar ' + url;
	exec(cmd, function(error, stdout, stderr) {
	  console.log(stdout);
	});
	// end

  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
