#!/usr/bin/env node

var net = require('net');

// From: http://stackoverflow.com/questions/8125507/how-can-i-send-and-receive-websocket-messages-on-the-server-side
function decodeWebSocket (data){
    var datalength = data[1] & 127;
    var indexFirstMask = 2;
    if (datalength == 126) {
        indexFirstMask = 4;
    } else if (datalength == 127) {
        indexFirstMask = 10;
    }
    var masks = data.slice(indexFirstMask,indexFirstMask + 4);
    var i = indexFirstMask + 4;
    var index = 0;
    var output = "";
    while (i < data.length) {
        output += String.fromCharCode(data[i++] ^ masks[index++ % 4]);
    }
    return output;
}

var argv = process.argv.slice(2);
if(argv.length === 3) {

	var localPort = argv[0];
	var remoteHost = argv[1];
	var remotePort = argv[2];

	var server = net.createServer(function(socket) {

		var client = new net.Socket();
		client.connect(remotePort, remoteHost, function() {
		});

		client.on('data', function(data) {
			console.log('<' + (""+data).substring(2));
			socket.write(data);
		});

		client.on('close', function() {
			socket.end();
		});

		socket.on('data', function(data) {
			console.log('>' + (((""+data).charCodeAt(0) == 0xFFFD) ? decodeWebSocket(data) : data));
			client.write(data);
		});

		socket.on('close', function() {
			client.end();
		});
	});

	server.listen(localPort, 'localhost');

	console.log("-=- Websocket Proxy -=-");
	console.log("local port: ", localPort);
	console.log("remote host: ", remoteHost);
	console.log("remote port: ", remotePort);

} else {
	console.log("Usage: ./websocket-proxy <local-port> <remote-host> <remote-port>");
}
