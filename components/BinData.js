'use strict';

var ns = CreateNameSpace('bindata');

ns.makeArray = function(buffer) {
	
	var struct = {
		version: 0,
		serial: 0,
		timestamp:0,
		params: [],
		data:[],
	};
	
	if (buffer.length < 12) {
		return false;
	}
	//Проверка заголовка
	if (buffer.slice(0,3).toString("hex") != "aaaa41") {
		return false;
	}
	
	struct.version = buffer[3];
	struct.serial = buffer.readUIntBE(4,4);
	struct.timestamp = buffer.readUIntBE(8,4) + 946684800;
	
	var paramCount = buffer[12];
	
	for (var i=0;i<buffer[12];i++) {
		var param = buffer[12+i+1];
		
		if (param) {
			param = param.toString(16).toUpperCase();
			struct.params.push(param);
		} else {
			return false;
		}
	}
	
	var dataStartIndex = 12 + paramCount + 1;
	
	var dataLen = 0;
	var dataVal = 0;
	var bufferLen = buffer.length;
	
	while(true) {
	
		if (dataStartIndex >= bufferLen) {
			break;
		}
		
		dataLen = buffer[dataStartIndex];
		
		dataStartIndex++;
		
		dataVal = buffer.readUIntBE(dataStartIndex, dataLen);
		
		dataStartIndex += dataLen;
		
		var time = dataVal;
		var params = {};
	
		for(var p=0; p < paramCount; p++) {
			
			dataLen = buffer[dataStartIndex];
			
			dataStartIndex++;
			
			dataVal = buffer.readUIntBE(dataStartIndex, dataLen);
			
			dataStartIndex += dataLen;
			
			params[struct.params[p]] = dataVal;
		}
		struct.data.push({
			params: params,
			timestamp: time
		});
		
	}
	
	return struct;
}
/*
setTimeout(function(){
	var buffer = fs.readFileSync('/Volumes/Macintosh\ HD/Users/aw/Documents/AquaMonitor/161026.BIN');	

	var scruct = app.bindata.makeArray(buffer);

	app.unit.updateData(scruct);

}, 100);
*/