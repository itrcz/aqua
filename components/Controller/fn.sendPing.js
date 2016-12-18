module.exports = function(ns) {
	ns.sendPing = function(params,_callback) {
		
		var port = new ns.SerialPort(params.comport, {
			baudRate: params.comspeed,
			autoOpen:false
		});

		app.commsocket.cmd.PING(port,function(data){
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