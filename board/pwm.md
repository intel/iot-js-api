PWM API
=======

The PWM API supports writing analog values to pins using Pulse Width Modulation. Usually PWM is used for controlling LEDs, fans, vibration, etc.

PWM is characterized by a repeating digital signal of given pulse width (duration for value 1 in normal polarity and for value 0 in reverse polarity) and a total duration of the signal (period). Also, PWM is characterized by a duty cycle that is the ratio between the pulse width and the total signal period.
For instance, a LED that is driven with a PWM signal with 50% duty cycle will be approximately half-bright.

The term "channel" is used as the numeric index of a PWM pin relative to the PWM controller starting with 1.

<a name="apiobject"></a>
### The PWM API object
When requiring `"pwm"`, the following steps are run:
- If there is no permission for using the functionality, throw `SecurityError`.
- If the PWM functionality is not supported on the board, throw `"NotSupportedError"`.
- Return an object that implements the following method.

| Method              | Description      |
| ---                 | ---              |
| [`open()`](#open)   | open a PWM pin   |

See also the [Web IDL](./webidl.md) definition.

<a name="open"></a>
#### The `PWM open(options)` method
Configures a PWM pin using data provided by the `options` argument. It runs the following steps:
- If `options` is a string or number, create a dictionary `init` and use the value of `options` to initialize the `init.pin` property.
- Otherwise if `options` is a dictionary, let `init` be `options`. It may contain the following [`PWM`](#pwm) properties, but at least `name`
  * `pin` for pin name
  * `mapping` for pin mapping, either `"system"` or `"board"`, by default `"board"`
  * `reversePolarity`, by default `false`.
- If any of the `init` properties is specified, but has invalid value on the board, throw `InvalidAccessError`.
- Let `mapping` be `init.mapping`.
- Let the missing `init` properties take the default value.
- Request the underlying platform to initialize PWM on the pin identified by `init.pin` in the namespace specified by `mapping` if that is defined. If not found, throw `InvalidAccessError`. If `mapping is not defined, then search `init.pin` first in the OS namespace, then in board namespace. In case of failure, throw `InvalidAccessError`.
- Let `pwm` be the [`PWM`](#pwm) object representing the pin identified by the `init.pin` initialized by `init`.
- Return the `pwm` object.

<a name="pwm"></a>
### The `PWM` interface
Represents the properties and methods that expose PWM functionality.

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| `pin`      | String or Number | no | `undefined`   | pin name |
| `mapping`  | String | no | `"board"`   | pin mapping |
| `reversePolarity` | boolean | yes |   `false`   | PWM polarity |
| `write()`  | function | no | defined by implementation | set and enable PWM signal |
| `stop()`   | function | no | defined by implementation | stop the PWM signal |
| `close()`  | function | no | defined by implementation | release the pin |

| Method                   | Description                |
| ---                      | ---                        |
| [`write()`](#write) | set and start a PWM signal |
| [`stop()`](#stop)        | stop the PWM signal        |
| [`close()`](#close)      | close the pin              |

The `pin` property is an opaque number or string, representing a pin name.

The `mapping` property represents the pin namespace, either `"board"` or `"system"`.

The `reversePolarity` property tells whether the PWM signal is active on 0. The default value is `false`.

<a name="write"></a>
#### The `write(value)` method
Performs a synchronous write operation to define and enable the PWM signal. The argument `value` MUST be a dictionary defined here.
<a name="pwmdata"></a>

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

<a name="stop"></a>
#### The `stop()` method
Disables the PWM signal on the pin. A new invocation of `write()` is needed to restart the signal.

<a name="close"></a>
#### The `close()` method
Called when the application is no longer interested in the pin. It invokes the `stop()` method, then releases the pin.

### Examples

```javascript
try {
  var pwm = require("pwm");

  var pwm6 = pwm.open(6);  // configure pin 6 as PWM
  pwm6.write({ period: 2.5, pulseWidth: 1.5 });  // duty cycle is 60%
  console.log("PWM duty cycle: " + pwm6.dutyCycle);
  setTimeout(function(){
    pwm6.stop();  // stop the PWM signal
    pwm6.close();
  }, 2000);
}.catch (error) {
  console.log("PWM error: " + error.message);
};

```
