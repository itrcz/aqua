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
				var rowTimeStamp = 0;

				for(var i=0; i < data.length; i++) {

					rowTimeStamp = (data[i].timestamp + timestamp);
					
					var A0 = data[i].params['A0'];
					var B1 = data[i].params['B0'];
					var F1 = data[i].params['F1'];
					var F2 = data[i].params['F2'];

					var query = ` 
						INSERT INTO ${ns.vars.unit_data_table} (recordDate, unit_id, A0, B0, F1, F2) 
						VALUES(
							FROM_UNIXTIME(${rowTimeStamp}), ${unitId}, "${A0}", "${B0}", "${F1}", "${F2}"
						) 
						ON DUPLICATE KEY UPDATE 
						A0="${A0}", B0="${B0}", F1="${F1}", F2="${F2}"
					`;

				}
				app.db.$(query, function(res){
					app.log.writeCommunicationLog({
						type: "NOTIFY",
						msg: `Получены данные от устройства S/N: ${struct.serial}`,
					});
				});
				//Обновляем статус онлайн
				app.db.$(`UPDATE ${ns.vars.unit_table} SET last_activity = FROM_UNIXTIME(${rowTimeStamp}) WHERE id = ${unitId}`, function(rows){

				}); 
			} else {
				app.log.writeCommunicationLog({
					type: "WARNING",
					msg: `Полученый данные с не сконфигурированного устройства! S/N: ${truct.seria}`,
				});
			}
		});
	};
}