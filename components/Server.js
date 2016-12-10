'use strict';

var ns = CreateNameSpace('server');

global.fs		= require('fs');
global.os 		= require("os");
//global.pm2		= require('pm2');
global.express 	= require('express');
global.app		= express();

var credentials = false

if (__config.ssl) {
	var privateKey  = fs.readFileSync(__dirname + "/../" + __config.credentials.key, 'utf8');
	var certificate = fs.readFileSync(__dirname + "/../" +__config.credentials.crt, 'utf8');
		credentials = {key: privateKey, cert: certificate};
		
	if (!credentials.cert || !credentials.key) {
		global.printError("Invalid SSL certificate, application cannot run, terminating...");
		process.exit();
	}
}

global.srv		= credentials ? require('https').createServer(credentials, app) : require('http').createServer(app);

/* LISTEN PORT */
var port = __config.port;
if (!port) {
	global.printError("No port configured, application cannot run, terminating...");
	process.exit();
}
isPortTaken(port,function(taken) {
	if (taken) {
		global.printError("Port ["+port+"] is taken by another proccess, application cannot run, terminating...");
		process.exit();
	}
	global.print("Listening port ["+port+"]");
	srv.listen(port);
});


ns.info = function() {
	return {
		platform:os.platform(),
		release:os.release(),
		arch:os.arch(),
		memory:os.totalmem(),
		hostname:os.hostname()
	};
}

ns.cpuAverage = function() {
	var cpus = os.cpus();
	
	var ret = {
		model:cpus[0].model,
		usage:0,
		cores:[]
	};
	
	for(var i = 0, len = cpus.length; i < len; i++) {
	    
	    var core = {}
	    var cpu = cpus[i], total = 0;
	
	    for(var type in cpu.times) {
	        total += cpu.times[type];
	    }
		
	    for(type in cpu.times) {
		    core[type] = Math.round(100 * cpu.times[type] / total);
	    }
	    ret.cores.push(core);
	}
	var totalUsage = 0;
	for(var i in ret.cores) {
		var usageCore = 100 - ret.cores[i].idle;
		totalUsage += usageCore;
	}
	ret.usage = 100*(totalUsage / (ret.cores.length*100));
	
	return ret;
}
