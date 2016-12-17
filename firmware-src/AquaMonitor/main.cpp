/*
 DIGITAL PIN CONFIG
 
 18 - [COMM-SERIAL] RX
 19 - [COMM-SERIAL] TX
 
 53 - [SD-CARD] SS (CS)
 52 - [SD-CARD] SCK
 51 - [SD-CARD] MOSI
 50 - [SD-CARD] MISO
 
 Serial0 - USB-TTL Communication
 Serial1 - Debug
 Serial2 - RS485
 Serial3 - GPRS
 
*/


#include <stdint.h>

#include <Timer.h>

#include <modem.h>

#include "DHT.h"

#include <RTC.h>
#include <AM_STORE.h>
#include <AM_COUNTER.h>
#include <AM_SOCKET.h>

#include <AM_PBVLevelMeter.h>

#include <LiquidCrystal_SSD1306.h>

String LCD_1 = "";

extern RTC         rtc;
extern AM_COUNTER  am_counter;
extern AM_STORE    am_store;
extern AM_SOCKET   am_socket;


/*
Timer* INTERVAL_availableMemory = new Timer(5000);

void printAvailableMemoryToSerial1() {
    if (Serial1) {
        uint16_t size = 8192;
        byte *buf;
        while ((buf = (byte *) malloc(--size)) == NULL);
        delete buf;
        Serial1.print("Free memory: ");
        Serial1.println(size);
    }
}
*/
void Serial_printTime(ts t) {
    Serial.print("Today is ");
    Serial.print(t.day);
    Serial.print(".");
    Serial.print(t.mon);
    Serial.print(".");
    Serial.println(t.year);
    Serial.print("Time is ");
    Serial.print(t.hour);
    Serial.print(":");
    Serial.print(t.min);
    Serial.print(":");
    Serial.println(t.sec);
    /*
    uint8_t *newSerial;
    
    newSerial = new uint8_t[3];
    newSerial[0] = 0x00;
    newSerial[1] = 0x00;
    newSerial[2] = 0xAA;

    am_store.setSerialNumber(newSerial);
    
    delete newSerial;
    */
    uint8_t * SN = am_store.getSerialNumber();
    
    Serial.print("SN: ");
    Serial.println( *( uint32_t* )SN );
    
    delete SN;
}
int main() {

    init();
    
    //дебаг
    Serial.begin(9600);
    
    //Серийны интерфейс для передачи
    Serial1.begin(9600);
    
    //GPRS
    Serial3.begin(115200);
    
    am_socket.init();
    
    
    PBVLevel_init();
    
    modem_init(&Serial3);
    
    am_counter.init();
 
    struct ts t;
    rtc.Date(&t);
    
    _delay_ms(100);
    
    Serial_printTime(t);
    
    //INTERVAL_availableMemory->setOnTimer(&printAvailableMemoryToSerial1);
    //INTERVAL_availableMemory->Start();

    char *levelBuffer = new char[20];
    int iLevelBuffer = false;

    
    while(true) {
        
        //INTERVAL_availableMemory->Update();
        
        am_counter.tick();
        am_socket.tick();
        modem_tick();
        
        PBVLevel_tick();
        
    }
}

/*
 
 uint32_t LED_T = 0;
 
 void blink_led() {
 pinMode(40,OUTPUT);
 LED_T = millis();
 digitalWrite(40, HIGH);
 }
 void led_off_check() {
 if (!LED_T) return;
 
 if ( (millis() - LED_T) > 20  ) {
 digitalWrite(40, LOW);
 LED_T = 0;
 }
 }

 */
