Board Supportfor Arduino 101
============================

This page defines the values returned by the [`Board.pins()`](./README.md/#getpins) method, and describes the pin mapping for the [`Board.pin()`](./README.md/#getpin) method, from board labels that are printed on the board to operating system specific values.

The board labels are described in the [Arduino 101](https://www.arduino.cc/en/Main/ArduinoBoard101) board documentation. Also, for each board pin, the [`supportedModes`](./README.md/#pin) property of each pin is described.

The [Arduino 101](https://www.arduino.cc/en/Main/ArduinoBoard101) board has 20 I/O pins that operate at 3.3 V and can be configured as described by the following table.

Pins 0 and 1 can be also configured to be used as UART, the port name is exposed as `uart0`.

On GPIO pins (0..13) interrupts can be configured to be triggered on low value, high value, rising edge, and falling edge. Some of the GPIO pins can trigger interrupt on value *change* (pins 2, 5, 7, 8, 10, 11, 12, 13).

Pins 3,5,6 and 9 can be used for PWM output. These pins are marked on the board by a ~ (tilde) symbol next to the pin numbers. Pin 3 corresponds to PWM channel 0, pin 9 to PWM channel 3, etc.

Pins (A0 - A5) can be used for analog input, and each provide 10 bits of resolution (i.e. 1024 different values).

There are 3 LEDs on the board that can be accessed by the pin names `"LED0"`, `"LED1"`, and `"LED3"`.

Other names:
- UART on pin 0 and 1 can be accessed by the name `"uart0`".
- UART on USB can be accessed by the name `"serialUSB0"`, `"serialUSB2"`, etc.
- I2C can be accessed by default on bus 0 (the SDA and SCL pins).
- SPI can be accessed by default on bus 0. SPI pins on the board are:
  * SS (Slave Select) on pin 10
  * MOSI  (Master Out Slave In) on pin 11
  * MISO (Master In Slave Out) on pin 12
  * SCK (Serial Clock) on pin 13.

Arduino 101 pins are summarized in the following table.

|Pin name |Supported modes (channel), [other]  |
| ---     | ---                                |
| `0`     | `"input"`, `"output"`, [UART0 RX]  |
| `1`     | `"input"`, `"output"`, [UART0 TX]  |
| `2`     | `"input"`, `"output"`              |
| `3`     | `"input"`, `"output"`, `"pwm"`(0)  |
| `4`     | `"input"`, `"output"`              |
| `5`     | `"input"`, `"output"`, `"pwm"`(1)  |
| `6`     | `"input"`, `"output"`, `"pwm"`(2)  |
| `7`     | `"input"`, `"output"`              |
| `8`     | `"input"`, `"output"`              |
| `9`     | `"input"`, `"output"`, `"pwm"`(3)  |
| `10`    | `"input"`, `"output"`, [SPI SS]    |
| `11`    | `"input"`, `"output"`, [SPI MOSI]  |
| `12`    | `"input"`, `"output"`, [SPI MISO]  |
| `13`    | `"input"`, `"output"`, [SPI SCK]   |
| `"A0"`  | `"analog"`(0)                      |
| `"A1"`  | `"analog"`(1)                      |
| `"A2"`  | `"analog"`(2)                      |
| `"A3"`  | `"analog"`(3)                      |
| `"A4"`  | `"analog"`(4)                      |
| `"A5"`  | `"analog"`(5)                      |
| `"LED0"`| `"output"` (active on 1)           |
| `"LED1"`| `"output"` (active on 0)           |
| `"LED2"`| `"output"` (active on 0)           |

