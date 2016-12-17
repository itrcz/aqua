/*
 AM_STORE.cpp
 AquaMonitor firmware
 LLC AquaAlliance
 Author: Ilya Trikoz
 12 aug 2016
 */
#include <RTC.h>
#include <AM_COUNTER.h>


#include <HardwareSerial.h>


extern RTC rtc;
extern AM_COUNTER  am_counter;

#include "AM_STORE.h"

AM_STORE am_store;



struct currectFile {
    uint32_t *time2000 = new uint32_t;
    uint32_t *timeFileCreate  = new uint32_t;
    uint32_t *timeSliceCreate  = new uint32_t;
} CUR_FILE;


AM_STORE::AM_STORE() {
    
}

uint32_t uint32fromArray(uint8_t *arr) {
    uint32_t ret = 0 |
    static_cast<uint32_t>(arr[3]) |
    static_cast<uint32_t>(arr[2]) << 8 |
    static_cast<uint32_t>(arr[1]) << 16 |
    static_cast<uint32_t>(arr[0]) << 24;
    
    return ret;
}

void AM_STORE::initSD(int port) {
    SD.begin(port);
}
void AM_STORE::write_int_file(uint32_t *data, File &f, bool writeLen = true) {
    //Задаем минимальную длину записи
    int s = 1;
    //Считаем длину записи
    if (*data > 0xFF) {
        s++;
        if (*data > 0xFFFF) s++;
        if (*data > 0xFFFFFF) s++;
    }
    if (writeLen) {
        //Записываем длину в файл
        f.write( s );
    }
    //Записываем число в файл
    while (s--) {
        f.write( *data >> (8 * s) & 0xFF );
    }
}


void AM_STORE::Restore() {
    SD.begin(53);
    
    File f;
    
    char configFileName[9] = "FILE.CFG";
    
    if (!SD.exists(configFileName)) {
#ifdef DEBUG_PORT
        DEBUG_PORT.println( "FILE.CFG is not exist." );
#endif
    }
    f = SD.open(configFileName, FILE_READ);

    //Если обьект не сознан
    if (!f) {
#ifdef DEBUG_PORT
        DEBUG_PORT.println( "Error." );
#endif
        return;
    }
    //Если файл не соответсвует длине
    if (f.size() != 10) {
        
#ifdef DEBUG_PORT
        DEBUG_PORT.println( "File is empty or incorrect." );
#endif
        f.close();
        return;
    }
    
    char* fileName = new char[11];
    
    for(int i = 0; i < 10; i++) {
        fileName[i] = f.read();
    }
    fileName[10] = 0x00;
    
    //Закрываем FILE.CFG
    f.close();
    
    
    //Открываем файл с данными
    f = SD.open(fileName, FILE_READ);
    
    //Если файл больше 12 байт
    //продолжам чтения файла
    if (f.size() > 12) {
#ifdef DEBUG_PORT
        DEBUG_PORT.print( "Restoring data from file " );
        DEBUG_PORT.println( fileName );
#endif
        f.seek(8);
        
        uint8_t *fileCreateTime = new uint8_t[4];
        memset(fileCreateTime, 0, 4);
        
        for(int i = 0; i < 4; i++) {
            fileCreateTime[i] = f.read();
        }
        
        *CUR_FILE.timeFileCreate = uint32fromArray(fileCreateTime);
        
        
        delete fileCreateTime;
        
        
        //читаем колличество кодов параметров
        int paramCount = f.read();
        
        uint8_t *params = new uint8_t[paramCount];
        
        //Читаем коды параметров
        for(int i = 0; i < paramCount; i++) {
            params[i] = f.read();
        }
        
        int bufferLen = 0;
        uint8_t *buffer = new uint8_t[4];
        
        
        while( f.available() ){
           
            //Обнуляем буфер
            memset(buffer, 0, 4);
            
            bufferLen = f.read();
            //Читаем сдвига времени
            for (int i = 0; i < bufferLen; i++) {
                buffer[i] = f.read();
            }
            //Записываем сдвиг времени
            *CUR_FILE.timeSliceCreate = uint32fromArray(buffer);
            
            
            //Читаем все парамерты по порядку
            for(int p = 0; p < paramCount; p++) {
                //Читаем длину параметра
                bufferLen = f.read();
                
                //Обнуляем буфер
                memset(buffer, 0, 4);
                
                //Читаем длину значения
                for (int i = 0; i < bufferLen; i++) {
                    // Заполняем в обратном порядке
                    buffer[3-i] = f.read();
                }
                //Записываем в RAM значения
                switch (params[p]) {
                    case 0xA0:
                        am_counter.Set_A0( uint32fromArray(buffer) );
                        
                        break;
                    case 0xB0:
                        am_counter.Set_B0( uint32fromArray(buffer) );
                        
                        break;
                    case 0xF1:
                        am_counter.Set_F1( uint32fromArray(buffer) );
                        
                        break;
                    case 0xF2:
                        am_counter.Set_F2( uint32fromArray(buffer) );
                        
                        break;
                    default:
#ifdef DEBUG_PORT
                        DEBUG_PORT.println( "Restore: unknown parameter in file." );
#endif
                        break;
                }
            }
        }
        delete params;
        delete buffer;
       
        
    } else {
#ifdef DEBUG_PORT
        DEBUG_PORT.println( "Restore: data file has incorrect len." );
#endif
    }
    
    f.close();
    
    
    delete fileName;
}

