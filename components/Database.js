'use strict';

var ns = CreateNameSpace('db');


ns.engine = require('mysql');
global.squel = require('squel');


/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.SQL = function() {
	var twoDigits = function(d) {
	    if(0 <= d && d < 10) return "0" + d.toString();
	    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
	    return d.toString();
	}
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

ns.$ = function(q,_callback) {

	ns.connection = ns.engine.createConnection(__config.database);
	
	ns.connection.connect();
	
	ns.connection.query(q, function(err, rows, fields) {
		if (err) {
			global.printError(err.toString());
			return _callback(false,err);
		}
		if (typeof(_callback) === "function") {
			_callback(rows);
		}
	});
	
	ns.connection.end();
}
/*
	Тест подключения к базе
	если ошибка, закрываем приложение
*/
ns.$("SELECT NOW()",function(res,err) {
	if (!res) {
		global.printError("Database is not running or configuration is incorrect, application cannot run, terminating...");
		process.exit();
	}
});
	