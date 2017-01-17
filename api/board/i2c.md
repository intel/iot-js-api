I2C API
=======

The I2C API supports Inter-Integrated Circuit (IIC, I2C), a synchronous serial protocol that allows multiple slave chips to communicate with a master chip. A single I2C bus uses 2 pins, SDA (data) and SCL (clock). Multiple I2C buses may be present on a board.
I2C selects the slave device by addressing: the first byte sent by the master chip contains the 7 bit address of a slave, and one bit for direction (read or write). Slaves acknowledge each byte received from the master by sending 0 on SDA (both SDA and SCL are pulled high in I2C).
If read was requested, the master will emit clock, and the selected slave will provide bits to the master as long as clock is emitted.
If write was requested, the master puts the bit on SDA and sends a clock signal for data available.
Therefore it is important to select the right speed supported by the master and slave devices.
This API uses a [`Buffer`](../README.mk/#buffer) object for both read and write.

The API object
--------------
I2C functionality is exposed by the [`I2C`](#i2c) object that can be obtained by using the [i2c() method of the `Board` API](./README.md/#i2c). See also the [Web IDL](./webidl.md).

```javascript
try {
  var board = require("board");
  var i2c = null;

  board.i2c().then(function(iic) {
    i2c = iic;
    console.log("I2C bus " + i2c.bus + " opened with bus speed " + i2c.speed);
    return i2c.write(0x02, [1, 2, 3])
  }).then(function() {
    return i2c.read(0x03, 3);
  }).then(function(buffer) {
      console.log("From I2C device 0x03: " + buffer.toString());
      i2c.close();
  }).catch(function(err) {
    console.log("I2C error: " + err.message);
  });
}
```

<a name="i2c">
### The `I2C` interface
Represents the properties and methods that expose I2C functionality. The `I2C` object has the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `bus`      | octet  | yes      | platform selected | I2C bus |
| `speed`    | long   | yes      | platform selected | I2C bus speed |

The `bus` property denotes the I2C bus number between 0 and 127.

The `speed` property can take the following numeric values denoting kilobits per second: 10, 100, 400, 1000, 3400.

#### I2C methods
<a name="init">
##### I2C initialization
This internal algorithm is used by the [`Board.i2c()`](./README.md/#i2c) method. Configures the I2C bus and bus speed provided by the `options` (first) dictionary argument on the [`board`](./README.md/#board) specified by the `board` (second) argument.
- Let `i2c` be an `I2C`](#i2c) object.
- If `options` is a dictionary and the `options.bus` property is a number between 0 and 127, let `i2c.bus` be `options.bus`, otherwise select the platform default value, and if that is not available, set the value to 0.
- If `options.speed` is not a number, let `i2c.speed` be 10. Otherwise, if it is in the { 10, 100, 400, 1000, 3400 } set, let `i2c.speed` take that value, otherwise set `i2c.speed` to the closest matching value.
- Request the underlying platform to initialize the I2C `bus` with `i2c.speed` on `board`.
- In case of failure, return `null`.
- Return `i2c`.

##### The `write(device, buffer)` method
Writes a [`Buffer`](./README.md/#buffer) using I2C to slave `device`. The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If `device` is not a number between 0 and 127, reject `promise` with `TypeError` and terminate these steps.
- Create a [`Buffer`](./README.md/#buffer) from `buffer`. If that fails, reject `promise` with `TypeError` and terminate these steps.
- Request the underlying platform to write the specified bytes to the specified device.
If the operation fails, reject `promise`.
- Otherwise, resolve `promise`.

##### The `read(device, size)` method
Reads maximum `size` number of bytes from I2C device `device` and resolves with a [`Buffer`](./README.md/#buffer). The method runs the following steps:
- Return a [`Promise`](../README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If `device` is not a number between 0 and 127, reject `promise` with `TypeError` and terminate these steps.
- Create a [`Buffer`](./README.md/#buffer) from `buffer`.
- Request the underlying platform to read `size` number of bytes from the specified `device` into `buffer`.
If the operation fails, reject `promise`.
- Otherwise, resolve `promise` with `buffer`.


##### The `close()` method
Closes the current [`I2C`](#i2c) bus and interrupts all pending operations.
