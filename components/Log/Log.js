'use strict';

var ns = CreateNameSpace('log');

ns.vars = {
	log_table: "aq_log",
	log_comm_table: "aq_log_comm",
	user_table: "aq_users"
};


require("./fn.getLog.js")										(ns);
require("./fn.getCommunicationLog.js")			(ns);
require("./fn.writeCommunicationLog.js")		(ns);




require("./define.Log.js")									(ns);
require("./define.CommLog.js")							(ns);