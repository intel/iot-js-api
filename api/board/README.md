Board API
=========

This API provides low level interfaces for I/O operations supported by the board and defines pin mappings between board pin names and pin values mapped by the OS.
  - [AIO - Analog I/O](./aio.md)
  - [GPIO - General Purpose I/O](./gpio.md)
  - [PWM - Pulse Width Modulation](./pwm.md)
  - [I2C - Inter-Integrated Circuit](./i2c.md)
  - [SPI - Serial Peripheral Interface](./spi.md)
  - [UART - Universal Asynchronous Receiver/Transmitter](./uart.md).

The full Web IDL definition for Board and IO APIs can be found [here](./webidl.md).

The API object
--------------
The API entry point is a [`Board`](./#board) object that is exposed in a platform-specific manner. As an example, on Node.js it can be obtained by requiring the package that implements this API.

In the following example, the application requires an implementation that exposed Arduino 101 values and semantics for pins.
```javascript
var board = require("board");

console.log("Connected to board: " + board.name);
```

On other platforms, e.g. in browsers, the API entry point can be exposed on another object, or constructed.
```javascript
var board = new Board();  // provides an instance of the default board
```

If the functionality is not supported by the platform, `require` should throw `NotSupportedError`. If there is no permission for using the functionality, `require` should throw `SecurityError`.

This API uses board pin names as defined in the corresponding board documentation.
The names, values and semantics related to hardware pins are owned and encapsulated by the implementation. This API uses opaque values (strings and numbers) for pin names.

The supported board documentations are listed in [this directory](./):
- [arduino101.md](./arduino101.md)
- [frdm_k64f.md](./frdm_k64f.md).

<a name="pin"></a>
### The `Pin` interface
Represents a hardware pin on the board.

| Property  | Type   | Optional | Default value | Represents |
| ---       | ---    | ---      | ---           | ---     |
| `pin`     | String or Number | no | `undefined`   | board name for the pin |
| `mode`    | String | no       | `undefined`   | I/O mode |

All properties are read-only.

The `pin` property is the board-specific name of a pin defined in the pin mapping of the board.

<a name="pinmode">
The `mode` property can take the following values:
- `"digital-input"` for digital input (GPIO). The pin value can be 0 or 1.
- `"digital-output"` for digital output (GPIO). The pin value can be 0 or 1.
- `"analog-input"` for analog input (AIO) that is converted to digital value.
- `"analog-output"` for analog output (AIO) that is converted from digital value.
- `"pwm"` for PWM analog output.
- `"uart-rx"` for serial receive pin.
- `"uart-tx"` for serial transmit pin.
- `"i2c-scl"` for I2C clock.
- `"i2c-scl"` for I2C data.
- `"spi-sclk"` for SPI clock.
- `"spi-mosi"` for SPI Master Out Slave In.
- `"spi-miso"` for SPI Master In Slave Out.

<a name="board"></a>
### The `Board` interface
Represents a hardware board. It contains an event handler for errors, and API methods.

| Property          | Type   | Optional | Default value | Represents |
| ---               | ---    | ---      | ---           | ---     |
| [`name`](#name)   | String | no       | `undefined`   | board name |
| [`aio()`](#aio)   | function | no | defined by implementation | request an AIO object |
| [`gpio()`](#gpio) | function | no | defined by implementation | request a GPIO object |
| [`pwm()`](#pwm)   | function | no | defined by implementation | request a PWM object |
| [`i2c()`](#i2c)   | function | no | defined by implementation | request an I2C object |
| [`spi()`](#spi)   | function | no | defined by implementation | request an SPI object |
| [`uart()`](#uart) | function | no | defined by implementation | request an UART object |

<a name="name"></a>
The `name` property is read-only, and provides the board name.

#### `Board` events
The `Board` object supports the following events:

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| *error*           | [`Error`](https://nodejs.org/api/errors.html#errors_class_error) object |

<a name="onerror"></a>
Board errors are represented as augmented [`Error`](https://nodejs.org/api/errors.html#errors_class_error) objects. The following [`Error` names](https://nodejs.org/api/errors.html) are used for signaling issues:
- `BoardDisconnectError`
- `BoardTimeoutError`
- `BoardIOError`.

#### `Board` methods
In all the descriptions of `Board` methods, `board` denotes a reference to this `Board` object.

<a name="aio"></a>
##### The `aio(options)` method
Configures an AIO pin. The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the AIO functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Run the internal [`AIO initialization`](./aio.md/#init) algorithm with `options` as argument and let `aio` be the returned result.
- If it throws an error, reject promise with that error.
- Resolve `promise` with the `aio` object.

<a name="gpio"></a>
##### The `gpio(options)` method
Configures a GPIO pin or GPIO port. The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the GPIO functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Run the internal [`GPIO initialization`](./gpio.md/#init) algorithm with `options` as argument and let `gpio` be the returned result.
- If it throws an error, reject promise with that error.
- Resolve `promise` with the `gpio` object.

<a name="pwm"></a>
##### The `pwm(options)` method
Configures a PWM pin. The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the PWM functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Run the internal [`PWM initialization`](./pwm.md/#init) algorithm with `options` as argument and let `pwm` be the returned result.
- If it throws an error, reject promise with that error.
- Resolve `promise` with the `pwm` object.

<a name="i2c"></a>
##### The `i2c(options)` method
Configures I2C communication. The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the I2C functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Run the internal [`I2C initialization`](./i2c.md/#init) algorithm with `options` as argument and let `i2c` be the returned result.
- If it throws an error, reject promise with that error.
- Resolve `promise` with the `i2c` object.

<a name="spi"></a>
##### The `spi(options)` method
Configures SPI communication.
The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the SPI functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Run the [`SPI init`](./spi.md/#init) steps with `options` as argument and let `spi` be the returned result.
- If it throws an error, reject promise with that error.
- Resolve `promise` with the `spi` object.

<a name="uart"></a>
##### The `uart(options)` method
Configures UART communication. It takes a dictionary object as argument.
The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the UART functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Run the [`UART init`](./uart.md/#init) steps with `options` as argument and let `uart` be the returned result.
- If it throws an error, reject promise with that error.
- Resolve `promise` with the `uart` object.
