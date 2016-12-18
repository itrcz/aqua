module.exports = function(ns) {
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
    //Передаем первый байт пакета STX
    crc = ns.tx(port,new Buffer([PROTOCOL.STX]), crc);
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
}