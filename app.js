global.about = {
	name: "TestApplication",
	version: "0.0.1",
	build: "24",
	author:"Ilya Trikoz"
}
//load config

global.__config = require('./config.json');

//load global functions
require('./library/functions.js');

global.pack = require('./library/pack.js');

global.print("Initialized application");

//Load components
require("./components/Server.js");
require("./components/Web.js");
require("./components/Database.js");
require("./components/Authentication.js");
require("./components/Socket.js");
require("./components/Services.js");
require("./components/BinData.js");
require("./components/CommSocket.js");
require("./components/Controller.js");
require("./components/Log.js");
require("./components/Unit.js");
