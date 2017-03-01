PWM API
=======

The PWM API supports writing analog values to pins using Pulse Width Modulation. Usually PWM is used for controlling LEDs, fans, vibration, etc.

PWM is characterized by a repeating digital signal of given pulse width (duration for value 1 in normal polarity and for value 0 in reverse polarity) and a total duration of the signal (period). Also, PWM is characterized by a duty cycle that is the ratio between the pulse width and the total signal period.
For instance, a LED that is driven with a PWM signal with 50% duty cycle will be approximately half-bright.

The term 'channel' is used to refer to the fact that PWM controller hardware has multiple channels, but they are exposed as output pins. In this API the value of a channel is the numeric index of a PWM pin relative to the controller.

The API object
--------------
PWM functionality is exposed by the [`PWM`](#pwm) object that can be obtained by using the [pwm() method of the `Board` API](./README.md/#pwm). See also the [Web IDL](./webidl.md).

### Examples

```javascript
var board = require("board");

board.pwm(6)  // configure pin 6 as PWM
  .then(function(pwm){
    pwm.write({ period: 2.5, pulseWidth: 1.5 });  // duty cycle is 60%
    console.log("PWM duty cycle: " + pwm.dutyCycle);
    setTimeout(function(){
      pwm.stop();  // stop the PWM signal
      pwm.close();
    }, 2000);
  }).catch(function(error) {
    console.log("PWM error: " + error.message);
  });

```

<a name="pwm">
### The `PWM` interface
Represents the properties and methods that expose PWM functionality. The `PWM` object extends the [`Pin`](./README.md/#pin) object.

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `pin`     | String or Number | no | `undefined`   | board name for the pin |
| `mode`    | String | no       | `undefined`   | I/O mode |
| `channel`  | unsigned long  | yes | `undefined` | numeric index of the analog pin |
| `reversePolarity` | boolean | yes |   `false`   | PWM polarity |
| `write()`  | function | no | defined by implementation | set and enable PWM signal |
| `stop()`   | function | no | defined by implementation | stop the PWM signal |
| `close()`  | function | no | defined by implementation | release the pin |

| Method signature         | Description                |
| ---                      | ---                        |
| [`write(value)`](#write) | set and start a PWM signal |
| [`stop()`](#stop)        | stop the PWM signal        |
| [`close()`](#close)      | close the pin              |

#### `PWM` properties

The `pin` property inherited from [`Pin`](./README.md/#pin) can take values defined by the board mapping.

The `mode` property inherited from [`Pin`](./README.md/#pin) takes the value `"pwm"`.

The `channel` property is initialized by the implementation and provides the numeric index of the analog pin, e.g. it is 0 for pin `"A0"` and 5 for pin `"A5"`.

The `reversePolarity` property tells whether the PWM signal is active on 0. The default value is `false`.

#### `PWM` methods

<a name="init">
##### PWM initialization
This internal algorithm is used by the [`Board.pwm()`](./README.md/#pwm) method. Configures the PWM pin provided by the `options` argument. It runs the following steps:
- If `options` is a string or number, create a dictionary `init` and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a dictionary, let `init` be `options`. It may contain the following [`PWM`](#pwm) properties:
  * `pin` for board pin name with the valid values defined by the board
  * `reversePolarity`, with a default value `false`.
- If any of the `init` properties has invalid value, throw `InvalidAccessError`.
- Let `pwm` be the [`PWM`](#pwm) object representing the pin identified by the `init.pin` argument and request the underlying platform to initialize PWM for the given pin. In case of failure, throw `InvalidAccessError`.
- Initialize the `pwm.pin` property with `init.pin`.
- Initialize the `pwm.reversePolarity` property with `init.reversePolarity`.
- Initialize the `pwm.channel` property with the board-specific value, if available.
- Return the `pwm` object.

<a name="write">
##### The `write(value)` method
Performs a synchronous write operation to define and enable the PWM signal. The argument `value` MUST be a dictionary defined here.
<a name="pwmdata">

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| period     | double | no       | `undefined`   | the total period of the PWM signal in milliseconds |
| pulseWidth | double | no       | `undefined`   | PWM pulse width in milliseconds |
| dutyCycle  | long   | no       | `undefined`   | the PWM duty cycle |

The `write(value)` method runs the following steps:
- The argument `value` MUST have at least 2 properties specified:
  * `period` and `pulseWidth`, or
  * `period` and `dutyCycle`, or
  * `pulseWidth` and `dutyCycle`.
The third property of `value` is calculated based on the other two. If all properties are specified, `dutyCycle` is recalculated based on the value of `period` and `pulseWidth`.
- If `value` has invalid values for the given board, throw `InvalidAccessError`.
- Set up and enable the PWM signal based on `value`.

<a name="stop">
##### The `stop()` method
Disables the PWM signal on the pin. A new invocation of `write()` is needed to restart the signal.

<a name="close">
##### The `close()` method
Called when the application is no longer interested in the pin. It invokes the `stop()` method, then releases the pin.
