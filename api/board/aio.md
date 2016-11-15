AIO API
=======

The AIO API supports reading analog input pins that measure the analog voltage signal between 0 and a maximum voltage (usually 3.3 or 5 Volts), then do Analog-to-Digital Conversion (ADC) with a resolution of 10 or 12 bits on most boards, so that the result (pin value) is 0 to 1023 or 0 to 4095, inclusively.

On some boards access to AIO may be asynchronous. This API provides both synchronous and asynchronous read. Also, applications can subscribe to an event that is fired when data is sampled on the pin, and if not interested in all samples, it can also provide a hint to the implementation about a minimum time between two events.

The API object
--------------
AIO functionality is exposed by the [`AIO`](#aio) object that can be obtained by using the [aio() method of the `Board` API](./README.md/#aio).

Implementations MAY also support an explicit constructor that runs the [`AIO initialization`](#init) algorithm.

### Examples

```javascript
try {
  var board = require("iot-board-arduino101");

  // Configure AIO using the board
  var aio1 = board.aio("A1");

  // Configure AIO using a constructor.
  var aio2 = new AIO("A2", board);
  // If 'board' is the default board, it can be omitted.
  // var aio2 = new AIO(2);

  // Read pin values.
  console.log(board.name + " AIO pin 1 value: " + aio1.value);
  console.log(board.name + " GPIO pin 2 value: " + aio2.value);

  // Release the pins.
  aio1.close();
  aio2.close();

  var aio4 = board.aio({pin: 4, rateLimit: 100 });
  // will notify 100 or more milliseconds apart
  aio4.ondata = function(value) {
    console.log("AIO pin 4 has new reading; value: " + value);
    aio4.close();  // also removes listeners
  };
} catch (err) {
  console.log("AIO error.");
}
```

<a name="aio">
### The `AIO` interface
Represents the properties and methods that expose AIO functionality. The `AIO` object implements the [`EventEmitter`](../README/#events) interface, and extends the [`Pin`](./README.md/#pin) object, so it has all properties of [`Pin`](./README.md/#pin). In addition, it has the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `channel`  | unsigned long | yes   | `undefined` | numeric index of the analog pin |
| `rateLimit` | unsigned long | yes   | 0 | minimum milliseconds between 'ondata' emits |
| `precision` | unsigned long | yes | `undefined` | bit length of digital sample |
| `read()`   | function | no | defined by implementation | asynchronous read of the pin |
| `close()`  | function | no | defined by implementation | close the pin |
| `onchange` | event | no       | `undefined`   | event for pin value change |

#### `AIO` properties

The `pin` property inherited from [`Pin`](./README.md/#pin) can take values defined by the board mapping, usually strings prefixed by `"A"`.

The `mode` property inherited from [`Pin`](./README.md/#pin) takes the value `"analog"`.

The `supportedModes` property inherited from [`Pin`](./README.md/#pin) returns an array of supported modes fot the pin, according to the board documentation. Implementations are not required to implement this property, in which case its value should be `undefined`.

The `value` property inherited from [`Pin`](./README.md/#pin) can take values between 0 and 1023 or between 0 and 4095. Its getter performs a synchronous read operation for the pin value. On platforms where AIO access is asynchronous, the read is blocked until data is available.

The `address` property inherited from [`Pin`](./README.md/#pin) is initialized by implementation with the pin mapping value provided by the board, and represents the identifier of the pin in the given platform and operating system.

The `channel` property is initialized by implementation and provides the numeric index of the analog pin, e.g. it is 0 for pin `"A0"` and 5 for pin `"A5"`.

The `rateLimit` property represents the minimum number of milliseconds between two emits of the `ondata` event. It is used as a hint from applications when initializing AIO pins, and the value reflects the capability of the platform (`undefined` when rate limitation is not supported).

The `precision` property represents the bit length of the digital sample. It is usually 10 or 12 bits, depending on board.

#### `AIO` methods

<a name="init">
##### AIO initialization
This internal algorithm is used by the [`Board.aio()`](./README.md/#aio) method and by the constructor of the [`AIO`](#aio) object. Synchronously configures the AIO pin provided by the `options` (first) argument on the board specified by the [`board`](./README.md/#board) (second) argument. It involves the following steps:
- If `options` is a string, create a dictionary 'init' and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a dictionary, let `init` be `options`. It may contain the following [`AIO`](#aio) properties:
  * `pin` for board pin name with the valid values defined by the board
  * `rateLimit`.
- If any of the `init` properties has an invalid value, throw `InvalidAccessError`.
- If `board` is `undefined` or `null`, let `board` be the default board connected. If no default board exists, throw `InvalidAccessError`.
- Let `aio` be the `AIO`](#aio) object representing the pin identified by the `name` argument.
- Initialize the `aio.address` property with the board-specific pin mapping value, if available.
- Request the underlying platform to initialize AIO on the given `board` for the given pin `name`.
- In case of failure, return `null`.
- Initialize the `value` property with `undefined`.
- initialize the `rateLimit` property with the value requested by the application and supported by the platform, or 0 if rate limiting or the requested value is not supported. The board documentations should provide information about the supported rate limit range.
- Return the `aio` object.

##### The `Promise<unsigned long> read()` method
Performs an asynchronous read operation for the pin value. It returns a promise that is resolved with the pin value when the next sample is available. On platforms where AIO access is synchronous, implementation can resolve the promise immediately with the pin value.

##### The `close()` method
Called when the application is no longer interested in the pin. This also removes all listeners to the `ondata` event. Until the next [initialization](#init), invoking the `read()` method or reading the `value` property SHOULD throw `InvalidAccessError`.


#### `AIO` events
The `AIO object supports the following events:

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| `ondata`          | unsigned long (the new pin value) |

The `ondata` event will be emitted every time a new sample is available, and the time since the last emit is more than `rateLimit`. The listener callback will receive the current value of the pin.
