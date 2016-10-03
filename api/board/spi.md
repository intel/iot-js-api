SPI API
=======

The SPI API supports Serial Peripheral Interface, a synchronous serial protocol that allows multiple slave chips to communicate with a master chip. A single SPI bus uses 4 pins, SCK for clock, SS for slave select, MOSI (Master Out, Slave In) for write, and MISO (Master In, Slave Out) for read. Multiple SPI buses may be present on a board.
For each clock signal one bit is written from the master to the selected slave and one bit is read by the master from the selected slave, so there is no separate read and write, but one transfer operation.
When a slave device's chip select is 0 (low), then it communicates with the master, otherwise it ignores the master.
This API uses a [`Buffer`](../README.mk/#buffer) object for both read and write.

The API object
--------------
SPI functionality is exposed by the [`SPI`](#spi) object that can be obtained by using the [spi() method of the `Board` API](./README.md/#spi). See also the [Web IDL](./webidl.md).

```javascript
try {
  var board = require("iot-board");

  board.spi().then(function(spi) {
    console.log("SPI bus " + spi.bus + " opened with bus speed " + spi.speed);
    console.log("SPI mode: " + spi.mode);
    console.log("Data bits: " + spi.bits);
    console.log("Speed [MHz]: " + spi.speed);
    console.log("MSB: " + (spi.msb ?  "true" : "false"));

    spi.transfer(0, [1, 2, 3]).then(function(buffer) {
        // Buffer object
        console.log("From SPI device 0: " + buffer.toString());
        spi.close();
      });
    });
  }).catch(function(err) {
    console.log("SPI error: " + err.message);
  });
}
```

<a name="SPI">
### The `SPI` interface
Represents the properties and methods that expose SPI functionality. The `SPI` object has the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `bus`      | octet  | yes      | 0             | SPI bus |
| `speed`    | long   | yes      | 20            | SPI bus speed in MHz |
| `msb`      | boolean | yes     | 1             | MSB (or LSB) first |
| `bits`     | number | yes      | 8             | number of data bits |
| `mode`     | enum   | yes      | 'mode0'    | SPI mode (polarity, sampling) |

The `bus` property denotes the SPI bus number between 0 and 127.

The `speed` property is a floating point number that denotes the SPI bus speed in MHz. Usually it is between 10 and 66 MHz.

The `msb` property is a boolean denoting whether the most significant bit (MSB) is sent first, or the least significant bit (LSB). The default value is `true` (MSB first).

The `bits` property is a number denoting the number of data bits (word size). Usually it is 1, 2, 4, 8 or 16. The default value is 4.

The `mode` property denotes the SPI mode, i.e.
- `"mode0"`, normal polarity, phase 0, sampled on leading clock
- `"mode1"`, polarity normal, phase 1, sampled on trailing clock
- `"mode2"`, polarity inverse, phase 0, sampled on leading clock
- `"mode3"`  polarity inverse, phase 1, sampled on trailing clock.

#### SPI methods
<a name="init">
##### SPI initialization
This internal algorithm is used by the [`Board.spi()`](./README.md/#spi) method. Configures the SPI bus and bus speed provided by the `options` (first) dictionary argument on the [`board`](./README.md/#board) specified by the `board` (second) argument.
- Let `spi` be an `SPI`](#spi) object.
- If `options` is a dictionary and the `options.bus` property is a number between 0 and 127, let `spi.bus` be `options.bus`, otherwise select the platform default value, and if that is not available, set the value to 0.
- If `options.speed` is not a number, let `spi.speed` be 10. Otherwise, set `spi.speed` to the closest matching value that is lower than `options.speed` and is supported by the platform.
- If `options.msb` is `false`, set `spi.msb` to `false`, otherwise set it to `true`.
- If `options.bits` is in the set {1, 2, 4, 8, 16 }, then set `spi.bits` to `option.bits`, otherwise set it to the value 4.
- If `options.mode` is in the set `{ 'mode0', 'mode1', 'mode2', 'mode3' }`, then set `spi.mode` to that, otherwise set it to `'mode0'`.
- Request the underlying platform to initialize the SPI `spi.bus` with `spi.speed` on `board`.
- In case of failure, return `null`.
- Return `spi`.

##### The `transfer(device, buffer)` method
Writes a [`Buffer`](./README.md/#buffer) `buffer` using SPI to the slave `device`, and reads another [`Buffer`](./README.md/#buffer) from the slave device that is returned. The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If `device` is not a number between 0 and 127, reject `promise` with `TypeError` and terminate these steps.
- Create a [`Buffer`](./README.md/#buffer) from `buffer` (may be empty). If that fails, reject `promise` with `TypeError` and terminate these steps.
- Request the underlying platform to write the specified `buffer` to the specified device and read another [`Buffer`](./README.md/#buffer) `readBuffer`.
If the operation fails, reject `promise`.
- Otherwise, resolve `promise` with `readBuffer`.

##### The `close()` method
Closes the current [`SPI`](#spi) bus and interrupts all pending operations.
