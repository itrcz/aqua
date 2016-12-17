#include "RTC.h"

#include <HardwareSerial.h>

RTC rtc;

  RTC::RTC()  {
    Wire.begin();
  }

  uint8_t RTC::bcd2dec(uint8_t num)
  {
    return ((num/16 * 10) + (num % 16));
  }
  long RTC::time2long(uint16_t days, uint8_t hours, uint8_t minutes, uint8_t seconds)
  {
      return ((days * 24L + hours) * 60 + minutes) * 60 + seconds;
  }
  uint16_t RTC::date2days(uint16_t y, uint8_t m, uint8_t d)
  {
      if (y >= 2000)
          y -= 2000;
      uint16_t days = d;
      for (uint8_t i = 1; i < m; ++i)
          days += pgm_read_byte(daysArray + i - 1);
      if (m > 2 && y % 4 == 0)
          ++days;
      return days + 365 * y + (y + 3) / 4 - 1;
  }
  void RTC::Date(struct ts *t) {
    Wire.beginTransmission(DS3231_ADDRESS);
    Wire.write(DS3231_REG_TIME);
    Wire.requestFrom(DS3231_ADDRESS, 7);

    if (Wire.available()) {
         t->sec   = bcd2dec( Wire.read() );
         t->min   = bcd2dec( Wire.read() );
         t->hour  = bcd2dec( Wire.read() );
                             Wire.read();
         t->day   = bcd2dec( Wire.read() );
         t->mon   = bcd2dec( Wire.read() );
         t->year  = bcd2dec( Wire.read() );
    } else {
      t->sec   = 0;
      t->min   = 0;
      t->hour  = 0;
      t->day   = 0;
      t->mon   = 0;
      t->year  = 0;
    }
    Wire.endTransmission();
  }
  void RTC::get(uint8_t *t)
  {
    Wire.beginTransmission(DS3231_ADDRESS);
    Wire.write(DS3231_REG_TIME);
    Wire.requestFrom(DS3231_ADDRESS, 7);

    *t = {0};

    if (Wire.available()) {
         t[0] = bcd2dec( Wire.read() );//sec
         t[1] = bcd2dec( Wire.read() );//min
         t[2] = bcd2dec( Wire.read() );//hour
         t[3] = bcd2dec( Wire.read() );//day
         t[4] = bcd2dec( Wire.read() );//date
         t[5] = bcd2dec( Wire.read() );//month
         t[6] = bcd2dec( Wire.read() );//year
    }


    Wire.endTransmission();
  }
  bool RTC::set(uint16_t year, uint8_t month, uint8_t day, uint8_t hour, uint8_t minute, uint8_t second)
  {
    Wire.beginTransmission(DS3231_ADDRESS);

    if (! Wire.write(DS3231_REG_TIME)) {
      return false;
    }

    Wire.write(second);
    Wire.write(minute);
    Wire.write(hour);
    Wire.write(0x01);// day of week does not matter for our needs
    Wire.write(day);
    Wire.write(month);
    Wire.write(year);

    Wire.write(DS3231_REG_TIME);

    Wire.endTransmission();

    return true;
  }
#include <HardwareSerial.h>

#define DEBUG_PORT Serial1

#define SECONDS_FROM_1970_TO_2000 946684800

const uint8_t daysInMonth [] PROGMEM = { 31,28,31,30,31,30,31,31,30,31,30,31 };

// number of days since 2000/01/01, valid for 2001..2099
static uint16_t date2days1(uint16_t y, uint8_t m, uint8_t d) {
    if (y >= 2000)
        y -= 2000;
    uint16_t days = d;
    for (uint8_t i = 1; i < m; ++i)
        days += pgm_read_byte(daysInMonth + i - 1);
    if (m > 2 && y % 4 == 0)
        ++days;
    return days + 365 * y + (y + 3) / 4 - 1;
}

  void RTC::timeslice2000(uint32_t* timestamp)
  {

    uint8_t *t = new uint8_t[7];

    get(t);
      
    *timestamp = time2long( date2days(t[6], t[5], t[4]) , t[2],  t[1], t[0]);
      
    delete t;
  }
