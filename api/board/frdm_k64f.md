Board Support for FRDM-K64F
===========================

The FRDM-K64F board pin names and locations are shown [here](https://developer.mbed.org/platforms/FRDM-K64F/).

There are 16 general purpose I/O pins, `D0` - `D15`. `D14` and `D15` can currently be used as GPIO inputs but not as outputs.

There is an onboard RGB LED which can be controlled through three different GPIO outputs for the red, green, and blue components. `LEDR` controls the red portion, `LEDG` the green portion, and `LEDB` the blue
portion. They are all active on high.

There are three onboard switches labeled `SW2`, `SW3`, and `RESET`. The `SW2` switch can be used as a GPIO input. The `RESET` switch can be used as an output.

There are ten pins that can be used as PWM output, `PWM0` - `PWM9`.

There are six analog input pins, `A0` - `A5`.

Supported pins are summarized in the following table:

|Pin name |Supported modes (channel), [other]   |
| ---     | ---                                 |
| `D0`    | `"input"`, `"output"`, [UART3 RX]   |
| `D1`    | `"input"`, `"output"`, [UART3 TX]   |
| `D2`    | `"input"`, `"output"`               |
| `D3`    | `"input"`, `"output"`, `"pwm"`(0)   |
| `D4`    | `"input"`, `"output"`               |
| `D5`    | `"input"`, `"output"`, `"pwm"`(1)   |
| `D6`    | `"input"`, `"output"`, `"pwm"`(2)   |
| `D7`    | `"input"`, `"output"`, `"pwm"`(3)   |
| `D8`    | `"input"`, `"output"`, `"pwm"`(4)   |
| `D9`    | `"input"`, `"output"`, `"pwm"`(5)   |
| `D10`   | `"input"`, `"output"`, `"pwm"`(6)   |
| `D11`   | `"input"`, `"output"`, `"pwm"`(7), [SPI MOSI] |
| `D12`   | `"input"`, `"output"`, `"pwm"`(8), [SPI MISO] |
| `D13`   | `"input"`, `"output"`, `"pwm"`(9), [SPI SCK]  |
| `D14`   | `"input"`, [I2C SDA]                |
| `D15`   | `"input"`, [I2C SCL]                |
| `"A0"`  | `"analog"`(0)                       |
| `"A1"`  | `"analog"`(1)                       |
| `"A2"`  | `"analog"`(2)                       |
| `"A3"`  | `"analog"`(3)                       |
| `"A4"`  | `"analog"`(4), `"pwm"`              |
| `"A5"`  | `"analog"`(5), `"pwm"`              |
| `"LED0"`| `"output"` (active on 1)            |
| `"LED1"`| `"output"` (active on 0)            |
| `"LED2"`| `"output"` (active on 0)            |
