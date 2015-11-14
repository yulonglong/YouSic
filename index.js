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
		io.emit('feedback', 'Downloading...');

		console.log('Server receive : ' + url);
		downloadYoutube(url);
	});
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});


// Download Youtube Video function
function downloadYoutube(url) {
	var exec = require('child_process').exec;
	var cmd = 'java -jar VideoDownloader/ytd.jar ' + url;
	exec(cmd, function(error, stdout, stderr) {
		console.log(stdout);

		// Regex the youtube id from stdout
		var regexYoutubeId = new RegExp("#info\\s-\\sYoutubeId\\s=\\s(.+)\\r\\n", "g");
		var resultArrayYoutubeId = regexYoutubeId.exec(stdout);

		// Regex the youtube id from stdout
		var regexAlreadyDownloaded = new RegExp("#info\\s-\\s"+resultArrayYoutubeId[1]+"\\salready\\sdownloaded\\r\\n", "g");
		var isAlreadyDownloaded = regexAlreadyDownloaded.test(stdout);

		if (isAlreadyDownloaded == true) {
			io.emit('completed', 'Download completed!');
		}
		else {
			io.emit('feedback', 'Processing audio...');
			convertToWav(resultArrayYoutubeId[1]);
		}
	});
}

// Use ffmpeg to convert to wav audio
function convertToWav(youtubeId) {
	var exec = require('child_process').exec;
	var cmd = 'for %n in (cache/'+youtubeId+'/'+youtubeId+'.AUDIO.mp4) do ffmpeg -i "%n" -ac 1 -map_metadata -1 -ar 44100 "cache/'+youtubeId+'/%~nn.wav"';
	exec(cmd, function(error, stdout, stderr) {
		console.log(stderr);
		io.emit('completed', 'Download completed!');
	});
}
