module.exports = function(ns) {
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

		app.commsocket.cmd.SETRTC(port,time,function(data){
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