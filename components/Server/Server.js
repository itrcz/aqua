'use strict';

var ns = CreateNameSpace('server');

global.fs		= require('fs');
global.os 		= require("os");
//global.pm2		= require('pm2');


require("./fn.startWebServer.js")				(ns);
require("./fn.startPushServer.js")			(ns);


require("./fn.info.js")									(ns);
require("./fn.cpuAverage.js")						(ns);


