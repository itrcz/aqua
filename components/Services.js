'use strict';

var ns = CreateNameSpace('services');

ns.pm2 = require("pm2");

ns.vars = {
	log_table: "aq_log",
	user_table: "aq_users"
};

ns.getStats = function(opt,_callback) {
	if (typeof(_callback) !== "function") return;
	
	_callback([
		{
			name: "ПО АкваАльянс",
			service: "service.node",
			status: 0
		}
	]);
}
ns.restart = function(arg,_callback) {
	switch(arg.service) {
		case 'service.node':
			
			arg.logMessage = "Перезапуск службы " + arg.service;
			
			app.log.writeLog(arg);
			
			// Connect or launch PM2
			ns.pm2.connect(function(err) {
				ns.pm2.list(function(err, process_list) {
					//console.log(process_list);
				ns.pm2.restart(process_list[0].pid);
			      // Disconnect to PM2
				  //ns.pm2.disconnect(function() { process.exit(0) });
			    });
			});
			return _callback(true);
			break;
	}
	_callback(false);
}

app.socket.defineClass("Services", {
	restart: {
		params: ['service'],
		$: function(req,_callback) {
			
			if (req.data.service) {
				
				return ns.restart({
					user: req.user,
					service: req.data.service
				},_callback);
			}
			return _callback(false);
		}
	},

	read: {
		params: ['page', 'start', 'limit'],
		$: function(req,_callback) {
			return ns.getStats(false,_callback);
		},
	}
});