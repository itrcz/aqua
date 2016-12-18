module.exports = function(ns) {
  ns.sendPacket = function(param, _callback) {
    if (!param || !param.port || !param.cmd_ack) {
      if (typeof(_callback) === "function") {
        _callback({
          success:false,
          message:"incorrect call"
        });
      }
      return;
    }

    if (!param.sts) param.sts = PROTOCOL.STS_SUCCESS;

    //Если нет тайм

    param.timeout = param.timeout || 200;

    //Длина данных
    param.length = 0x00;
    if (param.data) param.length = param.data.length;

    var done = false;
    var Buff = new ns.rxBuffer();

    var writePackage = function() {
      var crc = 0x0;
      crc = ns.txBegin(param.port, param.cmd_ack, param.sts, crc);
      crc = ns.txLength(param.port, param.length, crc);

      if (param.length > 0) crc = ns.txData(param.port, param.data, param.length, crc);

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
          if (param.port.isOpen()) param.port.close();
          
          var buffer = false;
          var success = false;
          var message = "";
          switch (buffObject.check) {
            case PROTOCOL.STS_SUCCESS:
            success = true;
            buffer = buffObject.buffer;
            break;
            case PROTOCOL.STS_FAIL:
            message = "Команда выполнена с ошибкой";
            break;
            case PROTOCOL.STS_CRC:
            message = "CRC сумма не совпадает";
            break;
            case PROTOCOL.STS_OVERFLOW:
            message = "Превышена длина данных";
            break;
            case PROTOCOL.STS_UNSUPPORTED:
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
}