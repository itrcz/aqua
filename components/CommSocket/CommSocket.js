'use strict';

global.PROTOCOL = {
	//Типы транспортов
	TRANSPORT_SERIAL: 0x01,
	TRANSPORT_GPRS: 0x02,
	RESTART: 0xFF,
	//Байт начала пакета
	STX: 0xAA,

	//Позиции в пакете
	POS_STX: 0,
	POS_CMD: 1,
	POS_ACK: 1,
	POS_CMD_ACK: 1,
	POS_STS: 2,
	POS_LEN: 3,
	POS_DATA_START: 4,
	POS_CRC_WITHOUTDATA: 5,

	//Команды протокола
	CMD_PING: 0x01,
	CMD_INFO: 0x02,
	CMD_GETRTC: 0x0B,
	CMD_SETRTC: 0x0C,
	CMD_SERVICE_SETSN: 0x78,
	CMD_PUSH_REQUEST: 0x64,
	CMD_PUSH_DATA_START: 0x65,
	CMD_PUSH_DATA_RAW: 0x66,
	//Статусы пакета
	STS_SUCCESS: 0x00,
	STS_FAIL: 0x01,
	STS_CRC: 0x02,
	STS_OVERFLOW: 0x03,
	STS_UNSUPPORTED: 0x04,
	STS_DENIDED: 0x04,
}
var ns = CreateNameSpace('commsocket');

require("./obj.util.js")					(ns);
require("./fn.tx.js")							(ns);
require("./fn.rx.js")							(ns);
require("./fn.sendPacket.js")			(ns);
require("./fn.sendResponse.js")		(ns);
require("./obj.cmd.js")						(ns);


ns.net = require('net');

ns.net.createServer(function (socket) {

	socket.name = socket.remotePort
	console.log("New connection on port " + socket.name );

	socket.paket = false;
	socket.Buff = new ns.rxBuffer();

	socket.on('data', function(data) {

		for(var i = 0;i < data.length; i++) {
			socket.paket = socket.Buff.$rx(data);

			if (socket.paket) {
				socket.Buff = new ns.rxBuffer();

				ns.sendResponse(socket);
				break;
			}
		}
	});

	socket.on('end', function () {

	});
	socket.on('close', function() {
		console.log("Port " + socket.name + " disconnected" );
	});
}).listen(5055);
