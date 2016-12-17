/*
  AM_COUNTER.h
  AquaMonitor firmware
  LLC AquaAlliance
  Author: Ilya Trikoz
  12 aug 2016
*/



#define DEBUG_PORT Serial

#define FILE_BIN_VERSION 0x01

#include <avr/io.h>
#include <avr/interrupt.h>

//Счетчик №1
static uint32_t _A0;
//Глубина
static uint32_t _B0;
//Температура
static uint32_t _F1;
//Влажность
static uint32_t _F2;

//Записывает даные на SD карту
void SaveData();

class AM_COUNTER
{
    
  public:
    AM_COUNTER();
    
    void Set_A0(uint32_t val);
    void Set_B0(uint32_t val);
    
    void Set_F1(uint32_t val);
    void Set_F2(uint32_t val);
    
    void SetLCDText(char*text);
    
    void init();
    void tick();
  private:
    
    //Включает прерывания на 2 порту
    void EnableInterrupts(void);
    //Сбразывает счетчик
    void ResetCounter(void);
};
