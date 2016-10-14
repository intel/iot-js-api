OCF Server API
==============

- Helper structures
  * The [OcfRequest](#ocfrequest) interface
  * The [ResourceInit](#resourceinit) dictionary
- Server events
  * [`create`](#oncreate)
  * [`retrieve`](#onretrieve)
  * [`update`](#onupdate)
  * [`delete`](#ondelete)
  * [`error`](#onerror)
- Server methods
  * [register(resource, translateFunction)](#register)
  * [unregister(resourceId)](#unregister)
  * [notify(resource)](#notify)
  * [enablePresence(timeToLive)](#enable)
  * [disablePresence()](#disable)

Introduction
------------
The Server API implements functionality to serve CRUDN requests in a device. A device that implements the Server API may provide special resources to handle CRUDN requests.

The Server API provides the means to register and unregister resources, to notify of resource changes, and to enable and disable presence functionality on the device.

The Server API object does not expose its own properties, only events and methods.

When a device is changed or shut down, the implementation should update presence information. Clients can subscribe to presence information using the [OCF Client API](./client.md).

1. Structures
-------------
<a name="ocfrequest"></a>
### 1.1. The `OcfRequest` interface
Describes an object that is passed to server event listeners.

| Property  | Type              | Optional | Default value | Represents |
| ---       | ---               | ---      | ---           | ---        |
| `source`  | [`ResourceId`](./client.md/#resourceid)  | no  | `undefined` | Requesting resource |
| `target`  |  [`ResourceId`](./client.md/#resourceid) | no  | `undefined` | Request handling resource |
| `id`  |  string | no  | `undefined` | Id of the request |
| `data` | object   | no | `undefined` | Resource id or resource or resource representation |
| `options` | object | yes | `undefined` | Dictionary containing the request options |

The `id` property in a request is a string that identifies the request in the response.

The `data` property in a request is an object that contains data that depends on the request type (create, retrieve, update, delete) and is described in this document with the corresponding request.

<a name="requestoptions"></a>
The `options` property is an object whose properties represent the `REST` query parameters passed along with the request as a JSON-serializable dictionary. The semantics of the parameters are application-specific (e.g. requesting a resource representation in metric or imperial units). For instance request options may be used with the [retrieve](./client.md/#retrieveoptions) request.

#### `OcfRequest` methods
<a name="respond"></a>
##### `respond(data)`
- Sends a response to this request.
- The `data` argument is optional and used with requests such as `create` and `update`.

The method is typically used from request event handlers, and internally reuses the request information in order to construct a response message.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Construct a response message to `request`, reusing the properties of `request`.
- If `data` is not `null`, then include it in the response message (when the protocol message format supports that).
- Send the response back to the sender.
- If there is an error during sending the response, reject `promise` with that error, otherwise resolve `promise`.

##### `error(error)`
- Sends an error response to this request.
- The `error` argument is an `Error` object.

The method is typically used from request event handlers, and internally reuses the request information in order to construct a response message.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Construct a response message to `request`, reusing the properties of `request`.
- If `error` is not `null` and an instance of `Error`, then mark the error in the response message (the error may be application specific). Otherwise, mark a generic error in the response message.
- Send the response back to the sender.
- If there is an error during sending the response, reject `promise` with that error, otherwise resolve `promise`.

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

2. Events
---------
The requests are dispatched using events. The Server API supports the following events:

| Event name  | Event callback argument            |
| ----------- | -----------------------            |
| *create*    | [`OcfRequest`](#ocfrequest) object |
| *retrieve*  | [`OcfRequest`](#ocfrequest) object |
| *update*    | [`OcfRequest`](#ocfrequest) object |
| *delete*    | [`OcfRequest`](#ocfrequest) object |
| *error*     | [`Error`] object                   |

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
| `options` | object | yes | `undefined` | Contains OCF request options |

The value of the `source` property of the request is the [ResourceId](./client.md/#resourceid) of the resource requesting the operation.
The value of the `target` property of the request is the [ResourceId](./client.md/#resourceid) of the resource responsible to create the requested resource.
The value of the `id` property is a string representing the unique identifier of the request.
The value of the `options` property is an object that contains a list of properties with values created by the implementation from the REST query options of the request. For instance this object may contain client hints on what measurement units should be used in the resource representation.
The value of the `data` property of the request should be an object that contains at least the following properties of the resource to be created:

| Property       | Type   | Optional | Default value | Represents            |
| ---            | ---    | ---      | ---           | ---                   |
| `resourcePath` | [`ResourceId`](./client.md/#resourceid) | no  | `undefined`   | OCF resource path |
| `resourceTypes` | [`Resource`](./client.md/#resource) | no  | `undefined`   | List of OCF resource types supported |

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

  // Use oneiota.org RAML definitions, the request options, and sensor documentation.
  var translate = function (representation, requestOptions) {
        switch (requestOptions.units) {
          case "C" :
            // use sensor specific code to get Celsius units
            representation.temperature = _getCelsiusFromSensorT1();
            break;
          case "F":
            representation.temperature = _getFahrenheitFromSensorT1();
            break;
          case "K":
            representation.temperature = _getKelvinFromSensorT1();
            break;
        }
      }
      return representation;
  }

  // Register the new resource and then respond to the request.
  server.register(res, translate)
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


When the `observe` argument is `true`, then implementations SHOULD set up change notifications for the resource, and send a retrieve response with the resource representation every time the resource is changed, according to the [`notify` algorithm](#notify). If the `request.options` property is defined and it is an object, then save that object in order that it can be used by the `notify()` algorithm.

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

3. Methods
-----------

<a name="register"></a>
##### 3.1. `register(resource, translate)` method
- Registers a resource in the OCF network.
- Returns a [`Promise`](./README.md/#promise) object.
- The `resource` argument is an object that should contain at least the following properties (other resource properties may also be specified):

| Property       | Type   | Optional | Default value | Represents        |
| ---            | ---    | ---      | ---           | ---               |
| `resourcePath` | string | no       | `undefined`   | OCF device UUID   |
| `resourceTypes` | array of strings | no       | `undefined`   | List of OCF resource types |

<a name="translate"></a>
- the `translate` argument is a function that is invoked by the implementation when the client requests a certain representation of the resource by the means of request options. The function takes two arguments, a resource `representation` object that comes from `resource.properties`, and a dictionary that contains the REST request options parsed into a dictionary. It returns the modified resource representation object.

See the [example](#exampleoncreate) for the `create` event.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to register the given `resource`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, update `resource` to be a [`Resource`](./client.md/#resource) object.
- If `translate` is a function, associate it with `resource.resourcePath` and save it for future use by the [`notify()` algorithm](#notify).
- Resolve `promise` with `resource`.

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
- For each client that requested observing `resource.resourceId`, do the following sub-steps:
    * If there were request options specified with the retrieve request associated with observing the resource, and if a [translate function](#translate) has been defined for the resource during its [registration](#register), then let `resource` be the result of invoking that translate function with `resource` and the [request options dictionary](#requestoptions) that has been saved for the [observation request](#onretrieve).
    * Send an OCF notification for `resource`, and wait for the answer.
    * If there is an error during the request, emit an `error` event with that error.
- When all the answers are received, resolve `promise`.
Note that the `notify()` method always resolves. Errors on notifying individual clients are considered non-critical and should be handled by the `error` event.

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
