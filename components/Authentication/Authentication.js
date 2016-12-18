'use strict';

var ns = CreateNameSpace('auth');

ns.vars = {
	users_table: "aq_users"
};


require("./fn.check.js")		(ns);