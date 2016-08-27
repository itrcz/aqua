global.about = {
	name: "TestApplication",
	version: "0.0.1",
	build: "24",
	author:"Ilya Trikoz"
}
//load config

global.__config = require('./config.json');

//load global functions
require('./library/functions.js');

global.pack = require('./library/pack.js');

global.print("Initialized application");

//Load components
require("./components/Server.js");
require("./components/Web.js");
require("./components/Database.js");
require("./components/Authentication.js");
require("./components/Socket.js");
require("./components/Services.js");
require("./components/CommSocket.js");
require("./components/Controller.js");
require("./components/Log.js");
require("./components/Unit.js");

function readfile() {

	fs.open('/Volumes/NO\ NAME/TEST', 'r', function(err, fd) {
	  if (err)
	    throw err;
	  //Поддерживаемая версия файла
	  var VERSION_SUPPORT = 0x1;
	  /*
		  Главный буфет - сюда будут записыватся прочтенные байты
		  размер буфера меняется в соответсвии с структурой файла
	  */
	  var buffer = new Buffer(4);
	  /*
		  Второй буфер - сюда будут копироватся некоторые байты
		  для корректного вывода
	  */
	  var copyBuffer = new Buffer(1);
	  /*
		  в эту переменную будет записан номер первого байта из буфера
	  */
	  var b = 0;


	  var readingDataRaw = false;
	  var writingCounter = false;

	  var fileData = {
		  version:0x0,
		  serial: 0x0,
		  timestamp: 0,
		  data: []
	  };


	  while (true) {
	    var read = fs.readSync(fd, buffer, 0, buffer.length, null);
	    if (read === 0) break;

	    //TEST FIRST 50 bytes
		if (b > 100) break;


	    //File HEAD
	    if (b == 0) {
		    if ( (buffer[0] == 0xAA && 0xAA == buffer[1]) && buffer[2] == 0x41) {

			    if (VERSION_SUPPORT !== buffer[3]) {
				    console.log("INCORRECT FILE VERSION")
					break;
			    }

			    copyBuffer = new Buffer(buffer.length);
				buffer.copy(copyBuffer, 0, 0, buffer.length);

				fileData.version = parseInt( copyBuffer.readUIntBE(3,1) );
		    } else {
			    console.log("INCORRECT FILE FORMAT");
			    break;
		    }

		//File SERIAL
	    } else if (b < 7) {
		    copyBuffer = new Buffer(buffer.length);
		    buffer.copy(copyBuffer, 0, 0, buffer.length);
			fileData.serial = parseInt( copyBuffer.readUIntBE(0,buffer.length) );
	    //File TIMESTAMP
	    } else if (b < 10) {
		  	copyBuffer = new Buffer(buffer.length);
		    buffer.copy(copyBuffer, 0, 0, buffer.length);

		    fileData.timestamp = parseInt( copyBuffer.readUIntBE(0,buffer.length) );

	    }
	    b += buffer.length;

	    if (b == 4) {
		    //Для получения серийного номера
		    buffer = new Buffer(3);
	    };
	    if (b == 7) {
		    //Для проучения unix штампа времени
		    buffer = new Buffer(4);
	    }
	    if (b == 11) {
		    //Далее идут данные
		    //выставляем 1 байт для получения длины данных
		    buffer = new Buffer(1);
	    }
	    if (b > 11) {
		    if (readingDataRaw) {
			    copyBuffer = new Buffer(buffer.length);
				buffer.copy(copyBuffer, 0, 0, buffer.length);
			    if (!writingCounter) {
				    fileData.data.push({
					    ts: fileData.timestamp + parseInt(copyBuffer.readUIntBE(0, buffer.length) ),
					    ct:0x0
				    });

				    writingCounter = true;
			    } else {
				    fileData.data[ fileData.data.length -1 ].ct = parseInt( copyBuffer.readUIntBE(0, buffer.length) )
				    writingCounter = false;
			    }
			    buffer = new Buffer(1);
			    readingDataRaw = false;
		    } else if (!readingDataRaw) {
			    //Задаем длину буфера для чтения данных
			    buffer = new Buffer( buffer[0] );
			    readingDataRaw = true;
		    }
	    }
	  }
	  console.log(fileData);

	});

}
