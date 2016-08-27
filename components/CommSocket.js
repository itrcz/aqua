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
var PROTOCOL_CMD_PING = 0x01
var PROTOCOL_CMD_INFO = 0x02
var PROTOCOL_CMD_RESET = 0x0A
var PROTOCOL_CMD_GETRTC = 0x0B
var PROTOCOL_CMD_SETRTC = 0x0C

//Статусы пакета
var PROTOCOL_STS_SUCCESS = 0x00
var PROTOCOL_STS_FAIL = 0x01
var PROTOCOL_STS_CRC = 0x02
var PROTOCOL_STS_OVERFLOW = 0x03
var PROTOCOL_STS_UNSUPPORTED = 0xFF

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
ns.CMD.INFO = function(port, _callback) {
  ns.SEND({
    port:port,
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

  param.timeout = param.timeout || 100;

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

      setTimeout(function(){
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
    param.port.on('data', function(data){

        var buffObject = Buff.$rx(data);
        if (buffObject) {
          done = true;
          if (param.port.isOpen()) {
            param.port.close();
          }
          var buffer = false;
          var success = false;
          var message = "";

          switch (buffObject.status) {
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
  port.write(data,function(err) {
      console.log("TX >>> ", data);
      port.drain(function(err) {
        //drained
      });
  });
  //В зависимоти от выбранного транспорта отправляем байт
/*  switch (transport) {
    case PRTOTOCOL_TRANSPORT_SERIAL:
      if (softSerial) {
        softSerial.write(data);
      }
    break;
    case PRTOTOCOL_TRANSPORT_GPRS:
    break;
  }
  */
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
  ns.tx(port,new Buffer([PROTOCOL_RESTART]), 0x00);

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
    //console.log("RX <<< ", new Buffer([buff]));
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

        //Если сумма CRC совпадает
        if (self.crc == self.buffer[self.length-1]) {
          //Обрезаем лишнее
          self.buffer = self.buffer.slice(0, self.length);

          global.print("Recived data:");
          console.log(self.buffer);

          //Отдаем пакет
          return {
            status: 0x0,
            buffer: self.buffer
          };
          //EXEC();
        } else {
          return {
            status: 0x02
          };
        }
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












ns.net = require('net');
ns.net.createServer(function (socket) {

	socket.name = socket.remotePort
	console.log(socket.name + " connected!" );

	socket.on('data', function(data) {

		//var Buff = new ns.rxBuffer();
    console.log("Got "+data.length+" bytes!");
		console.log(data);
	});

	socket.on('close', function() {
	  	console.log(socket.name + " closed!" );
	});
	socket.on('end', function () {
		console.log(socket.name + " ended!" );

	});

}).listen(5055);
