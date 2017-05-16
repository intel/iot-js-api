Board API
=========

The [Board](#board) API provides low level interfaces for I/O operations:
  - [AIO - Analog I/O](./aio.md)
  - [GPIO - General Purpose I/O](./gpio.md)
  - [PWM - Pulse Width Modulation](./pwm.md)
  - [I2C - Inter-Integrated Circuit](./i2c.md)
  - [SPI - Serial Peripheral Interface](./spi.md)
  - [UART - Universal Asynchronous Receiver/Transmitter](./uart.md).

Hardware pin names are usually marked on the circuit boards, that defines a board namespace for pins. However, operating systems, such as Linux, or [Zephyr](https://www.zephyrproject.org/doc/) define a pin name mapping that is consistent across the boards supported by the OS. This API supports both board and OS (system) defined namespaces. Pin names are opaque to the application, either strings or numbers that gain meaning in either the board or OS namespace. Also, the API exposes board name, OS name (including OS version) and API version for all board APIs.

Since it is generally easier for developers to just look at a given board and use the names printed there in the API, by default the board namespace is used, but developers can specify to use the system namespace as well. If a given pin value is not found in the default (or provided) namespace, an error is thrown: there is no fallback search in the other namespace.

Examples for the supported board namespaces are listed in [this directory](./):
- [arduino101.md](./arduino101.md)
- [frdm_k64f.md](./frdm_k64f.md).

For the supported OS pin namespace, consult the documentation of the implementation and its underlying OS documentation.

The full Web IDL definition for Board and IO APIs can be found in [webidl.md](./webidl.md).

The `Board` API object
----------------------
The API entry point is a [`Board`](#board) object provided by an implementation (module).
When requiring `"board"`, the following steps are run:
- If there is no permission for using the functionality, throw `SecurityError`.
- If the [Board](#board) functionality is not supported on the board, throw `"NotSupportedError"`.
- Let `board` be the Board API object, and initialize it by fetching board name and OS name. Return `board`.

```javascript
var board = require("board");

console.log("Connected to board: " + board.name + " running " + board.os);
```

If the functionality is not supported by the platform, `require` should throw `NotSupportedError`.

<a name="board"></a>
### The `Board` interface
Represents a hardware circuit board such as Arduino 101.

| Property          | Type   | Optional | Default value | Represents |
| ---               | ---    | ---      | ---           | ---        |
| [`name`](#boardname) | String | no       | `undefined`   | board name |
| [`os`](#osname)   | String | no       | `undefined`   | OS name |
| [`apiVersion`](#apiversion) | String | no   | `versions.board` in [`package.json`](../package.json) | API version |

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| `error`           | [`Error`](#error) object |

<a name="boardname"></a>
The `name` property is read-only, and provides the board name.

<a name="osname"></a>
The `os` property is read-only, and provides the underlying operating system name.

<a name="apiversion"></a>
The `apiVersion` property is read-only, and provides the provides the Board API version, as specified in the `versions.board` property of [`package.json`](../package.json).

<a name="error"></a>
Board errors are represented as augmented [`Error`](https://nodejs.org/api/errors.html#errors_class_error) objects. The following [`Error` names](https://nodejs.org/api/errors.html) are used for signaling issues:
- `BoardDisconnectError`
- `BoardTimeoutError`
- `BoardIOError`.
