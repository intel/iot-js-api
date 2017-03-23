Board Support for FRDM-K64F
===========================

The FRDM-K64F board pin names and locations are shown [here](https://developer.mbed.org/platforms/FRDM-K64F/).

There are 16 general purpose I/O pins, `D0` - `D15`. `D14` and `D15` can currently be used as GPIO_INs but not as outputs.

There is an onboard RGB LED which can be controlled through three different GPIO_OUTs for the red, green, and blue components. `LEDR` controls the red portion, `LEDG` the green portion, and `LEDB` the blue
portion. They are all active on high.

There are three onboard switches labeled `SW2`, `SW3`, and `RESET`. The `SW2` switch can be used as a GPIO_IN. The `RESET` switch can be used as an output.

There are ten pins that can be used as PWM output, `PWM0` - `PWM9`.

There are six analog input pins, `A0` - `A5`.

Supported pins are summarized in the following table:

|Pin name |Supported modes (channel)               |
| ---     | ---                                    |
| `D0`    | GPIO_IN, GPIO_OUT, UART_RX(3)          |
| `D1`    | GPIO_IN, GPIO_OUT, UART_TX(3)          |
| `D2`    | GPIO_IN, GPIO_OUT                      |
| `D3`    | GPIO_IN, GPIO_OUT, PWM(0)              |
| `D4`    | GPIO_IN, GPIO_OUT                      |
| `D5`    | GPIO_IN, GPIO_OUT, PWM(1)              |
| `D6`    | GPIO_IN, GPIO_OUT, PWM(2)              |
| `D7`    | GPIO_IN, GPIO_OUT, PWM(3)              |
| `D8`    | GPIO_IN, GPIO_OUT, PWM(4)              |
| `D9`    | GPIO_IN, GPIO_OUT, PWM(5)              |
| `D10`   | GPIO_IN, GPIO_OUT, PWM(6)              |
| `D11`   | GPIO_IN, GPIO_OUT, PWM(7), SPI_MOSI(0) |
| `D12`   | GPIO_IN, GPIO_OUT, PWM(8), SPI_MISO(0) |
| `D13`   | GPIO_IN, GPIO_OUT, PWM(9), SPI_SCLK(0) |
| `D14`   | GPIO_IN, I2C_SDA(0)                    |
| `D15`   | GPIO_IN, I2C_SCL(0)                    |
| `"A0"`  | ANALOG_IN(0)                           |
| `"A1"`  | ANALOG_IN(1)                           |
| `"A2"`  | ANALOG_IN(2)                           |
| `"A3"`  | ANALOG_IN(3)                           |
| `"A4"`  | ANALOG_IN(4), PWM                      |
| `"A5"`  | ANALOG_IN(5), PWM                      |
| `"LED0"`| active on 1                            |
| `"LED1"`| active on 0                            |
| `"LED2"`| active on 0                            |
