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

var server = net.createServer(function(socket) {

	var client = new net.Socket();
	client.connect(13001, '172.27.225.89', function() {
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

server.listen(12345, 'localhost');
