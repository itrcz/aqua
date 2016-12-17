
#include "modem.h"

#include <AM_SOCKET.h>

extern AM_SOCKET   am_socket;



#define MODEM_ST_PIN 22
#define MODEM_PK_PIN 23


Stream *GSM_PORT = NULL;

struct modem_states_struct
{
    //Если true, инициализация выполена
    bool inited     = false;
    //Если true, идет ожидание питания на модеме
    bool waitPower  = false;
    //Если true, тест модема выполнен успешно
    bool TEST       = false;
    //Если true, передача данных на модеме включена
    bool CGATT      = false;
    //Если true, можно приступать к записи APN и подключению к gprs
    bool CIPSHUT    = false;
    //Если true, apn настройки внесены в память модема
    bool APN        = false;
    //Если true, соединение с gprs установлено
    bool CIICR      = false;
    //Если true, ip адрес получен
    bool CIFSR      = false;
    //Если true, модем работает нормально
    bool IsOK       = false;
    //Если true, подключения к TCP сокету выполнено
    bool connected  = false;

    uint8_t fails = 0;

} MODEM;

/****************************************************************************************
    Необходимые таймеры
*****************************************************************************************/
Timer* INTERVAL_modem_OnOff = new Timer(3000);
Timer* INTERVAL_modem_check = new Timer(120000);

/*
    Пауза проверок работаспособности модема
    необходимо выполнить при передачи данных
*/
void modem_watch_pause(void) {
    #ifdef DEBUG_PORT
        DEBUG_PORT.println("MODEM: connectivity control disabled.");
    #endif
    INTERVAL_modem_check->Pause();
}
/*
    Восстановление проверок работаспособности модема
*/
void modem_watch_resume(void) {
    #ifdef DEBUG_PORT
        DEBUG_PORT.println("MODEM: connectivity control enabled.");
    #endif
    INTERVAL_modem_check->Resume();
}
/****************************************************************************************
    Управление питанием модема
*****************************************************************************************/
/*
    Функция возвращает true если модем включен и false есил выключен
*/
bool modem_power(void) {
    if (digitalRead(MODEM_ST_PIN) == HIGH)
        return true;
    else
        return false;
}
/*
    Функция делает попытку включения модема
    вызывается автоматический
*/

void modem_power_on(void) {
    pinMode(MODEM_ST_PIN, INPUT);
    pinMode(MODEM_PK_PIN, OUTPUT);

    if ( !modem_power() && MODEM.waitPower == false ) {

        MODEM.fails     = 0;
        MODEM.TEST      = false;
        MODEM.CGATT     = false;
        MODEM.CIPSHUT   = false;
        MODEM.APN       = false;
        MODEM.CIICR     = false;
        MODEM.CIFSR     = false;
        MODEM.IsOK      = false;
        MODEM.connected = false;

        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - powering ON...");
        #endif
        digitalWrite(MODEM_PK_PIN, HIGH);
        MODEM.waitPower = true;
    }
    INTERVAL_modem_OnOff->setSingleShot(true);
    INTERVAL_modem_OnOff->setInterval(5000);
    INTERVAL_modem_OnOff->setOnTimer(&modem_power_check);
    INTERVAL_modem_OnOff->Start();
}
/*
    Функция делает попытку выключения модема
    вызывается автоматический
*/
void modem_power_off(void) {
    if ( modem_power() ) {
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - powering OFF...");
        #endif
        digitalWrite(MODEM_PK_PIN, HIGH);
        
        INTERVAL_modem_OnOff->setSingleShot(true);
        INTERVAL_modem_OnOff->setInterval(5000);
        INTERVAL_modem_OnOff->setOnTimer(&modem_power_check);
        INTERVAL_modem_OnOff->Start();
        
    } else {
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - already OFF.");
        #endif
    }
}
/*
    Проверка питания модема
*/
void modem_power_check(void) {
    MODEM.waitPower = false;
    
    digitalWrite(MODEM_PK_PIN, LOW);
    
    if ( !modem_power() ) {
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - power FAIL");
        #endif
        INTERVAL_modem_OnOff->setSingleShot(true);
        INTERVAL_modem_OnOff->setInterval(1000);
        INTERVAL_modem_OnOff->setOnTimer(&modem_power_on);
        INTERVAL_modem_OnOff->Start();

    } else {
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - power OK");
        #endif
        
        //Инициализация проверки модема после включения
        modem_check_list();
    }
}

