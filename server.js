var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1337;

// Azure path
var javaExec = "\"D:/Program Files/Java/jdk1.8.0_60/bin/java\"";

// Local path
if (port == 1337) {
	javaExec = "java";
}

app.use(express.static(__dirname + '/public_html'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public_html/index.html');
});

io.on('connection', function(socket){
	socket.on('youtube_url', function(url){
		
		console.log("------------ Start of cycle ----------------\n");

		io.emit('feedback-loading', 'Downloading video...');
		io.emit('clear-result', 'clear');
		console.log('Server receive : ' + url);
		downloadYoutube(url);

	});
});

http.listen(port, function(){
	console.log('listening on *:'+port);
	createCacheFolder();
});


function createCacheFolder() {
	var fs = require('fs');
	var dir = './cache';

	if (!fs.existsSync(dir)){
	    fs.mkdirSync(dir);
	}
}

// Download Youtube Video function
function downloadYoutube(url) {
	var path   = require('path');
	var fs     = require('fs');
	var ytdl   = require('ytdl-core');

	try {
		ytdl.getInfo(url, function(err, info) {
	  		var videoId = info['video_id'];
	  		var dir = './cache';
			if (fs.existsSync(dir + '/'+videoId+'.wav')) {
			    io.emit('feedback-processing', 'Analysing music...');
	 			callMatcher(videoId);
			}
			else {
		  		var audioOutput = path.resolve(__dirname + '/cache' , videoId+'.mp4');
				ytdl(url, { quality: 140 }).pipe(fs.createWriteStream(audioOutput))
				.on('finish', function() {
					io.emit('feedback-processing', 'Processing audio...');
	 				convertToWav(videoId);
	 			});
			}
	  	});
	}
	catch (err) {
		console.log(err);
		io.emit('completed-warning', 'Invalid URL!');
	}
}

// Use ffmpeg to convert to wav audio
function convertToWav(youtubeId) {
	var exec = require('child_process').exec;
	var cmd = 'for %n in (cache/'+youtubeId+'.mp4) do ffmpeg -i "%n" -ac 1 -map_metadata -1 -ar 44100 "cache/%~nn.wav"';
	exec(cmd, function(error, stdout, stderr) {
		console.log(stderr);
		io.emit('feedback-processing', 'Analysing music...');
		callMatcher(youtubeId);
	});
}

function callMatcher(youtubeId) {
	var exec = require('child_process').exec;
	var cmd = javaExec + ' -Xmx8000M -jar ./matcher/YouSicMatcher.jar ./matcher/songs.db ./cache/'+youtubeId+'.wav';
	exec(cmd, function(error, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);

		var startMinArray = [];
		var startSecArray = [];
		var endMinArray = [];
		var endSecArray = [];
		var artistArray = [];
		var songArray = [];
		var matches;

		// Regex the youtube id from stdout
		var regexMatchedSongs = new RegExp("([0-9]+)\\s([0-9]+)\\s([0-9]+)\\s([0-9]+)\\s(.+)\\s-\\s(.+)\\r\\n", "g");

		while (matches = regexMatchedSongs.exec(stdout)) {
			startMinArray.push(decodeURIComponent(matches[1]));
			if (matches[2].length == 1) {
				startSecArray.push('0'+decodeURIComponent(matches[2]));
			}
			else {
				startSecArray.push(decodeURIComponent(matches[2]));
			}
			endMinArray.push(decodeURIComponent(matches[3]));
			if (matches[4].length == 1) {
				endSecArray.push('0'+decodeURIComponent(matches[4]));
			}
			else {
				endSecArray.push(decodeURIComponent(matches[4]));
			}
			artistArray.push(decodeURIComponent(matches[5]));
			songArray.push(decodeURIComponent(matches[6]));
		}
		if (songArray.length == 0) {
			io.emit('completed-cross', 'Sorry, no music detected!');
		}
		else  {
			io.emit('completed-tick', 'Completed!');
			console.log("Music detected:");
			for(var i=0;i<songArray.length;i++) {
				io.emit('add-result', 
					'<li>' +
					'<a href="https://play.spotify.com/search/'+artistArray[i].replace(/\s/g, '%20')+'%20'+songArray[i].replace(/\s/g, '%20')+'">' +
					'<img src="img/spotify-connect.png"  style="height:30px;">' +
					'</a>' +
					'&nbsp;'+
					startMinArray[i]+':'+startSecArray[i]+" - "+endMinArray[i]+':'+endSecArray[i]+" --- "+artistArray[i]+" - "+songArray[i]+
					'</li>');

				console.log(startMinArray[i]+':'+startSecArray[i]+" - "+endMinArray[i]+':'+endSecArray[i]+" --- "+artistArray[i]+" - "+songArray[i]);
			}
		}
		console.log("------------- End of cycle ----------------\n");
	});
}
