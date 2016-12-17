/*
  AM_STORE.h
  AquaMonitor firmware
  LLC AquaAlliance
  Author: Ilya Trikoz
  12 aug 2016
*/

#include <avr/io.h>
#include <SPI.h>
#include <SD.h>

#define DEBUG_PORT Serial

#define FILE_BIN_VERSION 0x01


static File dataFile;


class AM_STORE
{
  public:
    AM_STORE();


    //запись серийного номера в EEPROM
    void setSerialNumber(uint8_t*sn);
    //чтения серийного номера из EEPROM
    uint8_t* getSerialNumber();

    //запись интервала сохранений в EEPROM
    void setRecordInterval(uint8_t val);
    //чтения интервала сохранений из EEPROM
    uint8_t getRecordInterval();
    
    
    void Restore();
    
    //Открывает файл
    //Если файл не создан - создает и добавляет заголовок файла
    bool OFile(File &f, bool w);
    //Закрывает файл
    bool CFile(File &f);
    //Размер файла
    uint8_t CFileSize(File &f);

    //Записывает число в файл (максимальное значение 32 бита)
    //если writeLen == false длина байт занимаемая числом не будет записана перед данными
    void write_int_file(uint32_t *data, File &f, bool writeLen);

    
    /*
     Записываеь в файл длину значение и само значения
     если ts == true то перед записью будет записано коллицество секунд 
     с момента создания файла
     */
    void writeToDataFile(uint32_t *data, bool ts);
    
    
    void initSD(int port);

  private:
    void EEPROM_write(unsigned int uiAddress, unsigned char ucData);
    unsigned char EEPROM_read(unsigned int uiAddress);
};
