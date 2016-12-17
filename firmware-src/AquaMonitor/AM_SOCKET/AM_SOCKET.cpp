/*
  AM_SOCKET.cpp
  AquaMonitor firmware
  LLC AquaAlliance
  Author: Ilya Trikoz
  12 aug 2016
*/
#include "AM_SOCKET.h"

#include <RTC.h>
#include <AM_STORE.h>
#include <AM_COUNTER.h>

#include "modem.h"

extern RTC rtc;
extern AM_STORE am_store;
extern AM_COUNTER am_counter;

struct paket {
    //Буфер
     uint8_t * buffer;
    //Длина полученных данных
     uint8_t length;
    //Сума полученных данных
     uint8_t crc;
    //Статус поверки
     uint8_t check;
    //Время получения последнего байта
     uint32_t rxLastByteTime;
    
} paket;


AM_SOCKET am_socket;

AM_SOCKET::AM_SOCKET() {
    this->zeroBuffer();
}

void AM_SOCKET::init(void) {}
void AM_SOCKET::setTransport(uint8_t t) {
    transport = t;
}

void AM_SOCKET::zeroBuffer(void) {
    if (paket.buffer) {
        delete paket.buffer;
    }
    //буфер куда соберается входящий поток данных
    paket.buffer = new uint8_t[50];
    //длина входящего пакета
    paket.length = 0x0;
    //сумма
    paket.crc = 0x0;
    
    paket.rxLastByteTime = 0;
    
    paket.check = 0xFF;
}

void AM_SOCKET::crc8(uint8_t dat) {
  for( uint8_t i=0; i<8; i++) {
    uint8_t fb = (paket.crc ^ dat) & 1;
    paket.crc >>= 1;
    dat >>= 1;
    if( fb ) paket.crc ^= 0x8c;
  }
}

//Передача 1 байта
void AM_SOCKET::tx(uint8_t data, bool lastByte = false) {
	//В зависимоти от выбранного транспорта отправляем байт
	switch (transport) {
		case PRTOTOCOL_TRANSPORT_SERIAL:
			if (__IF_SERIAL__)
			{
				__IF_SERIAL__.write(data);
			}
			break;
		case PRTOTOCOL_TRANSPORT_GPRS:
			modem_tcp_send_byte(data);
			break;
	}
	if (lastByte) {
		this->zeroBuffer();
		return;
	}
	crc8(data);
}

//Начала передачи
void AM_SOCKET::txBegin(uint8_t cmd_ack, uint8_t sts) {
  //Чистим буфер перед отправкой
  this->zeroBuffer();
  //Передаем первый байт пакета STX
  this->tx(PROTOCOL_STX);
  //Передаем CMD или ACK
  this->tx(cmd_ack);
  //Передаем стутсу STS
  this->tx(sts);
}

//Отправка длины данных
void AM_SOCKET::txLength(uint8_t len) {
  //Передаем длину данных LEN
  this->tx(len);
}

//Отправка данных
void AM_SOCKET::txData(uint8_t* bytes, uint8_t size) {
  for (int i = 0;i < size; i++) {
      this->tx(bytes[i]);
  }
}

//Отправка crc
void AM_SOCKET::txCrc(void) {
  this->tx(paket.crc, true);
}

