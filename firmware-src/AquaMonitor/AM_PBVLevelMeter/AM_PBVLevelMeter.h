/*
 AM_PBVLevelMeter
 AquaMonitor firmware
 LLC AquaAlliance
 Author: Ilya Trikoz
 31 Aug 2016
*/

#include <Timer.h>

#include "DHT.h"


#include <HardwareSerial.h>


#define RS485 Serial2


#define DEBUG_PORT Serial


//Открывает порт
void PBVLevel_init(void);

void PBVLevel_send_request(void);
void PBVLevel_getValue(void);

void PBVLevel_tick(void);
