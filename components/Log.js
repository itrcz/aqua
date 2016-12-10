'use strict';

var ns = CreateNameSpace('log');

ns.vars = {
	log_table: "aq_log",
	log_comm_table: "aq_log_comm",
	user_table: "aq_users"
};

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
ns.getCommunicationLog = function(opt,_callback) {
	
	if (typeof(_callback) !== "function") return;
	
	if (!opt || typeof(opt) !== "object") opt = [];
	
	var query = squel.select();

	query.field("id");
	query.field("type");
	query.field("msg");
	query.field("timestamp");
		
	query.from(ns.vars.log_comm_table);

       
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

app.socket.defineClass("Log", {
	read: {
		params: ['page', 'start', 'limit'],
		$: function(req,_callback) {
			return ns.getLog(false,_callback);
		},
	}
});
app.socket.defineClass("CommLog", {
	read: {
		params: ['page', 'start', 'limit'],
		$: function(req,_callback) {
			return ns.getCommunicationLog(false,_callback);
		},
	}
});