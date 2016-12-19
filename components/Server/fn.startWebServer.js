module.exports = function(ns) {
	
	let credentials = false;

	global.express 	= require('express');
	global.webapp		= express();

	if (__config.ssl) {
		let privateKey  = fs.readFileSync(`${appDir}/${ __config.credentials.key}`, 'utf8');
		let certificate = fs.readFileSync(`${appDir}/${ __config.credentials.crt}`, 'utf8');
				credentials = {key: privateKey, cert: certificate};
		
		if (!credentials.cert || !credentials.key) {
			global.printError(`Не верный SSL сертифика, приложение не может быть запущео!`);
			process.exit();
		}
	}

	global.srv = credentials ? require('https').createServer(credentials, webapp) : require('http').createServer(webapp);


	if (!__config.port) {
		global.printError(`Порт для веб сервера не сконфигурирован, приложение не может быть запущео!`);
		process.exit();
	}
	isPortTaken(__config.port,function(taken) {
		if (taken) {
			global.printError(`Порт ${__config.port} занят другим процессом, приложение не может быть запущено!`);
			process.exit();
		}

		console.log(`Веб сервер:    127.0.0.1:${__config.port}`.blue);
		if (__config.ssl) {
			console.log(`HTTPS:         Да`.green);
		} else {
			console.log(`HTTPS:         Нет`.red);
		}
		srv.listen(__config.port);
	});


	webapp.get('/', function (req, res) {
		res.redirect('/arm-web/');
	});
	webapp.use(express.static(`${appDir}/web`));

}