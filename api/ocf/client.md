Client API
==========

- Structures
  * The [ResourceId](#resourceid) dictionary
  * The [Resource](#resource) dictionary
  * The [ClientResource](#clientresource) interface
    - The [update](#onresourceupdate) event
    - The [delete](#onresourcelost) event
- Client events
  * [platformfound](#onplatformfound)
  * [devicefound](#ondevicefound)
  * [devicelost](#ondevicelost)
  * [resourcefound](#onresourcefound)
  * [error](#onerror)
- Discovery methods
  * [getPlatformInfo(deviceId)](#getplatforminfo)
  * [getDeviceInfo(deviceId)](#getdeviceinfo)
  * [findPlatforms(listener)](#findplatforms)
  * [findDevices(listener)](#finddevices)
  * [findResources(options, listener)](#findplatforms)
- Client methods
  * [create(target, resource)](#create)
  * [retrieve(resourceId, options, listener)](#retrieve)
  * [update(resource)](#update)
  * [delete(resourceId)](#delete)

Introduction
------------
The OCF Client API implements CRUDN (Create, Retrieve, Update, Delete, Notify) functionality that enables remote access to resources on the network, as well as OCF discovery.

The Client API object does not expose its own properties, only events and methods.

## Structures
<a name="resourceid"></a>
### 1.1. The `ResourceId` dictionary
Identifies an OCF resource by the UUID of the device that hosts the resource, and the URI path of the resource that uniquely identifies the resource inside a device.

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---     |
| `deviceId` | string | no       | `undefined`   | UUID of the device |
| `resourcePath` | string | no       | `undefined`   | URI path of the resource |


<a name="resource"></a>
### 1.2. The `Resource` dictionary
Extends `ResourceId`. Used for creating and registering resources, exposes the properties of an OCF resource. All properties are read-write.

| Property        | Type    | Optional | Default value | Represents |
| ---             | ---     | ---      | ---           | ---     |
| `resourcePath`  | string  | no       | `undefined`   | URI path of the resource |
| `resourceTypes` | array of strings | no    | `[]` | List of OCF resource types |
| `interfaces`    | array of strings | no    | `[]` | List of supported interfaces |
| `mediaTypes`    | array of strings | no    | `[]` | List of supported Internet media types |
| `discoverable`  | boolean | no    | `true` | Whether the resource is discoverable |
| `observable`    | boolean | no    | `true` | Whether the resource is observable |
| `secure`        | boolean | no    | `true` | Whether the resource is secure |
| `slow`          | boolean | yes   | `false` | Whether the resource is constrained |
| `properties`    | object | yes    | `{}` | Resource representation properties as described in the data model |

 The `properties` property is a resource representation that contains resource-specific properties and values usually described in the [RAML data model](http://www.oneiota.org/documents?filter%5Bmedia_type%5D=application%2Framl%2Byaml) definition of the resource.

<a name="clientresource"></a>
### 1.3. The `ClientResource` object
#### `ClientResource` properties
`ClientResource` extends `Resource`. It has all the properties of [`Resource`](#resource), and in addition it has the following events.

Note that applications should not create `ClientResource` objects, as they are created and tracked by implementations. Applications can create and use `ResourceId` and `Resource` objects as method arguments, but client-created `ClientResource` objects are not tracked by implementations and will not receive events.

#### `ClientResource` events
`ClientResource` objects support the following events:

| Event name | Event callback argument |
| -----------| ----------------------- |
| *update*   | dictionary |
| *delete*   | N/A |

<a name="onresourceupdate"></a>
The `update` event is fired on a `ClientResource` object when the implementation receives an OCF resource update notification because the resource representation has changed. The event listener receives a dictionary object that contains the resource properties that have changed. In addition, the resource property values are already updated to the new values when the event is fired.

<a name="onresourcelost"></a>
The `delete` event is fired on a `ClientResource` object when the implementation gets notified about the resource being deleted or unregistered from the OCF network. This might not be supported in all OCF networks.

## 2. Events
The Client API supports the following events:

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| *platformfound*   | [`Platform`](./README.md/#platform) object |
| *devicefound*     | [`Device`](./README.md/#device) object |
| *devicelost*      | [`Device`](./README.md/#device) object |
| *resourcefound*   | [`ClientResource`](#resource) object |
| *error*           | [`Error`](../README.md/#ocferror) object |

<a name="onplatformfound"></a>
##### 2.1. The `platformfound` event
Fired when a platform is discovered. The event callback receives as argument a [`Platform`](./README.md/#platform) object.
```javascript
client.addListener('platformfound', function(platform) {
  console.log("Platform found with id: " + platform.id);
});
```

<a name="ondevicefound"></a>
##### 2.2. The `devicefound` event
Fired when a device is discovered or when a device appears on the network as a result of enabling its presence. The event callback receives as argument a [`Device`](./README.md/#device) object.
```javascript
client.addListener('devicefound', function(device) {
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

When the first listener is added to the `ondevicefound` or the `ondevicelost` event, implementations SHOULD enable watching device status, if supported by the underlying platform.

When the last listener is removed from the `ondevicefound` and the `ondevicelost` event, implementations SHOULD disable watching device status.

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
Fired when there is a protocol error about which the application needs to know. The `Event` object contains an `error` property whose value is an [`Error`](https://nodejs.org/api/events.html#events_error_events) object with two additional optional properties:
- `deviceId`: a string representing the device UUID that signaled the error
- `resourcePath`: an [`ResourceInit`](#resourceinit) object relevant for the error.

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
##### 3.4. The `findDevices(listener)` method
- Initiates a device discovery network operation.
- Returns a [`Promise`](./README.md/#promise) object.
- The `listener` argument is optional, and is an event listener for the [`devicefound`](#ondevicefound) event that receives as argument a [`Device`](./README.md/#device) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a multicast request for retrieving `/oic/d` and wait for the answer.
- If sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- If the `listener` argument is specified, add it as a listener to the [`devicefound`](#ondevicefound) event.
- When a device is discovered, fire a `devicefound` event that contains a property named `device`, whose value is a [`Device`](./README.md/#device) object.

<a name="findresources"></a>
##### 3.5. The `findResources(options, listener)` method
- Initiates a resource discovery network operation.
- Returns a [`Promise`](./README.md/#promise) object.
- The `options` parameter is optional, and its value is an object that contains one or more of the following properties:

| Property       | Type   | Optional | Default value | Represents        |
| ---            | ---    | ---      | ---           | ---               |
| `deviceId`     | string | yes      | `undefined`   | OCF device UUID   |
| `resourceType` | string | yes      | `undefined`   | OCF resource type |
| `resourcePath` | string | yes      | `undefined`   | OCF resource path |

- The `listener` argument is optional, and is an event listener for the [`resourcefound`](#onresourcefound) event that receives as argument a [`ClientResource`](./README.md/#resource) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Configure an OCF resource discovery request as follows:
  - If `options.deviceId` is specified, make a direct discovery request to that device
  - If `options.resourceType` is specified, include it as the `rt` parameter in a new endpoint multicast discovery request `GET /oic/res` to "All CoAP nodes" (`224.0.1.187` for IPv4 and `FF0X::FD` for IPv6, port `5683`).
  - If `options.resourcePath` is specified, filter results locally.
- If sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- If the `listener` argument is specified, add it as a listener to the [`resourcefound`](#resourcefound) event.
- When a resource is discovered, fire a `resourcefound` event that contains a property named `resource`, whose value is a [`ClientResource`](#resource) object.

<a name="client-methods"></a>
## 4. Client methods
<a name="create"></a>
##### 4.1. The `create(resource, target)` method
- Creates a remote resource on a given device, and optionally specifies a target resource that is supposed to create the new resource. The device's [`oncreate`](./server.md/#oncreate) event handler takes care of dispatching the request to the target resource that will handle creating the resource, and responds with the created resource, or with an error.
- Returns a [`Promise`](./README.md/#promise) object which resolves with a [Resource](#resource) object.
- The optional `target` argument is a [ResourceId](#resourceid) object that contains at least a device UUID and a resource path that identifies the target resource responsible for creating the requested resource.
- The `resource` argument is a [Resource](#resource) object. It should contain at least the following properties (other resource properties may also be specified):

| Property       | Type   | Optional | Default value | Represents            |
| ---            | ---    | ---      | ---           | ---                   |
| `resourcePath` | string | no       | `undefined`   | OCF resource URI path |
| `resourceType` | string | no       | `undefined`   | OCF resource type     |

The method sends a request to the device specified in `target` and the device's `create` event handler takes care of creating the resource and replying with the created resource, or with an error.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If `target` is not specified, let `target.deviceId` be `resource.deviceId` and `target.resourcePath` be `null`.
- Send a request to the OCF network to create the resource described by `resource` to the device specified by `target.deviceId` and the target resource on the device specified by `target.resourcePath`. Wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="retrieve"></a>
##### 4.2. The `retrieve(resourceId, options, listener)` method
- Retrieves a resource based on resource id by sending a request to the device specified in `resourceId.deviceId`. The device's [`retrieve`](./server.md/#onretrieve) event handler takes care of fetching the resource representation and replying with the created resource, or with an error.
- Returns a [`Promise`](./README.md/#promise) object which resolves with a [Resource](#resource) object.
- The `resourceId` argument is a [ResourceId](#resourceid) object that contains a device UUID and a resource path. Note that any [`Resource`](#resource) object can also be provided.
- The `options` argument is optional, and it is an object whose properties represent the `REST` query parameters passed along with the `GET` request as a JSON-serializable dictionary. Implementations SHOULD validate this client input to fit OCF requirements. The semantics of the parameters are application-specific (e.g. requesting a resource representation in metric or imperial units). Similarly, the properties of an OIC resource representation are application-specific and are represented as a JSON-serializable dictionary.
- The `listener` argument is optional, and is an event listener for the `ClientResource` [`update`](#onresourceupdate) event that is added on the returned [`ClientResource`](#resource) object.

In the OCF retrieve request it is possible to set an `observe` flag if the client wants to observe changes to that resource (and get a retrieve response with a resource representation for each resource change).

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Let `observe` be `null`.
- If the `listener` argument is specified, add it as a listener to the `ClientResource` [`update`](#onresourceupdate) event, and set `observe` to `true`.
- Let `resource` be the resource identified by `resourceId`.
- Send a request to retrieve the resource specified by `resourceId` with the OCF `observe` flag set to the value of `observe`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- If `observe` is `false`, resolve `promise` with `resource` updated from the retrieve response.
- Otherwise, if `observe` is `true, for each OCF retrieve response received while `resource` being observed, update `resource` with the new values, and fire the `ClientResource` [`update`](#onresourceupdate) event on `resource`, providing the event listener an object that contains the resource properties that have changed.
- If there are OCF protocol errors during observe, fire an [`error`](#onerror) event with a new [`OcfError`](#ocferror) object `error` with `error.kind` is set to `"observe"`, `error.deviceId` set to the value of `resourceId.deviceId` and `resourcePath` set to the value of `resourceId.resourcePath`.

<a name="update"></a>
##### 4.3. The `update(resource)` method
- Updates a resource on the network by sending a request to the device specified by `resource.deviceId`. The device's [`update`](./server.md/#onupdate) event handler takes care of updating the resource and replying with the updated resource, or with an error. The resource identified by `resource` is updated.
- Returns: a [`Promise`](./README.md/#promise) object.
- The `resource` argument is a [Resource](#resource) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to update the resource specified by `resource` with the properties present in `resource`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="delete"></a>
##### 4.4. The `delete(resourceId)` method
- Deletes a resource from the network by sending a request to the device specified in `resourceId.deviceId`. The device's [`delete`](./server.md/#ondelete) event handler takes care of deleting the resource and reporting success or error.
- Returns: a [`Promise`](./README.md/#promise) object.
- The `resourceId` argument is a [ResourceId](#resourceid) object that contains a device UUID and a resource path that identifies the resource to be deleted.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to delete the resource specified by `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.
