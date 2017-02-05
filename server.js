#!/usr/bin/env nodejs
// Tell the server the location and name of the node application

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 1338;

// Azure path
var javaExec = "\"D:/Program Files/Java/jdk1.8.0_60/bin/java\"";
var ffmpegExec = "matcher/ffmpeg"; // For windows, using the binary ffmpeg.exe in folder matcher
var os = "linux"; // edit this according to the os running this app "windows" or "linux"

// Local path
if (port == 1338) {
	javaExec = "java";
	ffmpegExec = "ffmpeg"; // Please sudo apt-get install ffmpeg
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

	}),

	socket.on('youtube_url_download_link', function(url){
		console.log(url);
		console.log("------------ Start of cycle " + socket.id + " ----------------\n");
		io.to(socket.id).emit('feedback-loading', 'Processing URL...');
		io.to(socket.id).emit('clear-result', 'clear');
		io.to(socket.id).emit('embed-youtube','');
		io.to(socket.id).emit('video-title','');
		io.to(socket.id).emit('video-url', '');

		console.log('Server receive : ' + url);
		console.log('Retrieving youtube downloadable links...');
		getYoutubeDownloadLinks(url, socket.id);

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

// Get youtube download links function
function getYoutubeDownloadLinks(url , socketId) {
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

			var videoAndAudio = false;
			var videoOnly = false;
			var audioOnly = false;

			var formats = info['formats'];
			var formatsArrayLength = formats.length;
			for (var i = 0; i < formatsArrayLength; i++) {
				var currFormat = formats[i];

				// BEGIN - Added for easy download section
				if ((!videoAndAudio) &&
				((currFormat['quality'] == 'hd720') || (currFormat['quality'] == 'medium')) &&
				(currFormat['container']== 'mp4')) {
					io.to(socketId).emit('add-easy-result', 
					'<li><a href="' + currFormat['url'] + '" style="color: blue;" target="_blank" download="'+ currFormat['url'] +'">' +
					'Video and audio download</a></li>');
					videoAndAudio = true;
				}
				if ((!videoOnly) && 
				((currFormat['encoding'] == 'H.264') && 
				(currFormat['container'] == 'mp4') && 
				(currFormat['audioEncoding'] == null) &&
				(currFormat['audioBitrate'] == null))) {
					io.to(socketId).emit('add-easy-result', 
					'<li><a href="' + currFormat['url'] + '" style="color: blue;" target="_blank" download="'+ currFormat['url'] +'">' +
					'Video only download</a></li>');
					videoOnly = true;
				}
				if ((!audioOnly) &&
				((currFormat['encoding'] == null) && 
				(currFormat['container'] == 'mp4') && 
				(currFormat['resolution'] == null) &&
				(currFormat['audioEncoding'] == 'aac') &&
				(currFormat['audioBitrate'] >= 64))) {
					io.to(socketId).emit('add-easy-result', 
					'<li><a href="' + currFormat['url'] + '" style="color: blue;" target="_blank" download="'+ currFormat['url'] +'">' +
					'Audio only download</a></li>');
					audioOnly = true;
				}
				// END - easy download section

				io.to(socketId).emit('add-result', 
					'<li>' +
					'<a href="' + currFormat['url'] + '" style="color: blue;" target="_blank" download="'+ currFormat['url'] +'">' +
					'Download' +
					'</a>' +
					'&nbsp;'+
					'<i class="fa fa-file-video-o" aria-hidden="true"></i>' + '&nbsp;'+
					(currFormat['quality'] || currFormat['quality_label']) + ' | '+
					currFormat['encoding'] + ' | '+
					currFormat['container'] + ' | '+
					currFormat['resolution'] + ' | '+
					'<i class="fa fa-file-audio-o" aria-hidden="true"></i>' +'&nbsp;'+
					currFormat['audioEncoding'] + ' | '+
					currFormat['audioBitrate'] +
					'</li>');
			}

			io.to(socketId).emit('completed-tick', 'Completed!');
		});
	}
	catch (err) {
		console.log(err);
		io.to(socketId).emit('completed-warning', 'Invalid URL!');
	}
	console.log("------------- End of cycle " + socketId + " ----------------\n");
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
	var filename = "cache/" + youtubeId + ".mp4";
	var cmd = ffmpegExec + ' -i "'+ filename +'" -ac 1 -map_metadata -1 -ar 44100 "cache/'+ youtubeId +'.wav"';
	if (os == "windows") {
		cmd = 'for %n in (cache/'+youtubeId+'.mp4) do "'+ffmpegExec+'" -i "%n" -ac 1 -map_metadata -1 -ar 44100 "cache/%~nn.wav"';
	}
	exec(cmd, function(error, stdout, stderr) {
		console.log(stderr);
		io.to(socketId).emit('feedback-processing', 'Analysing music...');
		callMatcher(youtubeId, socketId);
	});
}

function callMatcher(youtubeId, socketId) {
	var exec = require('child_process').exec;
	var cmd = javaExec + ' -Dfile.encoding=UTF-8 -Xmx8000M -jar ./matcher/YouSicMatcher.jar ./matcher/songs.db ./cache/'+youtubeId+'.wav';
	exec(cmd, function(error, stdout, stderr) {
		console.log("=========== stdout from matcher ============");
		console.log(stdout);
		console.log("=========== end stdout from matcher =============")
		console.log("=========== stderr from matcher ============")
		console.log(stderr);
		console.log("=========== end stderr from matcher =============")

		var startMinArray = [];
		var startSecArray = [];
		var endMinArray = [];
		var endSecArray = [];
		var artistArray = [];
		var songArray = [];
		var matches;

		// Regex the youtube id from stdout
		var regexMatchedSongs = new RegExp("([0-9]+)\\s([0-9]+)\\s([0-9]+)\\s([0-9]+)\\s(.+)\\s\\-\\s(.+)", "g");
		
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
	'src=\"http://www.youtube.com/embed/'+videoId+'\" ' +
	'frameborder=\"0\"/>');

	io.to(socketId).emit('embed-youtube', youtubeString);
}
