
#include <Arduino.h>
#include <HardwareSerial.h>
#include <Timer.h>

#define DEBUG_PORT Serial

void 	modem_watch_pause(void);
void 	modem_watch_resume(void);


void 	modem_power_on(void);
void 	modem_power_off(void);
void 	modem_power_check(void);

void	modem_init(void * uart_device);
void	modem_check_list(void);
void	modem_join_apn(char* apn, char* user, char* pass);

bool	modem_gprs_check(void);

bool	modem_tcp_connect(const char* host, const char* port);
bool	modem_tcp_disconnect();
bool	modem_tcp_send_init(uint16_t len);
void	modem_tcp_send_byte(uint8_t b);

void	modem_tick(void);


#define DEFAULT_TIMEOUT     		 10   //seconds
#define DEFAULT_INTERCHAR_TIMEOUT 1500   //miliseconds

enum DataType {
    CMD     = 0,
    DATA    = 1,
};

int   gsm_check_readable();

uint8_t   gsm_read_byte();

int   gsm_wait_readable(int wait_time);
void  gsm_flush_serial();
void  gsm_read_buffer(char* buffer,int count,  unsigned int timeout = DEFAULT_TIMEOUT, unsigned int chartimeout = DEFAULT_INTERCHAR_TIMEOUT);
void  gsm_clean_buffer(char* buffer, int count);
void  gsm_send_byte(uint8_t data);
void  gsm_send_int(uint16_t data);
void  gsm_send_char(const char c);
void  gsm_send_cmd(const char* cmd);
void  gsm_send_cmd(const __FlashStringHelper* cmd);
void  gsm_send_cmd_P(const char* cmd);
void  gsm_send_End_Mark(void);
boolean  gsm_wait_for_resp(const char* resp, DataType type, unsigned int timeout = DEFAULT_TIMEOUT, unsigned int chartimeout = DEFAULT_INTERCHAR_TIMEOUT);
boolean  gsm_check_with_cmd(const char* cmd, const char *resp, DataType type, unsigned int timeout = DEFAULT_TIMEOUT, unsigned int chartimeout = DEFAULT_INTERCHAR_TIMEOUT);
boolean  gsm_check_with_cmd(const __FlashStringHelper* cmd, const char *resp, DataType type, unsigned int timeout = DEFAULT_TIMEOUT, unsigned int chartimeout = DEFAULT_INTERCHAR_TIMEOUT);