bool AM_STORE::OFile(File &f, bool w) {
    SD.begin(53);
    
    String fileName = "";
    //Формеруем имя файла исходя из текущей даты
    struct ts t;
    rtc.Date(&t);
    if (t.year < 10) fileName += "0";
    fileName += String(t.year,DEC);
    if (t.mon < 10) fileName += "0";
    fileName += String(t.mon, DEC);
    if (t.day < 10) fileName += "0";
    fileName += String(t.day, DEC);
    fileName += ".bin";
    
    const char *fileNameChar = fileName.c_str();
    
    if (w) {
        
        /*
         Если файл не создан, сперва записываем имя файла в файл конфигурации
         он нужен чтобы прочитать текущий файл после перезагрузки устройства
        */
        if (!SD.exists((char*)fileNameChar)) {
            f = SD.open("FILE.CFG", FILE_WRITE);
            if (f) {
                f.seek(0);
                
                f.write(fileNameChar,10);
                
                f.close();
            }
            
        }
        
        //Создаем или открываем файл данных
        f = SD.open(fileNameChar, FILE_WRITE);
        
    } else {
        //Пытаемся открыть файл данных
        f = SD.open(fileNameChar, FILE_READ);
    }
    if (!f) {
        return false;
    }
    
    rtc.timeslice2000( CUR_FILE.time2000 );

    
    if (f.size() == 0) {
        if (!w) {
            return false;
        }
        //Заголовок файла
        const char SOF[] = {0xAA,0xAA,0x41,FILE_BIN_VERSION};
        //Если не удалось записать заголовок возвращаем false
        if (! f.write(SOF, sizeof SOF)) {
            return false;
        }
        //Записываем серийный номер устройства в файл
        uint8_t * SN = this->getSerialNumber();
        f.write(SN, 0x4);
        delete SN;
        
        //Обнуляем счетчик секунд с начала записи файла
        *CUR_FILE.timeSliceCreate = 0;
        
        //Записываем штамп времени
        *CUR_FILE.timeFileCreate = *CUR_FILE.time2000;
        
        this->write_int_file(CUR_FILE.timeFileCreate, f, false);
        
        //Параметры которые будут хранится в файле
        const char CONFIGURED_PARAMS[] = {0xA0,0xB0,0xF1,0xF2};
        
        //Записываем колличетсво параметров которые будут хранится в файле
        f.write(sizeof CONFIGURED_PARAMS);
        
        //Записываем параметры которые будут хранится в файле
        f.write(CONFIGURED_PARAMS, sizeof CONFIGURED_PARAMS);
        
    }
 
    
    //Возвращаем true - файл готов
    return true;
}
bool AM_STORE::CFile(File &f) {
    if (f) {
        f.close();
        return true;
    }
    return false;
}
uint8_t AM_STORE::CFileSize(File &f) {
    uint8_t fileSize;
    this->OFile(f, false);
    fileSize = f.size();
    this->CFile(f);
    
    return fileSize;
}

void AM_STORE::writeToDataFile(uint32_t *data, bool ts) {
    
    if ( this->OFile(dataFile,true) ) {
        
        if (ts) {
            *CUR_FILE.timeSliceCreate = *CUR_FILE.time2000 - *CUR_FILE.timeFileCreate;
            
            this->write_int_file(CUR_FILE.timeSliceCreate, dataFile);
        }
        
        //Записываем показание счетчика
        this->write_int_file(data, dataFile);
        
        //Закрывает файл
        this->CFile(dataFile);
        
    } else {
#ifdef DEBUG_PORT
        DEBUG_PORT.println("COUNTER - Error occured while opening file.");
#endif
    }
}



/*
 ~~~~ EEPROM MEMORY MAP ~~~~
 
 0-3     DEVICE SERIAL
 32-64   DEVICE NAME
 
 70 - интервал записи данных в файл
 0x1 - каждую минуту
 0x2 - каждые 5 минут
 0x3 - каждые 15 минут
 0x4 - каждые 30 минут
 0x5 - каждые 60 минут
 
 другое значение - каждые 15 минут
 
 */
void AM_STORE::setSerialNumber(uint8_t*sn) {
    for (int i = 0; i<4; i++) {
        this->EEPROM_write(i,sn[i]);
    }
}
uint8_t* AM_STORE::getSerialNumber() {
    uint8_t *serial;
    serial = new uint8_t[4];
    
    for(int i = 0; i<4; i++) {
        serial[i] = this->EEPROM_read(i);
    }
    return serial;
}



void AM_STORE::setRecordInterval(uint8_t val) {
    this->EEPROM_write(70,val);
}
uint8_t AM_STORE::getRecordInterval() {
    return this->EEPROM_read(70);
}
void AM_STORE::EEPROM_write(unsigned int uiAddress, unsigned char ucData)
{
    /* Wait for completion of previous write */
    while(EECR & (1<<EEPE))
        ;
    /* Set up address and Data Registers */
    EEAR = uiAddress;
    EEDR = ucData;
    /* Write logical one to EEMPE */
    EECR |= (1<<EEMPE);
    /* Start eeprom write by setting EEPE */
    EECR |= (1<<EEPE);
}


unsigned char AM_STORE::EEPROM_read(unsigned int uiAddress)
{
    /* Wait for completion of previous write */
    while(EECR & (1<<EEPE))
        ;
    /* Set up address register */
    EEAR = uiAddress;
    /* Start eeprom read by writing EERE */
    EECR |= (1<<EERE);
    /* Return data from Data Register */
    return EEDR;
}
