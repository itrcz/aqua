global.about = {
	name: "AquaMonitor",
	version: "0.1.1",
	build: "104",
	author:"Ilya Trikoz"
}
//load config
global.__config = require('./config.json');

global.fs 		= require('fs');
global.path 	= require('path');
global.colors = require('colors');
global.crypto = require('crypto');


global.appDir = path.resolve(__dirname);

//load global functions
require(appDir+'/core/functions.js');
require(appDir+'/core/namespaces.js');

console.log(("                             ").bgBlue.white);
console.log(("         "+ about.name +"         ").bgBlue.white);
console.log(("       "+ " Версия:" + about.version + "         ").bgBlue.white);
console.log(("        "+ " Cборка:" + about.build +"          ").bgBlue.white);
console.log(("                             ").bgBlue.white);

//Load components
LoadComponent("Server");

LoadComponent("Database");
LoadComponent("Authentication");
LoadComponent("Socket");
LoadComponent("Services");
LoadComponent("BinData");
LoadComponent("CommSocket");
LoadComponent("Controller");
LoadComponent("Log");
LoadComponent("Unit");

setTimeout(function(){
	console.log(("                             ").bgBlue.white);
},100)