/****************************************************************************************
    Инициализация модема
    Выполняется 1 раз при старте контроллера
*****************************************************************************************/
void modem_init(void * uart_device) {
    if (MODEM.inited == true) {
        return;
    }
    GSM_PORT = (Stream*)uart_device;

    MODEM.inited = true;
    #ifdef DEBUG_PORT
        DEBUG_PORT.println("MODEM - inited");
    #endif
    
    //
    modem_power_on();
}
/****************************************************************************************
    Проверка работаспособности модема
*****************************************************************************************/
/*
    Очередь команд
    Выполняется переодический
    Конфигурирует и/или сбразывает настройки модема при необходимости
*/

void modem_check_list(void) {

    INTERVAL_modem_check->setSingleShot(true);
    INTERVAL_modem_check->setInterval(4000);
    INTERVAL_modem_check->setOnTimer(&modem_check_list);

    //Проверка питания на модеме
    if ( ! modem_power() ) {
        MODEM.IsOK = false;

        //Если остутсвует питания, отправляем комадру включить
        modem_power_on();

        return;
    }
    if (MODEM.fails >= 10) {
      #ifdef DEBUG_PORT
          DEBUG_PORT.println("MODEM - too match errors, restarting...");
      #endif

      modem_power_off();

      return;
    }

    gsm_flush_serial();

    //Тест модема
    if ( MODEM.TEST == false) {
        if(!gsm_check_with_cmd("AT+CFUN=1\r\n","OK\r\n",CMD)) {
            MODEM.TEST      = false;
            MODEM.CGATT     = false;
            MODEM.CIPSHUT   = false;
            MODEM.APN       = false;
            MODEM.CIICR     = false;
            MODEM.CIFSR     = false;
            MODEM.IsOK      = false;

            MODEM.connected = false;

            modem_power_off();

            INTERVAL_modem_check->setInterval(4000);
            INTERVAL_modem_check->Start();
            #ifdef DEBUG_PORT
                DEBUG_PORT.println("MODEM - hardware FAIL");
            #endif
            return;
        }
        MODEM.TEST = true;
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - hardware OK");
        #endif
    }
    //Проверка регистрации в домашней сети
    if(!gsm_check_with_cmd("AT+CREG?\r\n", "+CREG: 0,1\r\n",CMD)) {
        MODEM.CIPSHUT   = false;
        MODEM.CIICR     = false;
        MODEM.CIFSR     = false;
        MODEM.IsOK      = false;

        MODEM.connected = false;

        MODEM.fails++;

        INTERVAL_modem_check->setInterval(10000);
        INTERVAL_modem_check->Start();
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - gsm FAIL");
        #endif
        return;
    }
    #ifdef DEBUG_PORT
        DEBUG_PORT.println("MODEM - gsm OK");
    #endif
    //Включаем передачу данных
    if ( MODEM.CGATT == false ) {
        if (!gsm_check_with_cmd("AT+CGATT=1\r\n","OK\r\n",CMD)) {
            MODEM.CGATT = false;
            MODEM.IsOK = false;
            INTERVAL_modem_check->setInterval(1000);
            INTERVAL_modem_check->Start();
            #ifdef DEBUG_PORT
                DEBUG_PORT.println("MODEM - CGATT FAIL");
            #endif
            return;
        }
        MODEM.CGATT = true;
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - CGATT OK");
        #endif
    }
    if ( MODEM.CIPSHUT == false ) {
        gsm_send_cmd("AT+CIPSHUT\r\n");
        INTERVAL_modem_check->setInterval(2000);
        INTERVAL_modem_check->Start();

        MODEM.CIPSHUT = true;

        MODEM.fails++;

        return;
    }
    if ( MODEM.APN == false ) {

        modem_join_apn("fixedip.msk", "", "");

        INTERVAL_modem_check->setInterval(1000);
        INTERVAL_modem_check->Start();
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - apn OK");
        #endif
        return;
    }
    if ( MODEM.CIICR == false ) {
        if (!gsm_check_with_cmd("AT+CIICR\r\n","OK",CMD)) {
            MODEM.CIICR = false;
            MODEM.IsOK = false;

            MODEM.fails++;

            INTERVAL_modem_check->setInterval(2000);
            INTERVAL_modem_check->Start();
            #ifdef DEBUG_PORT
                DEBUG_PORT.println("MODEM - CIICR FAIL");
            #endif
            return;
        }
        MODEM.CIICR = true;

        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - CIICR OK");
        #endif

        INTERVAL_modem_check->setInterval(4000);
        INTERVAL_modem_check->Start();
        return;
    }

    if (!gsm_check_with_cmd("AT+CIFSR\r\n",".",CMD)) {


        MODEM.CIPSHUT = false;
        MODEM.CIICR = false;
        MODEM.IsOK = false;

        MODEM.connected = false;

        MODEM.fails++;

        INTERVAL_modem_check->setInterval(100);
        INTERVAL_modem_check->Start();
        #ifdef DEBUG_PORT
            DEBUG_PORT.println("MODEM - gprs FAIL");
        #endif
        return;
    }

    #ifdef DEBUG_PORT
        DEBUG_PORT.println("MODEM - gprs OK");
    #endif

    MODEM.IsOK = true;

    #ifdef DEBUG_PORT
        DEBUG_PORT.println("MODEM - OK");
    #endif

    MODEM.fails = 0;

    INTERVAL_modem_check->setInterval(120000);
    INTERVAL_modem_check->Start();

}

