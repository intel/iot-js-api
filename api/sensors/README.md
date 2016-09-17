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
    attribute EventHandler<Sensor> onsensorconnected;
    attribute EventHandler<Sensor> onsensordisconnected;
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
