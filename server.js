var http = require('http'),
	fs = require('fs'),
	path = require('path'),
	mime = require('mime'),
	cache = {};


//I have to prototype it to make this work
function resWriteHeadFn(num, contentObj) {
	if(!num && !contentObj) return console.log('please enter number and ContentObj');
	return writeHead(num, contentObj);
}

function send404(res) {
	res.writeHead(404, {'Content-Type': 'text/plain'});
	res.write('Error 404: resource not found.');
	res.end();
}

function sendFile(res, filePath, fileContents) {
	res.writeHead(200, 
		{'Content-Type': mime.lookup(path.basename(filePath) ) } 
	);
	res.end(fileContents);
}
