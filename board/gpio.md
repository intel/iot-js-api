GPIO API
========

The GPIO (General Purpose Input & Output) API supports digital pins.

On certain boards GPIO pins may be grouped into ports (e.g. 8, 16 or 32 pins), read and written as registers by the controller.

On certain boards, analog pins can also be used as GPIO.

<a name="apiobject"></a>
### The GPIO API object
GPIO pin functionality is exposed by an object that can be obtained by using the [`gpio()`](./README.md/#gpio) method of the [`Board` API](./README.md/#board). See also the [Web IDL](./webidl.md). The API object exposes the following method:

| Method              | Description      |
| ---                 | ---              |
| [`open()`](#open)   | synchronous open |

<a name="open"></a>
#### The `GPIO open(options)` method
Configures a GPIO pin or port using data provided by the `options` argument. It involves the following steps:
- If `options` is a number or string, create a dictionary `init` and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a dictionary, let `init` be `options`. It may contain the following [`GPIO`](#gpio) properties:
  * `pin` for the GPIO pin or port name defined by the board
  * `port` for the array of GPIO pins that define the port
  * `mode` with valid values `"input"` or `"output"`, by default `"input"`
  * `activeLow`, by default `false`
  * `edge`, by default `"any"`
  * `state`, by default `undefined`.
- If any of the `init` properties has an invalid value, throw `TypeError`.
- If `init.port` is defined and matches a GPIO port name defined by the board, run the following sub-steps:
  * request the underlying platform to initialize the GPIO port on the given board with the `init` properties. In case of failure, throw `InvalidAccessError`.
  * Let `gpio` be the [`GPIO`](#gpio) object representing the requested port initialized by `init`.
- Otherwise, if `init.pin` is defined, run the following sub-steps:
  * Let `gpio` be the [`GPIO`](#gpio) object representing the requested pin initialized by `init`. For the [`GPIO`](#gpio) properties missing from the `init` dictionary, use the default values of the `GPIO` object properties.
  * Initialize the `gpio.pin` property with `init.pin`.
- Return the `gpio` object.


<a name="gpio"></a>
### The `GPIO` interface
The `GPIO` interface extends the [`Pin`](./README.md/#pin) object and implements the [`EventEmitter`](../README.md/#events) interface. It exposes the following properties and methods.

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `pin`      | String or Number | no | `undefined`   | board name for the pin |
| `mode`     | String | no       | `undefined`   | I/O mode |
| `port`     | array  | yes      | `undefined`   | array of pin names representing the ports
| `activeLow` | boolean | yes   | `false` | whether the pin is active on logical low |
| `edge`     | string | yes      | `"any"`       | Interrupt generation mode |
| `state`    | string | yes      | `undefined`      | "pulldown", "pullup" |

| Method               | Description       |
| ---                  | ---               |
| [`read()`](#read)    | synchronous read  |
| [`write()`](#write)  | synchronous write |
| [`close()`](#close)  | close the pin     |

| Event name | Event callback argument |
| -----------| ----------------------- |
| `data`     | unsigned long (the pin value) |

The `data` event listener callback receives the current value of the pin (0 or 1 for single pins, and positive integer for GPIO ports).

The `pin` property inherited from [`Pin`](./README.md/#pin) can take values defined by the board documentation, usually positive integers.

The `mode` property MUST take the value `"input"` or `"output"`. The default value is `"input"`.

The `port` property, if defined, is an array of strings that represents the ordered list of pin names that form a GPIO port, where the first element in the array represents the MSB.

The `activeLow` property tells whether the pin value 0 means active. If `activeLow` is `true`, with `value` 0 the pin is active, otherwise inactive. For instance, if an actuator is attached to the (output) pin active on low, client code should write the value 0 to the pin in order to activate the actuator.

The `edge` property is used for input pins and tells whether the `data` event is emitted on the rising edge of the signal (string value `"rising"`) when `value` changes from 0 to 1, or on falling edge (string value `"falling"`) when `value` changes from 1 to 0, or both edges (string value `"any"`), or never (string value `"none`"). The default value is `"any"`, which means the event will fire on any change.

The `state` property tells if the internal pulldown (string value `"pulldown"`) or pullup (string value `"pullup"`) resistor is used for input pins to provide a default value (0 or 1) when the input is floating. The default value is `undefined`.

<a name="read"></a>
#### The `unsigned long read()` method
Returns the value of the GPIO pin or port.

<a name="write"></a>
#### The `write(value)` method
If `value` is `0`, `null` or `undefined`, let `value` be 0. Otherwise, if `port` is `undefined`, let `value` be `1`. The method synchronously writes `value` to the GPIO pin. If `port` is defined, and if `value` is larger than the numeric range of the port, throw `RangeError`. If `activeLow` is `true`, the value 0 activates the pin, and the value 1 inactivates it. If `activeLow` is `false`, the value 1 activates the pin, and the value 0 deactivates it.

<a name="close"></a>
#### The `close()` method
Called when the application is no longer interested in the pin. This also removes all listeners to the `data` event. Until the next invocation of [`open()`](#open), invoking the `write()` method or reading the `value` property SHOULD throw `InvalidAccessError`.

### Examples

#### Working with GPIO pins

```javascript
try {
  var gpio = require("board").gpio();

  var gpio3 = gpio.open(3);  // GPIO input pin with default configuration.
  console.log(board.name + " GPIO pin 3 value: " + gpio3.read());
  gpio3.close();

  var gpio5 = gpio.open({ pin: 5, mode: "output", activeLow: true });
  gpio5.write(0);  // activate pin
  gpio5.close();

  gpio6 = gpio.open({pin: 6, edge: "any"});
  gpio6.on("data", function(value) {
    console.log("GPIO pin 6 has changed; value: " + value);
  });
  setTimeout(function(){
    gpio6.close();
  }, 2000);

} catch (err) {
  console.log("GPIO error: " + err.message);
};
```

#### Working with GPIO ports

```javascript
try {
  var gpio = require("board").gpio();
  // Configure a GPIO port using default configuration
  var gport1 = gpio.open({ port: [3,4,5,6,7,8]});

  // Set up a change listener on the port value.
  gport1.on("data", function(value) {
    console.log("GPIO port value has changed; value: " + gport1.read());
  });

  setTimeout(function(){
    gport1.close();
  }, 2000);

  // Initialize and write an output port
  var gport2 = gpio.open({ port: [5,6,7,8], mode: "output", activeLow: true });
  gport2.write(0x21);
  gport2.close();
} catch (err) {
  console.log("GPIO port error: " + error.message);
};
```
