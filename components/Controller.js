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

ns.sendPing = function(params,_callback) {
	
	var port = new ns.SerialPort(params.comport, {
		baudRate: params.comspeed,
		autoOpen:false
	});

	app.commsocket.CMD.PING(port,function(data){
		if (data.success) {
			_callback({
				success:true
			});
		} else {
			if (data.code) {
				_callback({
					success:false,
					message:"Error code: " + data.code
				});
			} else {
				_callback({
					success:false,
					message:"Не удалось связатся с устройством"
				});
			}
		}
	});

}
ns.setSn = function(params,_callback) {
	
	var port = new ns.SerialPort(params.comport, {
		baudRate: params.comspeed,
		autoOpen:false
	});

	app.commsocket.CMD.SETSN(port,params.sn,function(data){
		console.log(data.success);
		if (data.success) {
			_callback({
				success:true
			});
		} else {
			if (data.code) {
				_callback({
					success:false,
					message:"Error code: " + data.code
				});
			} else {
				_callback({
					success:false,
					message:"Не удалось связатся с устройством"
				});
			}
		}
	});

}

ns.findHardware = function (params,_callback) {
	
	var ports = [];

	ns.SerialPort.list(function (err, resPorts) {
		var deviceCount = resPorts.length;
		var devices = [];

		var getControllers = function(com,speed,_cb) {
			var port = new ns.SerialPort(com, {
				baudRate: speed,
				autoOpen:false
			});
			app.commsocket.CMD.INFO(port,function(data){
				if (data.success) {
					data.com = resPorts[deviceCount];
					devices.push(data);
				}
				if (deviceCount > 0) {
					port = 0;
					setTimeout(function(){
						getControllers(resPorts[--deviceCount].comName,speed,_cb)
					},500);
				} else {
					_cb(devices);
				}
			});
		}
		getControllers(resPorts[--deviceCount].comName,params.comspeed,function(data){

			if (devices[0]) {
				var data = [];

				devices.forEach(function(device){

					data.push({
						sn: device.sn,
						name: device.name,
						com: device.com.comName,
						vendorId: device.com.vendorId,
						productId: device.com.productId,
						manufacturer: device.com.manufacturer
					});
				});

				_callback(data);
			} else {
				_callback({
					success:false,
					message:"Устройств не найдено"
				});
			}
		});
	});
}
ns.timeSync = function(params, _callback) {
	
	var port = new ns.SerialPort(params.comport, {
		baudRate: params.comspeed,
		autoOpen:false
	});
	var timeNow = new Date();

	var time = new Buffer(6);
			time[0] = Number('0x' + (timeNow.getFullYear()-2000)).toString(10);
			time[1] = Number('0x' + (timeNow.getMonth() + 1)).toString(10);
			time[2] = Number('0x' + timeNow.getDate()).toString(10);
			time[3] = Number('0x' + timeNow.getHours()).toString(10);
			time[4] = Number('0x' + timeNow.getMinutes()).toString(10);
			time[5] = Number('0x' + timeNow.getSeconds()).toString(10);

	app.commsocket.CMD.SETRTC(port,time,function(data){
		if (data.success) {
			_callback({
				success:true
			});
		} else {
			if (data.code) {
				_callback({
					success:false,
					message:"Error code: " + data.code
				});
			} else {
				_callback({
					success:false,
					message:"Не удалось связатся с устройством"
				});
			}
		}
	});
}
app.socket.defineClass("Controller", {
	findHardware: {
		params: ['id','comspeed'],
		$: function(req,_callback) {
			
			req.data.comspeed = req.data.comspeed || 9600;

			ns.findHardware(req.data,_callback);
		},
	},
	ping: {
		params: ['id','comport','comspeed'],
		$: function(req,_callback) {
			req.data.comspeed = req.data.comspeed || 9600;
	
			if (!req.data.comport) {
				return _callback({
							success:false,
							message:"Не задан COM порт"
						});
			}
			return ns.sendPing(req.data,_callback);
		},
	},
	setSn: {
		params: ['id','comport','comspeed','sn'],
		$: function(req,_callback) {
			req.data.comspeed = req.data.comspeed || 9600;
	
			if (!req.data.comport) {
				return _callback({
							success:false,
							message:"Не задан COM порт"
						});
			}
			if (req.data.sn > 16000000 || req.data.sn <= 0) {
				return _callback({
							success:false,
							message:"Не корректный SN"
						});
			}
			return ns.setSn(req.data,_callback);
		},
	},
	timeSync: {
		params: ['id','comport','comspeed'],
		$: function(req,_callback) {
			req.data.comspeed = req.data.comspeed || 9600;
	
			if (!req.data.comport) {
				return _callback({
							success:false,
							message:"Не задан COM порт"
						});
			}
			ns.timeSync(req.data,_callback);
		},
	},
});
