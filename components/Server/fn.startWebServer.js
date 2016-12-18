module.exports = function(ns) {
	
	global.express 	= require('express');
	global.webapp		= express();
	global.srv = credentials ? require('https').createServer(credentials, webapp) : require('http').createServer(webapp);

	var credentials = false

	if (__config.ssl) {
		var privateKey  = fs.readFileSync(appDir + "/" + __config.credentials.key, 'utf8');
		var certificate = fs.readFileSync(appDir + "/" +__config.credentials.crt, 'utf8');
		credentials = {key: privateKey, cert: certificate};
		
		if (!credentials.cert || !credentials.key) {
			global.printError("Не верный SSL сертифика, приложение не может быть запущео!");
			process.exit();
		}
	}

	/* LISTEN PORT */
	var port = __config.port;
	if (!port) {
		global.printError("Порт для веб сервера не сконфигурирован, приложение не может быть запущео!");
		process.exit();
	}
	isPortTaken(port,function(taken) {
		if (taken) {
			global.printError("Порт ["+port+"] занят другим процессом, приложение не может быть запущено!");
			process.exit();
		}

		console.log(("Веб сервер:    127.0.0.1:"+port).blue);
		if (__config.ssl) {
			console.log(("HTTPS:         Да").green);
		} else {
			console.log(("HTTPS:         Нет").red);
		}
		srv.listen(port);
	});


	webapp.get('/', function (req, res) {
		res.redirect('/arm-web/');
	});
	webapp.use(express.static(appDir+'/web'));

}