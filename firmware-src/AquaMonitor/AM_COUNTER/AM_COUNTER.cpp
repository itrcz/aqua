/*
  AM_COUNTER.cpp
  AquaMonitor firmware
  LLC AquaAlliance
  Author: Ilya Trikoz
  12 aug 2016
*/
#include "AM_COUNTER.h"

#include <AM_STORE.h>
#include <Timer.h>
#include <modem.h>
#include <HardwareSerial.h>

#include <RTC.h>
extern RTC rtc;


#define INTERVAL_20S   20000
#define INTERVAL_1MIN   60000
#define INTERVAL_5MIN   300000
#define INTERVAL_15MIN  900000
#define INTERVAL_30MIN  1800000
#define INTERVAL_60MIN  3600000

extern AM_STORE am_store;

Timer* INTERVAL_record_saving = new Timer(0);

AM_COUNTER am_counter;


void SaveData() {
    
#ifdef DEBUG_PORT
    DEBUG_PORT.println("COUNTER - Saving data...");
#endif
    
    //Записываем импульсы (парамерт A1)
    /*
     При записи первого параметра необходимо вторым аргументом
     ставить true для записи метки времени в файл
    */
    am_store.writeToDataFile( &_A0 , true);
    
    //Записываем глубину (парамерт B1)
    am_store.writeToDataFile( &_B0 , false);
    
    //Записываем температуру (парамерт F1)
    am_store.writeToDataFile( &_F1 , false);
    //Записываем влажность (парамерт F2)
    am_store.writeToDataFile( &_F2 , false);
    
}

AM_COUNTER::AM_COUNTER() {
   
}


#include <LiquidCrystal_SSD1306.h>

#define OLED_RESET 4
LiquidCrystal_SSD1306 lcd(SSD1306_SWITCHCAPVCC, SSD1306_I2C_ADDRESS, OLED_RESET);

void AM_COUNTER::SetLCDText(char*text) {
    lcd.clear();
    lcd.home();
    lcd.print(text);
  //  _delay_ms(100);
    
}
void AM_COUNTER::init() {
    
    //Экран
    lcd.begin(128, 64);
    
    
    //Значения счетчика
    Set_A0(0);
    Set_B0(0);
    
    Set_F1(0);
    Set_F2(0);
    
    am_store.Restore();
    
    //Включаем прерывания
    EnableInterrupts();

    
    switch ( am_store.getRecordInterval() ) {
        case 0x1:INTERVAL_record_saving->setInterval(INTERVAL_1MIN); break;
        case 0x2:INTERVAL_record_saving->setInterval(INTERVAL_5MIN); break;
        case 0x3:INTERVAL_record_saving->setInterval(INTERVAL_15MIN); break;
        case 0x4:INTERVAL_record_saving->setInterval(INTERVAL_30MIN); break;
        case 0x5:INTERVAL_record_saving->setInterval(INTERVAL_60MIN); break;
        default: INTERVAL_record_saving->setInterval(INTERVAL_5MIN); break;
    }
    INTERVAL_record_saving->setOnTimer(&SaveData);
    INTERVAL_record_saving->Start();
    
}

void AM_COUNTER::Set_A0(uint32_t val)
{
    _A0 = val;
}
void AM_COUNTER::Set_B0(uint32_t val)
{
    _B0 = val;
}
void AM_COUNTER::Set_F1(uint32_t val)
{
    _F1 = val;
}
void AM_COUNTER::Set_F2(uint32_t val)
{
    _F2 = val;
}

void AM_COUNTER::EnableInterrupts(void)
{
  //Обнуляем порт PE4, теперь PE42 (2 порт) назначен как OUTPUT
  DDRE &= (0 << DDE4);

  //Задаем pull-up на порту
  PORTE |= (1 << PORTE4);


  //Задаем прерывание rising edge
  EICRB |= (1 << ISC41) | (0 << ISC40);
  //Включаем прерывания
  EIMSK |= (1 << INT4);
  //Разрешить прирывания
  __asm__ __volatile__ ("sei" ::: "memory");
}
/*
  Прерывание по 4 вектору
  Вызывается при получении импульса
  с расходомера
*/

ISR (INT4_vect)
{
  _delay_ms(10);
  if ( !(PINE & 1 << PORTE4) ) {
      _A0++;
    #ifdef DEBUG_PORT
      DEBUG_PORT.print("COUNTER - Impulses: ");
      DEBUG_PORT.println(_A0);

    #endif
  }
}
/*
  Прерывание
*/
void AM_COUNTER::tick() {
  INTERVAL_record_saving->Update();
}
