module.exports = function(ns) {
	var port = 5055;

	ns.net = require('net');

	ns.net.createServer(function (socket) {

		socket.name = socket.remotePort;

		console.log("New connection on port " + socket.name );

		socket.paket = false;
		socket.Buff = new app.commsocket.rxBuffer();

		socket.on('data', function(data) {

			for(var i = 0;i < data.length; i++) {
				socket.paket = socket.Buff.$rx(data);

				if (socket.paket) {
					socket.Buff = new app.commsocket.rxBuffer();

					app.commsocket.sendResponse(socket);
					break;
				}
			}
		});

		socket.on('end', function () {

		});
		socket.on('close', function() {
			console.log("Port " + socket.name + " disconnected" );
		});
	}).listen(port);

		console.log(("Push сервер:   127.0.0.1:"+port+"").blue);

}