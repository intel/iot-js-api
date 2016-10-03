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

There are changes on how `Sensor` objects are obtained. In this API `Sensor objects are not constructed, but exposed via the [`Board`](../board/README.md) object. Also, this API lists all sensors of a given type, not only the default one. Also, this API adds two more properties to the `Sensor` object, for exposing a sensor name, and the name of the hardware controller. In rest, the sensor interfaces are the same.

## Web IDL for Sensor APIs
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
};

// Using the 'instanceof' type names for the W3C sensor types.
enum SensorType {
    "AmbientLightSensor",
    "Accelerometer",
    "GeolocationSensor",
    "Gyroscope",
    "Magnetometer",
    "ProximitySensor"
};
```

The Web IDL of [Generic Sensor](https://w3c.github.io/sensors/#the-sensor-interface) is the following:
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
Various sensors may add properties to [`Sensor`](#sensor), or to its `reading` property of type `SensorReading`.

###  The data model for lightmeter
The `reading` property of the sensor is a dictionary that contains a new property named `illuminance` that is a floating point number and represents the current light level (illuminance) measured in lux.

### The data model for proximity sensor
The `reading` property of the sensor is a dictionary that contains the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| distance   | double | no       | undefined     | distance to object in cm |
| max        | double | no       | undefined     | sensing range in cm      |
| near       | boolean | no      | undefined     | if object in proximity   |

### The data model for accelerometer
The `reading` property of the sensor is a dictionary that contains the following properties:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| accelerationX | double | no    | undefined  | acceleration along the X axis |
| accelerationY | double | no    | undefined  | acceleration along the Y axis |
| accelerationZ | double | no    | undefined  | acceleration along the Z axis |

The sensor contains one more additional property named `includesGravity` of type `boolean`. If it is `false`, then the `reading` property stores linear acceleration values (that don't take into account gravity).

### The data model for gyroscope
The `reading` property of the sensor is a dictionary that contains the following properties that represent the current angular velocity around the X, Y or Z axis, expressed in radians per second:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| rotationRateX | double | no    | 0  | angular velocity along the X axis |
| rotationRateY | double | no    | 0  | angular velocity along the Y axis |
| rotationRateZ | double | no    | 0  | angular velocity along the Z axis |

### The data model for magnetometer
The `reading` property of the sensor is a dictionary that contains the following properties that represent the geomagnetic field force around the X, Y or Z axis, expressed in microTesla units:

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---        |
| magneticFieldX | double | no    | 0  | geomagnetic field along the X axis |
| magneticFieldY | double | no    | 0  | geomagnetic field along the Y axis |
| magneticFieldZ | double | no    | 0  | geomagnetic field along the Z axis |


### The data model for geolocation
Work in progress.
