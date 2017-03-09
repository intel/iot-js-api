OCF Web API
===========

* [OCF API object](#api-entry-point)
  - [OCF Client API](./client.md)
  - [OCF Server API](./server.md)
* The [OcfDevice](#ocfdevice) dictionary
* The [OcfPlatform](#ocfplatform) dictionary
* The [OcfError](#ocferror) interface
* [Web IDL](./webidl.md)
* [Examples](./examples.md)

Introduction
------------
This document presents a JavaScript API for the [OCF](https://openconnectivity.org) [Core Specification](https://openconnectivity.org/resources/specifications) version 1.1.0.

The OCF provides
  - the specification for the Core Framework for OCF core architecture, interfaces, protocols and services to enable the implementation of OCF profiles for IoT usages

  - Application Profiles Specification documents for the OCF profiles to enable IoT usages for different market segments such as home, industrial, healthcare, and automotive.

In OCF terminology, multiple providers and solutions can share a physical hardware *platform*. A platform may host multiple physical or virtual *devices*.
Devices are addressable endpoints of communication, and run the OCF software stack. A device may host multiple physical or virtual *resources*. A resource represents *sensors* and *actuators*.

A given sensor or actuator is represented by resource properties. A read-only resource property represents a sensorial input, whereas a read-write property represents the state of an actuator.

Resources can be accessed remotely, and can notify subscribers with data and state changes. The resources act as servers, and communication may involve different protocols like CoAP or HTTP. Resources may also be represented by devices that translate between resource-specific and standard protocols. These devices are called *gateways*, or OCF *intermediary devices*.

The devices support installable software modules called *applications*. This API is exposed on an OCF device and enables writing applications that implement resources and related business logic.

This version of the API supports OCF Resource, Device, and Platform related functionality. OCF Collections, Links and Scenes are not yet supported.

Since implementations may run on constrained hardware, examples use [ECMAScript 5.1](http://www.ecma-international.org/ecma-262/5.1/).

The API object
--------------
The API object is exposed in a platform-specific manner. As an example, on Node.js it can be obtained by requiring the package that implements this API. On other platforms, it can be exposed as a property of a global object.

```javascript
let module = 'ocf';  // use your own implementation's name
var ocf = require(module);
```
If the functionality is not supported by the platform, `require` should throw `NotSupportedError`. If there is no permission for using the functionality, `require` should throw `SecurityError`.

When `require` is successful, it MUST return an object with the following read-only properties:
- `client` is an object that implements the [OCF Client API](./client.md), i.e. CRUDN (Create, Retrieve, Update, Delete, Notify) functionality:
  * remote access to resources on the network,
  * listening to presence notifications in the OCF network, and
  * discovery for platforms, devices and resources on the OCF network.
- `server` is an object that implements the [OCF Server API](./server.md), i.e. the functionality to serve CRUDN requests on a device, to register and unregister resources, to notify of resource changes, and to enable and disable presence functionality on the device.
- `device` is an [`OcfDevice`](#ocfdevice) object that represents properties of the current device.
- `platform` is an [`OcfPlatform`](#ocfplatform) object that represents properties of the platform that hosts the current device.

|Property   |Type     |Optional |Default value |
| ---       | ---     | ---     | ---          |
| `client`  | [OcfClient](./client.md#ocfclient) object | no | platform provided |
| `server`  | [OcfServer](./server.md#ocfserver) object | no | platform provided |
| `device`  | [OcfDevice](#ocfdevice) object | no | platform provided |
| `platform` | [OcfPlatform](#ocfplatform) object | no | platform provided |

<a name="ocfdevice"></a>
### The `OcfDevice` object
Exposes information about the OCF device that runs the current OCF stack instance. All properties are read-only. Future versions of this specification will support configuring some of the values.

|Property           |Type     |Optional |Default value |Represents |
| ---               | ---     | ---     | ---          | ---       |
| `uuid`            | string  | no      | `undefined` | UUID of the device |
| `url`             | string  | yes     | `undefined` | host:port  |
| `name`            | string  | yes     | `undefined` | Name of the device |
| `types`           | array of strings  | no  | `[]` | List of supported OCF device types |
| `dataModels`      | array of strings  | no  | `[]` | List of supported OCF data models |
| `coreSpecVersion` | string  | no  | `undefined` | OCF Core Specification version |

The `types` property is a list of the OCF Device types that are supported. It comforms to the same syntax constraints as [resource](./client.md/#resource) types. OCF mandates that every device supports at least the properties defined in the `"oic.wk.d"` resource type, that represents a resource for a "basic device". Other specifications, such as the OCF Smart Home Device Specification can define more device types, for instance `"oic.d.fan"`, `"oic.d.thermostat"`, `"oic.d.light"`, `"oic.d.airconditioner"`, etc. The properties exposed by these device types are defined in [oneiota.org](http://wwww.oneiota.org). [Device discovery](./client.md/#finddevices) may use filters based upon device types.

The `dataModels` property is in the following format: `vertical.major.minor` where `major` and `minor` are numbers and `vertical` is a string such as `"Smart Home"`.

<a name="ocfplatform"></a>
### The `OcfPlatform` object
Exposes information about the OCF platform that hosts the current device.

|Property            |Type     |Optional |Default value |Represents |
| ---                | ---     | ---     | ---          | ---       |
| `id`               | string  | no  | `undefined` | Platform identifier |
| `osVersion`        | string  | yes  | `undefined` | OS version  |
| `model`            | string  | yes  | `undefined` | Model of the hardware |
| `manufacturerName` | string  | no  | `undefined` | Manufacturer name |
| `manufacturerURL`  | string  | no  | `undefined` | Manufacturer web page |
| `manufacturerDate` | Date    | no  | `undefined` | Manufacturing date |
| `platformVersion`  | string  | no  | `undefined` | Platform version |
| `firmwareVersion`  | string  | no  | `undefined` | Firmware version |
| `supportURL`       | string  | no  | `undefined` | Product support web page |

<a name="ocferror"></a>
### Error handling

Errors during OCF network operations are exposed via `onerror` events and `Promise` rejections.

OCF errors (see also [these notes](../README.md#errors)) are represented as augmented instances of [`Error`](https://nodejs.org/api/errors.html#errors_class_error) objects.

The following [`Error` names](https://nodejs.org/api/errors.html) are used for signaling OCF issues:
- `OcfResourceNotFound` used if the resource cannot be located in the OCF network, or when an observed resource is deleted from the network.
- `OcfDeviceNotFound` used if the device id cannot be located in the OCF network.
- `OcfDiscoveryError` for generic discovery related errors
- `OcfObserveError` for generic observe related errors that are not covered by `OcfResourceNotFound`.
- `OcfResourceError` for other resource related errors.
- `OcfDeviceError` for other device related errors.

The OCF error objects MAY contain two additional optional properties.

| Property       | Type   | Optional | Default value | Represents |
| ---            | ---    | ---      | ---           | ---     |
| `deviceId`     | string | yes      | `undefined`   | UUID of the device |
| `resourcePath` | string | yes      | `undefined`   | URI path of the resource |

- The `deviceId` property is a string that represents the device UUID causing the error. The value `null` means the local device, and the value `undefined` means the error source device is not available.
- The `resourcePath` property is a string that represents the resource path of the [resource](./client.md/#resource) causing the error. If `deviceId` is `undefined`, then the value of `resourcePath` should also be set to `undefined`.
- The `message` property is inherited from `Error`.

The constructor of `OcfDiscoveryError`, `OcfObserveError` and `OcfPresenceError` takes the following parameters:
- the `message` parameter is a string representing an error message, as with `Error`
- the `deviceId` parameter instantiates the `deviceId` property
- the `resourcePath` parameter instantiates `the resourcePath`.

If `deviceId` is defined, and `resourcePath` is `undefined` or `null`, it means the error is device-specific without being specific to the resource (such as errors realted to device presence).

```javascript
let message = "OCF error";
let deviceId = "0685B960-736F-46F7-BEC0-9E6CBD61ADC1";
let resourcePath = "/myroom/a/light/1";
var err = new OcfObserveError(message, deviceId, resourcePath);
// use `err` in a server response
```

Implementations SHOULD handle the `uncaughtException` event on the process object.

Notes
------

The API uses [Promises](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects) with [these notes](../README.md#promise).

The API uses Node.js-style [events](https://nodejs.org/api/events.html#events_events) with [these notes](../README.md#events).

Code using this API is deployed to a device which exposes one or more resources. In this version of the API it is assumed that the execution context of the code is separated for each device.

**Device identification** is UUID.

**Resource identification** is URL path, relative to a given device. A URL composed of the ```oic``` scheme, the device ID as host and the resource path can also be used for identifying a resource: ```oic://<deviceID>/<resourcePath>```. However, this specification uses the device ID and resource ID separately.

**Device discovery** uses endpoint discovery, that is, a multicast request "GET /oic/res" to "All CoAP nodes" (```224.0.1.187``` for IPv4 and ```FF0X::FD``` for IPv6, port 5683). The response lists devices and their resources (at least URI, resource type, interfaces, and media types).

OCF defines special resources on each device, for implementing device discovery, resource discovery, platform discovery, presence, etc. API implementations should encapsulate handling these special resources and the hardcoded/fixed URIs.

This version of the API supports the OCF Core Specification version 1.0 (final) and 1.1.0 (draft), except that it does not yet support OCF resource *links*, *scenes*, *rules* and *scripts*.
