global.about = {
	name: "AquaMonitor",
	version: "0.1.1",
	build: "98",
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

global.print("Initialized application");

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

