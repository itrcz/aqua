/*
  AM_SOCKET.h
  AquaMonitor firmware
  LLC AquaAlliance
  Author: Ilya Trikoz
  12 aug 2016
*/
//#include "util.h"

#include <stdint.h>
#include <HardwareSerial.h>


#define DEBUG_PORT Serial

#define __IF_SERIAL__ Serial1


PROGMEM const uint8_t _device_name[] = "AQUA Monitor (for testing only)";

//Типы транспортов
#define PRTOTOCOL_TRANSPORT_NULL 0x0
#define PRTOTOCOL_TRANSPORT_SERIAL 0x01
#define PRTOTOCOL_TRANSPORT_GPRS 0x02

//Байт начала пакета
#define PROTOCOL_STX 0xAA

#define PROTOCOL_ACK 0x80

//Позиции в пакете
#define PROTOCOL_POS_STX 0
#define PROTOCOL_POS_CMD 1
#define PROTOCOL_POS_ACK 1
#define PROTOCOL_POS_CMD_ACK 1
#define PROTOCOL_POS_STS 2
#define PROTOCOL_POS_LEN 3
#define PROTOCOL_POS_DATA_START 4
#define PROTOCOL_POS_CRC_WITHOUTDATA 5

//Команды протокола
#define PROTOCOL_CMD_PING       0x01
#define PROTOCOL_CMD_INFO       0x02
#define PROTOCOL_CMD_RESET      0x0A
#define PROTOCOL_CMD_GETRTC     0x0B
#define PROTOCOL_CMD_SETRTC     0x0C

//Push команды
#define PROTOCOL_CMD_PUSH_REQUEST       0x64
#define PROTOCOL_CMD_PUSH_DATA_START    0x65
#define PROTOCOL_CMD_PUSH_DATA_RAW      0x66

//Сервисные команды
#define PROTOCOL_CMD_SERVICE_SETSN      0x78


//Статусы пакета
#define PROTOCOL_STS_SUCCESS        0x00
#define PROTOCOL_STS_FAIL           0x01
#define PROTOCOL_STS_CRC            0x02
#define PROTOCOL_STS_OVERFLOW       0x03
#define PROTOCOL_STS_UNSUPPORTED    0x04
#define PROTOCOL_STS_DENIDED        0x05


//GPRS настройки
#define SERVER_ADDRESS "195.239.8.122", "5055"
#define TCP_TIMEOUT 3000

// library interface description
class AM_SOCKET
{


  public:
    AM_SOCKET();
    
    void init(void);
    /*
    	Функция вызывается в каждый своботный тик процессора
    */
    void tick(void);

   private:
    //Тип транспорта (меняется в зависимости от используемого транспорта)
    short transport;

    //Функция очищает буфер
    void zeroBuffer(void);
    /*
      Установка текущего транспорта
    */
    void setTransport(uint8_t t);
    /*
     Пересчет CRC8 для буфера
     полиномиал - 0x31
     */
    void crc8(uint8_t data);
    /*
     обработка пакетов и формирования ответа
     */
    void sendResponse(void);
    /*
     отправить акт об ошибке
     */
    void sendErrorAck(void);
    /*
      Привем данных
    */
    void tx(uint8_t data, bool lastByte);
    /*
      Функция отправляет 2 байта данный - STX и STS
      функция использует функцию tx()
    */
    void txBegin(uint8_t cmd_ack, uint8_t sts);
    /*
      Функция отправляет 1 байт данный - LEN
      функция использует функцию tx()
    */
    void txLength(uint8_t len);
    /*
      Функция отправляет масив int - DATA
      функция использует функцию tx()
    */
    void txData(uint8_t* data, uint8_t size);
    /*
      Функция отправляет 1 байта данный - CRC
      функция использует функцию tx()
    */
    void txCrc(void);
    /*
      Обработка принятых команд
      функция принимает пакет по байтно
      возвращает true если пакет был обработан
      и false при ожидании данных
    */
    bool rx(uint8_t buff);
    /*
     Начать передачу по GPRS
     в качестве аргумента принимает колличество в байтах которые необходимо отправить
     вернет true если можно приступить к передачи данный
     */
    bool gprs_StartTransmition(uint16_t len);
    /*
     Функция ожидает пакет от сервер
     если пакет не приходит сессия разрывается
     */
    bool gprs_waitPaket(bool noAck);
    /*
     Отправляем запрос на передачу push
     */
    bool gprs_transmit_PushRequest(void);
    /*
     Отправляем начало передачи RAW данных
     */
    bool gprs_transmit_RawDataStart(uint8_t patekCount);
    /*
     Оправляет данные на сервер
     */
    void gprs_transmitRawData(void);

};
