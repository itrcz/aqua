'use strict';

//Типы транспортов
var PRTOTOCOL_TRANSPORT_SERIAL = 0x01
var PRTOTOCOL_TRANSPORT_GPRS = 0x02

var PROTOCOL_RESTART = 0xFF
//Байт начала пакета
var PROTOCOL_STX = 0xAA

//Позиции в пакете
var PROTOCOL_POS_STX = 0
var PROTOCOL_POS_CMD = 1
var PROTOCOL_POS_ACK = 1
var PROTOCOL_POS_CMD_ACK = 1
var PROTOCOL_POS_STS = 2
var PROTOCOL_POS_LEN = 3
var PROTOCOL_POS_DATA_START = 4
var PROTOCOL_POS_CRC_WITHOUTDATA = 5

//Команды протокола
var PROTOCOL_CMD_PING 	= 0x01
var PROTOCOL_CMD_INFO 	= 0x02
var PROTOCOL_CMD_GETRTC = 0x0B
var PROTOCOL_CMD_SETRTC = 0x0C

var PROTOCOL_CMD_SERVICE_SETSN 	= 0x78

var PROTOCOL_CMD_PUSH_REQUEST 		= 0x64
var PROTOCOL_CMD_PUSH_DATA_START 	= 0x65
var PROTOCOL_CMD_PUSH_DATA_RAW 		= 0x66

//Статусы пакета
var PROTOCOL_STS_SUCCESS 		= 0x00
var PROTOCOL_STS_FAIL 			= 0x01
var PROTOCOL_STS_CRC 			= 0x02
var PROTOCOL_STS_OVERFLOW 		= 0x03
var PROTOCOL_STS_UNSUPPORTED 	= 0x04
var PROTOCOL_STS_DENIDED 		= 0x04

var ns = CreateNameSpace('commsocket');

ns.util = {
  rawToArray: function(buffer) {
  	var array = [];
  	for (var i = 4;i < buffer.length-1; i++) {
      var len = buffer[i];
  		array.push( buffer.slice(i+1, i+1 + buffer[i]) );
      i += buffer[i];
    }
  	return array;
  },
  crc8: function(dat,crc) {
    if (!crc) crc = 0x0;
    for( var i=0; i<8; i++) {
      var fb = (crc ^ dat) & 1;
      crc >>= 1;
      dat >>= 1;
      if( fb ) crc ^= 0x8C; // полином
    }
    return crc;
  }
}

ns.CMD = {}

