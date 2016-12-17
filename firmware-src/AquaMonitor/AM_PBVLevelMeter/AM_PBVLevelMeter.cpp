#include "AM_PBVLevelMeter.h"


#include <avr/io.h>

#include <AM_COUNTER.h>
extern AM_COUNTER am_counter;


static bool readingDataFromDevice = false;

Timer* INTERVAL_pbv_getLevel = new Timer(0);
Timer* INTERVAL_dht_update = new Timer(0);

DHT dht(30, DHT11);

void DHT_init(void) {
  //  DHT dht(30, DHT11);
}
void DHT_update(void) {
    float h = dht.readHumidity();
    // Read temperature as Celsius (the default)
    float t = dht.readTemperature();
    
    am_counter.Set_F1( t * 100 );
    am_counter.Set_F2( h * 100 );
    
#ifdef DEBUG_PORT
    DEBUG_PORT.print("DHT Hum: ");
    DEBUG_PORT.println(h);
    DEBUG_PORT.print("DHT Temp: ");
    DEBUG_PORT.println(t);
#endif
    
}
void PBVLevel_init(void) {
    
    
    INTERVAL_pbv_getLevel->setInterval(110000);
    INTERVAL_pbv_getLevel->setOnTimer(&PBVLevel_getValue);
    INTERVAL_pbv_getLevel->Start();
    
    INTERVAL_pbv_getLevel->setInterval(120000);
    INTERVAL_pbv_getLevel->setOnTimer(&DHT_update);
    INTERVAL_pbv_getLevel->Start();

    DDRL |= (1 << DDL7);
    
    PORTL |= (0 << PORTL7);
}


void PBVLevel_send_request(void) {
    
    
    PORTL |= (1 << PORTL7);
    
    RS485.write(0xFF);
    
    delay(1);
    
    PORTL |= (1 << PORTL7);
    
    
#ifdef DEBUG_PORT
    DEBUG_PORT.println("PBVLevel: Requesting data from device...");
#endif
    
}


void PBVLevel_getValue(void) {
    
    
    RS485.begin(9600);

    
    unsigned long timeout = millis();
    char syncBuff[] = {0x31,0x37,0x30,0x0D,0x0A};
    int sum = 0;
    
    char *buffer = new char[8];

    
    while(true) {
        if(RS485.available()) {
            
            char c = RS485.read();
           
            if (sum < 5) {
                sum = (c==syncBuff[sum]) ? sum+1 : 0;
            } else {
                if (c == 0x0D) {
                    break;
                }
                buffer[sum - 5] = c;
                sum++;
            }
            
           
        }
        
        if ((unsigned long) (millis() - timeout) > 1000UL) {
            break;
        }
    }
    
    buffer[sum] = 0;
    
    am_counter.Set_B0( atof(buffer) * 100 );
    
    delete buffer;
    
    RS485.end();

}

char *levelBuffer = new char[32];
int iLevelBuffer = 0;

void PBVLevel_tick(void) {
   
    
    INTERVAL_pbv_getLevel->Update();
  
    
    
}