module.exports = function(ns) {
	ns.getLog = function(opt,_callback) {
		if (typeof(_callback) !== "function") return;

		if (!opt || typeof(opt) !== "object") opt = [];

		var query = squel.select();

		query.field(ns.vars.log_table+".id");
		query.field(ns.vars.log_table+".ipaddr");
		query.field(ns.vars.log_table+".action");
		query.field(ns.vars.log_table+".timestamp");

		query.field("u.username");

		query.from(ns.vars.log_table);

		query.join(ns.vars.user_table, "u", "u.id = "+ns.vars.log_table+".userid")

		if (typeof(opt.where) === "object") {
			for (var key in opt.where) {
				query.where(key+" = '"+opt.where[key]+"'");
			}
		}

		if (typeof(opt.limit) === "number" && opt.limit > 0) {
			query.limit(opt.limit);
		}

		app.db.$(query.toString(), function(rows){
			_callback(rows);
		});
	}
	ns.writeLog = function (opt,_callback) {

		if (typeof(_callback) !== "function") _callback = function(){};

		if (!opt || typeof(opt) !== "object") opt = [];

		var query = squel.insert();

		query.into(ns.vars.log_table);


		var time = new Date();
		time = time.SQL();
		
		query.set("userid", opt.user.id);
		query.set("ipaddr", opt.user.ipaddr);
		query.set("action", opt.logMessage);
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