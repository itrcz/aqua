'use strict';
/*
	Класс для загрузки клиента
*/
var Boot = function(config) {
	var self = this;
	var software = null;
	var appDir = "/arm-web/";

	document.onmousedown = function(event) { if(event.button==2) return false; }
	
	/*
		Масив с шагами загрузки
		Загрузка происходить синхронно поочередно
	*/
	self.query = [
		//Инициализация загрузки приложения
		{
			type:"function",
			title: "Loadnig application",
			fnc: function(self,_callback){
				self.printDebug("Loading an application");
				_callback(true);
			}
		},
		//Загрузка сокета для общения с сервером
		{
			type:"script",
			title: "Loadnig communication Socket",
			src:"/socket.io/socket.io.js",
		},
		//Подключения к сокету
		{
			type:"function",
			title: "Connecting to Socket",
			fnc: function(self,_callback){
				if (typeof io === 'undefined') {
					return console.error("Socket library is not loaded.");
				}
				var socket_inited = false;
				
				self.io = io.connect();
				self.io.binaryType = 'arraybuffer';
				self.io.on('reconnecting', function(data){
					
					if (localStorage.session) {
						
						self.io.emit("auth",{
							session:localStorage.session
						}, function(res){
							if (res.success && res.user.session) {
					
								self.connectionProblem.classList = "connection_problem";
					
								localStorage.setItem('session', res.user.session);
								
								self.io.emit("getApi", false, function(data){
									//needs to reactivate remote classes
								});
							}
						});
					}
				});
				self.io.on('disconnect', function(data){
					self.connectionProblem.classList = "connection_problem active";
				});
				self.io.on('connect',function(data){
					
					if (!socket_inited) {
						socket_inited = true;
						_callback(true);
					}
				});
				window.socket = self.io;
			}
		},
		//Авторизация в системе
		{
			type:"function",
			title: "Authentication",
			fnc: function(self,_callback){
				if (typeof io === 'undefined') {
					return console.error("Socket library is not loaded.");
				}
				//Функция отправляет логин пароль для входа в систему
				var tryLogin = function(_success) {
					var login = self.auth_form.login_input.value;
					var password = self.auth_form.password_input.value;
					if (!login || !password) {
						self.el.addClass(self.auth_form.form,"incorrect");
						if (typeof(_success) === "function") {
							_success(false);
						}
						return;
					}
					self.io.emit("auth",{
						login:login,
						password:self.MD5(password)
					}, function(res){
						if (res.success && res.user.session) {
							self.el.removeClass(self.auth_form.form,"active");
							
							localStorage.setItem('session', res.user.session);
							
							if (self.auth_form.remember.checked && window.localStorage) {
								localStorage.setItem('login', login);
								localStorage.setItem('password', password);
							}
							if (res.software) {
								self.software = res.software;	
								self.copyright.innerHTML = self.software.name + " версия: " + self.software.version + " сборка: " + self.software.build;
							}
							
							setTimeout(function(){
								_callback(true)
							}, 100);
						} else {
							self.el.addClass(self.auth_form.form,"incorrect");
						}
						if (typeof(_success) === "function") {
							_success(res.success);
						}
					});
				}
				//Функция показывает форму авторизации
				var notLoggedIn = function() {
					self.el.addClass(self.auth_form.form,"active");
					
					self.auth_form.form.addEventListener("animationend", function(){
						self.el.removeClass(this,"incorrect");
					}, false);
					
					
					self.auth_form.password_input.addEventListener('keypress', function (e) {
					    var key = e.which || e.keyCode;
					    if (key === 13) {
							tryLogin();
							return;
					    }		
					});
	
					self.auth_form.submit_button.addEventListener("click", tryLogin);
				}
				//Если логин пароль сохранен, пробуев войти
				if (window.localStorage && localStorage.login && localStorage.password) {
					self.auth_form.login_input.value = localStorage.login;
					self.auth_form.password_input.value = localStorage.password;
					self.auth_form.remember.checked = true;
					
					tryLogin(function(success) {
						if (!success) {
							notLoggedIn();
						}
					});
					return;
				}
				//Показываем форму авторизации
				notLoggedIn();	
			}
		},
		//Загрузка стилей для глифов
		{
			type:"style",
			title: "Loadnig UI icons",
			src:appDir+"library/fontello/css/fontello.css",
		},
		//Загрузка глифов
		{
			type:"style",
			title: "Loadnig UI icons",
			src:appDir+"library/fontello/css/fontello-codes.css",
		},
		//Загрузка скриптов для карт гугл
		{
			type:"script",
			title: "Loading maps",
			src: "https://api-maps.yandex.ru/2.1/?lang=ru_RU",
			//src:"https://maps.googleapis.com/maps/api/js?key=AIzaSyAtbFIwn98QJ2miK1hGu-ERLx3r0S-Vrzg",
		},
		//Загрузка фреймворка
		{
			type:"script",
			title: "Loadnig framework core",
			src:appDir+"library/ext/ext-all-rtl.js",
		},
		//Загрузка библиотеки для графиков
		{
			type:"script",
			title: "Loadnig chart library",
			src:appDir+"library/ext/charts.js",
		},
		//Загрузка стилей для фреймворка
		{
			type:"style",
			title: "Loadnig framework UI",
			src:appDir+"library/ext/resources/theme-crisp-all.css",
		},
		//Загрузка стилей для графиков
		{
			type:"style",
			title: "Loadnig chart UI",
			src:appDir+"library/ext/resources/charts-all.css",
		},
		//Загрузка дополнительных стилей
		{
			type:"style",
			title: "Loadnig styles",
			src:appDir+"/css/theme.css",
		},
		{
			type:"style",
			title: "Loadnig styles",
			src:appDir+"/css/style.css",
		},
		//Загрузка jquery скриптов
		{
		  type:"script",
		  title: "Loading jquery",
		  src:appDir+"library/jquery/jquery-1.12.4.min.js",
		},
		//Загрузка необходимых классов для общения с сервером
		{
			type:"function",
			title: "Loading api classes",
			fnc: function(self,_callback){
				self.io.emit("getApi", false, function(data){
					if (data.success && data.api) {
						window.apiData = data.api;
						_callback(true);
					}
				});
			}
		},
		//Загрузка приложения
		{
			type:"script",
			title: "Initiating application",
			src:appDir+"app/Init.js",
		},
		//Таймаут для того, чтобы приложение успело отрисоватся перед пропаданием загрузчика
		{
			type:"function",
			title: "Initiating application",
			fnc: function(self,_callback){
				
				setTimeout(function(){
					setTimeout(function(){
						self.boot.setAttribute("style","display:none;");
					}, 500);
					
					self.el.addClass(self.boot,"done");
					
					_callback(true);
				}, 100);
			}
		},
	]
	//Показывать дебаг в консоле
	self.isDebug = true;

	//Выводит данные в лог если включен debug
	self.printDebug = function(str) {
		if(self.isDebug) {
			console.log(str);
		}
	}
	//Работа с dom
	self.el = {
		create: function(el) {
			return document.createElement(el);
		},
		//Специально IE9 и IE10, фукнции classList.add у них нету...
		addClass: function(el, cls){
			if (el.className) el.className += ' ';
		    el.className += cls.trim();   
		},
		
		removeClass: function(el, cls) {
			el.className = el.className.replace(new RegExp(cls,'g'),'').trim();
		}
	}
}
//Отрисовка загрузчика
Boot.prototype.init = function(_callback) {
	
	var body 							= document.body;
				
	this.boot 						= this.el.create("div");
				
	var loader 						= this.el.create("div");
	var logo 							= this.el.create("div");

	this.copyright 				= this.el.create("div");
	
	this.progress_title 	= this.el.create("div");
	this.progress 				= this.el.create("div");
	this.progress_tumb 		= this.el.create("div");
	
	this.connectionProblem = this.el.create("div");
		
		
	this.el.addClass(this.boot,"boot");
	
	body.innerHTML = "";
	body.appendChild(this.boot);
	
	this.el.addClass(loader,"loader");
	this.boot.appendChild(loader);
	
	this.el.addClass(logo,"logo");
	loader.appendChild(logo);
	
	this.el.addClass(this.copyright,"copyright");
	loader.appendChild(this.copyright);

	//Форма авторизации
	this.auth_form = {
		form: this.el.create("div"),
		login_input: this.el.create("input"),
		password_input: this.el.create("input"),
		submit_button: this.el.create("button"),
		remember: this.el.create("input"),
		remember_label:this.el.create("label"),
		ssl_message: this.el.create("span"),
	}
	this.auth_form.login_input.type = "text";
	this.auth_form.login_input.placeholder = "Логин";
	
	this.auth_form.password_input.type = "password";
	this.auth_form.password_input.placeholder = "Пароль";
	
	this.auth_form.remember.type = "checkbox";
	this.auth_form.remember.id = "remember";

	this.auth_form.remember_label.setAttribute("for", "remember");
	this.auth_form.remember_label.innerHTML = "Запомнить пароль";
	
	this.auth_form.ssl_message.innerHTML = 'Secure login with SSL';
		
	this.el.addClass(this.auth_form.ssl_message,"ssl");
	
	this.auth_form.submit_button.type = "submit";
	
	this.auth_form.submit_button.innerHTML = "Войти";
	
	this.el.addClass(this.auth_form.form, "login_form");
	
	this.auth_form.form.appendChild(this.auth_form.login_input);
	this.auth_form.form.appendChild(this.auth_form.password_input);
	this.auth_form.form.appendChild(this.auth_form.remember);
	this.auth_form.form.appendChild(this.auth_form.remember_label);
	this.auth_form.form.appendChild(this.auth_form.submit_button);
	
	this.auth_form.form.appendChild(this.auth_form.ssl_message);
	
	
	loader.appendChild(this.auth_form.form);

	//Статус загрузки компонентов
	this.el.addClass(this.progress_title, "progress_title");
	
	loader.appendChild(this.progress_title);
	
	this.el.addClass(this.progress, "progress");
	loader.appendChild(this.progress);
	
	this.el.addClass(this.progress_tumb, "progress_tumb");
	this.progress.appendChild(this.progress_tumb);
	
	//Маска переподключения к сокету
	this.el.addClass(this.connectionProblem,"connection_problem");
	body.appendChild(this.connectionProblem);
	

	var connProbMessage = this.el.create("div");
	//this.el.addClass(connProbMessage,"connection_problem");
	connProbMessage.innerHTML = '<i class="icon-plug"></i><p>Соединение с сервером было прервано, выполняется попытка соединится...</p>';
	
	this.connectionProblem.appendChild(connProbMessage);
	
	//Начать загрузка
	this.bootQuery(this,0,_callback);

}
//Функция проходит по всем шагам и выполняет загрузку
Boot.prototype.bootQuery = function(self,step,finish) {
	var q 			= self.query;
	var query_len 	= q.length;
	var current 	= q[step];

	self.progress_tumb.style.width = ((step / query_len) * 100) + "%";

	if (!q[step]) {
		self.progress_tumb.style.width = "100%";
		if (typeof(finish) === "function") {
			finish(true);
		}
		return true;
	}

	if (current.title) {
		self.progress_title.innerHTML = current.title;
	}
	
	switch (current.type) {
		case "style":
			return self.asyncLoadCss(current.src,function(){
				self.bootQuery(self,++step,finish);
			});
			break;
		case "script":
			return self.asyncLoadScript(current.src,function(){
				self.bootQuery(self,++step,finish);
			});
			break;
		case "function":
			return current.fnc(self,function(status){
				if (status) self.bootQuery(self,++step,finish);
			});
			break;
		default: return self.bootQuery(self,++step,finish);
	}
}
//Описание класса
Boot.prototype.toString = function() {
	return "[Bootloader]";
}
//Асинхронно загружает внешнии скрипты
Boot.prototype.asyncLoadScript = function(src, _callback) {
	var script = document.createElement('script');
    script.setAttribute('src', src);
    script.setAttribute('type', "text/javascript");
    if (typeof _callback === "function") {
		script.onreadystatechange = script.onload = function() {
			//Timeout for IE10, browser need some time for init script...
			if (navigator.userAgent.toLowerCase().indexOf('msie') != -1 && parseInt(navigator.userAgent.toLowerCase().split('msie')[1]) < 11 ) {
				setTimeout(function(){
					_callback(true);
				}, 500);
			} else {
				_callback(true);
			}
		};
	}
	document.getElementsByTagName('head')[0].appendChild(script);
}
//Асинхронно загружает внешнии стилей
Boot.prototype.asyncLoadCss = function(href, _callback) {
	var css = document.createElement('link');
    css.setAttribute('rel', "stylesheet");
    css.setAttribute('type', "text/css");
    css.setAttribute('href', href);
	css.setAttribute('media', "all");
    
    if (typeof _callback === "function") {
		css.onreadystatechange = css.onload = function() {
			//Timeout for IE10, browser need some time for init script...
			if (navigator.userAgent.toLowerCase().indexOf('msie') != -1 && parseInt(navigator.userAgent.toLowerCase().split('msie')[1]) < 11 ) {
				setTimeout(function(){
					_callback(true);
				}, 500);
			} else {
				_callback(true);
			}
		};
	}
	document.getElementsByTagName('head')[0].appendChild(css);
}

