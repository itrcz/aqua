'use strict';

var ns = CreateNameSpace('controller');

ns.SerialPort = require("serialport");

global.print("Controller server running at port 5055\n");

ns.list = function() {
	ns.SerialPort.list(function (err, ports) {
		ports.forEach(function(port) {
			console.log(port);
		});
	});
}

require("./fn.sendPing.js")						(ns);
require("./fn.setSerialNumber.js")		(ns);
require("./fn.findHardware.js")				(ns);
require("./fn.timeSync.js")						(ns);






require("./define.Controller.js")			(ns);