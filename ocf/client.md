Client API
==========

- The [OcfClient](#ocfclient) object
  * The [Destination](#destination) dictionary
  * The [Resource](#resource) dictionary
  * The [ClientResource](#clientresource) interface

Introduction
------------
<a name="ocfclient"></a>
The OCF Client API implements CRUDN (Create, Retrieve, Update, Delete, Notify) functionality that enables remote access to resources on the network, as well as OCF discovery.

|Property    |Type     |Optional |Default value |
| ---        | ---     | ---     | ---          |
| `device`   | [`OcfDevice`](./README.md/#ocfdevice) object | no | implementation provided |

| Event name                          | Event callback argument |
| ---                                 | ---                     |
| [`platformfound`](#onplatformfound) | [`Platform`](./README.md/#platform) object |
| [`devicefound`](#ondevicefound)     | [`Device`](./README.md/#device) object |
| [`devicelost`](#ondevicelost)       | [`Device`](./README.md/#device) object |
| [`resourcefound`](#onresourcefound) | [`ClientResource`](#clientresource) object |
| [`error`](#onerror)                 | [`Error`](../README.md/#ocferror) object |

| Discovery method signature                     | Description                |
| ---                                            | ---                        |
| [`getPlatformInfo(deviceId)`](#getplatforminfo)  | fetch platform information |
| [`getDeviceInfo(deviceId)`](#getdeviceinfo)      | fetch device information   |
| [`findPlatforms(listener)`](#findplatforms)      | discover platforms         |
| [`findDevices(listener)`](#finddevices)          | discover devices           |
| [`findResources(options, listener)`](#findresources) | discover resources     |

| Client method signature              | Description                |
| ---                                  | ---                        |
| [`create(target, resource)`](#create)                  | create a resource |
| [`retrieve(destination, options, listener)`](#retrieve) | retrieve/observe a resource |
| [`update(resource)`](#update)                          | update a resource |
| [`delete(destination)`](#delete)                        | delete a resource |
| [`configure(destination, options)`](#configure)           | configure a remote device |

## Structures
<a name="endpoint"></a>
### 1.1. The `Endpoint` dictionary
Identifies an endpoint of an OCF resource. This is the address of the resource on the local network given as an [origin](https://url.spec.whatwg.org/#origin) string, and a priority value.

| Property | Type | Optional | Default value | Represents |
| ---   |---    |---   |---   |---   |
| `origin` | string | no | "" | origin of the resource |
| `priority` | number | no | 1 | priority of the endpoint |

<a name="destination"></a>
### 1.2. The `Destination` dictionary
Identifies an OCF resource by the UUID of the device that hosts the resource, and the URI path of the resource that uniquely identifies the resource inside a device.

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---     |
| `deviceId` | string | no       | `undefined`   | UUID of the device |
| `resourcePath` | string | no       | `undefined`   | URI path of the resource |
| `destination` | Endpoint | yes | `undefined` | endpoint to use for request |

<a name="resourcelink"></a>
### 1.3. The `ResourceLink` dictionary
Extends `Destination`. Represents an OCF resource Link used in Collections.

| Property        | Type    | Optional | Default value | Represents |
| ---             | ---     | ---      | ---           | ---     |
| `resourceTypes` | array of strings | no    | `[]` | List of OCF resource types |
| `interfaces`    | array of strings | no    | `[]` | List of supported interfaces |
| `discoverable`  | boolean | no    | `true` | Whether the resource is discoverable |
| `observable`    | boolean | no    | `true` | Whether the resource is observable |
| `ins`           | string  | yes   | `undefined` | Immutable instance identifier of a link  |

The `discoverable` and `observable` properties come from the `p` (policy) property of a Web Link.

<a name="resource"></a>
### 1.4. The `Resource` dictionary
Extends `Destination`. Used for creating and registering resources, exposes the properties of an OCF resource. All properties are read-write.

| Property        | Type    | Optional | Default value | Represents |
| ---             | ---     | ---      | ---           | ---     |
| `resourceTypes` | array of strings | no    | `[]` | List of OCF resource types |
| `interfaces`    | array of strings | no    | `["oic.if.baseline"]` | List of supported interfaces |
| `mediaTypes`    | array of strings | no    | `[]` | List of supported Internet media types |
| `discoverable`  | boolean | no    | `true` | Whether the resource is discoverable |
| `observable`    | boolean | no    | `true` | Whether the resource is observable |
| `endpoints`     | array of strings | no    | `[endpoint]` | List of resource [endpoints](#endpoint) |
| `links`         | array of ResourceLink | no    | `undefined` | Collection of links |
| `secure`        | boolean | no    | `true` | Whether the resource is secure |
| `slow`          | boolean | yes   | `false` | Whether the resource is constrained |
| `properties`    | object | yes    | `undefined` | Resource representation properties as described in the data model |

 The `properties` property is a resource representation object that contains resource-specific properties and values usually described in the [RAML data model](http://www.oneiota.org/documents?filter%5Bmedia_type%5D=application%2Framl%2Byaml) definition of the resource.

 The `links` property, when present, means the resource is an OCF Collection resource that contains zero or more [RFC5988 Web Links](https://tools.ietf.org/html/rfc5988) represented by the [`ResourceLink`](#resourcelink) dictionary.

 Either the `properties` or the `links` property MUST be defined.

 The `interfaces` property MUST at least contain `"oic.if.baseline"`.

 The `endpoints` property is an array of strings. Each string is a URI consisting of an origin (scheme and authority). It MUST contain at least one [endpoint](#endpoint).

<a name="clientresource"></a>
### 1.5. The `ClientResource` object
#### `ClientResource` properties
`ClientResource` extends `Resource`. It has all the properties of [`Resource`](#resource), and in addition it has events.

Note that applications should not create `ClientResource` objects, as they are created and tracked by implementations. Applications can create and use `Destination` and `Resource` objects as method arguments, but client-created `ClientResource` objects are not tracked by implementations and will not receive events.

#### `ClientResource` events
`ClientResource` objects support the following events:

| Event name | Event callback argument |
| -----------| ----------------------- |
| `update`   | partial `Resource` dictionary |
| `delete`   | `Destination` dictionary |

<a name="onresourceupdate"></a>
The `update` event is fired on a `ClientResource` object when the implementation receives an OCF resource update notification because the resource representation has changed. The event listener receives a dictionary object that contains the resource properties that have changed. In addition, the resource property values are already updated to the new values when the event is fired.

The recommended way to observe and unobserve resources from applications is by using the [`retrieve()`](#retrieve) method, in order to be able to specify OCF retrieve options. However, for convenience, when the first listener function `listener` is added to the `update` event of `resource`, implementations SHOULD call [`retrieve(resource, null, listener)`](#retrieve). When the last listener is removed, the implementations SHOULD call [`retrieve(resource)`](#retrieve), i.e. make an OCF retrieve request with the observe flag off.

<a name="onresourcelost"></a>
The `delete` event is fired on a `ClientResource` object when the implementation gets notified about the resource being deleted or unregistered from the OCF network. The event listener receives a dictionary object that contains the `deviceId` and `resourcePath` of the deleted resource.

## 2. Events
The Client API supports the following events.

<a name="onplatformfound"></a>
##### 2.1. The `platformfound` event
Fired when a platform is discovered. The event callback receives as argument a [`Platform`](./README.md/#platform) object.
```javascript
client.on('platformfound', function(platform) {
  console.log("Platform found with id: " + platform.id);
});
```
<a name="ondevicefound"></a>
##### 2.2. The `devicefound` event
Fired when a device is discovered. The event callback receives as argument a [`Device`](./README.md/#device) object.
```javascript
client.on('devicefound', function(device) {
  console.log("Device found with id: " + device.uuid);
});
```
<a name="ondevicelost"></a>
##### 2.3. The `devicelost` event
Fired when a device is lost. The event callback receives as argument a [`Device`](#./README.md/#device) object.
```javascript
client.on('devicelost', function(device) {
  console.log("Device disappeared: " + device.uuid);
});
```
When the first listener is added to the `ondevicefound` or the `ondevicelost` event, implementations SHOULD enable [watching device status](#devicestatus), if supported by the underlying platform.

When the last listener is removed from the `ondevicefound` and the `ondevicelost` event, implementations SHOULD disable watching device status.

<a name="devicestatus"></a>
__Implementation Note__
The mechanism used for watching device status depends on the underlying native stack. According to the OCF Core Specification, presence (using the `/oic/ad` resource) is not supported any longer, but e.g. [iotivity](https://www.iotivity.org/) still supports it. So implementations MAY use the presence related mechanisms provided by the native stack, but this will work only with devices that run on the same underlying native stack.

<a name="onresourcefound"></a>
##### 2.4. The `resourcefound` event
Fired when a resource is discovered. The event callback receives as argument a [`ClientResource`](#clientresource) object.
```javascript
client.on('resourcefound', function(resource) {
  console.log("Resource found with path: " + resource.resourcePath);
});
```

<a name="onerror"></a>
##### 2.5. The `error` event

Fired when there is a protocol error about which the application needs to know. The `Event` object contains an `error` property whose value is an [`OcfError`](./README.md/#ocferror) object.

```javascript
client.on('error', function(error) {
  if (error.deviceId)
    console.log("Error for device: " + error.deviceId);
});
```

## 3. Discovery Methods
<a name="getplatforminfo"></a>
##### 3.1. The `getPlatformInfo(deviceId)` method
Fetches a remote platform information object.  The `deviceId` argument is a string that contains an OCF device UUID. The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a direct discovery request `GET /oic/p` with the given `deviceId` (which can be either a device UUID or a device URL, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with a [`Platform`](./README.md/#platform) object created from the response.

<a name="getdeviceinfo"></a>
##### 3.2. The `getDeviceInfo(deviceId)` method
Fetches a remote device information object. The `deviceId` argument is a string that contains an OCF device UUID. The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a direct discovery request `GET /oic/d` with the given `deviceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with a [`Device`](./README.md/#device) object created from the response.

<a name="findplatforms"></a>
##### 3.3. The `findPlatforms(listener)` method
- Initiates a platform discovery network operation.
- Returns a [`Promise`](./README.md/#promise) object.
- The `listener` argument is optional, and is an event listener for the [`platformfound`](#onplatformfound) event that receives as argument a [`Platform`](./README.md/#platform) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a multicast request for retrieving `/oic/p` and wait for the answer.
- If sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- If the `listener` argument is specified, add it as a listener to the ['platformfound'](#onplatformfound) event.
- When a platform is discovered, fire a `platformfound` event that contains a property named `platform`, whose value is a [`Platform`](./README.md/#platform) object.

<a name="finddevices"></a>
##### 3.4. The `findDevices(options, listener)` method
- Initiates a device discovery network operation.
- Returns a [`Promise`](./README.md/#promise) object.
- The `options` parameter is optional, and its value is an object that contains one or more of the following properties:

| Property        | Type       | Optional | Default value | Represents      |
| ---             | ---             | --- | ---           | ---             |
| `deviceTypes`   | array of string | yes | `undefined`   | OCF device type |
| `resourceTypes` | array of string | yes | `undefined`   | OCF resource type |

- The `listener` argument is optional, and is an event listener for the [`devicefound`](#ondevicefound) event that receives as argument a [`Device`](./README.md/#device) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
  - If `options.deviceTypes` is an array, include every string element in the `rt` parameter in a new OCF discovery request.
- Send the OCF discovery request and wait for the answer.
- If sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- If the `listener` argument is specified, add it as a listener to the [`devicefound`](#ondevicefound) event.
- When a device is discovered, fire a `devicefound` event that contains a property named `device`, whose value is a [`Device`](./README.md/#device) object.

<a name="findresources"></a>
##### 3.5. The `findResources(options, listener)` method
- Initiates a resource discovery network operation.
- Returns a [`Promise`](./README.md/#promise) object.
- The `options` parameter is optional, and its value is an object that contains one or more of the following properties:

| Property        | Type   | Optional | Default value | Represents        |
| ---             | ---    | ---      | ---           | ---               |
| `deviceId`      | string | yes      | `undefined`   | OCF device UUID   |
| `deviceTypes`   | array of string | yes | `undefined` | OCF device type |
| `resourceTypes` | array of string | yes | `undefined` | OCF device type |
| `resourcePath`  | string | yes      | `undefined`   | OCF resource path |
| `timeout`       | number | yes      | `undefined`   | Timeout for discovery |

- The `listener` argument is optional, and is an event listener for the [`resourcefound`](#onresourcefound) event that receives as argument a [`ClientResource`](#clientresource) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Configure an OCF resource discovery request as follows:
  - If `options.deviceId` is specified, make a direct resource discovery request to that device
  - If `options.deviceTypes` is an array, include every string element in the `rt` parameter in a new OCF discovery request.
  - If `options.resourceTypes` is an array, include every string element in the `rt` parameter in the OCF resource discovery request.
  - If `options.resourcePath` is specified, filter results locally.
  - If the `listener` argument is specified, add it as a listener to the [`resourcefound`](#resourcefound) event.
- If `timeout` is a positive number, start a timer with `timeout`. When it expires, discard any further discovery responses matching this query.
- Execute the following sub-steps:
  * Send the OCF discovery request.
  * If sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
  * Wait for discovery responses. If there is an error during the discovery protocol, fire an `error` event. Whenever a resource `resource` is discovered, fire the [`resourcefound`](#resourcefound) event with `resource` as an argument to the listener function.

<a name="client-methods"></a>
## 4. Client methods
<a name="create"></a>
##### 4.1. The `create(target, resource)` method
- Creates a remote resource on a given device, and optionally specifies a target resource that is supposed to create the new resource. The device's [`oncreate`](./server.md/#oncreate) event handler takes care of dispatching the request to the target resource that will handle creating the resource, and responds with the created resource, or with an error.
- Returns a [`Promise`](./README.md/#promise) object which resolves with a [Resource](#resource) object.
- The optional `target` argument is a [Destination](#destination) object that contains at least a device UUID and a resource path that identifies the target resource responsible for creating the requested resource.
- The `resource` argument is a [Resource](#resource) object. It should contain at least the properties that don't have default values in the [resource registration steps](./server.md/#register): `resourcePath` and `resourceTypes`.

The method sends a request to the device specified in `target` and the device's `create` event handler takes care of creating the resource and replying with the created resource, or with an error.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If `target` is not specified, let `target.deviceId` be `resource.deviceId` and `target.resourcePath` be `null`.
- If `target.deviceId` is `undefined`, reject `promise` with `TypeError`.
- Send a request to create the resource described by `resource` to the device specified by `target.deviceId` and the target resource on the device specified by `target.resourcePath`. Wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="retrieve"></a>
##### 4.2. The `retrieve(destination, options, listener)` method
- Retrieves a resource based on resource id by sending a request to the destination specified in `destination`. The device's [`retrieve`](./server.md/#onretrieve) event handler takes care of fetching the resource representation and replying with the created resource, or with an error.
- Returns a [`Promise`](./README.md/#promise) object which resolves with a [Resource](#resource) object.
- The `destination` argument is a [Destination](#destination) object that contains a device UUID, a resource path, and an optional [endpoint](#endpoint). Note that any [`Resource`](#resource) object can also be provided.
- The `options` argument is optional, and it is an object whose properties represent the `REST` query parameters passed along with the `GET` request as a JSON-serializable dictionary. Implementations SHOULD validate this client input to fit OCF requirements. The semantics of the parameters are application-specific (e.g. requesting a resource representation in metric or imperial units). Similarly, the properties of an OIC resource representation are application-specific and are represented as a JSON-serializable dictionary.
- The `listener` argument is optional, and is an event listener for the `ClientResource` [`update`](#onresourceupdate) event that is added on the returned [`ClientResource`](#resource) object.
In the OCF retrieve request it is possible to set an `observe` flag if the client wants to observe changes to that resource (and get a retrieve response with a resource representation for each resource change).
If a listener is provided, the OCF observe flag is turned on, otherwise it is turned off. If implementations need to make internal retrieve requests, the value of the OCF observe flag SHOULD be preserved unless there have been errors and observing is turned off.

The `options` argument usually contains the interface the retrieve method if called on, denoted by the `if` property.
For instance,
```javascript
client.retrieve({ deviceId: "xxx", resourceId: "/light/room/1"}, options: { if: "oic.if.ll"; });
```
retrieves the collection of lights from room 1. Note that the `/light/room/1` resource may contain more than one interface in its `interfaces` property, and the `options` argument needs to specify which interface of the resource should be used with the retrieve operation. By default, the resource definition defines the default interface for an operation. If not specified, the `oic.if.baseline` is used.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Let `observe` be `null`.
- If the `listener` argument is specified, add it as a listener to the `ClientResource` [`update`](#onresourceupdate) event, and set `observe` to `true`.
- Let `resource` be the resource identified by `destination`.
- Send a request to retrieve the resource specified by `destination` with the OCF `observe` flag set to the value of `observe`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- If `observe` is `false`, resolve `promise` with `resource` updated from the retrieve response.
- Otherwise, if `observe` is `true`, for each OCF retrieve response received for resource representation change while `resource` is being observed, update `resource` with the new values, and fire the `ClientResource` [`update`](#onresourceupdate) event on `resource`, providing the event listener an object that contains the resource properties that have changed, in addition to `resourcePath` and `deviceId`.
- If there is an OCF protocol error during observation, fire an [`error`](#onerror) event with a new [`OcfObserveError`](../README.md/#ocferror) object `error` with `error.deviceId` set to the value of `destination.deviceId`, `resourcePath` set to the value of `destination.resourcePath`, and, if `destination.endpoint` was set, then `endpoint` set to `destination.endpoint`.

<a name="update"></a>
##### 4.3. The `update(resource)` method
- Updates a resource on the network by sending a request to the device specified by `resource.deviceId`. The device's [`update`](./server.md/#onupdate) event handler takes care of updating the resource and replying with the updated resource, or with an error. The resource identified by `resource` is updated. The `resource` may be augmented with the optional `endpoint` property to provide a destination to which the request is to be addressed.
- Returns: a [`Promise`](./README.md/#promise) object.
- The `resource` argument is a [Resource](#resource) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to update the resource specified by `resource` with the properties present in `resource`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="delete"></a>
##### 4.4. The `delete(destination)` method
- Deletes a resource from the network by sending a request to the destination specified in `destination`. The device's [`delete`](./server.md/#ondelete) event handler takes care of deleting (unregistering) the resource and reporting success or error.
- Returns: a [`Promise`](./README.md/#promise) object.
- The `destination` argument is a [Destination](#destination) object that contains a device UUID, a resource path that identifies the resource to be deleted, and an optional [endpoint](#endpoint) to which the request will be directed.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to delete the resource specified by `destination`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="configure"></a>
##### 4.5. The `configure(deviceId, options)` method
Configures a remote device using its `/oic/con` resource with the properties defined by the `options` argument. The following properties are supported:

|Property            |Type     |Optional |Default value |Represents |
| ---                | ---     | ---     | ---          | ---       |
| `deviceName`       | string  | no      | `undefined`  | User provided device name |
| `location`         | a [`Coordinates`](https://www.w3.org/TR/geolocation-API/#coordinates_interface) object | yes | `undefined` | Device coordinates |
| `locationName`     | string  | yes     | `undefined` | User provided location name |
| `region`           | string  | yes     | `undefined` | User provided region name |
| `currency`         | string  | yes     | `undefined` | User provided currency name |

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If `options` is not a dictionary, or `options.deviceName` is not a string, reject `promise` with `TypeError` and abort these steps.
- Send a request to update the `/oic/con` resource on the device specified by the `deviceId` argument with the dictionary specified by `options` argument, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.
