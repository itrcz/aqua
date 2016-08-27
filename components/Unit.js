'use strict';

var ns = CreateNameSpace('unit');

ns.vars = {
	unit_table: "aq_unit",
	unit_data_table: "aq_unit_data",
};

ns.getUnits = function(opt,_callback) {
	if (typeof(_callback) !== "function") return;

	if (!opt || typeof(opt) !== "object") opt = [];

	var query = squel.select();

	if (typeof(opt.select) === "object") {
		for (var key in opt.select) {
			query.field(opt.select[key]);
		}
	}

	query.from(ns.vars.unit_table);


	if (typeof(opt.where) === "object") {
		for (var key in opt.where) {
			query.where(key+" = '"+opt.where[key]+"'");
		}
	}

	if (typeof(opt.limit) === "number" && opt.limit > 0) {
		query.limit(opt.limit);
	}

	app.db.$(query.toString(), function(rows){
		_callback(rows);
	});
}
ns.checkUnitData = function(data,_callback) {
	if (!data.name) {
		_callback({
			success:false,
			message:"Не задано имя объекта"
		});
		return false;
	}

	if (!data.lat || !data.lng) {
		_callback({
			success:false,
			message:"Не заданы координаты объекта"
		});
		return false;
	}
	return true;
}
ns.addUnit = function(data,_callback) {
	if (typeof(_callback) !== "function") return;

	var query = squel.insert();

	query.into(ns.vars.unit_table);

	if (!ns.checkUnitData(data,_callback)) {
		return;
	}

	query.set("name",			data.name);
	query.set("owner",			data.owner);
	query.set("lat",			data.lat);
	query.set("lng",			data.lng);
	query.set("hw_serial",		data.hw_serial);
	query.set("hw_conn_type",	data.hw_conn_type);
	query.set("hw_ipaddr",		data.hw_ipaddr);
	query.set("hw_comport",		data.hw_comport);
	query.set("hw_comspeed",	data.hw_comspeed);

	app.db.$(query.toString(), function(res){

		if (res.insertId > 0) {
			_callback({
				success:true,
				data: res.insertId
			});
		} else {
			_callback({
				success:false,
				message:"Cannot insert data into table " + ns.vars.unit_table
			});
		}
	});

}
ns.updateUnit = function(data,_callback) {
	if (typeof(_callback) !== "function") return;

	if (!data && !data.id) {
		_callback({
			success:false,
			message:"Record does not exists"
		});
		return;
	}

	var query = squel.update();

		query.table(ns.vars.unit_table);

		if (!ns.checkUnitData(data,_callback)) {
			return;
		}

		query.set("name",			data.name);
		query.set("owner",			data.owner);
		query.set("lat",			data.lat);
		query.set("lng",			data.lng);
		query.set("hw_serial",		data.hw_serial);
		query.set("hw_conn_type",	data.hw_conn_type);
		query.set("hw_ipaddr",		data.hw_ipaddr);
		query.set("hw_comport",		data.hw_comport);
		query.set("hw_comspeed",	data.hw_comspeed);

		if (data.instant_water_quality) 	query.set("instant_water_quality",		data.instant_water_quality);
		if (data.instant_water_level) 		query.set("instant_water_level",		data.instant_water_level);
		if (data.instant_water_consumption) query.set("instant_water_consumption",	data.instant_water_consumption);


		query.where("id="+data.id);

		app.db.$(query.toString(), function(res){
			if (res.affectedRows > 0) {
				_callback({
					success:true
				});
			} else {
				_callback({
					success:false,
					message:"Record does not exists"
				});
			}
		});
}
/*
	Функция удаляет объект из базы
	также будет удален адрес привязанный к объекту
*/
ns.removeUnit = function(data,_callback) {
	if (typeof(_callback) !== "function") return;

	if (!data && !data.id) {
		_callback({
			success:false,
			message:"Record does not exists"
		});
		return;
	}


	var query = squel.remove();

		query.from(ns.vars.unit_table);

		query.where("id="+data.id);


	app.db.$(query.toString(), function(res){


		if (res.affectedRows > 0) {
			return _callback({
				success:true
			});
		}
		_callback({
			success:false,
			message:"Error occured while deleting row from table " + ns.vars.unit_table

		});
	});
}
ns.addUnitData = function(opt,_callback) {
	if (typeof(_callback) !== "function") return;

	if (!opt || typeof(opt) !== "object") opt = [];

	var query = squel.insert();

	query.into(ns.vars.unit_data_table);

	if (opt.lvl >= 0) {
		query.set("lvl", opt.lvl);
	}
	if (opt.cons >= 0) {
		query.set("cons", opt.cons);
	}
	if (opt.recordDate) {
		query.set("recordDate", opt.recordDate.SQL());
	}

	if (opt.id > 0) {

		query.set("unit_id", opt.id);

		app.db.$(query.toString(), function(res){

			ns.updateUnit({
				id:							opt.id,
				instant_water_level:		opt.lvl,
				instant_water_consumption:	opt.cons,
			},$$);

			if (res.affectedRows > 0) {
				_callback({
					success:true
				});
			} else {
				_callback({
					success:false,
					message:"Cannot insert data into table " + ns.vars.unit_data_table
				});
			}
		});
	} else {
		_callback({
			success:false,
			message:"Cannot insert data into table " + ns.vars.unit_data_table + " cause unit_id is NULL"
		});
	}
}

ns.readChart = function(opt,_callback) {
	if (typeof(_callback) !== "function") return;

	if (!opt || typeof(opt) !== "object") opt = [];

	var query = squel.select();

	if (typeof(opt.select) === "object") {
		for (var key in opt.select) {
			query.field(opt.select[key]);
		}
	}
	query.field("ANY_VALUE(lvl) as lvl");
	query.field("ANY_VALUE( date_format(recordDate, '%Y-%m-%d %l:%i:%s') )  as recordDate")

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

app.socket.defineClass("Unit", {
	readChart: {
		params: ['page', 'start', 'limit'],
		$: function(req,_callback) {
			return ns.readChart(false,_callback);
		},
	},
	create: {
		params: ['id','name','owner','lat','lng','hw_serial','hw_conn_type', 'hw_ipaddr', 'hw_comport', 'hw_comspeed'],
		$: function(req,_callback) {
			return ns.addUnit(req.data,_callback);
		},
	},
	read: {
		params: ['page', 'start', 'limit'],
		$: function(req,_callback) {
			return ns.getUnits(false,_callback);
		},
	},
	update: {
		params: ['id','name','owner','lat','lng','hw_serial','hw_conn_type', 'hw_ipaddr', 'hw_comport', 'hw_comspeed'],
		$: function(req,_callback) {
			return ns.updateUnit(req.data,_callback);
		},
	},
	destroy: {
		params: ['id'],
		$: function(req,_callback) {
			return ns.removeUnit(req.data,_callback);
		},
	}
});
