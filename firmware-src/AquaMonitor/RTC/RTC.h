#define DS3231_ADDRESS              (0x68)
#define DS3231_REG_TIME             (0x00)
#define DS3231_REG_ALARM_1          (0x07)
#define DS3231_REG_ALARM_2          (0x0B)
#define DS3231_REG_CONTROL          (0x0E)
#define DS3231_REG_STATUS           (0x0F)
#define DS3231_REG_TEMPERATURE      (0x11)

#include <Wire.h>

PROGMEM const uint8_t daysArray [] = { 31,28,31,30,31,30,31,31,30,31,30,31 };

struct ts {
    uint8_t sec;    // seconds
    uint8_t min;    // minute
    uint8_t hour;   // hours
    uint8_t day;    // date
    uint8_t mon;    // month
    uint8_t year;   // year
};


class RTC {

  public:
    RTC();

    void Date(struct ts *t);


    //Отдает время - 7 байт BCD из RTC
    void get(uint8_t *t);
    //Записывает время 7 байт BCD в RTC
    bool set(uint16_t year, uint8_t month, uint8_t day, uint8_t hour, uint8_t minute, uint8_t second);

    void timeslice2000(uint32_t* timestamp);


  private:

    //Конвертирует из BCD в целое число
    uint8_t bcd2dec(uint8_t num);

    long time2long(uint16_t days, uint8_t hours, uint8_t minutes, uint8_t seconds);
    uint16_t date2days(uint16_t year, uint8_t month, uint8_t day);
};