ns.CMD.PING = function(port, _callback) {
  ns.SEND({
    port:port,
    cmd_ack:PROTOCOL_CMD_PING
  },_callback);
}
ns.CMD.SETRTC = function(port, time, _callback) {
  ns.SEND({
    port:port,
    
    cmd_ack:PROTOCOL_CMD_SETRTC,
    data:time,
  },_callback);
}
ns.CMD.SETSN = function(port, sn, _callback) {
	var buf = new Buffer(4);
	buf.writeUInt32LE(sn,0);
	
  ns.SEND({
    port:port,
    cmd_ack:PROTOCOL_CMD_SERVICE_SETSN,
    data:buf,
  },_callback);
}
ns.CMD.INFO = function(port, _callback) {
  ns.SEND({
    port:port,
    timeout:300,
    cmd_ack:PROTOCOL_CMD_INFO
  },function(res){
    if (res.success) {
      var bufs = ns.util.rawToArray(res.data);
      if (bufs[0] && bufs[1]) {
        return _callback({
          success:true,
          sn: bufs[0].readUIntBE(0,bufs[0].length),
          name: bufs[1].toString(),
        });
      }
    }
    return _callback({
      success:false
    });
  });
}
ns.SEND = function(param, _callback) {
	if (!param || !param.port || !param.cmd_ack) {
	  if (typeof(_callback) === "function") {
	    _callback({
	      success:false,
	      message:"incorrect call"
	    });
	  }
	  return;
	}
	
	if (!param.sts) {
	  param.sts = PROTOCOL_STS_SUCCESS;
	}
	
	//Если нет тайм
	
	param.timeout = param.timeout || 200;
	
	//Длина данных
	param.length = 0x00;
	if(param.data) {
	  param.length = param.data.length;
	}
	
	var done = false;
	var Buff = new ns.rxBuffer();
	
	var writePackage = function() {
  	
  		var crc = 0x0;
		crc = ns.txBegin(param.port, param.cmd_ack, param.sts, crc);
		crc = ns.txLength(param.port, param.length, crc);
		
		if (param.length > 0) {
			crc = ns.txData(param.port, param.data, param.length, crc);
		}
		
		crc = ns.txCrc(param.port, crc);
		
    	var rxTimeout = null;
    	
    	var updateRxTimeout = function () {
			if (rxTimeout) {
			    clearTimeout(rxTimeout);
			    rxTimeout = null;
			}
		    rxTimeout = setTimeout(function(){
		        if (!done) {
					done = true;
					if (param.port.isOpen()) {
						param.port.close();
					}
					_callback({
		            	success:false,
						message:"Timeout"
		        	});
		        }
		    }, param.timeout);
    	}    
		updateRxTimeout();
    	param.port.on('data', function(data){
	    	
	    	updateRxTimeout();
			
	        var buffObject = Buff.$rx(data);
	        if (buffObject) {
				done = true;
				if (param.port.isOpen()) {
					param.port.close();
				}
				var buffer = false;
				var success = false;
				var message = "";
				switch (buffObject.check) {
	            	case PROTOCOL_STS_SUCCESS:
					success = true;
	              	buffer = buffObject.buffer;
	              break;
	              case PROTOCOL_STS_FAIL:
	                message = "Команда выполнена с ошибкой";
	                break;
	              case PROTOCOL_STS_CRC:
	                message = "CRC сумма не совпадает";
	                break;
	              case PROTOCOL_STS_OVERFLOW:
	                message = "Превышена длина данных";
	                break;
	              case PROTOCOL_STS_UNSUPPORTED:
	                message = "Команда не поддерживается";
	                break;
	              default:
	                message = "Не известная ошибка при передачи данных";
	            }
	            return _callback({
	              success:success,
	              data: buffer,
	              message:message,
	            });
	        }
    	});
	}
	
    param.port.open(function(err){
		if (err) {
			done = true;
			return _callback({
				success:false,
				message:err
			});
		} else {
			writePackage();
		}
    });
}


ns.tx = function(port, data, crc, lastByte) {
	if (!port) {
		return false;
	}
	//if port is web socket
	if (port.paket) {
		port.write(data);
	} else {
		//if port is serial
		port.write(data,function(err) {
			port.drain(function(err) {});
		});

	}
	if (lastByte) {
    	return;
	}
	return ns.util.crc8(data[0],crc);
}
ns.txBegin = function(port,cmd_ack, sts, crc) {
  /*
    после повторного открытия порта
    первый пакет может быть отправлен не корретно
    поэтому отправляем 1 байт PROTOCOL_RESTART
    если даже они запишутся, контроллер их проигнорирует
  */
  //ns.tx(port,new Buffer([PROTOCOL_RESTART]), 0x00);

  //Передаем первый байт пакета STX
  crc = ns.tx(port,new Buffer([PROTOCOL_STX]), crc);
  //Передаем CMD или ACK
  crc = ns.tx(port,new Buffer([cmd_ack]), crc);
  //Передаем стутсу STS
  crc = ns.tx(port,new Buffer([sts]), crc);

  return crc;
}
ns.txLength = function(port,len,crc) {
  //Передаем длину данных LEN
  return ns.tx(port,new Buffer([len]), crc);
}
ns.txData = function(port,data,size, crc) {
  for (var i = 0;i < data.length; i++) {
    crc = ns.tx(port, new Buffer([data[i]]), crc);
  }
  return crc;
}
ns.txCrc = function(port, crc) {
  return ns.tx(port,new Buffer([crc]), crc, true);
}

