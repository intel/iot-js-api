GPIO API
========

The GPIO (General Purpose Input & Output) API supports digital pins.

The API object
--------------
GPIO pin functionality is exposed by the [`GPIO`](#gpio) object that can be obtained by using the [gpio() method of the `Board` API](./README.md/#gpio).

Implementations MAY also support an explicit constructor that runs the [`GPIO initialization`](#init) algorithm.

On certain boards GPIO pins may be grouped into ports (e.g. 8, 16 or 32 pins), read and written as registers by the controller.

GPIO port functionality is exposed by the [`GPIOPort`](#gpioport) object that can be obtained by using the [gpio() method of the `Board` API](./README.md/#gpio).

Implementations MAY also support an explicit constructor that runs the [`GPIO initialization`](#init) algorithm.


### Examples

#### Working with GPIO pins

```javascript
try {
  var board = require("board");

  // Configure a GPIO pin using the board
  var gpio3 = board.gpio(3);  // GPIO input pin with default configuration.

  // Configure a GPIO pin using a constructor.
  var gpio4 = new GPIO(4, board);
  // If 'board' is the default board, it can be omitted.
  // var gpio4 = new GPIO(4);

  // Read GPIO pin values.
  console.log(board.name + " GPIO pin 3 value: " + gpio3.value);
  console.log(board.name + " GPIO pin 4 value: " + gpio4.value);

  // Release GPIO pins.
  gpio3.close();
  gpio4.close();

  var gpio5 = board.gpio({ pin: 5, mode: "output", activeLow: true });
  gpio5.write(0);  // activate pin
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

Using an implementation with string pin names.

#### Working with GPIO pins

```javascript
try {
  var board = require("board");

  // Configure a GPIO input pin on the default board.
  var gpio3 = new GPIO("GPIO3");

  console.log(board.name + " GPIO pin 3 value: " + gpio3.value);
} catch (err) {
  console.log("GPIO error.");
}
```

#### Working with GPIO ports

```javascript
try {
  var board = require("board");

  // Configure a GPIO port using the board object and default configuration
  var gport = board.gpio([1,2,3,4,5,6,7,8]);
  gport.close();

  // Configure a GPIO port using a constructor.
  gport = new GPIO([1,2,3,4,5,6,7,8], board);
  gport.close();

  // If 'board' is the default board, it can be omitted.
  gport = new GPIO([1,2,3,4,5,6,7,8]);
  gport.close();

  // If the board supports symbolic port names, and "GPIOPort1" is the name of a port.
  gport = new GPIO("GPIOPort1");

  if (gport instanceof GPIOPort) {  // true
    console.log("GPIO port " + gport.name + " pins: " + gport.pins());
  }

  // Read GPIO port value.
  console.log(board.name + " GPIO port value: " + gport.value);

  // Set up a change listener on the port value.
  gport.onchange = function(value) {
    console.log("GPIO port value has changed; value: " + value);
  };

  // Initialize and write an output port
  gwport = new GPIO({ pins: [1,2,3,4,5,6,7,8], mode: "output", activeLow: true });
  gwgport.write(0x21);
  gwport.close();

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

The `supportedModes` property inherited from [`Pin`](./README.md/#pin) returns an array of supported modes for the pin, according to the board documentation. Implementations are not required to implement this property, in which case its value should be `undefined`.

The `value` property inherited from [`Pin`](./README.md/#pin) provides the raw value of the pin, 0 (meaning `low`, or `false`) or 1 (meaning `high`, or `true`) or `undefined`. The default value is `undefined`, meaning the input may be floating, and output is not specified. When reading the property, implementations SHOULD perform a synchronous read operation to fetch the value of the pin.

The `address` property inherited from [`Pin`](./README.md/#pin) is initialized by the implementation with the pin mapping value provided by the board, and represents the identifier of the pin in the given platform and operating system.

The `activeLow` property tells whether the pin value 0 means active. If `activeLow` is `true`, with `value` 0 the pin is active, otherwise inactive. For instance, if an actuator is attached to the (output) pin active on low, client code should write the value 0 to the pin in order to activate the actuator.

The `edge` property is used for input pins and tells whether the `onchange` event is emitted on the rising edge of the signal (string value `"rising"`) when `value` changes from 0 to 1, or on falling edge (string value `"falling"`) when `value` changes from 1 to 0, or both edges (string value `"any"`), or never (string value `"none`"). The default value is `"none"`, which means the event will not fire on any change.

The `pull` property tells if the internal pulldown (string value `"pulldown"`) or pullup (string value `"pullup"`) resistor is used for input pins to provide a default value (0 or 1) when the input is floating. The default value is `"none"`, meaning no resistor is used and the input is floating.

#### `GPIO` methods

##### The `write(value)` method
If `value` is `0`, `null` or `undefined`, let `value` be 0. Otherwise let `value` be `1`.
The method synchronously writes 0 or 1 to the GPIO pin, to provide its raw value. If `activeLow` is `true`, the value 0 activates the pin, and the value 1 inactivates it. If `activeLow` is `false`, the value 1 activates the pin, and the value 0 deactivates it.

##### The `close()` method
Called when the application is no longer interested in the pin. This also removes all listeners to the `onchange` event. Until the next invocation of `init()`, invoking the `write()` method or reading the `value` property SHOULD throw `InvalidAccessError`.

#### `GPIO` events
The `GPIO` object supports the following events:

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| `onchange`        | number (the new pin value) |

The listener callback will receive the current value of the pin (0 or 1).

<a name="gpioport">
### The `GPIOPort` interface
Represents the properties and methods that expose GPIO port functionality. The `GPIOPort` object extends the [`GPIO`](#gpio) object, so it has all its properties that are valid for all the GPIO pins contained in the GPIO port. In addition, it has the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `name`     | string | no       | `undefined`   | Symbolic name of the GPIO port |
| `pins`     | array of strings | no       | `[ ]`   | List of contained GPIO pin names |

#### `GPIOPort` properties

The `name` property is a string that represents the symbolic name of the GPIO port as defined by the board.

The `pins` property is an array of strings containing the board pin names of the GPIO ports contained in the port.

The `pin` property inherited from [`Pin`](./README.md/#pin) should be `undefined`.

The `address` property inherited from [`Pin`](./README.md/#pin) should be `undefined`.

The `mode`, `supportedModes`, `activeLow`, `edge` and `pull` properties inherited from [`GPIO`](#gpio) are valid for all pins contained in the port.

The `value` property inherited from [`Pin`](./README.md/#pin) provides the raw numeric value of the port. The default value is `undefined`, meaning the inputs may be floating, and outputs are not specified. When reading the property, implementations SHOULD make a synchronous read operation to fetch the value of the port.

#### `GPIOPort` methods

##### The `write(value)` method
If `value` is `0`, `false`, `null` or `undefined`, let `value` be 0. If `value` is larger than the numeric range of the port, throw `RangeError`. The method synchronously writes `value` to the GPIO port, regardless of the value of `activeLow`.

##### The `close()` method
Called when the application is no longer interested in the port. This also removes all listeners to the `onchange` event. Until the next invocation of `init()`, invoking the `write()` method or reading the `value` property SHOULD throw `InvalidAccessError`.

#### `GPIOPort` events
The `GPIOPort` object supports the following events inherited from [`GPIO`](#gpio):

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| `onchange`        | number (the new port value) |

The listener callback will receive the current numeric value of the port.

<a name="init">
### GPIO initialization
This internal algorithm is used by the [`Board.gpio()`](./README.md/#gpio) method and by the constructor of the [`GPIO`](#gpio) and [`GPIOPort`](#gpioport) objects. Synchronously configures the GPIO pin or GPIO port provided by the `options` (first) argument on the board specified by the [`board`](./README.md/#board) (second) argument.
- If `options` is a number, and there is no matching GPIO pins defined by the board, throw `TypeError`.
- If `options` is a string, and there is no matching GPIO pins or ports defined by the board, throw `TypeError`.
- Create a dictionary `init` and use the value of `options` to initialize the `init.name` property.
- Otherwise, if `options` is a dictionary, let `init` be `options`. It may contain the following [`GPIO`](#gpio) properties:
  * `name` for the GPIO pin or port name defined by the board
  * `mode` with valid values `"input"` or `"output"`, by default `"input"`
  * `activeLow`, by default `false`
  * `edge`, by default `"any"`
  * `pull`, by default `"none"`.
- If any of the `init` properties has an invalid value, throw `TypeError`.
- If `board` is `undefined` or `null`, let `board` be the default board connected. If no default board exists, throw `InvalidAccessError`.
- If `init.name` matches a GPIO port name defined by the board, run the following sub-steps:
  * let `gpioport` be the [`GPIOPort`](#gpioport) object representing the requested port initialized by `init`. For the [`GPIOPort`](#gpioport) properties missing from the `init` dictionary, use the default values of the [`GPIOPort`](#gpioport) object properties.
  * Initialize the `gpioport.pin` and `gpioport.address` properties with `undefined`.
  * Request the underlying platform to initialize the GPIO port on the given board with the `init` properties.
  * In case of failure, return `null`.
  * Initialize the `gpioport.value` property with the current value of the port, if available.
  * Return the `gpioport` object.
- Otherwise, run the following sub-steps:
  * Let `gpio` be the [`GPIO`](#gpio) object representing the requested pin initialized by `init`. For the [`GPIO`](#gpio) properties missing from the `init` dictionary, use the default values of the `GPIO` object properties.
  * Initialize the `gpio.pin` property with `init.name`.
  * Initialize the `gpio.address` property with the board-specific pin mapping value, if available.
  * Request the underlying platform to initialize the GPIO pin on the given `board` with the `init` properties.
  * In case of failure, return `null`.
  * Initialize the `gpio.value` property with the current value of the pin, if available.
  * Return the `gpio` object.
