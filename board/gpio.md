GPIO API
========

The GPIO (General Purpose Input & Output) API supports digital pins.

On certain boards GPIO pins may be grouped into ports (e.g. 8, 16 or 32 pins), read and written as registers by the controller.

On certain boards, analog pins can also be used as GPIO.

<a name="apiobject"></a>
### The GPIO API object
When requiring `"gpio"`, the following steps are run:
- If there is no permission for using the functionality, throw `SecurityError`.
- If the GPIO functionality is not supported on the board, throw `"NotSupportedError"`.
- Return an object that implements the following methods.

| Method              | Description      |
| ---                 | ---              |
| [`open()`](#open)   | open GPIO pin    |
| [`port()`](#port)   | open GPIO port   |

See also the [Web IDL](./webidl.md) definition.

The following dictionary is used for initializing GPIO pins and ports.
<a name="gpiooptions"></a>

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `pin `     | String or Number | no | `undefined`   | pin name |
| `mapping`  | String | no | `"board"`   | pin mapping |
| `mode`     | String | no       | `undefined`   | I/O mode |
| `activeLow` | boolean | yes   | `false` | whether the pin is active on logical low |
| `edge`     | string | yes      | `"any"`       | Interrupt generation mode |
| `state`    | string | yes      | `undefined`      | "pulldown", "pullup" |

The `pin` property is either a number or string, with values defined by the OS or board documentation. The default value is `undefined`.

The `mapping` property represents the pin namespace, either `"system"` or `"board"`, by default `"board"`.

The `mode` property MUST take the value `"in"` or `"out"`. The default value is `"out"`.

The `activeLow` property tells whether the pin value 0 means active. If `activeLow` is `true`, with `value` 0 the pin is active, otherwise inactive. For instance, if an actuator is attached to the (output) pin active on low, client code should write the value 0 to the pin in order to activate the actuator. The default value is `false`.

The `edge` property is used for input pins and tells whether the `data` event is emitted on the rising edge of the signal (string value `"rising"`) when `value` changes from 0 to 1, or on falling edge (string value `"falling"`) when `value` changes from 1 to 0, or both edges (string value `"any"`), or never (string value `"none`"). The default value is `"none"`.

The `state` property tells if the internal pulldown (string value `"pulldown"`) or pullup (string value `"pullup"`) resistor is used for input pins to provide a default value (0 or 1) when the input is floating. The default value is `undefined`.


<a name="open"></a>
#### The `GPIO open(options)` method
Configures a GPIO pin using data provided by the `options` argument, that may contain the following properties:

The method runs the following steps:
- If `options` is a number or string, let `init` be a [GPIOOptions](#gpiooptions) object, let `init.pin` be `options` and let the other [GPIOOptions](#gpiooptions) properties take the default values.
- If `options` is a dictionary and if `options.pin` is not defined, throw `TypeError`. If any of the `options` properties has an invalid value, throw `TypeError`. Let the the missing [GPIOOptions](#gpiooptions) properties take the default values. Let `init` be `options`.
- Request the underlying platform to initialize GPIO on the pin identified by `init.pin` in the namespace specified by `init.mapping` if that is defined. If not found, throw `InvalidAccessError`. If `init.mapping is not defined, then search `init.pin` first in the OS namespace, then in board namespace. In case of failure, throw `InvalidAccessError`.
- Let `gpio` be the [`GPIO`](#gpio) object that represents the requested pin corresponding to `init.pin` and return `gpio`.

<a name="port"></a>
#### The `GPIO port(port, options)` method
Configures a GPIO pin or port using data provided by the `options` argument that can take the same properties as in the [`open()`](#open) method.
A GPIO port can be identified either by a symbolic name defined by the OS or the board, or a sequence of pin names the implementation binds together and are written and read together.
The `port` argument is either a number or string representing a symbolic port name defined in the OS or board documentation, or an array of strings representing the pin names participating in the port in MSB order, i.e. the first element in the array represents the MSB.

The `port()` method runs the following steps:
- If `options` is a defined, let `mapping` be `init.mapping`. Let `init` be `options` and let the the missing [GPIOOptions](#gpiooptions) properties take the default values.
- Otherwise if `options` is not defined, let `init` be a [GPIOOptions](#gpiooptions) dictionary with all properties taking the default value.
- If `port` is a number or string, run the following sub-steps:
  * If `mapping` is defined, match `port` to the supported GPIO port names in the pin namespace specified by `mapping`. If not found, throw `InvalidAccessError`.
  * Otherwise if `mapping` is not defined, search `port` first in the OS namespace, then in board namespace. If both fail, throw `InvalidAccessError`.
  * Request the underlying platform to initialize the GPIO port identified by `port` and initialize it using `init`.
  * Let `gpio` be the [`GPIO`](#gpio) object representing the requested port and return `gpio`.
- Otherwise if `init.port` is an array, run the following sub-steps for aggregating pins in the implementation:
  * Let `gpio` be a [`GPIO`](#gpio) object.
  * For each pin name in the `port` sequence, run the [`open()`](#open) method with `init` as argument, associate the returned [`GPIO`](#gpio) object with the `gpio` object and make it represent a bit in the value returned by `gpio.read()`, with the first element in the sequence representing the most significant bit. If any of the opens fail, close the other pins and throw `InvalidAccessError`.
  * Initialize [`gpio.write()`](#write) with a function that obtains the corresponding bit values for each pin participating in the port and writes the pin values. Re-throw any errors.
  * Initialize [`gpio.read()`](#read) with a function that reads the corresponding bit values from each pin participating in the port and returns the assembled value. Re-throw any errors.
  * Initialize [`gpio.close()`](#close) with a function that closes each participating pin. Re-throw any errors.
  * For any listener on the `data` event, on notification from the underlying platform on a value change on any participating pin, implementations SHOULD wait a platform-dependent short time and then fire the `data` event with the value assembled from the participating pins.
  * Return the `gpio` object.

<a name="gpio"></a>
### The `GPIO` interface
The `GPIO` interface implements the [`EventEmitter`](../README.md/#events) interface. It exposes the following methods and event.

| Method               | Description       |
| ---                  | ---               |
| [`read()`](#read)    | synchronous read  |
| [`write()`](#write)  | synchronous write |
| [`close()`](#close)  | close the pin     |

| Event name | Event callback argument |
| -----------| ----------------------- |
| `data`     | unsigned long (the pin value) |

The `data` event listener callback receives the current value of the pin (0 or 1 for single pins, and positive integer for GPIO ports). Implementations SHOULD use a platform-dependent minimum time interval between firing two consecutive events.

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
  var board = require("board");
  var gpio = require("gpio");

  var gpio3 = gpio.open(3);  // GPIO input pin with default configuration.
  gpio3.write(1);  // activate pin
  gpio3.close();

  var gpio5 = gpio.open({ pin: 5, mode: "out", activeLow: true });
  gpio5.write(0);  // activate pin
  gpio5.close();

  gpio6 = gpio.open({ pin: 6, mode: "in", edge: "any"});
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
  var gpio = require("gpio");
  // Configure a GPIO port using default configuration
  var gport1 = gpio.port([3,4,5,6,7,8], { mode: "in"});

  // Set up a change listener on the port value.
  gport1.on("data", function(value) {
    console.log("GPIO port value has changed; value: " + gport1.read());
  });

  setTimeout(function(){
    gport1.close();
  }, 2000);

  // Initialize and write an output port
  var gport2 = gpio.port([5,6,7,8], { activeLow: true });
  gport2.write(0x21);
  gport2.close();

  // Configure a GPIO port supported in the platform under a symbolic name
  var gport3 = gpio.port("gpio-port-1", { activeLow: true });
  gport3.write(0x21);
  gport3.close();

} catch (err) {
  console.log("GPIO port error: " + error.message);
};
```
