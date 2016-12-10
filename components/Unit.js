'use strict';

var ns = CreateNameSpace('unit');



ns.vars = {
	unit_table: "aq_unit",
	unit_data_table: "aq_unit_data",
	fields: ['id','name','owner','well_num','well_num_cadastral','well_type','well_drill_year','lat','lng','hw_serial', 'hw_comport', 'hw_comspeed', 'hw_allow_push']
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

	for (var i=0;i<ns.vars.fields.length;i++) {
		if (typeof(data[ns.vars.fields[i]]) !== "undefined") {
			query.set(ns.vars.fields[i], data[ns.vars.fields[i]]);
		}
	}
	
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
		
		for (var i=0;i<ns.vars.fields.length;i++) {
			if (typeof(data[ns.vars.fields[i]]) !== "undefined") {
				query.set(ns.vars.fields[i], data[ns.vars.fields[i]]);
			}
		}
		
	
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
/*
	var struct = {
		version:	INT8,
		serial:		INT32,
		timestamp:	INT32,
		params:		ARRAY,
		data:		ARRAY,
	};
*/
ns.updateData = function(struct) {
	if (!struct || typeof(struct) !== "object") {
		return;
	}
	if (!struct.serial || !struct.timestamp) {
		return;
	}
	var query = squel.select();
		query.field("id");
		query.where("hw_serial=" + struct.serial);
		query.from(ns.vars.unit_table);
		query.limit(1);
	
	app.db.$(query.toString(), function(rows){
		if (rows && rows[0] && rows[0].id) {
			var unitId = rows[0].id;
			var data = struct.data;
			var timestamp = struct.timestamp;
			var paramCount = struct.params.length;
				
			for(var i=0; i < data.length; i++) {
				
				var query = "INSERT INTO =TABLE "+
							"(recordDate, unit_id, A0, B0, F1, F2) "+
							"VALUES(FROM_UNIXTIME(=TIMESTAMP), =ID, '=A0','=B0','=F1','=F2') "+
							"ON DUPLICATE KEY UPDATE "+
							"A0='=A0', B0='=B0', F1='=F1', F2='=F2'";
				
				query = query.replace(/=TABLE/g, ns.vars.unit_data_table);
				query = query.replace(/=TIMESTAMP/g, (data[i].timestamp + timestamp));
				query = query.replace(/=ID/g, unitId);
				
				query = query.replace(/=A0/g, data[i].params['A0']);
				query = query.replace(/=B0/g, data[i].params['B0']);
				query = query.replace(/=F1/g, data[i].params['F1']);
				query = query.replace(/=F2/g, data[i].params['F2']);
					
				app.db.$(query, function(res){
					
				});
					
			}
				
		}
	});
};

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

app.socket.defineClass("Unit", {
	readChart: {
		params: ['page', 'start', 'limit'],
		$: function(req,_callback) {
			return ns.readChart(false,_callback);
		},
	},
	create: {
		params: ns.vars.fields,
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
		params: ns.vars.fields,
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
