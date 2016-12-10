var fs = require('fs');
var path = require('path');
var colors = require('colors');

global.crypto = require('crypto');

global.$$ = function() {
	return true;
}
global.CreateNameSpace = function (namespace) {
	if (typeof(global.app) === "undefined") {
		global.app = Object();
	}
	if (global.app[namespace]) {
		return false;
	}
	global.app[namespace] = {
		public: {}
	};
	return global.app[namespace];
}
//Check fileExist
global.fileExists = function(fp) {
    try {
	    return fs.statSync(fp).isFile();
	}
    catch (e)	{
	    return false;
	}
}
//Function for check object for function
global.IsFunction = function(f) {
	var getType = {};
	return f && getType.toString.call(f) === '[object Function]';
}
//Function for check object for emptines
global.Empty = function(obj) {
  return !Object.keys(obj).length;
}
//Function return X time
global.GetTime = function(){
	return parseInt(new Date().getTime() / 1000);
}
//Function return time as string
global.GetTimeString = function() {
    var date = new Date();
    var	sec  	= date.getSeconds();
    var	min  	= date.getMinutes();
    var	hour 	= date.getHours();
    var	day  	= date.getDate();
    var	month 	= date.getMonth() + 1;
    var	year 	= date.getFullYear();
    	
	hour 	= (hour 	< 10 ? "0" : "") + hour;
    min 	= (min 		< 10 ? "0" : "") + min;
    sec 	= (sec 		< 10 ? "0" : "") + sec;
    month 	= (month 	< 10 ? "0" : "") + month;
    day 	= (day 		< 10 ? "0" : "") + day;
    
    return day + "/" + month + "/" + year + " " + hour + ":" + min + ":" + sec;
}
//Check if port is listeing
global.isPortTaken = function(port, fn) {
  var net = require('net')
  var tester = net.createServer()
  .once('error', function (err) {    fn(true)  })
  .once('listening', function() {
    tester.once('close', function() { fn(false) })
    .close()
  })
  .listen(port)
}
//Print message if verbose is ON
global.print = function(string) {
	if (__config.verbose && string) {
		console.log(string.green);
	}
}
//Print error message
global.printDebug = function(string) {
	console.log(string.bgWhite.magenta);
}
//Print error message
global.printError = function(string) {
	console.log(string.bgRed.white);
}