ns.rxBuffer = function() {
  var self = this;

  this.zeroBuffer = function() {
    self.crc    = 0x0;
    self.buffer = new Buffer(255);
    self.length = 0x0;
  }
  self.zeroBuffer();

  self.rx = function(buff) {
    self.buffer[self.length++] = buff;
    /*
     Если STX не равен 0xAA стандартна протокола
    */
    if (self.buffer[PROTOCOL_POS_STX] != PROTOCOL_STX) {
      self.zeroBuffer();
      return;
    }

    //Если байт не является последним из пакета то считаем сумму CRC8
    if (self.length != (self.buffer[PROTOCOL_POS_LEN] + PROTOCOL_POS_CRC_WITHOUTDATA)) {
      self.crc = ns.util.crc8(buff, self.crc);
    }
    /*
      Проверяем длину данные
      если привыщает отвечаем PROTOCOL_STS_OVERFLOW
    */
    if (self.length == PROTOCOL_POS_LEN + 1) {
      if (self.buffer[PROTOCOL_POS_LEN] > 250) {
        //txBegin( buffer[PROTOCOL_POS_CMD] | 0x40, PROTOCOL_STS_OVERFLOW);
        //txLength(0);
        //txCrc();
      }
    }
    /*
      Код ниже имеет смысл выполнять
      только при наличии STX, CMD, STS LEN
    */
    if (self.length >= PROTOCOL_POS_DATA_START) {
      /*
        Проверяем если текущий байт является последними
      */
      //LEN + STX, CMD, STS LEN, CRC
      if (self.length == (self.buffer[PROTOCOL_POS_LEN] + PROTOCOL_POS_CRC_WITHOUTDATA)) {
	  	self.crcCorrect = false;
	  	self.dataBuffer = null;
        //Если сумма CRC совпадает
        if (self.crc == self.buffer[self.length-1]) {
          //Обрезаем лишнее
          self.buffer = self.buffer.slice(0, self.length);
		  
		  self.dataBuffer = self.buffer.slice(PROTOCOL_POS_DATA_START, self.length-1);
		  	  
		  self.crcCorrect = true;
          //EXEC();
        } 
        //Отдаем пакет
          return {
	        buffer: self.buffer,
	        cmd_ack: self.buffer[PROTOCOL_POS_CMD_ACK],
	        sts: self.buffer[PROTOCOL_POS_STS],
	        len: self.buffer[PROTOCOL_POS_LEN],
	        data: self.dataBuffer,
	        crc: self.buffer[self.buffer.length - 1],
			check: self.crcCorrect ? PROTOCOL_STS_SUCCESS : PROTOCOL_STS_CRC
          };
        //Обнуляем буфер
        self.zeroBuffer();
      }
    }
  }//end of this.rx

  //Функция обрабатывает куски пакета по 1 байту
  self.$rx = function(data) {
    var buff;
    for (var i = 0;i< data.length;i++) {
      buff = self.rx(data[i]);
    }
    return buff;
  }
}//end of ns.rxBuffer



