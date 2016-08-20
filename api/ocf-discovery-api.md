Discovery API
=============
The OCF Discovery API is part of part of the [OCF Client API](./ocf-client-api.md), and implements discovery for platforms, devices and resources in the OCF network.

```javascript
// Require as part of OCF API object:
let ocf = require('ocf');
// use as ocf.client

// Or, require as separate object:
let client = require('ocf')('client');  // same as ocf.client
```

## 1. Properties
The Discovery API does not expose own properties.


## 2. Events
The object that implements the Discovery API must implement the [EventEmitter](https://nodejs.org/api/events.html#events_events) interface to supports the following events:

| Event name     | Event callback argument |
| -------------- | ----------------- |
| *resourcefound*  | [`OcfResource`](./client.md/#ocfresource) object    |
| *devicefound*    | [`OcfDevice`](./ocf-api.md/#ocfdevice) object     |
| *platformfound*  | [`OcfPlatform`](./ocf-api.md/#ocfplatform) object |
| *error*          | [`Error`](https://nodejs.org/api/events.html#events_error_events) object |


<a name="onresourcefound"></a>
##### 2.1. The `resourcefound` event
Fired when a resource is discovered. The event callback receives as argument an [`OcfResource`](./ocf-client-api.md/#ocfresource) object.
```javascript
client.on('resourcefound', function(resource) {
  console.log("Resource found with path: " + resource.id.path);
});
```

<a name="ondevicefound"></a>
##### 2.2. The `devicefound` event
Fired when a device is discovered. The event callback receives as argument an [`OcfDevice`](./ocf-api.md/#ocfdevice) object.
```javascript
client.addListener('devicefound', function(device) {
  console.log("Device found with id: " + device.uuid);
});
```

<a name="onplatformfound"></a>
##### 2.3. The `platformfound` event
Fired when a platform is discovered. The event callback receives as argument an [`OcfPlatform`](./ocf-api.md/#ocfplatform) object.
```javascript
client.addListener('platformfound', function(platform) {
  console.log("Platform found with id: " + platform.id);
});
```

<a name="onerror"></a>
##### 2.4. The `error` event
Fired when there is a protocol error during discovery the application need to know about. The `Event` object contains a `error` property whose value is an [`Error`](https://nodejs.org/api/events.html#events_error_events) object with two additional optional properties:
- `deviceId`: a string representing the device UUID that signaled the error
- `resource`: an [`OcfResourceInit`](./ocf-client-api.md/#ocfresourceinit) object relevant for the error.
```javascript
client.on('error', function(error) {
  if (error.deviceId)
    console.log("Error for device: " + error.deviceId);
});
```

## 3. Methods

The OCF Discovery API has the following methods:

<a name="findresources"></a>
##### 3.1. The `findResources(options)` method
- Initiates a resource discovery network operation.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object that resolves with an [`OcfResource`](./ocf-client-api.md/#ocfresource) object.
- The `options` parameter is optional, and its value is an object that contains one or more of the following properties:

| Property   | Type    | Optional | Default value | Represents |
| ---        | ---     | ---      | ---           | ---     |
| `deviceId`    | string | yes     | `undefined` | OCF device UUID |
| `resourceType` | string | yes     | `undefined` | OCF resource type |
| `resourcePath` | string | yes     | `undefined` | OCF resource path |

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
- When a resource is discovered, fire a `resourcefound` event that contains a property named `resource`, whose value is an [`OcfResource`](./ocf-client-api.md/#ocfresource) object.

<a name="finddevices"></a>
##### 3.2. The `findDevices()` method
Initiates a device discovery network operation. It takes no arguments and it runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `SecurityError`.
- If the functionality is not supported, reject `promise` with `NotSupportedError`.
- Send a multicast request for retrieving `/oic/d` and wait for the answer.
- If the sending the request fails, reject `promise` with `"NetworkError"`, otherwise resolve `promise`.
- If there is an error during the discovery protocol, fire an `error` event.
- When a device is discovered, fire a `devicefound` event that contains a property named `device`, whose value is [`OcfDevice`](./ocf-api.md/#ocfdevice) object.

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

<a name="getdeviceinfo"></a>
##### 3.4. The `getDeviceInfo(deviceId)` method
Fetches a remote device information. The `deviceId` argument is a string that contains an OCF device UUID. The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a direct discovery request `GET /oic/d` with the given `deviceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with an [`OcfDevice`](./ocf-api.md/#ocfdevice) object created from the response.

<a name="getplatforminfo"></a>
##### 3.5. The `getPlatformInfo(deviceId)` method
Fetches a remote platform information.  The `deviceId` argument is a string that contains an OCF device UUID. The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- Send a direct discovery request `GET /oic/p` with the given id (which can be either a device UUID or a device URL, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with an [`OcfPlatform`](./ocf-api.md/#ocfplatform) object created from the response.
