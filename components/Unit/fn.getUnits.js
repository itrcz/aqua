module.exports = function(ns) {
	/*
	Выгрузить список юнитов из БД
	*/
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
			/*
	 		Проверяем время последнего коннекта
			и задаем статус онлайн / оффлайн
			*/
			var now = new Date().getTime();
			for (var i = 0; i < rows.length; i++) {
				rows[i].hw_availability = 0;
				if (rows[i].last_activity) {
					var last_activity = new Date(rows[i].last_activity).getTime();
					console.log(last_activity, " = ", now);

					if (now - 3600 * 1000 < last_activity) {
						rows[i].hw_availability = 1;
					}
				}
			}
			_callback(rows);
		});
	}
}