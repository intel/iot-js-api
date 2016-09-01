OCF Web API
===========

* [Introduction](#introduction)
* [OCF API object](#api-entry-point)
  - [OCF Client API](./client.md)
  - [OCF Server API](./server.md)
* [Web IDL](./webidl.md)
* [Examples](./examples.md)

Introduction
------------
This document presents a JavaScript API for [OCF](https://openconnectivity.org) [Core Specification](https://openconnectivity.org/resources/specifications) version 1.0 (final) and 1.1.0 (draft).

Since implementations may run on constrained hardware, examples use [ECMAScript 5.1](http://www.ecma-international.org/ecma-262/5.1/).

The OCF specifies
  - the Core Framework for OCF core architecture, interfaces, protocols and services to enable OCF profiles implementation for IoT usages

  - Application Profiles Specification documents specify the OCF profiles to enable IoT usages for different market segments such as home, industrial, healthcare, and automotive.

In OCF terminology, multiple providers and solutions can share a physical hardware *platform*. A platform may host multiple physical or virtual *devices*.
Devices are addressable endpoints of communication, and run the OCF software stack. A device may host multiple physical or virtual *resources*.
A resource represents *sensors* and *actuators*.
A given sensor or actuator is represented by resource properties. A read-only resource property represents a sensorial input, whereas a read-write property represents the state of an actuator.
Resources can be accessed remotely, and can notify subscribers with data and state changes. The resources act as servers, and communication may involve different protocols. Resources may also be represented by devices that translate between resource-specific and standard protocols. These devices are called *gateways*, or OCF *intermediary devices*.

The devices support installable software modules called *applications*. This API is exposed on an OCF device and enables writing the applications that implement resources and business logic.

## API entry point
The API object is exposed in a platform specific manner. As an example, on Node.js it can be obtained by requiring the package that implements this API. On other platforms, it can be exposed as a property of a global object.

```javascript
let module = 'ocf';  // use your own implementations' name
var ocf = require(module);
```

When `require` is successful, it MUST return an object with the following read-only properties:
- `client` is an object that implements the [OCF Client API](./client.md).
- `server` is an object that implements the [OCF Server API](./server.md)
- `device` is an [`OcfDevice`](#ocfdevice) object that represents properties of the current device
- `platform` is an [`OcfPlatform`](#ocfplatform) object that represents properties of the platform that hosts the current device.

The Client API implements CRUDN (Create, Retrieve, Update, Delete, Notify) functionality, enabling remote access to resources in the network. Also, it enables listening to presence notifications in the OCF network. Also, it implements discovery for platforms, devices and resources in the OCF network.

The Server API implements functionality to serve CRUDN requests in a device. Also, it provides means to register and unregister resources, to notify resource changes, and to enable and disable presence functionality on the device.

## Structures

<a name="ocfdevice"></a>
### The `OcfDevice` object
Exposes information about the OCF device that runs the current OCF stack instance.

|Property   |Type     |Optional |Default value |Represents |
| ---       | ---                  | --- | ---         | ---     |
| `uuid`    | string  | no  | `undefined` | UUID of the device |
| `url`     | string  | yes  | `undefined` | host:port  |
| `name`    | string  | yes  | `undefined` | Name of the device |
| `dataModels` | array of strings  | no  | `[]` | List of supported OCF data models |
| `coreSpecVersion`    | string  | no  | `undefined` | OCF Core Specification version |

The `dataModels` property is in the following format: `vertical.major.minor` where `major` and `minor` are numbers and `vertical` is a string such as `"Smart Home"`.

<a name="ocfplatform"></a>
### The `OcfPlatform` object
Exposes information about the OCF platform that hosts the current device.

|Property   |Type              |Optional |Default value |Represents |
| ---       | ---                  | --- | ---         | ---     |
| `id`      | string  | no  | `undefined` | Platform identifier |
| `osVersion` | string  | yes  | `undefined` | OS version  |
| `model`    | string  | yes  | `undefined` | Model of the hardware |
| `manufacturerName` | string  | no  | `undefined` | Manufacturer name |
| `manufacturerURL` | string  | no  | `undefined` | Manufacturer web page |
| `manufacturerDate` | Date  | no  | `undefined` | Manufacturing date |
| `platformVersion` | string  | no  | `undefined` | Platform version |
| `firmwareVersion` | string  | no  | `undefined` | Firmware version |
| `supportURL` | string  | no  | `undefined` | Product support web page |

<a name="ocferror"></a>
### Error handling

Errors during OCF network operations are exposed via `onerror` events and `Promise` rejections.

OCF errors are represented as augmented [`Error`](https://nodejs.org/api/errors.html#errors_class_error) objects with added properties. The following [`Error` names](https://nodejs.org/api/errors.html) are used for signaling OCF issues:
- `OcfDiscoveryError`
- `OcfObserveError`
- `OcfPresenceError`.

All these errors are instances of [`Error`](https://nodejs.org/api/errors.html#errors_class_error) and contain the following additional properties:

| Property       | Type   | Optional | Default value | Represents |
| ---            | ---    | ---      | ---           | ---     |
| `deviceId`     | string | yes      | `undefined`   | UUID of the device |
| `resourcePath` | string | yes      | `undefined`   | URI path of the resource |

- The `deviceId` property is a string that represents the device UUID causing the error. The value `null` means the local device, and the value `undefined` means the error source device is not available.
- The `resourcePath` property is a string that represents the resource path of the [resource](./client.md/#resource) causing the error. If `deviceId` is `undefined`, then the value of `resourcePath` should be also set to `undefined`.
- The `message` property is inherited from `Error`.

The constructor of `OcfDiscoveryError`, `OcfObserveError` and `OcfPresenceError` take the following parameters:
- the `message` parameter is a string representing an error message, like with `Error`
- the `deviceId` parameter instantiates the `deviceId` property
- the `resourcePath` parameter instantiates `the resourcePath`.

If `deviceId` is defined, and `resourcePath` is `undefined` or `null`, it means the error is device specific without being specific to the resource (such as device presence related errors).

```javascript
let message = "OCF error";
let deviceId = "0685B960-736F-46F7-BEC0-9E6CBD61ADC1";
let resourcePath = "/myroom/a/light/1";
var err = new OcfObserveError(message, deviceId, resourcePath);
// use `err` in a server response
```

Implementations SHOULD handle the `uncaughtException` event on the process object.

<a name="ocfpromise"></a>
### Promises
The API uses [Promises](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects). In constrained implementations, at least the following [`Promise`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects) methods MUST be implemented:
- the [`Promise` constructor](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-constructor)
- the [`then(onFulfilled, onRejected)`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise.prototype.then) method
- the [`catch(onRejected)`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise.prototype.catch) method.

<a name="events"></a>
### Events
The API uses Node.js style [events](https://nodejs.org/api/events.html#events_events) with the [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) interface. In constrained implementations, at least the following subset of the [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) interface MUST be supported:
- the [`on(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener) method
- the [`addListener(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_addlistener_eventname_listener) method, as an alias to the `on()` method
- the [`removeListener(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener) method
- the [`removeAllListeners`](https://nodejs.org/api/events.html#events_emitter_removealllisteners_eventname) method.

## Notes
Code using this API is deployed to a device, which exposes one or more resources. In this version of the API it is assumed that the execution context of the code is separated for each device.

**Device identification** is UUID.

**Resource identification** is URL path, relative to a given device. A URL composed of the ```oic``` scheme, the device ID as host and the resource path can also be used for identifying a resource: ```oic://<deviceID>/<resourcePath>```. However, this specification uses the device ID and resource ID separately.

**Device discovery** uses endpoint discovery: multicast request "GET /oic/res" to "All CoAP nodes" (```224.0.1.187``` for IPv4 and ```FF0X::FD``` for IPv6, port 5683). The response lists devices and their resources (at least URI, resource type, interfaces, and media types).

OCF defines special resources on each device, for implementing device discovery, resource discovery, platform discovery, presence, etc. API implementations should encapsulate handling these special resources and the hardcoded/fixed URIs.

This version of the API supports the OCF Core Specification version 1.0 (final) and 1.1.0 (draft), except that it not yet support OCF resource *links*, *scenes*, *rules* and *scripts*.
