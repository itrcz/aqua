module.exports = function(ns) {
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
}