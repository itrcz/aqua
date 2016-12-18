module.exports = function(ns) {
	ns.recalculateRawData = function(opt,_callback) {
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
}