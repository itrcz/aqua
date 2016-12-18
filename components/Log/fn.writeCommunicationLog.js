module.exports = function(ns) {
	ns.writeCommunicationLog = function (opt,_callback) {

		if (typeof(_callback) !== "function") _callback = function(){};

		if (!opt || typeof(opt) !== "object") opt = [];

		var query = squel.insert();

		query.into(ns.vars.log_comm_table);

		if (!opt.msg) {
			_callback({
				success:false,
				message:"No message."
			});
			return;
		}
		if (!opt.type) {
			opt.type = 'NOTIFY';
		}
		var time = new Date();
		time = time.SQL();
		
	//query.set("userid", opt.user.id);
	//query.set("ipaddr", opt.user.ipaddr);
	query.set("msg", opt.msg);
	query.set("type", opt.type);
	query.set("timestamp", time);
	
	app.db.$(query.toString(), function(res){
		
		if (res.affectedRows > 0) {
			_callback({
				success:true
			});
		} else {
			_callback({
				success:false,
				message:"Cannot insert data into table " + ns.vars.log_table
			});
		}
	});
}
}