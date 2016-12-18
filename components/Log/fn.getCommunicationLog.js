module.exports = function(ns) {
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
}