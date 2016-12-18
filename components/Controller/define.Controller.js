module.exports = function(ns) {
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
				return ns.setSerialNumber(req.data,_callback);
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
}