//Задаем APN
void modem_join_apn(char* apn, char* user, char* pass) {
    MODEM.APN = true;
    gsm_send_cmd("AT+CSTT=\"");
    gsm_send_cmd(apn);
    gsm_send_cmd("\",\"");
    gsm_send_cmd(user);
    gsm_send_cmd("\",\"");
    gsm_send_cmd(pass);
    gsm_send_cmd("\"\r\n");
}

/****************************************************************************************
    TCP Соединение
*****************************************************************************************/
bool modem_tcp_connect(const char* host, const char* port) {
   
    if (MODEM.connected) {
        return true;
    }
    if ( MODEM.IsOK == false ) {
        MODEM.connected = false;
        return false;
    }
    
    gsm_flush_serial();
    
    gsm_send_cmd("AT+CIPSTART=\"TCP\",\"");
    gsm_send_cmd(host);
    gsm_send_cmd("\",");
    gsm_send_cmd(port);
    
    if (gsm_check_with_cmd("\r\n", "CONNECT", CMD) ) {
  
        modem_watch_pause();
        
        MODEM.fails = 0;
        MODEM.connected = true;
        return true;
    }
    
    MODEM.connected = false;
    MODEM.fails++;
    
    modem_tcp_disconnect();
    
    return false;

}
bool modem_tcp_disconnect() {
    modem_watch_resume();
    MODEM.connected = false;

    if (gsm_check_with_cmd("AT+CIPCLOSE\r\n", "CLOSE OK\r\n", CMD)) {
        return true;
    }
    MODEM.fails++;
    
    return false;
}
bool modem_tcp_send_init(uint16_t len) {
   
    gsm_send_cmd("AT+CIPSEND=");
    gsm_send_int(len);
    
    if(!gsm_check_with_cmd("\r\n",">",CMD)) {
        MODEM.fails++;
        return false;
    }
    return true;
}
void modem_tcp_send_byte(uint8_t b) {
    gsm_send_byte(b);
}
/****************************************************************************************
    Прерывание
*****************************************************************************************/
void modem_tick(void) {
    INTERVAL_modem_check->Update();
    INTERVAL_modem_OnOff->Update();
}
/****************************************************************************************
    Необходимые функции
*****************************************************************************************/

int gsm_check_readable()
{
    return GSM_PORT->available();
}
uint8_t gsm_read_byte()
{
    if(gsm_check_readable()){
        char c = GSM_PORT->read();
        return c;
    }
    return 0;
}