//Функция md5()
Boot.prototype.MD5 = function(s,raw,hexcase,chrsz) {
	raw = raw || false;	
	hexcase = hexcase || false;
	chrsz = chrsz || 8;
	
	function safe_add(x, y){
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}
	function bit_rol(num, cnt){
		return (num << cnt) | (num >>> (32 - cnt));
	}
	function md5_cmn(q, a, b, x, s, t){
		return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t){
		return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t){
		return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t){
		return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t){
		return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}
	
	function core_md5(x, len){
		x[len >> 5] |= 0x80 << ((len) % 32);
		x[(((len + 64) >>> 9) << 4) + 14] = len;
		var a =  1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d =  271733878;
		for(var i = 0; i < x.length; i += 16){
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
			d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
			c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
			b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
			a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
			d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
			c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
			b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
			a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
			d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
			c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
			b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
			a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
			d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
			c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
			b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);
			a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
			d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
			c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
			b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
			a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
			d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
			c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
			b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
			a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
			d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
			c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
			b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
			a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
			d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
			c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
			b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);
			a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
			d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
			c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
			b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
			a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
			d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
			c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
			b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
			a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
			d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
			c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
			b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
			a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
			d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
			c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
			b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);
			a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
			d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
			c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
			b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
			a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
			d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
			c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
			b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
			a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
			d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
			c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
			b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
			a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
			d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
			c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
			b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);
			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
		}
		return [a, b, c, d];
	}
	function str2binl(str){
		var bin = [];
		var mask = (1 << chrsz) - 1;
		for(var i = 0; i < str.length * chrsz; i += chrsz) {
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
		}
		return bin;
	}
	function binl2str(bin){
		var str = "";
		var mask = (1 << chrsz) - 1;
		for(var i = 0; i < bin.length * 32; i += chrsz) {
			str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
		}
		return str;
	}
	
	function binl2hex(binarray){
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var str = "";
		for(var i = 0; i < binarray.length * 4; i++) {
			str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
		}
		return str;
	}
	return (raw ? binl2str(core_md5(str2binl(s), s.length * chrsz)) : binl2hex(core_md5(str2binl(s), s.length * chrsz))	);
}