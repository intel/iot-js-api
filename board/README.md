Board API
=========

The [Board](#board) API provides low level interfaces for I/O operations:
  - [AIO - Analog I/O](./aio.md)
  - [GPIO - General Purpose I/O](./gpio.md)
  - [PWM - Pulse Width Modulation](./pwm.md)
  - [I2C - Inter-Integrated Circuit](./i2c.md)
  - [SPI - Serial Peripheral Interface](./spi.md)
  - [UART - Universal Asynchronous Receiver/Transmitter](./uart.md).

This API uses board pin names as defined in the corresponding board documentation.
The names, values and semantics related to hardware pins are owned and encapsulated by the implementation. This API uses opaque values (strings and numbers) for [`Pin`](#pin) names.

The supported board documentations are listed in [this directory](./):
- [arduino101.md](./arduino101.md)
- [frdm_k64f.md](./frdm_k64f.md).

The full Web IDL definition for Board and IO APIs can be found [here](./webidl.md).

The `Board` API object
----------------------
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

<a name="pin"></a>
### The `Pin` interface
Represents a hardware pin on the board.

| Property  | Type   | Optional | Default value | Represents |
| ---       | ---    | ---      | ---           | ---     |
| `pin`     | String or Number | no | `undefined`   | board name for the pin |

The read-only `pin` property is the board-specific name or numeric value of a pin, as defined in the board documentation.

In future versions of the API the `Pin` object may be extended.

<a name="board"></a>
### The `Board` interface
Represents a hardware board.

| Property          | Type   | Optional | Default value | Represents |
| ---               | ---    | ---      | ---           | ---        |
| [`name`](#name)   | String | no       | `undefined`   | board name |

| Method signature  | Description            |
| ---               | ---                    |
| [`aio()`](#aio)   | request an AIO object  |
| [`gpio()`](#gpio) | request a GPIO object  |
| [`pwm()`](#pwm)   | request a PWM object   |
| [`i2c()`](#i2c)   | request an I2C object  |
| [`spi()`](#spi)   | request an SPI object  |
| [`uart()`](#uart) | request an UART object |

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| `error`           | [`Error`](#error) object |

<a name="name"></a>
The `name` property is read-only, and provides the board name.

<a name="error"></a>
Board errors are represented as augmented [`Error`](https://nodejs.org/api/errors.html#errors_class_error) objects. The following [`Error` names](https://nodejs.org/api/errors.html) are used for signaling issues:
- `BoardDisconnectError`
- `BoardTimeoutError`
- `BoardIOError`.

#### `Board` methods

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