void AM_SOCKET::sendErrorAck(void) {
    switch (paket.check) {
        case PROTOCOL_STS_SUCCESS:
            
            break;
        case PROTOCOL_STS_FAIL:
            
            break;
        case PROTOCOL_STS_CRC:
            
            break;
        case PROTOCOL_STS_OVERFLOW:
            
            break;
        case PROTOCOL_STS_UNSUPPORTED:
            
            break;
            
        default:
            break;
    }
}
//Обработка входящих команд
void AM_SOCKET::sendResponse(void) {
    if (paket.check != PROTOCOL_STS_SUCCESS)
    {
        return this->sendErrorAck();
    }
    /*
     Если больше чем PROTOCOL_ACK (0x80) значит пакет является актом
     */
   
    if (paket.buffer[PROTOCOL_POS_ACK] > PROTOCOL_ACK ) {
    
        return;
    }
    
    switch( paket.buffer[PROTOCOL_POS_CMD] ) {
            /*
             Команда для проверки связи
             */
        case PROTOCOL_CMD_PING:
            if (transport == PRTOTOCOL_TRANSPORT_GPRS) {
                if (! this->gprs_StartTransmition(PROTOCOL_POS_CRC_WITHOUTDATA)) {
                    return;
                }
            }
            this->txBegin(paket.buffer[PROTOCOL_POS_CMD] | PROTOCOL_ACK, PROTOCOL_STS_SUCCESS);
            this->txLength(0);
            this->txCrc();
            
            this->gprs_transmitRawData();
            
            break;
        case PROTOCOL_CMD_INFO:

            uint8_t *sn;
            uint8_t len;
            uint8_t device_name[sizeof(_device_name)];
            
            for(int i=0;i<sizeof(_device_name);i++) {
                device_name[i] = pgm_read_byte(_device_name + i);
            }
            
            sn = am_store.getSerialNumber();
            
            len = (2 + 4 + sizeof(_device_name));
            
            if (transport == PRTOTOCOL_TRANSPORT_GPRS) {
                if (! this->gprs_StartTransmition(len)) {
                    return;
                }
            }
            
            this->txBegin( paket.buffer[PROTOCOL_POS_CMD] | PROTOCOL_ACK, PROTOCOL_STS_SUCCESS);
            
            this->txLength(len);
            
            //Длина серийного номера
            this->tx( 0x4 );
            //Серийный номер
            this->txData(sn,4);
            //Длина наименования
            this->tx( sizeof(_device_name) );
            //Строка наименования
            this->txData(device_name,sizeof(_device_name));
            
            this->txCrc();
            
            delete sn;
            
            break;
            /*
             Команда для перезагрузки
             DATA 0x00 - перезагрузка контроллера
             DATA 0x05 - перезагрузка gprs модема по питанию
             */
        case PROTOCOL_CMD_RESET:
            
            break;
        case PROTOCOL_CMD_GETRTC:
            /*
             Здесь должен быть код получения информации от RTC
             */
            
            break;
        case PROTOCOL_CMD_SETRTC:
            /*
             Запись даты и времени (формат BSD) в RTC
             */
            if (transport == PRTOTOCOL_TRANSPORT_GPRS) {
                if (! this->gprs_StartTransmition(PROTOCOL_POS_CRC_WITHOUTDATA)) {
                    return;
                }
            }
            
            if (paket.buffer[PROTOCOL_POS_LEN] == 6) {
                if(rtc.set(
                           paket.buffer[PROTOCOL_POS_LEN+1],
                           paket.buffer[PROTOCOL_POS_LEN+2],
                           paket.buffer[PROTOCOL_POS_LEN+3],
                           paket.buffer[PROTOCOL_POS_LEN+4],
                           paket.buffer[PROTOCOL_POS_LEN+5],
                           paket.buffer[PROTOCOL_POS_LEN+6]
                           )) {
                    this->txBegin( paket.buffer[PROTOCOL_POS_CMD] | PROTOCOL_ACK, PROTOCOL_STS_SUCCESS);
                } else {
                    this->txBegin( paket.buffer[PROTOCOL_POS_CMD] | PROTOCOL_ACK, PROTOCOL_STS_FAIL);
                }
            } else {
                this->txBegin(paket.buffer[PROTOCOL_POS_CMD] | PROTOCOL_ACK, PROTOCOL_STS_FAIL);
            }
            this->txLength(0);
            this->txCrc();
            
            break;
        case PROTOCOL_CMD_SERVICE_SETSN:
            
            if (transport == PRTOTOCOL_TRANSPORT_GPRS) {
                if (! this->gprs_StartTransmition(PROTOCOL_POS_CRC_WITHOUTDATA)) {
                    return;
                }
            }
            if ( paket.buffer[PROTOCOL_POS_LEN] == 4) {
                
                uint8_t *newSerial;
                
                newSerial = new uint8_t[4];
                
                newSerial[3] = paket.buffer[PROTOCOL_POS_LEN+1];
                newSerial[2] = paket.buffer[PROTOCOL_POS_LEN+2];
                newSerial[1] = paket.buffer[PROTOCOL_POS_LEN+3];
                newSerial[0] = paket.buffer[PROTOCOL_POS_LEN+4];
                
                am_store.setSerialNumber(newSerial);
                
                delete newSerial;
                
                this->txBegin( paket.buffer[PROTOCOL_POS_CMD] | PROTOCOL_ACK, PROTOCOL_STS_SUCCESS);
            } else {
                this->txBegin( paket.buffer[PROTOCOL_POS_CMD] | PROTOCOL_ACK, PROTOCOL_STS_FAIL);
            }
            
            this->txLength(0);
            this->txCrc();
            break;
        default:
            if (transport == PRTOTOCOL_TRANSPORT_GPRS) {
                if (! this->gprs_StartTransmition(PROTOCOL_POS_CRC_WITHOUTDATA)) {
                    return;
                }
            }
            this->txBegin( paket.buffer[PROTOCOL_POS_CMD] | PROTOCOL_ACK, PROTOCOL_STS_UNSUPPORTED);
            this->txLength(0);
            this->txCrc();
            
            break;
    }
    zeroBuffer();
}

