'use strict';

var ns = CreateNameSpace('unit');

ns.vars = {
	unit_table: "aq_unit",
	unit_data_table: "aq_unit_data",
	fields: ['id','name','owner','well_num','well_num_cadastral','well_type','well_drill_year','lat','lng','hw_availability','hw_serial', 'hw_comport', 'hw_comspeed', 'hw_allow_push']
};

/*
	Проверка корректности данные перед сохранением в базу
	Если при проверку возникнет ошибка она будет передана в интерфейс
*/
require("./fn.beforeUnitSave.js")		(ns);

/*
	Возвращает список скважин
*/
require("./fn.getUnits.js")				(ns);
/*
	Добавляет скважину в базу
*/
require("./fn.addUnit.js")				(ns);
/*
	Обновляет скважину в базе
*/
require("./fn.updateUnit.js")			(ns);
/*
	Удаляет скважину из базы
*/
require("./fn.removeUnit.js")			(ns);

/*
	Пока не задействована
	предназначени для пересчета значений raw в нормыльный вид
*/
require("./fn.recalculateRawData.js")		(ns);

/*
* Функция вызывается после получения данных от контроллера
* Записывает сырые даные в базу по серейному номеру контроллера
* Если в базе отсутвует конфигурация на контроллер будет записан лог об ошибке
*	var struct = {
*		version:	INT8,
*		serial:		INT32,
*		timestamp:	INT32,
*		params:		ARRAY,
*		data:		ARRAY,
*	};
*/
require("./fn.addRawData.js")		(ns);


/*

	Тестовые функции

*/
ns.readChart = function(opt,_callback) {
	if (typeof(_callback) !== "function") return;

	if (!opt || typeof(opt) !== "object") opt = [];

	var query = squel.select();

	if (typeof(opt.select) === "object") {
		for (var key in opt.select) {
			query.field(opt.select[key]);
		}
	}
	query.field("B0 as lvl");
	query.field("date_format(recordDate, '%Y-%m-%d %l:%i:%s')  as recordDate")

	query.from(ns.vars.unit_data_table);

	if (typeof(opt.where) === "object") {
		for (var key in opt.where) {
			query.where(key+" = '"+opt.where[key]+"'");
		}
	}

	if (typeof(opt.limit) === "number" && opt.limit > 0) {
		query.limit(opt.limit);
	}
	query.limit(1000);
	//query.group("DATE_FORMAT(recordDate, '%Y-%m-%d %H')");
	query.order("recordDate");

	//query = "SELECT * FROM aq_unit_data "+
	//   	"WHERE recordDate IN ( "+
	//   	"	SELECT MIN(recordDate) "+
	//   	"	FROM aq_unit_data "+
	//   	"	GROUP BY UNIX_TIMESTAMP( recordDate ) DIV ( 3600 ) "+
	//   	")";
	//
	//app.db.$(/* query.toString() */query, function(rows){
	//   _callback(rows);
	//});


	app.db.$(query.toString(), function(rows){
		_callback(rows);
	});
}

//Публичные функции для интерфейса
require("./define.Unit.js")			(ns);
