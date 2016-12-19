module.exports = function(ns) {
	ns.beforeUnitSave = function(data,_callback) {
		if (!data.name) {
			_callback({
				success:false,
				message:"Не задано имя объекта"
			});
			return false;
		}
		if (!data.well_num) {
			_callback({
				success:false,
				message:"Не задан номер скважины"
			});
			return false;
		}
		if (!data.well_num_cadastral) {
			_callback({
				success:false,
				message:"Не задан кадастровый номер"
			});
			return false;
		}
		if (!data.well_drill_year) {
			_callback({
				success:false,
				message:"Не задан год бурения"
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
}