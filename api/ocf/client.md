Client API
==========

The OCF Client API implements CRUDN (Create, Retrieve, Update, Delete, Notify) functionality that enables remote access to resources in the network. Also, it implements OCF discovery.

The Client API object does not expose own properties, only events and methods.

## 1. Helper objects
<a name="ocferror"></a>
### 1.1. The `OcfError` object
Client requests may fail in the OCF network for various reasons. The `OcfError` object is an instance of [`Error`](https://nodejs.org/api/events.html#events_error_events) that contains the following additional properties:

| Property       | Type   | Optional | Default value | Represents |
| ---            | ---    | ---      | ---           | ---     |
| `kind`         | string | no       | `undefined`   | OCF specific error type |
| `deviceId`     | string | yes      | `undefined`   | UUID of the device |
| `resourcePath` | string | yes      | `undefined`   | URI path of the resource |

- The `kind` property is a string that can take the following values: `"discovery"`, `"presence"`, `"observe"`.
- The `deviceId` property is a string that represents the device UUID causing the error. The value `null` means the local device, and the value `undefined` means the error source device is not available.
- The `resourcePath` property is a string that represents the resource path of the resource causing the error. If `deviceId` is `undefined`, then the value of `resourcePath` should be also set to `undefined`.
- The `message` property is inherited from `Error`.

The constructor of `OcfError` takes the following parameters:
- the `message` parameter is a string representing an error message, like with `Error`
- the `kind` parameter instantiates `OcfError.kind`
- the `deviceId` parameter instantiates `OcfError.deviceId`
- the `resourcePath` parameter instantiates `OcfError.resourcePath`.

If `deviceId` is defined, and `resourcePath` is `undefined` or `null`, it means the error is device specific without being specific to the resource (such as device presence related errors).

```javascript
let message = "OCF error";
let kind = "observe";
let deviceId = "0685B960-736F-46F7-BEC0-9E6CBD61ADC1";
let resourcePath = "/myroom/a/light/1";
var err = new OcfError(message, kind, deviceId, resourcePath);
```

<a name="ocfresourceid"></a>
### 1.1. The `OcfResourceId` object
Identifies an OCF resource by the UUID of the device that hosts the resource, and the URI path of the resource that uniquely identifies the resource inside a device.

| Property   | Type   | Optional | Default value | Represents |
| ---        | ---    | ---      | ---           | ---     |
| `deviceId` | string | no       | `undefined`   | UUID of the device |
| `path`     | string | no       | `undefined`   | URI path of the resource |

<a name="ocfresource"></a>
### 1.2. The `OcfResource` object
#### `OcfResource` properties
`OcfResource` has all the properties of [`OcfResourceInit`](./server.md#ocfresourceinit), and in addition it has an `id` property:

| Property   | Type    | Optional | Default value | Represents |
| ---        | ---     | ---      | ---           | ---     |
| `id` | [`OcfResourceId`](#ocfresourceid) | no    | `undefined` | Resource identifier |

#### `OcfResource` events
`OcfResource` supports the following events:

| Event name | Event callback argument |
| -----------| ----------------------- |
| *update*   | [`OcfResource`](#ocfresource) object |
| *delete*   | [`OcfResource`](#ocfresource) object |

<a name="onresourceupdate"></a>
The `OcfResource` *update* event is fired when the implementation receives an OCF resource update notification because the resource representation has changed. The event listener receives an object that contains the resource properties that have changed. In addition, the resource property values are already updated to the new values when the event is fired.

<a name="onresourcelost"></a>
The `OcfResource` *delete* event is fired when the `*devicelost*` event is fired for the device that contains the resource, or when the implementation gets notified about the resource being deleted or unregistered from the OCF network.

## 2. Events
The Client API supports the following events:

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| *platformfound*   | [`OcfPlatform`](./README.md/#ocfplatform) object |
| *devicefound*     | [`OcfDevice`](./README.md/#ocfdevice) object |
| *devicelost*      | [`OcfDevice`](./README.md/#ocfdevice) object |
| *resourcefound*   | [`OcfResource`](#ocfresource) object |
| *error*           | [`Error`](#ocferror) object |

<a name="onplatformfound"></a>
##### 2.3. The `platformfound` event
Fired when a platform is discovered. The event callback receives as argument an [`OcfPlatform`](./README.md/#ocfplatform) object.
```javascript
client.addListener('platformfound', function(platform) {
  console.log("Platform found with id: " + platform.id);
});
```

<a name="ondevicefound"></a>
##### 2.2. The `devicefound` event
Fired when a device is discovered or when a device appears on the network as a result of enabling its presence. The event callback receives as argument an [`OcfDevice`](./README.md/#ocfdevice) object.
```javascript
client.addListener('devicefound', function(device) {
  console.log("Device found with id: " + device.uuid);
});
```

<a name="ondevicelost"></a>
##### 2.3. The `devicelost` event
Fired when a device is lost. The event callback receives as argument an [`OcfDevice`](#./README.md/#ocfdevice) object.
```javascript
client.on('devicelost', function(device) {
  console.log("Device disappeared: " + device.uuid);
});
```

When the first listener is added to the `*ondevicefound*` or the `*ondevicelost*` event, implementations SHOULD enable listening to OCF presence notifications.

When the last listener is removed from the `*ondevicefound*` and the `*ondevicelost*` event, implementations SHOULD disable listening to OCF presence notifications.

<a name="onresourcefound"></a>
##### 2.1. The `resourcefound` event
Fired when a resource is discovered. The event callback receives as argument an [`OcfResource`](#ocfresource) object.
```javascript
client.on('resourcefound', function(resource) {
  console.log("Resource found with path: " + resource.id.path);
});
```

<a name="onerror"></a>
##### 2.4. The `error` event
Fired when there is a protocol error the application need to know about. The `Event` object contains a `error` property whose value is an [`Error`](https://nodejs.org/api/events.html#events_error_events) object with two additional optional properties:
- `deviceId`: a string representing the device UUID that signaled the error
- `resource`: an [`OcfResourceInit`](#ocfresourceinit) object relevant for the error.
```javascript
client.on('error', function(error) {
  if (error.deviceId)
    console.log("Error for device: " + error.deviceId);
});
```

## 3. Discovery Methods
<a name="getplatforminfo"></a>
##### 3.1. The `getPlatformInfo(deviceId)` method
Fetches a remote platform information.  The `deviceId` argument is a string that contains an OCF device UUID. The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- Send a direct discovery request `GET /oic/p` with the given id (which can be either a device UUID or a device URL, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with an [`OcfPlatform`](./README.md/#ocfplatform) object created from the response.

<a name="getdeviceinfo"></a>
##### 3.2. The `getDeviceInfo(deviceId)` method
Fetches a remote device information. The `deviceId` argument is a string that contains an OCF device UUID. The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a direct discovery request `GET /oic/d` with the given `deviceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with an [`OcfDevice`](./README.md/#ocfdevice) object created from the response.

<a name="findplatforms"></a>
##### 3.3. The `findPlatforms(listener)` method
- Initiates a platform discovery network operation.
- Returns a [`Promise`](./README.md/#ocfpromise) object that resolves with an [`OcfPlatform`](./README.md/#ocfplatform) object.
- The `listener` argument is optional, and is an event listener for the ['platformfound'](#onplatformfound) event that received as argument an [`OcfPlatform`](./README.md/#ocfplatform) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a multicast request for retrieving `/oic/p` and wait for the answer.
- If the sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- If the `listener` argument is specified, add it as a listener to the ['platformfound'](#onplatformfound) event.
- When a platform is discovered, fire a `platformfound` event that contains a property named `platform`, whose value is an [`OcfPlatform`](./README.md/#ocfplatform) object.

<a name="finddevices"></a>
##### 3.4. The `findDevices(listener)` method
- Initiates a device discovery network operation.
- Returns a [`Promise`](./README.md/#ocfpromise) object that resolves with an [`OcfDevice`](./README.md/#ocfdevice) object.
- The `listener` argument is optional, and is an event listener for the ['devicefound'](#ondevicefound) event that receives as argument an [`OcfDevice`](./README.md/#ocfdevice) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `SecurityError`.
- If the functionality is not supported, reject `promise` with `NotSupportedError`.
- Send a multicast request for retrieving `/oic/d` and wait for the answer.
- If the sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- If the `listener` argument is specified, add it as a listener to the ['devicefound'](#ondevicefound) event.
- When a device is discovered, fire a `devicefound` event that contains a property named `device`, whose value is [`OcfDevice`](./README.md/#ocfdevice) object.

<a name="findresources"></a>
##### 3.5. The `findResources(options, listener)` method
- Initiates a resource discovery network operation.
- Returns a [`Promise`](./README.md/#ocfpromise) object that resolves with an [`OcfResource`](#ocfresource) object.
- The `options` parameter is optional, and its value is an object that contains one or more of the following properties:

| Property       | Type   | Optional | Default value | Represents        |
| ---            | ---    | ---      | ---           | ---               |
| `deviceId`     | string | yes      | `undefined`   | OCF device UUID   |
| `resourceType` | string | yes      | `undefined`   | OCF resource type |
| `resourcePath` | string | yes      | `undefined`   | OCF resource path |

- The `listener` argument is optional, and is an event listener for the ['resourcefound'](#onresourcefound) event that receives as argument an [`OcfResource`](./README.md/#ocfresource) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `SecurityError`.
- If the functionality is not supported, reject `promise` with `NotSupportedError`.
- Configure an OCF resource discovery request as follows:
  - If `options.deviceId` is specified, make a direct discovery request to that device
  - If `options.resourceType` is specified, include it as the `rt` parameter in a new endpoint multicast discovery request `GET /oic/res` to "All CoAP nodes" (`224.0.1.187` for IPv4 and `FF0X::FD` for IPv6, port `5683`).
  - If `options.resourcePath` is specified, filter results locally.
- If sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- If the `listener` argument is specified, add it as a listener to the ['resourcefound'](#resourcefound) event.
- When a resource is discovered, fire a `resourcefound` event that contains a property named `resource`, whose value is an [`OcfResource`](#ocfresource) object.

## 4. CRUDN Methods
<a name="create"></a>
##### 4.1. The `create(target, resourceInit)` method
- Creates a remote resource on a given device.
- Returns a [`Promise`](./README.md/#ocfpromise) object which resolves with an [OcfResource](#ocfresource) object.
- The `target` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path. It identifies the resource that is responsible for creating the requested resource.
- The `resourceInit` argument is an [OcfResourceInit](#ocfresourceinit) object. It should contain at least the following properties (other resource properties may also be specified).

| Property       | Type   | Optional | Default value | Represents            |
| ---            | ---    | ---      | ---           | ---                   |
| `resourcePath` | string | no       | `undefined`   | OCF resource URI path |
| `resourceType` | string | no       | `undefined`   | OCF resource type     |

The method sends a request to the device specified in `target` and the device's `createresource` event handler takes care of creating the resource and replying with the created resource, or error.

The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to create the resource described by `resourceInit` to the device specified by `target.deviceId` and the handler resource on the device specified by `target.resourcePath`. Wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="retrieve"></a>
##### 4.2. The `retrieve(resourceId, options, listener)` method
- Retrieves a resource based on resource id by sending a request to the device specified in `resourceId.deviceId`. The device's `retrieveresource` event handler takes care of fetching the resource representation and replying with the created resource, or with an error.
- Returns a [`Promise`](./README.md/#ocfpromise) object which resolves with an [OcfResource](#ocfresource) object.
- The `resourceId` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path.
- The `options` argument is optional, and it is an object whose properties represent the ```REST``` query parameters passed along with the `GET` request as a JSON-serializable dictionary. Implementations SHOULD validate this client input to fit OCF requirements. The semantics of the parameters are application specific (e.g. requesting a resource representation in metric or imperial units). Similarly, the properties of an OIC resource representation are application specific and are represented as a JSON-serializable dictionary.
- The `listener` argument is optional, and is an event listener for the `OcfResource` ['update'](#onresourceupdate) event.

In the OCF retrieve request it is possible to set an `observe` flag if the client wants to observe changes to that request (and get a retrieve responses with a resource representation for each resource change).

The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- If the `listener` argument is specified, add it as a listener to the `OcfResource` ['update'](#onresourceupdate) event, and set the `observe` flag to `true`.
- Let `resource` be the resource identified by `resourceId`.
- Otherwise, if `listener` is not specified, set `observe` to `false`. If previously `resource` has been observed, then stop firing `OcfResource` [`update`](#onresourceupdate) event on the resource.
- Send a request to retrieve the resource specified by `resourceId` with the `observe` flag set as in the steps above, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- If `observe` is `false`, resolve `promise` with `resource` updated from the retrieve response.
- Otherwise, if `observe` is `true, for each OCF retrieve response received while `resource` being observed, update `resource` with the new values, and fire the `OcfResource` [`update`](#onresourceupdate) event on `resource`, providing the event listener an object that contains the resource properties that have changed.
- If there are OCF protocol errors during observe, fire an [`error`](#onerror) event with a new [`OcfError`](#ocferror) object `error` with `error.kind` is set to `"observe"`, `error.deviceId` set to the value of `resourceId.deviceId` and `resourcePath` set to the value of `resourceId.path`.

<a name="update"></a>
##### 4.3. The `update(resource)` method
- Updates a resource in the network by sending a request to the device specified by `resource.id.deviceId`. The device's `updateresource` event handler takes care of updating the resource and replying with the created resource, or error. The resource identified by `resource.id` is updated so that every properties present in `resource` other than `resource.id` is updated with the value specified in `resource`.
- Returns: a [`Promise`](./README.md/#ocfpromise) object which resolves with an [OcfResource](#ocfresource) object.
- The `resource` argument is an [OcfResource](#ocfresource) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to update the resource specified by `resource` with the properties present in `resource, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.


<a name="delete"></a>
##### 4.4. The `delete(resourceId)` method
- Deletes a resource from the network by sending a request to the device specified in `resourceId.deviceId`. The device's `deleteresource` event handler takes care of deleting the resource and reporting success or error.
- Returns: a [`Promise`](./README.md/#ocfpromise) object.
- The `resourceId` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path that identifies the resource to be deleted.

The method runs the following steps:
- Return a [`Promise`](./README.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to delete the resource specified by `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.
