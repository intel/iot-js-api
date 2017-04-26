AIO API
=======

The AIO API supports reading analog input pins that measure the analog voltage signal between 0 and a maximum voltage (usually 3.3 or 5 Volts), then do Analog-to-Digital Conversion (ADC) with a resolution of 10 or 12 bits on most boards, so that the result (pin value) is 0 to 1023 or 0 to 4095, inclusively.

On some boards access to AIO may be asynchronous. This API uses synchronous methods.

<a name="apiobject"></a>
### The AIO API object
AIO functionality is exposed by an object that can be obtained by using the [`aio()`](./README.md/#aio) method of the [`Board` API](./README.md/#board). See also the [Web IDL](./webidl.md). The API object exposes the following method:

| Method              | Description      |
| ---                 | ---              |
| [`open()`](#open)   | synchronous open |

<a name="open"></a>
#### The `AIO open(options)` method
Configures an AIO pin using data provided by the `options` argument. It involves the following steps:
- If `options` is a string, create a dictionary 'init' and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a number, create a dictionary 'init' and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a dictionary, let `init` be `options`. It may contain the following [`AIO`](#aio) properties, where at least `pin` MUST be specified:
  * `pin` for board pin name with the valid values defined by the board, or for the numeric index of the analog pin;
  * `precision` for the bit width of a sample (if the board supports setting the sampling rate).
- If any property of `init` is specified and has an invalid value on the given board, as defined by the board documentation,  throw `TypeError`.
- Request the underlying platform to initialize AIO on `init.pin` (if defined) or otherwise `init.channel`.
- In case of failure, throw `InvalidAccessError`.
- Let `aio` be the `AIOPin`](#aiopin) object that represents the hardware pin identified by `init.pin`, as defined by the board documentation.
- If `init.precision` is defined, request the board to set the precision and initialize the `aio.precision` property with the value supported by the board. If there is an error, throw `InvalidAccessError`.
- Initialize the `aio.value` property with `undefined`.
- Return the `aio` object.

<a name="aio"></a>
### The `AIO` interface
The `AIO` object extends the [`Pin`](./README.md/#pin) object.

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `pin`      | String or Number | no | `undefined`   | board name for the pin |
| `precision` | unsigned long | yes | `undefined` | bit length of digital sample |

| Method              | Description      |
| ---                 | ---              |
| [`read()`](#read)   | synchronous read |
| [`close()`](#close) | close the pin    |

The `pin` property inherited from [`Pin`](./README.md/#pin) can take values defined by the board documentation, usually strings prefixed by `"A"`, but it can also be specified as the numeric index of the analog pin, where pin 0 corresponding to the first analog pin and so forth.

The `precision` property represents the bit length of the digital sample. It is usually 10 or 12 bits, depending on board.

<a name="read"></a>
#### The `unsigned long read()` method
Performs a synchronous read operation for the pin value. It returns the pin value representing the last sampling.

<a name="close"></a>
#### The `close()` method
Called when the application is no longer interested in the pin. Until the next [open()](#open) is called, invoking the `read()` method throws `InvalidAccessError`.

### Examples
```javascript
try {
  var aio = require("board").aio();  // initialize AIO on the board

  var a1 = aio.open("A1");
  console.log(board.name + " AIO pin 1 value: " + a1.read());
  a1.close();

  var a4 = aio.open({pin: "A4", precision: 12 });

  setTimeout(function() {
    a4.close();
  }, 10500);

  setInterval(function() {
    console.log("AIO pin 4 value: " + a4.read());
  }, 1000);
} catch (err) {
  console.log("AIO error: " + err.message);
};
```
