Board Support for Arduino 101
=============================

This document defines the pin values that are accepted by implementations.

The board labels are described in the [Arduino 101](https://www.arduino.cc/en/Main/ArduinoBoard101) board documentation. Also, for each board pin, the supported modes of each pin is described.

The [Arduino 101](https://www.arduino.cc/en/Main/ArduinoBoard101) board has 20 I/O pins that operate at 3.3V and can be configured as described by the following table.

Pins 0 and 1 can be also configured to be used as UART. The port name is exposed as `uart0`.

On GPIO pins (0..13) interrupts can be configured to be triggered on low value, high value, rising edge and falling edge. Some of the GPIO pins can trigger interrupt on value *change* (pins 2, 5, 7, 8, 10, 11, 12, 13).

Pins 3, 5, 6 and 9 can be used for PWM output. These pins are marked on the board by a ~ (tilde) symbol next to the pin numbers. Pin 3 corresponds to PWM channel 0, pin 5 to PWM channel 1, pin 6 to PWM channed 2, and pin 9 to PWM channel 3.

Pins A0 to A5 can be used for analog input and each provide 10 bits of resolution (i.e. 1024 different values).

There are 3 LEDs on the board that can be accessed by the pin names `"LED0"`, `"LED1"` and `"LED3"`.

Other names:
- UART on pin 0 and 1 can be accessed by the name `"uart0"`.
- UART on USB can be accessed by the name `"serialUSB0"`, `"serialUSB2"`, etc.
- I2C can be accessed by default on bus 0 (the SDA and SCL pins).
- SPI can be accessed by default on bus 0. SPI pins on the board are:
  * SS (Slave Select) on pin 10
  * MOSI  (Master Out Slave In) on pin 11
  * MISO (Master In Slave Out) on pin 12
  * SCK (Serial Clock) on pin 13.

Arduino 101 pins are summarized in the following table (channel means the index of the same I/O type):

|Pin value |Supported modes (channel)       |
| ---      | ---                            |
| `0`      | GPIO_IN, GPIO_OUT, UART_RX(0)  |
| `1`      | GPIO_IN, GPIO_OUT, UART_TX(0)  |
| `2`      | GPIO_IN, GPIO_OUT              |
| `3`      | GPIO_IN, GPIO_OUT, PWM(0)      |
| `4`      | GPIO_IN, GPIO_OUT              |
| `5`      | GPIO_IN, GPIO_OUT, PWM(1)      |
| `6`      | GPIO_IN, GPIO_OUT, PWM(2)      |
| `7`      | GPIO_IN, GPIO_OUT              |
| `8`      | GPIO_IN, GPIO_OUT              |
| `9`      | GPIO_IN, GPIO_OUT, PWM(3)      |
| `10`     | GPIO_IN, GPIO_OUT, SPI_SS(0)   |
| `11`     | GPIO_IN, GPIO_OUT, SPI_MOSI(0) |
| `12`     | GPIO_IN, GPIO_OUT, SPI_MISO(0) |
| `13`     | GPIO_IN, GPIO_OUT, SPI_SCLK(0) |
| `"A0"`   | ANALOG_IN(0)                   |
| `"A1"`   | ANALOG_IN(1)                   |
| `"A2"`   | ANALOG_IN(2)                   |
| `"A3"`   | ANALOG_IN(3)                   |
| `"A4"`   | ANALOG_IN(4)                   |
| `"A5"`   | ANALOG_IN(5)                   |
| `"LED0"` | active on 1                    |
| `"LED1"` | active on 0                    |
| `"LED2"` | active on 0                    |