ns.sendResponse = function(socket) {
	if (!socket) return false;
	if (!socket.paket) return false;
	
	var crc = 0x0;
	
	if (socket.paket.check) {
		global.printError("Recieved paket has error");
		console.log("CODE: ", socket.paket.check);
		
		crc = ns.txBegin(socket, PROTOCOL_CMD_PUSH_REQUEST + 0x80, PROTOCOL_STS_CRC, crc);
		crc = ns.txLength(socket, 0, crc);
		crc = ns.txCrc(socket, crc);
		return;
	}

	switch(socket.paket.cmd_ack) {
		case PROTOCOL_CMD_PUSH_REQUEST:
			global.printDebug("PUSH_REQUEST: ACK");
			crc = ns.txBegin(socket, PROTOCOL_CMD_PUSH_REQUEST + 0x80, PROTOCOL_STS_SUCCESS, crc);
		    crc = ns.txLength(socket, 0, crc);
		    crc = ns.txCrc(socket, crc);
			app.log.writeCommunicationLog({
				type: "NOTIFY",
				msg: "Push request from addr:" + socket._peername.address + " port:" + socket._peername.port + " family:" + socket._peername.family,
			});
			
		break;
		case PROTOCOL_CMD_PUSH_DATA_START:
			global.printDebug("PUSH_DATA_START: ACK");
			crc = ns.txBegin(socket, PROTOCOL_CMD_PUSH_DATA_START + 0x80, PROTOCOL_STS_SUCCESS, crc);
		    crc = ns.txLength(socket, 0, crc);
		    crc = ns.txCrc(socket, crc);
			/*
				Записываем масив raw для приема данных в сокет
				249 - максимальное количество данных в пакете
			*/
			var rawPaketCount = socket.paket.data[0];
			
			if (!socket.raw_data_pakets) {
				socket.raw_data_pakets = new Array();
			}
			for (var i = 0; i < rawPaketCount; i++) {
				socket.raw_data_pakets.push({
					received: false,
					buffer:null
				});
			}
		break;
		case PROTOCOL_CMD_PUSH_DATA_RAW:
			var currentPaket = socket.paket.data[0];
			
			if (!socket.raw_data_pakets || !socket.raw_data_pakets.length) {
				global.printError("NO RAW STRUCT IN SOCKET");
				app.log.writeCommunicationLog({
					type: "WARNING",
					msg: "Ошибка при получении raw данных, запрос на передачу небыл получен от устройтсва.",
				});
				return;
			}
			
			socket.raw_data_pakets[ currentPaket ].buffer = socket.paket.data.slice(1, socket.paket.data.length);
			socket.raw_data_pakets[ currentPaket ].received = true;
			
			if (currentPaket + 1 == socket.raw_data_pakets.length) {
				var FileBuff = null;
				for(var i = 0; i < socket.raw_data_pakets.length; i++) {
					if (!FileBuff) {
						FileBuff = socket.raw_data_pakets[i].buffer;
					} else {
						FileBuff = Buffer.concat([FileBuff, socket.raw_data_pakets[i].buffer]);
					}
				}
				
				var scruct = app.bindata.makeArray(FileBuff);
				
				if (!scruct.serial) {
					scruct.serial = "NONE";
				}
				app.log.writeCommunicationLog({
					type: "NOTIFY",
					msg: "Получены данные от устройства S/N:" + scruct.serial,
				});

				app.unit.updateData(scruct);				
			}
		break;
		default:
			app.log.writeCommunicationLog({
				type: "WARNING",
				msg: "Получен неизвестный запрос. CMD:" + socket.paket.cmd_ack.toString(16),
			});
			crc = ns.txBegin(socket, socket.paket.cmd_ack + 0x80, PROTOCOL_STS_UNSUPPORTED, crc);
		    crc = ns.txLength(socket, 0, crc);
		    crc = ns.txCrc(socket, crc);
		break;
	}
}

ns.net = require('net');

ns.net.createServer(function (socket) {
	
	socket.name = socket.remotePort
	console.log("New connection on port " + socket.name );
	
	socket.paket = false;
	socket.Buff = new ns.rxBuffer();

	socket.on('data', function(data) {
				
		for(var i = 0;i < data.length; i++) {
			socket.paket = socket.Buff.$rx(data);
			
			if (socket.paket) {
				socket.Buff = new ns.rxBuffer();
				
				ns.sendResponse(socket);
				break;
			}
		}
	});

	socket.on('end', function () {
		
	});
	socket.on('close', function() {
	  	console.log("Port " + socket.name + " disconnected" );
	});
}).listen(5055);
