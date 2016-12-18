module.exports = function(ns) {
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
    if (self.length != (self.buffer[PROTOCOL_POS_LEN] + PROTOCOL_POS_CRC_WITHOUTDATA)) self.crc = ns.util.crc8(buff, self.crc);
      /*
      Проверяем длину данные
      если привыщает отвечаем PROTOCOL_STS_OVERFLOW
      */
      if (self.length == PROTOCOL_POS_LEN + 1) {
        if (self.buffer[PROTOCOL_POS_LEN] > 250) {
          txBegin( buffer[PROTOCOL_POS_CMD] | 0x40, PROTOCOL_STS_OVERFLOW);
          txLength(0);
          txCrc();
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
    }
    //Функция обрабатывает куски пакета по 1 байту
    self.$rx = function(data) {
      var buff;
      for (var i = 0;i< data.length;i++) {
        buff = self.rx(data[i]);
      }
      return buff;
    }
  }
}
