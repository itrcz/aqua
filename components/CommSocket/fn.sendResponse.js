module.exports = function(ns) {
  ns.sendResponse = function(socket) {
    if (!socket) return false;
    if (!socket.paket) return false;

    var crc = 0x0;

    if (socket.paket.check) {
      global.printError("Recieved paket has error");
      console.log("CODE: ", socket.paket.check);

      crc = ns.txBegin(socket, PROTOCOL.CMD_PUSH_REQUEST + 0x80, PROTOCOL.STS_CRC, crc);
      crc = ns.txLength(socket, 0, crc);
      crc = ns.txCrc(socket, crc);
      return;
    }

    switch(socket.paket.cmd_ack) {
      case PROTOCOL.CMD_PUSH_REQUEST:
      global.printDebug("PUSH_REQUEST: ACK");
      crc = ns.txBegin(socket, PROTOCOL.CMD_PUSH_REQUEST + 0x80, PROTOCOL.STS_SUCCESS, crc);
      crc = ns.txLength(socket, 0, crc);
      crc = ns.txCrc(socket, crc);
      app.log.writeCommunicationLog({
        type: "NOTIFY",
        msg: "Push request from addr:" + socket._peername.address + " port:" + socket._peername.port + " family:" + socket._peername.family,
      });

      break;
      case PROTOCOL.CMD_PUSH_DATA_START:
      global.printDebug("PUSH_DATA_START: ACK");
      crc = ns.txBegin(socket, PROTOCOL.CMD_PUSH_DATA_START + 0x80, PROTOCOL.STS_SUCCESS, crc);
      crc = ns.txLength(socket, 0, crc);
      crc = ns.txCrc(socket, crc);
      //Записываем масив raw для приема данных в сокет
      //максимальное количество данных в пакете
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
      case PROTOCOL.CMD_PUSH_DATA_RAW:
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

        app.unit.addRawData(scruct);        
      }
      break;
      default:
      app.log.writeCommunicationLog({
        type: "WARNING",
        msg: "Получен неизвестный запрос. CMD:" + socket.paket.cmd_ack.toString(16),
      });
      crc = ns.txBegin(socket, socket.paket.cmd_ack + 0x80, PROTOCOL.STS_UNSUPPORTED, crc);
      crc = ns.txLength(socket, 0, crc);
      crc = ns.txCrc(socket, crc);
      break;
    }
  }
}