Client API
==========

The OCF Client API implements CRUDN (Create, Retrieve, Update, Delete, Notify) functionality that enables remote access to resources in the network. Also, it implements [discovery](./ocf-discovery-api.md).

The Client API object does not expose own properties, only events and methods.

```javascript
// Require as part of OCF API object:
let ocf = require('ocf');
// use as ocf.client

// Or, require as separate object:
let client = require('ocf')('client');  // same as ocf.client

client.on('deviceadded', function(event) {
  console.log("Device appeared: " + event.device.uuid);
});

client.on('devicelost', function(event) {
  console.log("Device disappeared: " + event.device.uuid);
});

client.on('devicechanged', function(event) {
  console.log("Device changed: " + event.device.uuid);
});
```

## 1. Helper objects
<a name="ocfresourceid"></a>
### 1.1. The `OcfResourceId` object
Identifies an OCF resource by the UUID of the device that hosts the resource, and the URI path of the resource that uniquely identifies the resource inside a device.

| Property   | Type    | Optional | Default value | Represents |
| ---        | ---     | ---      | ---           | ---     |
| `deviceId` | string | no    | `undefined` | UUID of the device |
| `path`     | string | no    | `undefined` | URI path of the resource |

<a name="ocfresourceinit"></a>
### 1.2. The `OcfResourceInit` object
Exposes the properties of an OCF resource that are allowed to be set when creating a resource.
All properties are read-write.

| Property   | Type    | Optional | Default value | Represents |
| ---        | ---     | ---      | ---           | ---     |
| `resourceTypes` | array of strings | no    | `[]` | List of OCF resource types |
| `interfaces` | array of strings | no    | `[]` | List of supported interfaces |
| `mediaTypes` | array of strings | no    | `[]` | List of supported Internet media types |
| `discoverable` | boolean | no    | `true` | Whether the resource is discoverable |
| `observable` | boolean | no    | `true` | Whether the resource is discoverable |
| `secure` | boolean | no    | `true` | Whether the resource is secure |
| `slow` | boolean | yes   | `false` | Whether the resource is constrained |
| `links` | array of [`OcfResourceId`](#ocfresourceid) | yes    | `[]` | List of associated resources |
| `properties` | object | yes    | `{}` | List of resource properties according to the data model |

<a name="ocfresource"></a>
### 1.3. The `OcfResource` object
It has all the properties of [`OcfResourceInit`](), and in addition it has an `id` property:

| Property   | Type    | Optional | Default value | Represents |
| ---        | ---     | ---      | ---           | ---     |
| `id` | [`OcfResourceId`]() | no    | `undefined` | Resource identifier |


## 2. Events
The requests are dispatched using events. The Client API implements the [EventEmitter](https://nodejs.org/api/events.html#events_events) interface and supports the following presence related events:

| Event name     | Event callback argument |
| -------------- | ----------------------- |
| *deviceadded*    | [`OcfDevice`](./ocf-api.md/#ocfdevice) object |
| *devicechanged*  | [`OcfDevice`](./ocf-api.md/#ocfdevice) object |
| *devicelost*    | [`OcfDevice`](./ocf-api.md/#ocfdevice) object |

When a listener is added to any of the presence events, the implementation should subscribe to presence notifications in the network.

When the last presence event listener is removed, the implementation should unsubscribe from presence notifications from the network.

<a name="ondeviceadded"></a>
##### 2.1. The `deviceadded` event
Fired when a device appears on the network as a result of enabling its presence. The event callback receives as argument an [`OcfDevice`](#./ocf-api.md/#ocfdevice) object.

<a name="ondevicechanged"></a>
##### 2.2. The `devicechanged` event
Fired when a device changes. The event callback receives as argument an [`OcfDevice`](#./ocf-api.md/#ocfdevice) object.

<a name="ondevicelost"></a>
##### 2.3. The `devicelost` event
Fired when a device is lost. The event callback receives as argument an [`OcfDevice`](#./ocf-api.md/#ocfdevice) object.

## 3. Methods
<a name="create"></a>
##### 3.1. `create(target, resourceInit)` method
- Creates a remote resource on a given device.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object which resolves with an [OcfResource](#ocfresource) object.
- The `target` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path. It identifies the resource that is responsible for creating the requested resource.
- The `resourceInit` argument is an [OcfResourceInit](#ocfresourceinit) object. It should contain at least the following properties (other resource properties may also be specified).

| Property   | Type    | Optional | Default value | Represents |
| ---        | ---     | ---      | ---           | ---     |
| `resourcePath` | string | no    | `undefined` | OCF resource URI path |
| `resourceType` | string | no    | `undefined` | OCF resource type |

The method sends a request to the device specified in `target` and the device's `createresource` event handler takes care of creating the resource and replying with the created resource, or error.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to create the resource described by `resourceInit` to the device specified by `target.deviceId` and the handler resource on the device specified by `target.resourcePath`. Wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.

<a name="retrieve"></a>
##### 3.2. `retrieve(resourceId, options)` method
- Retrieves a resource based on resource id by sending a request to the device specified in `resourceId.deviceId`. The device's `retrieveresource` event handler takes care of fetching the resource representation and replying with the created resource, or with an error.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object which resolves with an [OcfResource](#ocfresource) object.
- The `resourceId` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path.
- The `options` argument is optional, and it is an object whose properties represent the ```REST``` query parameters passed along with the ```GET``` request as a JSON-serializable dictionary. Implementations SHOULD validate this client input to fit OCF requirements. The semantics of the parameters are application specific (e.g. requesting a resource representation in metric or imperial units). Similarly, the properties of an OIC resource representation are application specific and are represented as a JSON-serializable dictionary.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to retrieve the resource specified by `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.


<a name="update"></a>
##### 3.3. `update(resource)` method
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
##### 3.4. `delete(resourceId)` method
- Deletes a resource from the network by sending a request to the device specified in `resourceId.deviceId`. The device's `deleteresource` event handler takes care of deleting the resource and reporting success or error.
- Returns: a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `resourceId` argument is an [OcfResourceId](#ocfresourceid) object that contains a device UUID and a resource path that identifies the resource to be deleted.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to delete the resource specified by `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error, otherwise resolve `promise`.
