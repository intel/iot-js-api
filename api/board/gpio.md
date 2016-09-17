GPIO API
========

The GPIO API supports digital I/O pins.

The API object
--------------
GPIO functionality is exposed by the [`GPIO`](#gpio) object that can be obtained by using the [gpio() method of the `Board` API](./README.md/#gpio).

Implementations MAY also support an explicit constructor that runs the [`GPIO initialization`](#init) algorithm.

### Examples

```javascript
try {
  var board = require("iot-board");

  // Configure GPIO using the board
  var gpio3 = board.gpio(3);  // GPIO input pin with default configuration.

  // Configure GPIO using a constructor.
  var gpio4 = new GPIO(4, board);
  // If 'board' is the default board, it can be omitted.
  // var gpio4 = new GPIO(4);

  // Read pin values.
  console.log(board.name + " GPIO pin 3 value: " + gpio3.value);
  console.log(board.name + " GPIO pin 4 value: " + gpio4.value);

  // Release the pins.
  gpio3.close();
  gpio4.close();

  var gpio5 = board.gpio({ pin: 5, mode: "output", activeLow: true });
  gpio5.write(0);  // activate pin 2
  gpio5.close();

  var gpio6 = board.gpio({pin: 6, edge: "any"});
  // will notify on both 0->1 and 1->0 changes.
  gpio4.onchange = function(value) {
    console.log("GPIO pin 6 has changed; value: " + value);
    gpio6.close();  // also removes listeners
  };
} catch (err) {
  console.log("GPIO error.");
}
```

<a name="gpio">
### The `GPIO` interface
Represents the properties and methods that expose GPIO functionality. The `GPIO` object implements the [`EventEmitter`](../README/#events) interface, and extends the [`Pin`](./README.md/#pin) object, so it has all properties of [`Pin`](./README.md/#pin). In addition, it has the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `activeLow` | boolean | yes   | `false` | whether the pin is active on logical low |
| `edge`     | string | yes      | `"any"`       | Interrupt generation mode |
| `pull`     | string | yes      | `"none"`      | "pulldown", "pullup" or "none" |
| `write()`  | function | no | defined by implementation | synchronous write |
| `close()`  | function | no | defined by implementation | close the pin |
| `onchange` | event | no       | `undefined`   | event for pin value change |

#### `GPIO` properties

The `pin` property inherited from [`Pin`](./README.md/#pin) can take values defined by the board mapping, usually positive integers.

The `mode` property inherited from [`Pin`](./README.md/#pin) can take the values `"input"` or `"output"`. The default value is `"input"`. Other [`Pin.mode`](./README.md/#pinmode) values are invalid for GPIO.

The `supportedModes` property inherited from [`Pin`](./README.md/#pin) returns an array of supported modes fot the pin, according to the board documentation. Implementations are not required to implement this property, in which case its value should be `undefined`.

The `value` property inherited from [`Pin`](./README.md/#pin) provides the raw value of the pin, 0 (meaning `low`, or `false`) or 1 (meaning `high`, or `true`) or `undefined`. The default value is `undefined`, meaning  the input may be floating, and output is not specified. When reading the property, implementations SHOULD make a synchronous read operation to fetch the value of the pin.

The `address` property inherited from [`Pin`](./README.md/#pin) is initialized by implementation with the pin mapping value provided by the board, and represents the identifier of the pin in the given platform and operating system.

The `activeLow` property tells whether the pin value 0 means active. If `activeLow` is `true`, with `value` 0 the pin is active, otherwise inactive. For instance, if an actuator is attached to the (output) pin active on low, client code should write the value 0 to the pin in order to activate the actuator.

The `edge` property is used for input pins and tells whether the `onchange` event is emitted on the rising edge of the signal (string value `"rising"`) when `value` changes from 0 to 1, or on falling edge (string value `"falling"`) when `value` changes from 1 to 0, or both edges (string value `"any"`), or never (string value `"none`"). The default value is `"none"`, which means by default the `onchange` events will fire on any change.

The `pull` property tells if the internal pulldown (string value `"pulldown"`) or pullup (string value `"pullup"`) resistor is used for input pins to provide a default value (0 or 1) when the input is floating. The default value is `"none"`, meaning no resistor is used and the input is floating.

#### `GPIO` methods

<a name="init">
##### GPIO initialization
This internal algorithm is used by the [`Board.gpio()`](./README.md/#gpio) method and by the constructor of the [`GPIO`](#gpio) object. Synchronously configures the GPIO pin provided by the `options` (first) argument on the board specified by the `board` (second) argument.
- If `options` is a number or a string, create a dictionary `init` and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a dictionary, let `init` be `options`. It may contain the following [`GPIO`](#gpio) properties:
  * `pin` for board pin name with the valid values defined by the board
  * `mode` with valid values `"input"` or `"output"`, by default `"input"`
  * `activeLow`, by default `false`
  * `edge`, by default `"any"`
  * `pull`, by default `"none"`.
- If any of the `init` properties has invalid value, throw `InvalidAccessError`.
- If `board` is `undefined` or `null`, let `board` be the default board connected. If no default board exists, throw `InvalidAccessError`.
- Let `gpio` be the `GPIO`](#gpio) object representing the requested pin initialized by `init`. For the [`GPIO`](#gpio) properties missing from the `init` dictionary, implementations SHOULD use the default values of the `GPIO` object properties.
- Initialize the `address` property with the board specific pin mapping value, if available.
- Request the underlying platform to initialize GPIO on the given `board` with the `init` properties.
- In case of failure, return `null`.
- Initialize the `value` property with the current value of the pin, if available.
- Return the `gpio` object.

##### The `write(value)` method
If `value` is `0`, `null` or `undefined`, let `value` be 0. Otherwise let `value` be `1`.
The method synchronously writes 0 or 1 to the GPIO pin, to provide its raw value. If `activeLow` is `true`, the value 0 activates the pin, and the value 1 inactivates it. If `activeLow` is `false`, the value 1 activates the pin, and the value 0 deactivates it.

##### The `close()` method
Called when the application is no longer interested in the pin. This also removes all listeners to the `onchange` event. Until the next invocation of `init()`, invoking the `write()` method or reading the `value` property SHOULD throw `InvalidAccessError`.

#### `GPIO` events
The `GPIO object supports the following events:

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| `onchange`        | boolean (the new pin value) |

The listener callback will receive the current value of the pin (0 or 1).
