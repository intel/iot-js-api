AIO API
=======

The AIO API supports reading analog input pins that measure the analog voltage signal between 0 and a maximum voltage (usually 3.3 or 5 Volts), then do Analog-to-Digital Conversion (ADC) with a resolution of 10 or 12 bits on most boards, so that the result (pin value) is 0 to 1023 or 0 to 4095, inclusively.

On some boards access to AIO may be asynchronous. This API uses synchronous read.

The API object
--------------
AIO functionality is exposed by the [`AIO`](#aio) object that can be obtained by using the [aio() method of the `Board` API](./README.md/#aio).

Implementations MAY also support an explicit constructor that runs the [`AIO initialization`](#init) algorithm.

### Examples
```javascript
var board = require("board");

// Configure AIO using the board
board.aio("A1").then(function(aio){
  // Read pin values.
  console.log(board.name + " AIO pin 1 value: " + aio.read());

  // Release the pin.
  aio.close();
});

board.aio({pin: "A4", precision: 12 })
.then(function(aio){
  console.log("AIO pin 4 value: " + aio.read());
  aio.close();
}).catch(function(err) {
  console.log("AIO error.");
});
```

<a name="aio">
### The `AIO` interface
Represents the properties and methods that expose AIO functionality. The `AIO` object implements the [`EventEmitter`](../README/#events) interface, and extends the [`Pin`](./README.md/#pin) object, so it has all properties of [`Pin`](./README.md/#pin). In addition, it has the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `channel`  | unsigned long | yes   | `undefined` | numeric index of the analog pin |
| `precision` | unsigned long | yes | `undefined` | bit length of digital sample |
| `read()`   | function | no | defined by implementation | synchronous read |
| `close()`  | function | no | defined by implementation | close the pin |

#### `AIO` properties
The `pin` property inherited from [`Pin`](./README.md/#pin) can take values defined by the board mapping, usually strings prefixed by `"A"`.

The `mode` property inherited from [`Pin`](./README.md/#pin) takes the value `"analog-input"`.

The `channel` property is initialized by implementation and provides the numeric index of the analog pin, e.g. it is 0 for pin `"A0"` and 5 for pin `"A5"`.

The `precision` property represents the bit length of the digital sample. It is usually 10 or 12 bits, depending on board.

#### `AIO` methods
<a name="init">
##### AIO initialization
This internal algorithm is used by the [`Board.aio()`](./README.md/#aio) method. Configures the AIO pin provided by the `options` argument. It involves the following steps:
- If `options` is a string, create a dictionary 'init' and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a dictionary, let `init` be `options`. It may contain the following [`AIO`](#aio) properties:
  * `pin` for board pin name with the valid values defined by the board
  * `precision` for the bit width of a sample (if the board supports setting the sampling rate).
- If any of the `init` properties has an invalid value on the given board, as defined by the board documentation, throw `InvalidAccessError`.
- Request the underlying platform to initialize AIO on the given board for the given pin `init.pin`.
- In case of failure, throw `InvalidAccessError`.
- Let `aio` be the `AIO`](#aio) object that represents the hardware pin identified by `init.pin`, as defined by the board documentation.
- Initialize the `aio.channel` property with the numeric index of the analog pin, as defined by the board documentation.
- Initialize the `aio.mode` property with `"analog-input"`.
- If `init.precision` is defined, request the board to set the precision and initialize the `aio.precision` property with the value supported by the board. If there is an error, throw `InvalidAccessError`.
- Initialize the `aio.value` property with `undefined`.
- Return the `aio` object.

##### The `unsigned long read()` method
Performs a synchronous read operation for the pin value. It returns the pin value representing the last sampling.

##### The `close()` method
Called when the application is no longer interested in the pin. Until the next [initialization](#init), invoking the `read()` method SHOULD throw `InvalidAccessError`.
