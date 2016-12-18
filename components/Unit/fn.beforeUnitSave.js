module.exports = function(ns) {
	ns.beforeUnitSave = function(data,_callback) {
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
}