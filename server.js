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
		
		console.log("------------ Start of cycle " + socket.id + " ----------------\n");

		io.to(socket.id).emit('feedback-loading', 'Downloading video...');
		io.to(socket.id).emit('clear-result', 'clear');
		io.to(socket.id).emit('embed-youtube','');
		io.to(socket.id).emit('video-title','');
		io.to(socket.id).emit('video-url', '');

		console.log('Server receive : ' + url);
		downloadYoutube(url, socket.id);

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
function downloadYoutube(url , socketId) {
	var path   = require('path');
	var fs     = require('fs');
	var ytdl   = require('ytdl-core');

	try {
		ytdl.getInfo(url, function(err, info) {
			if (info == null ) {
				io.to(socketId).emit('completed-warning', 'Invalid URL!');
				return;
			}

			var videoId = info['video_id'];
			io.to(socketId).emit('video-title', info['title']);
			io.to(socketId).emit('video-url', 
				'<a class=\"video-url\" href=\"' +
				'https://www.youtube.com/watch?v=' + videoId +
				'\">' +
				'https://www.youtube.com/watch?v=' + videoId +
				'</a>');
			createYoutubeEmbedded(socketId,videoId,0,0);

			var dir = './cache';
			if (fs.existsSync(dir + '/'+videoId+'.wav')) {
				io.to(socketId).emit('feedback-processing', 'Analysing music...');
				callMatcher(videoId, socketId);
			}
			else {
				var audioOutput = path.resolve(__dirname + '/cache' , videoId+'.mp4');
				ytdl(url, { quality: 140 }).pipe(fs.createWriteStream(audioOutput))
				.on('finish', function() {
					io.to(socketId).emit('feedback-processing', 'Processing audio...');
					convertToWav(videoId, socketId);
				});
			}
		});
	}
	catch (err) {
		console.log(err);
		io.to(socketId).emit('completed-warning', 'Invalid URL!');
	}
}

// Use ffmpeg to convert to wav audio
function convertToWav(youtubeId, socketId) {
	var exec = require('child_process').exec;
	var cmd = 'for %n in (cache/'+youtubeId+'.mp4) do "matcher/ffmpeg" -i "%n" -ac 1 -map_metadata -1 -ar 44100 "cache/%~nn.wav"';
	exec(cmd, function(error, stdout, stderr) {
		console.log(stderr);
		io.to(socketId).emit('feedback-processing', 'Analysing music...');
		callMatcher(youtubeId, socketId);
	});
}

function callMatcher(youtubeId, socketId) {
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
			io.to(socketId).emit('completed-cross', 'Sorry, no music detected!');
		}
		else  {
			io.to(socketId).emit('completed-tick', 'Completed!');
			console.log("Music detected:");
			for(var i=0;i<songArray.length;i++) {
				io.to(socketId).emit('add-result', 
					'<li>' +
					'<a href="https://play.spotify.com/search/'+artistArray[i].replace(/\s/g, '%20')+'%20'+songArray[i].replace(/\s/g, '%20')+'">' +
					'<img src="img/spotify-connect.png"  style="height:30px;">' +
					'</a>' +
					'&nbsp;'+
					'<a class=\"result-link\" href="javascript:void(0);" onclick="setYoutubeEmbeddedStart(' +
						'\''+youtubeId+'\''+','+startMinArray[i]+','+startSecArray[i]+','+endMinArray[i]+','+endSecArray[i]+');" >' +

					startMinArray[i]+':'+startSecArray[i]+" - "+endMinArray[i]+':'+endSecArray[i]+" --- "+artistArray[i]+" - "+songArray[i]+
					'</a>' +
					'</li>');

				console.log(startMinArray[i]+':'+startSecArray[i]+" - "+endMinArray[i]+':'+endSecArray[i]+" --- "+artistArray[i]+" - "+songArray[i]);
			}
		}
		console.log("------------- End of cycle " + socketId + " ----------------\n");
	});
}

function createYoutubeEmbedded(socketId, videoId) {
	var youtubeString = 
	('<iframe id=\"ytplayer-iframe\" type=\"text/html\" ' +
	'width=\"640\" height=\"360\" ' +
	'src=\"http://www.youtube.com/embed/'+videoId+'?autoplay=1'+'\" ' +
	'frameborder=\"0\"/>');

	io.to(socketId).emit('embed-youtube', youtubeString);
}
