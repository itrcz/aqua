'use strict';

var ns = CreateNameSpace('auth');

ns.vars = {
	users_table: "aq_users"
};

ns.check = function(arg,_callback) {
	
	var query = squel.select();
	
	if (arg.login && arg.password && arg.password.length == 32) {
		query.where("username='"+arg.login+"'");
		query.where("password='"+arg.password+"'");
		
	} else if(arg.session && arg.session.length == 128) {
		
		query.where("session='"+arg.session+"'");
		
	} else {
		return _callback(false);
	}
	
	query.from(ns.vars.users_table);
	
	app.db.$(query.toString(), function(rows) {
		
		if (rows && rows[0]) {
			
			var session = crypto.randomBytes(64).toString('hex');

			var query = squel.update();
					query.table(ns.vars.users_table);
						query.set("session", session);
							query.where("id="+rows[0].id);
				
			app.db.$(query.toString(), function(res){
				if (res.affectedRows > 0) {
					rows[0].session = session;
					_callback(rows[0]);
				} else {
					_callback(false);
				}
			});
			
		} else {
			_callback(false);
		}
	})

}