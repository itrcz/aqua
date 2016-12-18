module.exports = function(ns) {
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
				app.commsocket.cmd.INFO(port,function(data){
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
}