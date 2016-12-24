'use strict';

var ns = CreateNameSpace('socket');

if (typeof(srv) === "undefined") {
	global.printError("Error occured while starting Socket, cannot start socket without Server component");
	return;
}

ns.io = require('socket.io')(srv, { log: __config.socket.log });


//В массив будут записаны классы директа для работы API клиента
ns.definedFuctions = [];

//Функция для записи классов API
/*
	первый вараметр - имя класса 
	второй параметр - массив функция
*/
ns.defineClass = function(className, functions) {
	if (className && typeof(functions) === "object") {
		ns.definedFuctions[className] = functions;
		return true;
	}
	return false;
}

/*
	Вызывается при успешном подключении сокета
	инициализирует события для обработки API запросов
*/
ns.initDefinitions = function(socket) {
	//Инициализация директ классов
	for(var className in ns.definedFuctions) {
		
		var functions = ns.definedFuctions[className];
		
		for(var functionName in functions) {
			var fnc = functions[functionName];
			
			var event = className + "." + functionName;

			socket.on(event, function(req,res) {
				
				if (ns.definedFuctions
					&&
					ns.definedFuctions[req.action]
					&&
					ns.definedFuctions[req.action][req.method]
					&&
					typeof(ns.definedFuctions[req.action][req.method].$) === "function") {
					
					req.user = socket.user;
					
					ns.definedFuctions[req.action][req.method].$(req,function(data){
						res({
					        type    : req.type,
					        tid     : req.tid,
					        action  : req.action,
					        method  : req.method,
					        data    : data
					    });
					});
				}
			})
			
		}
	}
}
/*
	Вызывается при входящем соединении от клиента
*/
ns.io.on('connection', function (socket) {
	
	/* Tests */
	socket.on('disconnect', function () {
		
	});
	  
	 socket.on('error', function() {

		console.log("Socket error, destroyed");

    socket.destroy();
	});
	
	/* End of tests */
	
	/*
		Обработка запроса на авторизацию
	*/
	socket.on("auth", function(arg,_callback){
		if (typeof _callback !== 'function') return;
		
		app.auth.check(arg,function(user){
			if (!user) {
				_callback({
					"success":false,	
				});
				return;
			}
			var ipaddr = socket.handshake.address;
				ipaddr = ipaddr.replace("::ffff:","");
				
			user.ipaddr = ipaddr;
			
			socket.user = user;
			
			//Включаем функции директа для данного сокета
			ns.initDefinitions(socket);
				
			_callback({
				"success":true,
				"user": user,
				"software": global.about
			});
		})
	});
	/*
		Обработка запроса GetAPI
		Отправляет API классы клиенту
	*/
	socket.on("getApi", function(arg,_callback){
		if (typeof _callback !== 'function') return;
		
		if (socket.user) {
			var api = {};
			
			for(var className in ns.definedFuctions) {
				
				var functions = ns.definedFuctions[className];
				
				api[className] = [];
				
				for(var functionName in functions) {
					api[className].push({
						name:functionName,
						params:functions[functionName].params
					});
				}
			}
			
			_callback({
				"success":true,
				"api": api
			});
			
			return;	
		}
		_callback({
			"success":false
		});
	});

});