UART API
========

The UART API supports the Universal Asynchronous Receiver/Transmitter that allows the board to communicate with other external devices. It uses 2 pins, RX for receiving and TX for transmitting. UART ports are usually referred by string names, but numbers may also be accepted, as defined in the board documentation.
This API uses a [`Buffer`](../README.md/#buffer) object for both read and write.

<a name="apiobject"></a>
### The UART API object
When requiring `"uart"`, the following steps are run:
- If there is no permission for using the functionality, throw `SecurityError`.
- If the AIO functionality is not supported on the board, throw `"NotSupportedError"`.
- Return an object that implements the following method.

| Method              | Description      |
| ---                 | ---              |
| [`open()`](#open)   | synchronous open |

See also the [Web IDL](./webidl.md) definition.

<a name="open"></a>
#### The `UART open(options)` method
Configures an UART port using data provided by the `options` argument. It runs the following steps:
- Let `uart` be an [`UART`](#uart) object.
- For all `uart` properties, if the `options` dictionary defines the same property with a valid value, let the `uart` property take that value, otherwise the default value.
- Request the underlying platform to initialize the UART with the parameters provided by `uart`.
- In case of failure, throw `SystemError` and abort these steps.
- Invoke the `uart.setReadRange(min, max)` method with `min` = 1, and `max` taking a value determined by the platform that is greater than or equal to 1.
- Return `uart`.

<a name="uart"></a>
### The `UART` interface
Represents the properties, methods and event that expose UART functionality. The `UART` interface implements the [`EventEmitter`](../README.md/#events) interface.

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| `read`            | [`Buffer`](../README.md/#buffer) |

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `port`     | String | no       | undefined     | UART port |
| `speed`    | number | yes      | 115200        | UART baud rate |
| `dataBits` | number | yes      | 8             | number of data bits |
| `stopBits` | number | yes      | 1             | number of stop bits |
| `parity`   | enum   | yes      | `'none'`      | `'none'`, `'even'`, `'odd'` |
| `flowControl` | boolean | yes  | `false`       | if flow control is on |

| Method                    | Description            |
| ---                       | ---                    |
| [`write()`](#write)       | write a buffer |
| [`setReadRange()`](#readrange) | set buffer sizes for read notifications |
| [`close()`](#close)       | close the UART port |

The `port` property denotes the UART port as a string defined by the board documentation, such as `"tty0"`, `"serialUSB0"`, etc.

The `speed` property represents the baud rate and its value can be 9600, 19200, 38400, 57600, 115200 (by default).

The `dataBits` property represents the number of data bits (word size), and it can be between 5 and 8 (by default).

The `stopBits` property represents the number of stop bits and can take the value 1 (by default) or 2.

The `parity` property can take the following values: `"none"` (by default), `"even"`, and `"odd"`.

The `flowControl` boolean property denotes if flow control is used. By default it is `false`.

<a name="write"></a>
#### The `write(buffer)` method
Transmits a [`Buffer`](../README.md/#buffer) using UART. The method runs the following steps:
- Request the underlying platform to send the bytes specified in `buffer`. If the operation fails, throw `SystemError` and abort these steps.

<a name="readrange"></a>
#### The `setReadRange(min, max)` method
Sets the minimum and maximum number of bytes for triggering the `onread` event. Whenever at least `min` number of bytes is available, the `read` event is fired with a [`Buffer`](../README.md/#buffer) containing at maximum `max` number of bytes.

<a name="close"></a>
#### The `close()` method
Closes the current [`UART`](#uart) port and interrupts all pending operations.

### Examples

```javascript
try {
  var uart = require("uart").open("serialUSB0");

  console.log("UART port " + uart.port);
  console.log("Speed [bps]: " + uart.speed);
  console.log("Data bits: " + uart.dataBits);
  console.log("Stop bits: " + uart.stopBits);
  console.log("Parity: " + uart.parity);
  console.log("Flow control " + (uart.flowControl ? "on." : "off.");

  uart.setReadRange(8, 16);  // min 8 byes, max 16 bytes in one read event

  uart.on("read", function(buffer) {
    console.log("UART received: " + buffer.toString());
  });

  uart.write([1, 2, 3]);

} catch(err) {
  console.log("UART error: " + err.message);
}
```
