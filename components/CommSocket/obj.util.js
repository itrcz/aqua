module.exports = function(ns) {
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

}