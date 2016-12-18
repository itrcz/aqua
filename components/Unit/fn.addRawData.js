module.exports = function(ns) {
	ns.addRawData = function(struct) {
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
						app.log.writeCommunicationLog({
							type: "NOTIFY",
							msg: "Получены данные от устройства S/N:" + scruct.serial,
						});
					}); 
				}
			} else {
				app.log.writeCommunicationLog({
					type: "WARNING",
					msg: "Полученый данные с не сконфигурированного устройства! S/N: "+struct.serial+".",
				});
			}
		});
	};
}