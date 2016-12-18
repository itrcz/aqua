module.exports = function(ns) {

  ns.cmd = Object();

  ns.cmd.PING = function(port, _callback) {
    ns.sendPacket({
      port:port,
      cmd_ack:PROTOCOL.CMD_PING
    },_callback);
  }
  ns.cmd.SETRTC = function(port, time, _callback) {
    ns.sendPacket({
      port:port,

      cmd_ack:PROTOCOL.CMD_SETRTC,
      data:time,
    },_callback);
  }
  ns.cmd.SETSN = function(port, sn, _callback) {
    var buf = new Buffer(4);
    buf.writeUInt32LE(sn,0);
    
    ns.sendPacket({
      port:port,
      cmd_ack:PROTOCOL.CMD_SERVICE_SETSN,
      data:buf,
    },_callback);
  }
  ns.cmd.INFO = function(port, _callback) {
    ns.sendPacket({
      port:port,
      timeout:300,
      cmd_ack:PROTOCOL.CMD_INFO
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

}