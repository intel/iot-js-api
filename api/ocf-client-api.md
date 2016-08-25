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

- The `kind` property is a string that can take the following values: `"presence"`, `"observe"`.
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
`OcfResource` has all the properties of [`OcfResourceInit`](./ocf-server-api.md#ocfresourceinit), and in addition it has an `id` property:

| Property   | Type    | Optional | Default value | Represents |
| ---        | ---     | ---      | ---           | ---     |
| `id` | [`OcfResourceId`](#ocfresourceid) | no    | `undefined` | Resource identifier |

## 2. Events
The Client API supports the following events:

| Event name        | Event callback argument |
| --------------    | ----------------------- |
| *platformfound*   | [`OcfPlatform`](./ocf-api.md/#ocfplatform) object |
| *devicefound*     | [`OcfDevice`](./ocf-api.md/#ocfdevice) object |
| *devicechanged*   | [`OcfDevice`](./ocf-api.md/#ocfdevice) object |
| *devicelost*      | [`OcfDevice`](./ocf-api.md/#ocfdevice) object |
| *resourcefound*   | [`OcfResource`](#ocfresource) object |
| *resourcechanged* | [`OcfResource`](#ocfresource) object |
| *resourcelost*    | [`OcfResource`](#ocfresource) object |
| *error*           | [`Error`](#ocferror) object |

<a name="onplatformfound"></a>
##### 2.3. The `platformfound` event
Fired when a platform is discovered. The event callback receives as argument an [`OcfPlatform`](./ocf-api.md/#ocfplatform) object.
```javascript
client.addListener('platformfound', function(platform) {
  console.log("Platform found with id: " + platform.id);
});
```

<a name="ondevicefound"></a>
##### 2.2. The `devicefound` event
Fired when a device is discovered or when a device appears on the network as a result of enabling its presence. The event callback receives as argument an [`OcfDevice`](./ocf-api.md/#ocfdevice) object.
```javascript
client.addListener('devicefound', function(device) {
  console.log("Device found with id: " + device.uuid);
});
```

<a name="ondevicechanged"></a>
##### 2.2. The `devicechanged` event
Fired when a device changes. The event callback receives as argument an [`OcfDevice`](#./ocf-api.md/#ocfdevice) object.
```javascript
client.on('devicechanged', function(device) {
  console.log("Device changed: " + device.uuid);
});
```

<a name="ondevicelost"></a>
##### 2.3. The `devicelost` event
Fired when a device is lost. The event callback receives as argument an [`OcfDevice`](#./ocf-api.md/#ocfdevice) object.
```javascript
client.on('devicelost', function(device) {
  console.log("Device disappeared: " + device.uuid);
});
```
<a name="onresourcefound"></a>
##### 2.1. The `resourcefound` event
Fired when a resource is discovered. The event callback receives as argument an [`OcfResource`](#ocfresource) object.
```javascript
client.on('resourcefound', function(resource) {
  console.log("Resource found with path: " + resource.id.path);
});
```

<a name="onresourcechanged"></a>
##### 2.3. The `resourcechanged` event
Fired when an observed resource has changed. The event callback receives as argument an [`OcfResource`](#ocfresource) object that contains at least the `id` property and the changed properties.

```javascript
client.on('resourcechanged', function(resource) {
  console.log("Device disappeared: " + device.uuid);
});
```

<a name="onresourcelost"></a>
#####  The `onresourcelost` event
Fired when the resource is noticed to be lost, either by losing the device that owns the resource, or by receiving a resource delete notification. The event call is invoked with the relevant [`OcfResource`](#ocfresource) object.

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
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- Send a direct discovery request `GET /oic/p` with the given id (which can be either a device UUID or a device URL, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with an [`OcfPlatform`](./ocf-api.md/#ocfplatform) object created from the response.

<a name="getdeviceinfo"></a>
##### 3.2. The `getDeviceInfo(deviceId)` method
Fetches a remote device information. The `deviceId` argument is a string that contains an OCF device UUID. The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a direct discovery request `GET /oic/d` with the given `deviceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with an [`OcfDevice`](./ocf-api.md/#ocfdevice) object created from the response.

<a name="findplatforms"></a>
##### 3.3. The `findPlatforms()` method
Initiates a platform discovery network operation. It takes no arguments and it runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a multicast request for retrieving `/oic/p` and wait for the answer.
- If the sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- When a platform is discovered, fire a `platformfound` event that contains a property named `platform`, whose value is an [`OcfPlatform`](./ocf-api.md/#ocfplatform) object.

<a name="finddevices"></a>
##### 3.4. The `findDevices()` method
Initiates a device discovery network operation. It takes no arguments and it runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `SecurityError`.
- If the functionality is not supported, reject `promise` with `NotSupportedError`.
- Send a multicast request for retrieving `/oic/d` and wait for the answer.
- If the sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- When a device is discovered, fire a `devicefound` event that contains a property named `device`, whose value is [`OcfDevice`](./ocf-api.md/#ocfdevice) object.

<a name="findresources"></a>
##### 3.5. The `findResources(options)` method
- Initiates a resource discovery network operation.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object that resolves with an [`OcfResource`](#ocfresource) object.
- The `options` parameter is optional, and its value is an object that contains one or more of the following properties:

| Property       | Type   | Optional | Default value | Represents        |
| ---            | ---    | ---      | ---           | ---               |
| `deviceId`     | string | yes      | `undefined`   | OCF device UUID   |
| `resourceType` | string | yes      | `undefined`   | OCF resource type |
| `resourcePath` | string | yes      | `undefined`   | OCF resource path |

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `SecurityError`.
- If the functionality is not supported, reject `promise` with `NotSupportedError`.
- Configure an OCF resource discovery request as follows:
  - If `options.deviceId` is specified, make a direct discovery request to that device
  - If `options.resourceType` is specified, include it as the `rt` parameter in a new endpoint multicast discovery request `GET /oic/res` to "All CoAP nodes" (`224.0.1.187` for IPv4 and `FF0X::FD` for IPv6, port `5683`).
  - If `options.resourcePath` is specified, filter results locally.
- If sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- When a resource is discovered, fire a `resourcefound` event that contains a property named `resource`, whose value is an [`OcfResource`](#ocfresource) object.

## 4. CRUDN Methods
<a name="create"></a>
##### 4.1. The `create(target, resourceInit)` method
- Creates a remote resource on a given device.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object which resolves with an [OcfResource](#ocfresource) object.
- The `target` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path. It identifies the resource that is responsible for creating the requested resource.
- The `resourceInit` argument is an [OcfResourceInit](#ocfresourceinit) object. It should contain at least the following properties (other resource properties may also be specified).

| Property       | Type   | Optional | Default value | Represents            |
| ---            | ---    | ---      | ---           | ---                   |
| `resourcePath` | string | no       | `undefined`   | OCF resource URI path |
| `resourceType` | string | no       | `undefined`   | OCF resource type     |

The method sends a request to the device specified in `target` and the device's `createresource` event handler takes care of creating the resource and replying with the created resource, or error.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to create the resource described by `resourceInit` to the device specified by `target.deviceId` and the handler resource on the device specified by `target.resourcePath`. Wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="retrieve"></a>
##### 4.2. The `retrieve(resourceId, options)` method
- Retrieves a resource based on resource id by sending a request to the device specified in `resourceId.deviceId`. The device's `retrieveresource` event handler takes care of fetching the resource representation and replying with the created resource, or with an error.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object which resolves with an [OcfResource](#ocfresource) object.
- The `resourceId` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path.
- The `options` argument is optional, and it is an object whose properties represent the ```REST``` query parameters passed along with the `GET` request as a JSON-serializable dictionary. Implementations SHOULD validate this client input to fit OCF requirements. The semantics of the parameters are application specific (e.g. requesting a resource representation in metric or imperial units). Similarly, the properties of an OIC resource representation are application specific and are represented as a JSON-serializable dictionary.

In the OCF retrieve request it is possible to set an `observe` flag if the client wants to observe changes to that request (and get a retrieve responses with a resource representation for each resource change). This API uses the `retrieve()` method only for a single retrieve operation, without observing.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to retrieve the resource specified by `resourceId` with the `observe` flag unset, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="update"></a>
##### 4.3. The `update(resource)` method
- Updates a resource in the network by sending a request to the device specified by `resource.id.deviceId`. The device's `updateresource` event handler takes care of updating the resource and replying with the created resource, or error. The resource identified by `resource.id` is updated so that every properties present in `resource` other than `resource.id` is updated with the value specified in `resource`.
- Returns: a [`Promise`](./ocf-api.md/#ocfpromise) object which resolves with an [OcfResource](#ocfresource) object.
- The `resource` argument is an [OcfResource](#ocfresource) object.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to update the resource specified by `resource` with the properties present in `resource, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.


<a name="delete"></a>
##### 4.4. The `delete(resourceId)` method
- Deletes a resource from the network by sending a request to the device specified in `resourceId.deviceId`. The device's `deleteresource` event handler takes care of deleting the resource and reporting success or error.
- Returns: a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `resourceId` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path that identifies the resource to be deleted.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to delete the resource specified by `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="observe"></a>
##### 4.5. The `observe(resourceId)` method
- Starts observing a device or resource for change or deletion.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `resourceId` argument provides a [OcfResourceId](#ocfresourceid) object to identify the resource to be observed.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- If the `deviceId` is `null` or `undefined`, request presence notifications on any device.
- If the `resourceId` argument is `null` or `undefined`, then reject `promise` with `"TypeMismatchError"`.
- Send an OCF retrieve request to get the resource identified by `resourceId` with the `observe` flag set.
- If there is an error during the request, reject `promise` with that error and terminate these steps.
- Otherwise, discard the retrieve response.
- Set an internal slot marking the resource being observed so that for each OCF retrieve response received while the resource being observed, fire the [`resourcechanged`](#onresourcechanged) event.
- If there are OCF protocol errors for observe, fire an [`error`](#onerror) event with a new [`OcfError`](#ocferror) object `error` for which `error.kind` is set to `"observe"`, `error.deviceId` is set to `resourceId.deviceId` and `resourcePath` is set to `resourceId.path`.
- Resolve `promise`.

<a name="unobserve"></a>
##### 4.6. The `unobserve(resourceId)` method
- Stops observing a device or resource for change or deletion.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `resourceId` argument provides a [OcfResourceId](#ocfresourceid) object to identify the resource to be unobserved.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- If the `deviceId` is `null` or `undefined`, request presence notifications on any device.
- If the `resourceId` argument is `null` or `undefined`, reject `promise` with `"TypeMismatchError"`.
- If the resource identified by `resourceId` is not being observed, `promise` with '"InvalidModificationError"'.
- Send an OCF retrieve request to get the resource identified by `resourceId` with the `observe` flag unset.
- If there is an error during the request, reject `promise` with that error and terminate these steps.
- Otherwise, discard the retrieve response.
- Release the internal slot marking the resource being observed, so that further OCF retrieve response received do not trigger firing the [`resourcechanged`](#onresourcechanged) event any more.
- Resolve `promise`.

<a name="subscribe"></a>
##### 4.5. The `subscribe(deviceId)` method
- Subscribes to presence notification for a given device or all devices in the OCF network.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `deviceId` string argument is optional, and provides a device UUID.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- If the `deviceId` is `null` or `undefined`, request presence notifications on any device.
- Otherwise request OCF presence notifications for `deviceId`.
- If there is an error during the requests, reject `promise` with that error, and terminate these steps.
- Otherwise, for every presence change notification fire the [`devicechanged`](#ondevicechanged) event, and for every delete notification fire the [`devicelost`](#ondevicelost) event. Do not fire [`resourcelost`](#onresourcelost) events for each observed resource of that device, that is used only for explicitly deleted or unregistered resources.
- If there are OCF protocol errors for presence, fire an [`error`](#onerror) event with a new [`OcfError`](#ocferror) object `error` for which `error.kind` is set to `"presence"`, `error.deviceId` is set to `deviceId` and `resourcePath` is set to `null`.
- Resolve `promise`.

<a name="unsubscribe"></a>
##### 4.6. The `unsubscribe(deviceId)` method
- Unsubscribe from presence notification for a given device or all devices in the OCF network.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `deviceId` string argument is optional, and provides a device UUID.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- If the `deviceId` is `null` or `undefined`, stop watching presence notifications on all devices.
- Otherwise request to stop watching presence notifications for `deviceId`.
- If there is an error during the requests, reject `promise` with that error, and terminate these steps.
- Resolve `promise`.
