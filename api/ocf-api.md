OCF Web API
===========

* [Introduction](#introduction)
* [OCF API object](#api-entry-point)
* [Web IDL](./ocf-web-idl.md)
* [Examples](./ocf-examples.md)

Introduction
------------
This document presents a JavaScript API for [OCF](https://openconnectivity.org) [Core Specification](https://openconnectivity.org/resources/specifications).

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

```javascript
var ocf = require('ocf');
```

When ```require``` is successful, it MUST return an object with the following read-only properties:
- `client` is an object that implements the [OCF Client API](./ocf-client-api.md) and the [OCF Discovery API](./ocf-discovery-api.md).
- `server` is an object that implements the [OCF Server API](./ocf-server-api.md)
- `device` is an [`OcfDevice`](#ocfdevice) object that represents properties of the current device
- `platform` is an [`OcfPlatform`](#ocfplatform) object that represents properties of the platform that hosts the current device.

Optionally, the API objects may be required separately:

```javascript
var ocf = require('ocf');

var client = require('ocf')('client');  // same as ocf.client
var server = require('ocf')('server');  // same as ocf.server
```

The Client API implements CRUDN (Create, Retrieve, Update, Delete, Notify) functionality, thereby enables remote access to resources in the network. Also, it enables listening to presence notifications in the OCF network. Also, it implements discovery for platforms, devices and resources in the OCF network.

The Server API implements functionality to serve CRUDN requests in a device. Also, it provides means to register and unregister resources, to notify resource changes, and to enable and disable presence functionality on the device.

## Helper objects

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

Notes
-----
<a name="ocfpromise"></a>
This API uses [Promises](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects).

Code using this API is deployed to a device, which exposes one or more resources. In this version of the API it is assumed that the execution context of the code is separated for each device.

**Device identification** is UUID.

**Resource identification** is URL path, relative to a given device. A URL composed of the ```oic``` scheme, the device ID as host and the resource path can also be used for identifying a resource: ```oic://<deviceID>/<resourcePath>```. However, this specification uses the device ID and resource ID separately.

**Device discovery** uses endpoint discovery: multicast request "GET /oic/res" to "All CoAP nodes" (```224.0.1.187``` for IPv4 and ```FF0X::FD``` for IPv6, port 5683). The response lists devices and their resources (at least URI, resource type, interfaces, and media types).


OCF defines special resources on each device, for implementing device discovery, resource discovery, platform discovery, etc. Platform is discoverable by the means of a resource with a fixed URI ```/oic/p```. Similarly, device discovery is supported by a resource with the well known fixed URI of ```/oic/d```, and resources with ```/oic/res```. This API encapsulates these special resources and the hardcoded/fixed URIs by explicit function names and parameters.
