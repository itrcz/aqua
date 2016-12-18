module.exports = function(ns) {
	ns.updateUnit = function(data,_callback) {
		if (typeof(_callback) !== "function") return;

		if (!data && !data.id) {
			_callback({
				success:false,
				message:"При получении данных сервером произошла ошибка, попробуйте открыть форму заного."
			});
			return;
		}

		var query = squel.update();

		query.table(ns.vars.unit_table);

		if (!ns.beforeUnitSave(data,_callback)) {
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

		app.db.$(query.toString(), function(res,err){
			if (res.affectedRows > 0) {
				_callback({
					success:true
				});
			} else {
				_callback({
					success:false,
					message:err.toString()
				});
			}
		});
	}
}