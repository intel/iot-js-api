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
| [`version`](#version) | String | no   | `versions.board` in [`package.json`](../package.json) | API version |

| Method            | Description            |
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

<a name="version"></a>
The `version` property is read-only, and provides the provides the Board API version, as specified in the `versions.board` property of [`package.json`](../package.json).

<a name="error"></a>
Board errors are represented as augmented [`Error`](https://nodejs.org/api/errors.html#errors_class_error) objects. The following [`Error` names](https://nodejs.org/api/errors.html) are used for signaling issues:
- `BoardDisconnectError`
- `BoardTimeoutError`
- `BoardIOError`.

#### `Board` methods

<a name="aio"></a>
##### The `aio()` method
Provides the AIO API object. The method runs the following steps:
- If the AIO functionality is not supported on the board, throw `"NotSupportedError"`.
- Initialize AIO functionality on the board. If it fails, throw `"SystemError"`.
- Let `aio` be the [AIO API object](./aio.md/#apiobject). Return `aio`.

<a name="gpio"></a>
##### The `gpio()` method
Provides the GPIO API object. The method runs the following steps:
- If the GPIO functionality is not supported on the board, throw `"NotSupportedError"`.
- Initialize GPIO functionality on the board. If it fails, throw `"SystemError"`.
- Let `gpio` be the [GPIO API object](./gpio.md/#apiobject). Return `gpio`.

<a name="pwm"></a>
##### The `pwm()` method
Provides the PWM API object. The method runs the following steps:
- If the PWM functionality is not supported on the board, throw `"NotSupportedError"`.
- Initialize PWM functionality on the board. If it fails, throw `"SystemError"`.
- Let `pwm` be the [PWM API object`](./pwm.md/#apiobject). Return `pwm`.

<a name="i2c"></a>
##### The `i2c()` method
Provides the I2C API object. The method runs the following steps:
- If the I2C functionality is not supported on the board, throw `"NotSupportedError"`.
- Initialize I2C functionality on the board. If it fails, throw `"SystemError"`.
- Let `i2c` be the [I2C API Object](./i2c.md/#apiobject). Return `pwm`.

<a name="spi"></a>
##### The `spi()` method
Provides the SPI API object. The method runs the following steps:
- If the SPI functionality is not supported on the board, throw `"NotSupportedError"`.
- Initialize SPI functionality on the board. If it fails, throw `"SystemError"`.
- Let `spi` be the [SPI API object](./spi.md/#apiobject). Return `spi`.

<a name="uart"></a>
##### The `uart()` method
Provides the UART API object. The method runs the following steps:
- If the UART functionality is not supported on the board, throw `"NotSupportedError"`.
- Initialize UART functionality on the board. If it fails, throw `"SystemError"`.
- Let `uart` be the [UART API object](./uart.md/#apiobject) object. Return `uart`.