/*
  ПРИЕМ ДАННЫХ
 Функция вернет 0xFF если недостаточно данных либо STS если пикет принят
*/

bool AM_SOCKET::rx(uint8_t buff) {
    
    paket.rxLastByteTime = millis();
    
    /*
     Если не выбран транспорт
     тогда отвечаем 0xFF
    */
	if (transport == PRTOTOCOL_TRANSPORT_NULL)
	{
        this->zeroBuffer();
        return false;
	}
    
	//Добавляем полученным байт в бефер
	paket.buffer[ paket.length++ ] = buff;
	
	/*
     Если STX не равен 0xAA стандартна протокола
	*/
	if (paket.buffer[PROTOCOL_POS_STX] != PROTOCOL_STX)
	{
		this->zeroBuffer();
        return false;
	}
    
    /*
     Если байт не является последним из пакета
     Расчет суммы принятого байта
     */
	if (paket.length != (paket.buffer[PROTOCOL_POS_LEN] + PROTOCOL_POS_CRC_WITHOUTDATA))
	{
		this->crc8(buff);
	}
	/*
		Конец заголовка
		Код ниже имеет смысл выполнять
		только при наличии STX, CMD, STS LEN
	*/
	if (paket.length >= PROTOCOL_POS_DATA_START)
	{
        //Если длина больше чем 45 байт возвращаем ошибку
        if (paket.buffer[PROTOCOL_POS_LEN] > 0x2D)
        {
            paket.check = PROTOCOL_STS_OVERFLOW;
            return true;
        }
		/*
		 Проверяем если текущий байт является последними
         LEN + STX, CMD, STS LEN, CRC
         */
		if (paket.length == (paket.buffer[PROTOCOL_POS_LEN] + PROTOCOL_POS_CRC_WITHOUTDATA))
		{
            DEBUG_PORT.println("GOT PAKET");
			//Если сумма CRC совпадает записываем SUCCESS
			if (paket.crc == paket.buffer[paket.length-1])
            {
                paket.check = PROTOCOL_STS_SUCCESS;
				return true;
			}
            //Если не совпадает записываем код ошибки
            else
			{
                paket.check = PROTOCOL_STS_CRC;
				return true;
			}
		}
	}
    return false;
}

bool AM_SOCKET::gprs_StartTransmition(uint16_t len) {
    
    this->setTransport(PRTOTOCOL_TRANSPORT_GPRS);
    
    if ( modem_tcp_connect(SERVER_ADDRESS) ) {
        if ( modem_tcp_send_init( len ) ) {
            gsm_flush_serial();
            return true;
        }
    }
    
    this->setTransport(PRTOTOCOL_TRANSPORT_NULL);
    
    this->zeroBuffer();
    return false;
}
bool AM_SOCKET::gprs_waitPaket(bool noAck = false) {
    if (gsm_wait_for_resp("SEND OK\r\n", CMD, 5)) {
        
        if (noAck) {
            gsm_flush_serial();
            return true;
        }
        paket.rxLastByteTime = millis();
        
        while(true) {
            if ( gsm_check_readable() ) {
                paket.rxLastByteTime = millis();
                
                uint8_t rxByte = gsm_read_byte();
                
                if ( this->rx(rxByte) ) break;
            }
            if (paket.rxLastByteTime + TCP_TIMEOUT < millis()) {
                
                this->zeroBuffer();
                
                DEBUG_PORT.println("TCP TIMEOUT");
                modem_tcp_disconnect();
                break;
            }
        }
        this->setTransport(PRTOTOCOL_TRANSPORT_NULL);
        return true;
    }
    this->setTransport(PRTOTOCOL_TRANSPORT_NULL);
    
    return false;
}

