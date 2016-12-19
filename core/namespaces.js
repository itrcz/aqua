
global.LoadComponent = function(cmp) {
	require(`${appDir}/components/${cmp}/${cmp}.js`);
}

/*

Функция для создания объекта класса

!Возвращает false если объект уже создат

*/
global.NameSpace = function (ns, shortcut) {
	if (typeof(global.app) === "undefined") {
		global.app = Object();
	}
	if (typeof(global.namespaces) === "undefined") {
		global.namespaces = Object();
	}
	if (global.namespaces[ns]) {
		return false;
	}
	if (shortcut && global.app[shortcut]) {
		return false;
	}
	this.ns = {
		class: ns,
		shortcut: shortcut,
		public: Object()
	}
	global.namespaces[ns] = this.ns;

	if (shortcut) {
		global.app[shortcut] = this.ns;
	}
	return this.ns;
}

global.GetNameSpace = function(ns) {
	if ( ! global.namespaces[ns]) {
		return false;
	}
	return global.namespaces[ns];
}