UART API
========

The UART API supports Universal Asynchronous Receiver/Transmitter that allows to the board to communicate with other external devices. It uses 2 pins, RX for receiving and TX for transmit. UART ports are usually referred by string names (see board definitions), but numbers may also be accepted.
This API uses a [`Buffer`](../README.mk/#buffer) object for both read and write.

The API object
--------------
UART functionality is exposed by the [`UART`](#uart) object that can be obtained by using the [uart() method of the `Board` API](./README.md/#uart). See also the [Web IDL](./webidl.md).

```javascript
try {
  var board = require("iot-board-arduino101");

  board.uart("serialUSB0").then(function(uart) {
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

  }).catch(function(err) {
    console.log("UART error: " + err.message);
  });
}
```

<a name="UART">
### The `UART` interface
Represents the properties and methods that expose UART functionality. The `UART` interface implements the [`EventEmitter`](../README/#events) interface and exposes one event with name `onread`.

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| `onread`          | [`Buffer`](../README.mk/#buffer) |

The `UART` object has the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `port`     | String | no       | undefined     | UART port |
| `speed`    | number | yes      | 115200        | UART baud rate |
| `dataBits` | number | yes      | 8             | number of data bits |
| `stopBits` | number | yes      | 1             | number of stop bits |
| `parity`   | enum   | yes      | `'none'`      | `'none'`, `'even'`, `'odd'` |
| `flowControl` | boolean | yes  | `false`       | if flow control is on |

The `port` property denotes the UART port as a string defined by the board documentation, such as `"tty0"`, `"serialUSB0"`, etc.


The `speed` property represents the baud rate and its value can be 9600, 19200, 38400, 57600, 115200 (by default).

The `dataBits` property represents the number of data bits (word size), and it can be between 5 and 8 (by default).

The `stopBits` property represents the number of stop bits and can take the value 1 (by default) or 2.

The `parity` property can take the following values: `"none"` (by default), `"even"`, and `"odd"`.

The `flowControl` boolean property denotes if flow control is used. By default it is `false`.

#### UART methods
<a name="init">
##### UART initialization
This internal algorithm is used by the [`Board.uart()`](./README.md/#uart) method. Configures UART with the `options` (first) dictionary argument on the [`board`](./README.md/#board) specified by the `board` (second) argument.
- If `options.port` is not a string, return `null`.
- Let `uart` be an `UART`](#uart) object.
- For all `uart` properties, if the `options` dictionary defines the same property with a valid value, let the `uart` property take that value, otherwise the default value.
- Request the underlying platform to initialize the UART with the parameters provided by `uart`.
- In case of failure, return `null`.
- Invoke the `uart.setReadRange(min, max)` method with `min` = 1, and `max` taking a value determined by the platform that is greater or equal than 1.
- Return `uart`.

##### The `write(buffer)` method
Transmits a [`Buffer`](./README.md/#buffer) using UART. The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Create a [`Buffer`](./README.md/#buffer) from `buffer`. If that fails, reject `promise` with `TypeError` and terminate these steps.
- Request the underlying platform to send the specified bytes.
If the operation fails, reject `promise`.
- Otherwise, resolve `promise`.

##### The `setReadRange(min, max)` method
Sets the minimum and maximum number of bytes for triggering the `onread` event. Whenever at least `min` number of bytes is available, a [`Buffer`](./README.md/#buffer) object containing a `max` number of bytes is sent with the `onread` event.

##### The `close()` method
Closes the current [`UART`](#uart) port and interrupts all pending operations.
