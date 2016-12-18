module.exports = function(ns) {
	ns.addUnit = function(data,_callback) {
		if (typeof(_callback) !== "function") return;

		var query = squel.insert();

		query.into(ns.vars.unit_table);

		if (!ns.beforeUnitSave(data,_callback)) {
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
}