bool AM_SOCKET::gprs_transmit_PushRequest(void) {
    this->zeroBuffer();
  
    if ( this->gprs_StartTransmition( PROTOCOL_POS_CRC_WITHOUTDATA ) ) {
        
        this->txBegin(PROTOCOL_CMD_PUSH_REQUEST, PROTOCOL_STS_SUCCESS);
        this->txLength(0);
        this->txCrc();
        
        this->gprs_waitPaket();
        
        if (paket.check == PROTOCOL_STS_SUCCESS)
        {
            if (paket.buffer[PROTOCOL_POS_ACK] == (PROTOCOL_CMD_PUSH_REQUEST + PROTOCOL_ACK))
            {
                return true;
            }
        }
    }
    return false;
}
bool AM_SOCKET::gprs_transmit_RawDataStart(uint8_t patekCount) {
    if (!patekCount) return false;
   
    this->zeroBuffer();
   
    if ( this->gprs_StartTransmition( PROTOCOL_POS_CRC_WITHOUTDATA + 1 ) ) {
        
        this->txBegin(PROTOCOL_CMD_PUSH_DATA_START, PROTOCOL_STS_SUCCESS);
        this->txLength(1);
        this->tx(patekCount);
        this->txCrc();
        
        this->gprs_waitPaket();
        
        if (paket.check == PROTOCOL_STS_SUCCESS)
        {
            if (paket.buffer[PROTOCOL_POS_ACK] == (PROTOCOL_CMD_PUSH_DATA_START + PROTOCOL_ACK))
            {
                return true;
            }
        }
    }
    return false;
}
void AM_SOCKET::gprs_transmitRawData(void) {

#define MAX_RAW_DATA 249
    
    File f;
    am_store.OFile(f,false);
    
    uint16_t file_size = f.size();
    if (file_size) {
        //Отправляем запрос на передачу Push посылки
        if ( this->gprs_transmit_PushRequest() ) {
            
            uint8_t rawPaketCount = 1;
            uint8_t rawPaketSent = 0;
            /*
             Если длина RAW данных больше чем максимальный размер посылки
             то подсчитываем сколько посылок на нужно будет отправить
             */
            if (file_size > MAX_RAW_DATA) {
                rawPaketCount = file_size / MAX_RAW_DATA;
                
                if (rawPaketCount * MAX_RAW_DATA != file_size) {
                    rawPaketCount += 1;
                }
            }
            //Отправляем запрос на передачу RAW данных
            if ( this->gprs_transmit_RawDataStart(rawPaketCount) ) {
                
                //Чистим буфер
                this->zeroBuffer();
                
                //Размер raw данных для посылки
                uint8_t rawDataSize;
                
                //Отправляем пакеты в цикле
                while(file_size) {
                    
                    //Задаем размер raw данных для текущей посылки
                    if (file_size < MAX_RAW_DATA) {
                        rawDataSize = file_size;
                    } else {
                        rawDataSize = MAX_RAW_DATA;
                    }
                    file_size -= rawDataSize;
                    
                    //Инициализируем отправку посылки
                    // + 1 это первый байт в котором передается номер пакета
                    if ( this->gprs_StartTransmition( PROTOCOL_POS_CRC_WITHOUTDATA + rawDataSize + 1 ) ) {
                        
                        this->txBegin(PROTOCOL_CMD_PUSH_DATA_RAW, PROTOCOL_STS_SUCCESS);
                        this->txLength( rawDataSize + 1 );
                        
                        //Первым байтом передаем номер посылки
                        this->tx(rawPaketSent++);
                        
                        //Передаем raw данные
                        while (rawDataSize--) {
                            this->tx( f.read() );
                        }
                        //Передаем сумму посылки
                        this->txCrc();
                        
                        /*
                         Посылки PUSH_DATA_RAW не требут актов
                         поэтому передаем noAck = true в функцию gprs_waitPaket
                         */
                        if ( ! this->gprs_waitPaket(true)) {
                            DEBUG_PORT.println("ERROR WHILE SENDING RAW DATA");
                            break;
                        }
                    }
                }
                
                if (rawPaketCount == rawPaketSent) {
                    DEBUG_PORT.println("RAW SEND OK");
                }
            }
            
            
            modem_tcp_disconnect();
            this->zeroBuffer();
            
            am_store.CFile(f);
        }
    }
    this->setTransport(PRTOTOCOL_TRANSPORT_NULL);
}

//Обработка прерываний
void AM_SOCKET::tick(void) {
    
    if (paket.rxLastByteTime) {
        if (millis() - 5000 > paket.rxLastByteTime) {
            zeroBuffer();
        }
    }

    //Если по serial пришли данные
    while(__IF_SERIAL__.available()) {
        //Если идет прием данных по GSM
        //Очищаем буфер но ничего не отвечаем 
        if (transport == PRTOTOCOL_TRANSPORT_GPRS) {
            __IF_SERIAL__.read();
            return;
        }
        this->setTransport(PRTOTOCOL_TRANSPORT_SERIAL);
        
        if ( this->rx( __IF_SERIAL__.read()) ) {
            this->sendResponse();
        }
        
	}
}
