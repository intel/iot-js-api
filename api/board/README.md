Board API
=========

This API provides low level interfaces for I/O operations supported by the board and defines pin mappings between board pin names and pin values mapped by the OS.
  - [GPIO - General Purpose I/O](./gpio.md)
  - [AIO - Analog I/O](./aio.md)
  - [PWM - Pulse Width Modulation](./pwm.md)
  - [I2C - Inter-Integrated Circuit](./i2c.md)
  - [SPI - Serial Peripheral Interface](./spi.md)
  - [UART - Universal Asynchronous Receiver/Transmitter](./uart.md).

This API uses board pin names as defined by implementations in the [`Board.pins()`](#getpins) and the [`Board.pin()`](#getpin) methods. Implementations SHOULD list pin names, pin addresses, supported modes, and other capabilities or constraints on how the pins can be configured.

The full Web IDL definition for Board and IO APIs can be found [here](./webidl.md).

The API object
--------------
The API entry point is a [`Board`](./#board) object that is exposed in a platform-specific manner. As an example, on Node.js it can be obtained by requiring the package that implements this API.

In the following example, the application requires an implementation that exposed Arduino 101 values and semantics for pins.
```javascript
var board = require("board");

console.log("Connected to board " + board.name);
```

On other platforms, e.g. in browsers, the API entry point can be exposed on another object, or constructed.
```javascript
var board = new Board();  // provides an instance of the default board
```

If the functionality is not supported by the platform, `require` should throw `NotSupportedError`. If there is no permission for using the functionality, `require` should throw `SecurityError`.

The names, values and semantics related to hardware pins are owned by the implementation. This API uses opaque values for names. For instance, when requiring `"iot-js-board-arduino101"` the semantics will be board-specific, i.e. developers could expect using the same labels as the ones printed on the board.

In a different use case OS-specific mappings would need to be used for pins. For instance, when requiring `"iot-js-zephyr"`, the semantics will be defined by the mapping used in [Zephyr OS](https://wiki.zephyrproject.org/view/Arduino_/_Genuino_101#Arduino_101_Pinout) to abstract various supported boards.

<a name="pin"></a>
### The `Pin` interface
Represents a hardware pin on the board.

| Property  | Type   | Optional | Default value | Represents |
| ---       | ---    | ---      | ---           | ---     |
| `pin`     | String or Number | no | `undefined`   | board name for the pin |
| `address` | Number | no       | `undefined`   | pin value defined by the OS |
| `value`   | Number or object | no       | `undefined`   | value of the pin (synchronous read)|
| `mode`    | String | no       | `undefined`   | I/O mode |
| `supportedModes` | array of String | no | `undefined` | pin value defined by the OS |

All properties are read-only.

The `pin` property is the board-specific name of a pin defined in the pin mapping of the board.

The `address` property is the operating-system-specific representation for that pin, usually a number.

<a name="pinmode">
The `mode` property can take the following values:
- `"input"` for digital input (GPIO). The pin value can be 0 or 1.
- `"output"` for digital output (GPIO). The pin value can be 0 or 1.
- `"analog"` for analog input (AIO) that is converted to digital value.
- `"pwm"` for PWM analog output.

The `supportedModes` property is an array of modes the board supports for the given pin.  Implementations are not required to implement this property, in which case its value should be `undefined`.

The `value` property is the raw value of a pin with no further interpretation (i.e. if the pin is a digital output active on low, then `1` represents inactive state).

<a name="board"></a>
### The `Board` interface
Represents a hardware board. It contains an event handler for errors, and API methods.

| Property          | Type   | Optional | Default value | Represents |
| ---               | ---    | ---      | ---           | ---     |
| [`name`](#name)   | String | no       | `undefined`   | board name |
| [`onerror`](#onerror) | event | no | `undefined`   | event for errors |
| [`pin()`](#getpin)| function | no | defined by implementation | get a Pin object |
| [`pins()`](#getpins)| function | no | defined by implementation | get an array of board pin names |
| [`aio()`](#aio)   | function | no | defined by implementation | get an AIO object |
| [`gpio()`](#gpio) | function | no | defined by implementation | get a GPIO object |
| [`pwm()`](#pwm)   | function | no | defined by implementation | get a PWM object |
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

<a name="getpin"></a>
##### The `pin(name)` method
Returns a [`Pin`](#pin) object associated with the pin name given in the `name` argument. The `name` argument can be a number or a string, as defined in the board pin mapping definition. The returned object describes the current state of the pin.

<a name="getpins"></a>
##### The `pins()` method
Returns an array of strings containing the board pin names supported by the board that can be used in the [`pin()`](#getpin) method.

<a name="gpio"></a>
##### The `gpio(options)` method
Returns a [`GPIO`](./gpio.md/#gpio) object associated with the pin name or pin options given in the `options` argument. It runs the following steps:
- Let `board` be the object representing this board.
- Run the internal [`GPIO initialization`](./gpio.md/#init) algorithm with `options` and `board` as arguments, and return its result. Rethrow any errors that occur.

<a name="aio"></a>
##### The `aio(options)` method
Returns an [`AIO`](./aio.md/#aio) object associated with the pin name or pin options given in the `name` argument. It runs the following steps:
- Let `board` be the object representing this board.
- Run the internal [`AIO initialization`](./aio.md/#init) algorithm with `options` and `board` as arguments and return its result. Rethrow any errors that occur.

<a name="pwm"></a>
##### The `pwm(options)` method
Returns a [`PWM`](./pwm.md/#pwm) object associated with the pin name or pin options given in the [`options`](./pwm.md/#pwmoptions) argument. It runs the following steps:
- Let `board` be the object representing this board.
- Run the internal [`PWM initialization`](./pwm.md/#init) algorithm with `options` and `board` as arguments and return its result. Rethrow any errors that occur.

<a name="i2c"></a>
##### The `i2c(options)` method
Configures I2C communication. The method runs the following steps:
- Let `board` be the object representing this board.
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the I2C functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Run the internal [`I2C initialization`](./i2c.md/#init) algorithm with `options` and `board` as arguments and let `i2c` be the returned result.
- If `i2c` is not `null`, resolve `promise` with the `i2c` object.
- Otherwise reject `promise`.

<a name="spi"></a>
##### The `spi(options)` method
Configures SPI communication.
The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the SPI functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Let `board` be the object representing this board.
- Run the [`SPI init`](./spi.md/#init) steps with `options` and `board` as arguments and let `spi` be the returned result.
- If `spi` is not `null`, resolve `promise` with the `spi` object.
- Otherwise reject `promise`.

<a name="uart"></a>
##### The `uart(options)` method
Configures UART communication. It takes a dictionary object as argument.
The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the UART functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Let `board` be the object representing this board.
- Run the [`UART init`](./uart.md/#init) steps with `options` as argument and let `uart` be the returned result.
- If `uart` is not `null`, resolve `promise` with the `uart` object.
- Otherwise reject `promise`.
