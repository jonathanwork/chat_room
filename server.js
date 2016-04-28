var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	mime = require('mime'),
	cache = {};


//I have to prototype it to make this work
// function resWriteHeadFn(num, contentObj) {
// 	if(!num && !contentObj) return console.log('please enter number and '+
// 		'ContentObj');
// 	return writeHead(num, contentObj);
// };
//sending errors data goes here.
function send404(res) {
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.write('Error 404: resource not found.');
	res.end();
};
//sending data goes here.
function sendFile(res, filePath, fileContents) {
	res.writeHead(200,
		{'content-type': mime.lookup(path.basename(filePath) ) }
	);
	res.end(fileContents);
};

//serving static files
function serveStatic(res, cache, absPath) {
	if(cache[absPath]) {
		sendFile(res, absPath, cache[absPath]);
	} else {
		fs.exists(absPath, function(exists) {
			if(exists) {
				fs.readFile(absPath, function(err, data) {
					if(err) {
						send404(res);
					}else {
						cache[absPath] = data;
						sendFile(res, absPath, data);
					}
				});
			} else {
				send404(res);
			}
		});
	}
};

var server = http.createServer(function(req, res) {
		var filePath = false;

		if(req.url == '/') {
			filePath = 'public/index.html';
		} else {
			filePath = 'public' + req.url;
		}

		var absPath = './' + filePath;

		serveStatic(res, cache, absPath);
	});

 server.listen(3000, function() {
 	console.log('check 3000');
});
chatServer = require('./lib/chat_server');
chatServer.listen(server);
