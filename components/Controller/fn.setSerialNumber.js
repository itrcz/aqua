module.exports = function(ns) {
	ns.setSerialNumber = function(params,_callback) {
		var port = new ns.SerialPort(params.comport, {
			baudRate: params.comspeed,
			autoOpen:false
		});

		app.commsocket.cmd.SETSN(port,params.sn,function(data){
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
}