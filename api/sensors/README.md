Sensor APIs
===========

This API is based on the [W3C Generic Sensor API](https://www.w3.org/TR/generic-sensor) but adapted to constrained environments. It exposes interfaces to handle various [sensor types](https://www.w3.org/2009/dap/).
  - [Ambient Light Sensor](./ambient-light.md) type, based on the [W3C Ambient Light Sensor specification](https://www.w3.org/TR/ambient-light/).
  - [Proximity Sensor](./proximity.md) type, based on the [W3C Proximity Sensor specification](https://www.w3.org/TR/proximity).
  - [Accelerometer Sensor](./accelerometer.md) type, based on the [W3C Accelerometer specification](https://github.com/w3c/accelerometer).
  - [Gyroscope Sensor](./gyroscope.md) type, based on the [W3C Gyroscope specification](https://w3c.github.io/gyroscope/).
  - [Magnetometer Sensor](./magnetometer.md) type, based on the [W3C MagnetoMeter specification](https://w3c.github.io/magnetometer).

This API takes interface definitions for the following objects from the [W3C Generic Sensor API](https://www.w3.org/TR/generic-sensor):
- [Sensor](https://www.w3.org/TR/generic-sensor/#the-sensor-interface)
- [SensorReading](https://www.w3.org/TR/generic-sensor/#the-sensor-reading-interface)
- [SensorReadingEvent](https://www.w3.org/TR/generic-sensor/#the-sensor-reading-event-interface)
- [SensorErrorEvent](https://www.w3.org/TR/generic-sensor/#the-sensor-error-event-interface).

### Changes compared to the W3C specifications

This API supports listing all sensors of a given type. Sensors can be constructed using additional optional properties: sensor name, the name of the hardware controller, the board object, and list of pin names used on the board. In rest, the sensor interfaces are the same. When board is not specified to a constructor, it takes the default board selected by the underlying platform.

On boards where hot-plug sensors are supported, events are emitted when sensors are added, and removed, respectively.

### Example

```javascript
var iot = require("iot-sensors");

var temperature = iot.sensors("Temperature")[0];

// if no temperature sensors already listed, try adding it
if (!temperature) try {
  temperature = new TemperatureSensor({
      name: "livingRoomTemperature1",
      controller: "BME280",
      pins: ["i2c0"]  // connected to I2C bus 0
      // board is default
  });
} catch(err) {
  console.log("Error adding temperature sensor: " + err.message);
}

console.log("Living room temperature [C]: " + temperature.celsius);

```

### Web IDL for Sensor APIs
```javascript
// Provided by 'require()'.
interface Sensors {
    // Enumerate all sensors or a given type of sensors connected to the board.
    // If a type was provided, the first in the list is the default sensor of that type.
    sequence<Sensor> sensors(optional SensorType sensorType);

    attribute EventHandler<Sensor> onsensorfound;
    attribute EventHandler<Sensor> onsensorlost;
};

Sensors implement EventEmitter;

partial interface Sensor {
    // Additional properties to W3C Generic Sensor.
    readonly attribute String name;  // e.g. "bedroomLightSensor1"
    readonly attribute String controller;  // e.g. "ISL29035", or "Grove" etc.
    readonly attribute Board board;
    readonly attribute sequence<String> pins;  // list of connected pin names
};

enum SensorType {
    "Accelerometer",
    "Geolocation",
    "Gyroscope",
    "Lightmeter",
    "Magnetometer",
    "Proximity",
    "Temperature"
};

partial dictionary SensorOptions {
    String name;
    String controller;
    Board board;
    sequence<String> pins;
};
```

Various sensors may add properties to [`Sensor`](#sensor), or to its `reading` property of type `SensorReading`.

###  The data model for `Lightmeter`
The `reading` property of the [`Lightmeter`](https://w3c.github.io/ambient-light/#ambient-light-sensor-interface) sensor object is a dictionary that contains a new property named `illuminance` that is a floating point number and represents the current light level (illuminance) measured in lux.

### The data model for `ProximitySensor`
The `reading` property of the [`ProximitySensor`](https://w3c.github.io/proximity/#proximity-sensor-interface) object is a dictionary that contains the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| distance   | double | no       | undefined     | distance to object in cm |
| max        | double | no       | undefined     | sensing range in cm      |
| near       | boolean | no      | undefined     | if object in proximity   |

### The data model for `Accelerometer`
The `reading` property of the sensor object [`Accelerometer`](https://w3c.github.io/accelerometer/#accelerometer-sensor-interface) object is a dictionary that contains the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| accelerationX | double | no    | undefined  | acceleration along the X axis |
| accelerationY | double | no    | undefined  | acceleration along the Y axis |
| accelerationZ | double | no    | undefined  | acceleration along the Z axis |

The sensor contains one more additional property named `includesGravity` of type `boolean`. If it is `false`, then the `reading` property stores linear acceleration values (that don't take into account gravity).

### The data model for `Gyroscope`
The `reading` property of the [`Gyroscope`](https://w3c.github.io/gyroscope/#gyroscope-sensor-interface) sensor object is a dictionary that contains the following properties that represent the current angular velocity around the X, Y or Z axis, expressed in radians per second:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| rotationRateX | double | no    | 0  | angular velocity along the X axis |
| rotationRateY | double | no    | 0  | angular velocity along the Y axis |
| rotationRateZ | double | no    | 0  | angular velocity along the Z axis |

### The data model for `Magnetometer`
The `reading` property of the [`Magnetometer`](https://w3c.github.io/magnetometer/#magnetometer-interface) sensor object is a dictionary that contains the following properties that represent the geomagnetic field force around the X, Y or Z axis, expressed in microTesla units:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| magneticFieldX | double | no    | 0  | geomagnetic field along the X axis |
| magneticFieldY | double | no    | 0  | geomagnetic field along the Y axis |
| magneticFieldZ | double | no    | 0  | geomagnetic field along the Z axis |


### The data model for geolocation
Work in progress.

### The data model for `TemperatureSensor`
The `reading` property of the `TemperatureSensor` object is a dictionary that contains the following properties that represent the temperature given in Celsius, Kelvin, and Fahrenheit:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| celsius    | double | no    | 0  | temperature in Celsius |
| fahrenheit | double | no    | 0  | temperature in Fahrenheit |
| kelvin     | double | no    | 0  | temperature in Kelvin |


## The Web IDL of [W3C Generic Sensor](https://w3c.github.io/sensors/#the-sensor-interface)

<a name="sensor">
```javascript
interface Sensor : EventTarget {
  readonly attribute SensorState state;
  readonly attribute SensorReading? reading;
  void start();
  void stop();
  attribute EventHandler onchange;
  attribute EventHandler onstatechange;
  attribute EventHandler onerror;
};

dictionary SensorOptions {
  double? frequency;
};

enum SensorState {
  "idle",
  "activating",
  "active",
  "errored"
};

interface SensorReading {
  readonly attribute DOMHighResTimeStamp timeStamp;
};

[Constructor(DOMString type, SensorReadingEventInit eventInitDict)]
interface SensorReadingEvent : Event {
  readonly attribute SensorReading reading;
};

dictionary SensorReadingEventInit : EventInit {
  SensorReading reading;
};

```