int gsm_wait_readable (int wait_time)
{
    unsigned long timerStart;
    int dataLen = 0;
    timerStart = millis();
    while((unsigned long) (millis() - timerStart) > wait_time * 1000UL) {
        delay(500);
        dataLen = gsm_check_readable();
        if(dataLen > 0){
            break;
        }
    }
    return dataLen;
}

void gsm_flush_serial()
{
    while(gsm_check_readable()){
        char c = GSM_PORT->read();
    }
}

void gsm_read_buffer(char *buffer, int count, unsigned int timeout, unsigned int chartimeout)
{
    int i = 0;
    unsigned long timerStart, prevChar;
    timerStart = millis();
    prevChar = 0;
    while(1) {
        while (gsm_check_readable()) {
            char c = GSM_PORT->read();
            prevChar = millis();
            buffer[i++] = c;
            if(i >= count)break;
        }
        if(i >= count)break;
        if ((unsigned long) (millis() - timerStart) > timeout * 1000UL) {
            break;
        }
        //If interchar Timeout => return FALSE. So we can return sooner from this function. Not DO it if we dont recieve at least one char (prevChar <> 0)
        if (((unsigned long) (millis() - prevChar) > chartimeout) && (prevChar != 0)) {
            break;
        }
    }
}

void gsm_clean_buffer(char *buffer, int count)
{
    for(int i=0; i < count; i++) {
        buffer[i] = '\0';
    }
}

//HACERR quitar esta funcion ?
void gsm_send_byte(uint8_t data)
{
    GSM_PORT->write(data);
}
void gsm_send_int(uint16_t data)
{
    GSM_PORT->print(data);
}

void gsm_send_char(const char c)
{
    GSM_PORT->write(c);
}

void gsm_send_cmd(const char* cmd)
{
  for(int i=0; i<strlen(cmd); i++)
    {
        gsm_send_byte(cmd[i]);
    }
}

void gsm_send_cmd(const __FlashStringHelper* cmd)
{
  int i = 0;
  const char *ptr = (const char *) cmd;
  while (pgm_read_byte(ptr + i) != 0x00) {
    gsm_send_byte(pgm_read_byte(ptr + i++));
  }
}

void gsm_send_cmd_P(const char* cmd)
{
  while (pgm_read_byte(cmd) != 0x00)
    gsm_send_byte(pgm_read_byte(cmd++));
}

void gsm_send_End_Mark(void)
{
    gsm_send_byte((char)26);
}

boolean gsm_wait_for_resp(const char* resp, DataType type, unsigned int timeout, unsigned int chartimeout)
{
    int len = strlen(resp);
    int sum = 0;
    unsigned long timerStart, prevChar;    //prevChar is the time when the previous Char has been read.
    timerStart = millis();
    prevChar = 0;
    while(1) {
        if(gsm_check_readable()) {
            char c = GSM_PORT->read();
            prevChar = millis();
            sum = (c==resp[sum]) ? sum+1 : 0;
            if(sum == len) break;
        }
        if ((unsigned long) (millis() - timerStart) > timeout * 1000UL) {
            return false;
        }
        //If interchar Timeout => return FALSE. So we can return sooner from this function.
        if (((unsigned long) (millis() - prevChar) > chartimeout) && (prevChar != 0)) {
         //   return false;
        }
    }
    //If is a CMD, we will finish to read buffer.
    if(type == CMD) gsm_flush_serial();
    return true;
}


boolean gsm_check_with_cmd(const char* cmd, const char *resp, DataType type, unsigned int timeout, unsigned int chartimeout)
{
    gsm_send_cmd(cmd);
    return gsm_wait_for_resp(resp,type,timeout,chartimeout);
}

//HACERR que tambien la respuesta pueda ser FLASH STRING
boolean gsm_check_with_cmd(const __FlashStringHelper* cmd, const char *resp, DataType type, unsigned int timeout, unsigned int chartimeout)
{
    gsm_send_cmd(cmd);
    return gsm_wait_for_resp(resp,type,timeout,chartimeout);
}
