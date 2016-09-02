OCF Server API
==============
The Server API implements functionality to serve CRUDN requests in a device. A device that implements the Server API may provide special resources to handle CRUDN requests.

The Server API provides the means to register and unregister resources, to notify of resource changes, and to enable and disable presence functionality on the device.

The Server API object does not expose its own properties, only events and methods.

When a device is changed or shut down, the implementation should update presence information. Clients can subscribe to presence information using the [OCF Client API](./client.md).

## 1. Structures
<a name="ocfrequest"></a>
### 1.1. The `OcfRequest` dictionary
Describes an object that is passed to server event listeners.

| Property  | Type              | Optional | Default value | Represents |
| ---       | ---               | ---      | ---           | ---        |
| `source`  | [`ResourceId`](./client.md/#resourceid)  | no  | `undefined` | Requesting resource |
| `target`  |  [`ResourceId`](./client.md/#resourceid) | no  | `undefined` | Request handling resource |
| `id`  |  string | no  | `undefined` | Id of the request |
| `data` | object   | no | `null` | Resource id or resource or resource representation |

The `id` property in a request is a string that identifies the request in the response.

The `data` property in a request is an object that contains data that depends on the request type (create, retrieve, update, delete) and is described in this document with the corresponding request.

<a name="resourceinit"></a>
### 1.2. The `ResourceInit` dictionary
Used for creating and registering resources, exposes the properties of an OCF resource that are allowed to be set when creating the resource. All properties are read-write.

| Property        | Type    | Optional | Default value | Represents |
| ---             | ---     | ---      | ---           | ---     |
| `resourcePath`  | string  | no       | `undefined`   | URI path of the resource |
| `resourceTypes` | array of strings | no    | `[]` | List of OCF resource types |
| `interfaces`    | array of strings | no    | `[]` | List of supported interfaces |
| `mediaTypes`    | array of strings | no    | `[]` | List of supported Internet media types |
| `discoverable`  | boolean | no    | `true` | Whether the resource is discoverable |
| `observable`    | boolean | no    | `true` | Whether the resource is discoverable |
| `secure`        | boolean | no    | `true` | Whether the resource is secure |
| `slow`          | boolean | yes   | `false` | Whether the resource is constrained |
| `properties`    | object | yes    | `{}` | Resource representation properties as described in the data model |

 The `properties` property is a resource representation that contains resource-specific properties and values usually described in the [RAML data model](http://www.oneiota.org/documents?filter%5Bmedia_type%5D=application%2Framl%2Byaml) definition of the resource.

## 2. Events
The requests are dispatched using events. The Server API supports the following events:

| Event name  | Event callback argument            |
| ----------- | -----------------------            |
| *create*    | [`OcfRequest`](#ocfrequest) object |
| *retrieve*  | [`OcfRequest`](#ocfrequest) object |
| *update*    | [`OcfRequest`](#ocfrequest) object |
| *delete*    | [`OcfRequest`](#ocfrequest) object |

Note that the OCF retrieve request contains the `observe` flag, which tells whether the client requires change notifications for the given resource. Therefore notifications are implemented using the `retrieve` event.

<a name="oncreate"></a>
##### 2.1. The `create` event
Fired when a client asks for a resource to be created on the device.
The event callback receives as argument an object that can be used as an argument to [respond](#respond) to the request, and has the following properties:

| Property  | Type              | Optional | Default value | Represents |
| ---       | ---               | ---      | ---           | ---        |
| `source`  | [`ResourceId`](./client.md/#resourceid)  | no  | `undefined` | Id of the requesting resource |
| `target`  |  [`ResourceId`](./client.md/#resourceid) | no  | `undefined` | Id of the request handling resource |
| `id`  |  string | no  | `undefined` | Id of the request |
| `data` | [`ResourceInit`](#resourceinit)  | yes | `undefined` | Initialized properties |
| `options` | object | yes | `undefined` | List of OCF request options |

The value of the `source` property of the request is the [ResourceId](./client.md/#resourceid) of the resource requesting the operation.
The value of the `target` property of the request is the [ResourceId](./client.md/#resourceid) of the resource responsible to create the requested resource.
The value of the `id` property is a string representing the unique identifier of the request.
The value of the `options` property is an object that contains a list of properties with values created by the implementation from the REST query options of the request.
The value of the `data` property of the request should be an object that contains at least the following properties of the resource to be created:

| Property       | Type   | Optional | Default value | Represents            |
| ---            | ---    | ---      | ---           | ---                   |
| `resourcePath` | `ResourceId`](./client.md/#resourceid) | no  | `undefined`   | OCF resource path |
| `resourceTypes` | `Resource`](./client.md/#resource) | no  | `undefined`   | List of OCF resource types supported |

In addition, other resource properties may also be specified, such as `interfaces`, `mediaTypes`, and `properties` for resource representation initialization.

<a name="exampleoncreate"></a>
```javascript
var server = require('ocf').server;
server.on('create', function(request) {
  console.log("Client resource id: " + request.source.resourcePath);
  console.log("Target resource id, responsible to create the resource: " + request.target.resourcePath);
  console.log("Requested resource path: " + request.resource.resourcePath);
  console.log("Requested resource type: " + request.resource.resourceType);

  // Use a local function to create the resource.
  let res = _createResource(request.target.resourcePath, request.resource);

  // Register the new resource and then respond to the request.
  server.register(res)
    .then(function(resource) {
      server.respond(request, null, resource);
    }).catch(function(error) {
      server.respond(request, error, res);
    });
});
```
<a name="onretrieve"></a>
##### 2.2. The `retrieve` event
Fired when a client asks for a resource to be retrieved on the device. The event callback receives two arguments:
- An [`OcfRequest`](#ocfrequest) object `request` that can be used to respond to the request.
- A boolean `observe` flag to tell if the client wants to also observe the resource for changes.

The value of the `source` property of `request` is the [ResourceId](./client.md/#resourceid) of the resource requesting the operation.

The value of the `target` property of `request` is the [ResourceId](./client.md/#resourceid) of the resource to be retrieved.

The value of the `data` property of `request` is `undefined`.

When the `observe` argument is `true`, then implementations SHOULD set up change notifications for the resource, and send a retrieve response with the resource representation every time the resource is changed.

When the `observe` argument is `false`, then implementations SHOULD reset those change notifications for the resource which are sent to the client identified by the `source` property.

```javascript
var server = require('ocf').server;
server.on('retrieve', function(request, observe) {
  console.log("Client resource id: " + request.source);
  console.log("Target resource id, to be retrieved: " + request.target);

  // Retrieve resource in a device specific way.
  let res = _getResource(request.target);
  let err = res ? null : new Error('retrieving resource failed');
  server.respond(request, err, res);

  if (observe) {
    console.log("Enabled change notifications for the resource.");
  } else {
    console.log("Disabled change notifications for the resource.");
  }
});
```

<a name="onupdate"></a>
##### 2.3. The `update` event
Fired when a client asks for a resource to be updated on the device with one or more properties. The event callback receives as argument an [`OcfRequest`](#ocfrequest) object that can be used for the response.
The value of the `source` property of the request is the [ResourceId](./client.md/#resourceid) of the resource requesting the operation.
The value of the `target` property of the request is the [ResourceId](./client.md/#resourceid) of the resource to be updated.
The `data` property of the request should be an object that contains the resource representation properties that should be updated, according to the data model of the given resource.

When the resource is updated, all observers should be notified, and the updated resource representation should be sent back in the response.

<a name="exampleonupdate"></a>
```javascript
var server = require('ocf').server;
server.on('update', function(request) {
  console.log("Client resource path: " + request.source.resourcePath);
  console.log("Resource path to be updated: " + request.target.resourcePath);

  let res = _updateResource(request.target, request.data);
  let err = res ? null : new Error('updating resource failed');
  server.notify(res);
  server.respond(request, err, res);
});
```

<a name="ondelete"></a>
##### 2.4. The `delete` event
Fired when a client asks for a resource to be deleted on the device. The event callback receives as argument an [`OcfRequest`](#ocfrequest) object that can be used in the response.
The value of the `source` property of the request is the [ResourceId](./client.md/#resourceid) of the resource requesting the operation.
The value of the `target` property of the request is the [ResourceId](./client.md/#resourceid) of the resource to be deleted.
The `data` property of the request is `undefined`.

```javascript
var server = require('ocf').server;
server.on('delete', function(request) {
  console.log("Client resource id: " + request.source);
  console.log("Resource to be deleted: " + request.target);

  let res = _deleteResource(request.target);
  // Presence should notify clients about the deletion of the resource
  let err = res ? null : new Error('deleting resource failed');
  server.respond(request, err);
});
```

## 3. Methods
<a name="register"></a>
##### 3.1. `register(resource)` method
- Registers a resource in the OCF network.
- Returns a [`Promise`](./README.md/#promise) object.
- The `resource` argument is an object that should contain at least the following properties (other resource properties may also be specified):

| Property       | Type   | Optional | Default value | Represents        |
| ---            | ---    | ---      | ---           | ---               |
| `resourcePath` | string | no       | `undefined`   | OCF device UUID   |
| `resourceTypes` | array of strings | no       | `undefined`   | List of OCF resource types |

See the [example](#exampleoncreate) for the `create` event.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to register the given `resource`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with a [`Resource`](./client.md/#resource) object created from the response.

<a name="unregister"></a>
##### 3.2. `unregister(resourceId)`
- Unregisters the given resource id from the OCF network.
- Returns a [`Promise`](./README.md/#promise) object.
- The `resourceId` argument is an [ResourceId](./client.md/#resourceid) object.

```javascript
let server = require('ocf').server;

server.unregister(resource)
  .then(resource) {
    console.log("Successfully unregistered resource " + resource.resourcePath)
  }.catch(error) {
    console.log("Error: " + error.message)
  };
```
The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to unregister the given `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.

The OCF network should send the presence notifications to listeners.

<a name="notify"></a>
##### 3.3. `notify(resource)`
- Notifies about resource representation change of local resource `resource`.
- Returns a [`Promise`](./README.md/#promise) object.
- The `resource` argument is an [Resource](./client.md/#resource) object.

See the [example](#exampleonupdate) for the `update` event.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send an OCF notification for `resource`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.

<a name="enablepresence"></a>
##### 3.4. `enablePresence(timeToLive)`
- Enables presence for the current device, with an optional time-to-live argument.
- Returns a [`Promise`](./README.md/#promise) object.
- The `timeToLive` argument is optional. It is a number representing the time to live of the request in seconds.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to enable presence for the current device, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.

<a name="disablepresence"></a>
##### 3.5. `disablePresence()`
- Disables presence for the current device.
- Returns a [`Promise`](./README.md/#promise) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to disable presence for the current device, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.


<a name="respond"></a>
##### 3.6. `respond(request, error, data)`
- Sends a response to a given [`OcfRequest`](#ocfrequest).
- Returns a [`Promise`](./README.md/#promise) object that resolves when the response is successfully sent, otherwise rejects.
- The `request` argument is mandatory, and should be the `OcfRequest` object for which the response is being sent.
- The `error` argument is mandatory, and should be `null` in case of success. Otherwise it should be an instance of [`Error`](https://nodejs.org/api/errors.html#errors_class_error).
- The `data` argument is optional and used with requests that return data, such as `create` and `update`.

The method is typically used from request event handlers, and internally reuses the request information in order to construct a response message.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Construct a response message to `request`, reusing the properties of `request`.
- If `error` is not `null` and an instance of `Error`, then mark the error in the response message.
- If `data` is not `null`, then include it in the response message (when the protocol message format supports that).
- Send the response back to the sender.
- If there is an error during sending the response, reject `promise` with that error, otherwise resolve `promise`.
