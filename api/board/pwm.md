PWM API
=======

The PWM API supports writing analog values to pins using Pulse Width Modulation. Usually PWM is used for controlling LEDs, fans, vibration, etc.

PWM is characterized by a repeating digital signal of given pulse width (duration for value 1 in normal polarity and for value 0 in reverse polarity) and a total duration of the signal (period). Also, PWM is characterized by a duty cycle that is the ratio between the pulse width and the total signal period.
For instance, a LED that is driven with a PWM signal with 50% duty cycle will be approximately half-bright.

The term 'channel' is used to refer to the fact that PWM controller hardware has multiple channels, but they are exposed as output pins. In this API the value of a channel is the numeric index of a PWM pin relative to the controller.

The API object
--------------
PWM functionality is exposed by the [`PWM`](#pwm) object that can be obtained by using the [pwm() method of the `Board` API](./README.md/#pwm).

Implementations MAY also support an explicit constructor that runs the [`PWM initialization`](#init) algorithm.

### Examples

```javascript
try {
  var board = require("iot-board-arduino101");

  var pwm6 = board.pwm(6);  // configure pin 6 as PWM
  // Alternatives:
  // var pwm6 = new PWM(6, board);  // use this board
  // var pwm6 = new PWM(6);  // use the default (this) board

  // Specify and enable PWM signal in terms of milliseconds.
  pwm6.write({ period: 2.5, pulseWidth: 1.5 });  // duty cycle is 60%
  console.log("PWM duty cycle: " + pwm.value.dutyCycle);

  // Stop the PWM signal.
  pwm6.stop();

  // Stop the PWM signal and release the pin.
  pwm6.close();
} catch (err) {
  console.log("AIO error.");
}

```

<a name="pwm">
### The `PWM` interface
Represents the properties and methods that expose PWM functionality. The `PWM` object extends the [`Pin`](./README.md/#pin) object, so it has all properties of [`Pin`](./README.md/#pin). In addition, it has the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `channel`  | unsigned long  | yes | `undefined` | numeric index of the analog pin |
| `reversePolarity` | boolean | yes |   `false`   | PWM polarity |
| `write()`  | function | no | defined by implementation | set and enable PWM signal |
| `stop()`   | function | no | defined by implementation | stop the PWM signal |
| `close()`  | function | no | defined by implementation | release the pin |

#### `PWM` properties

The `pin` property inherited from [`Pin`](./README.md/#pin) can take values defined by the board mapping.

The `address` property inherited from [`Pin`](./README.md/#pin) is initialized by the implementation with the pin mapping value provided by the board, and represents the identifier of the pin in the given platform and operating system.

The `mode` property inherited from [`Pin`](./README.md/#pin) takes the value `"pwm"`.

The `supportedModes` property inherited from [`Pin`](./README.md/#pin) returns an array of supported modes fot the pin, according to the board documentation. Implementations are not required to implement this property, in which case its value should be `undefined`.

The `channel` property is initialized by the implementation and provides the numeric index of the analog pin, e.g. it is 0 for pin `"A0"` and 5 for pin `"A5"`.

The `reversePolarity` property tells whether the PWM signal is active on 0. The default value is `false`.

<a name="pwmdata">
The `value` property inherited from [`Pin`](./README.md/#pin) provides a dictionary with the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| period     | double | no       | `undefined`   | the total period of the PWM signal in milliseconds |
| pulseWidth | double | no       | `undefined`   | the period of the PWM pulse in milliseconds |
| dutyCycle  | long   | no       | `undefined`   | the calculated PWM duty cycle |

#### `PWM` methods

<a name="init">
##### PWM initialization
This internal algorithm is used by the [`Board.pwm()`](./README.md/#pwm) method and by the constructor of the [`PWM`](#pwm) object. Synchronously configures the PWM pin provided by the `options` (first) argument on the board specified by the [`board`](./README.md/#board) (second) argument. It involves the following steps:
- If `options` is a string or number, then create a dictionary `init` and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a dictionary, let `init` be `options`. It may contain the following [`PWM`](#pwm) properties:
  * `pin` for board pin name with the valid values defined by the board
  * `reversePolarity`, with a default value `false`.
- If any of the `init` properties has invalid value, throw `InvalidAccessError`.
- If `board` is `undefined` or `null`, let `board` be the default board connected. If no default board exists, throw `InvalidAccessError`.
- initialize the `reversePolarity` property with the value requested by the application.
- Let `pwm` be the [`PWM`](#pwm) object representing the pin identified by the `name` argument.
- Request the underlying platform to initialize AIO on the given `board` for the given pin `name`.
- In case of failure, return `null`.
- Initialize the `pwm.address` property with the board-specific pin mapping value, if available.
- Initialize the `pwm.channel` property with the board-specific value, if available.
- Initialize the `value` property with the dictionary described [here](#pwmdata) with default property values.
- Return the `pwm` object.

##### The `write(value)` method
Performs a synchronous write operation to define and enable the PWM signal. The argument `value` is a [dictionary defined here](#pwmdata) with at least 2 properties specified:
- `period` and `pulseWidth`, or
- `period` and `dutyCycle`, or
- `pulseWidth` and `dutyCycle`.
The third property of `value` is calculated based on the other two. If all properties are specified, `dutyCycle` is recalculated based on the value of `period` and `pulseWidth`.
The method runs the following steps:
- If `value` has invalid values for the given board, throw `InvalidAccessError`.
- Set up and enable the PWM signal based on `value`.

##### The `stop()` method
Disables the PWM signal on the pin. A new invocation of `write()` is needed.

##### The `close()` method
Called when the application is no longer interested in the pin. It invokes the `stop()` method, then releases the pin.
