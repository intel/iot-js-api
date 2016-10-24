OCF Server API
==============

- Helper structures
  * The [OcfRequest](#ocfrequest) interface
    - [`respond(data)`](#respond)
    - [`respondWithError(error)`](#respondwitherror)
  * The [ResourceInit](#resourceinit) dictionary
- Server methods
  * [register(resource, translateFunction)](#register)
  * [unregister(resourceId)](#unregister)
  * [oncreate(handler, options)](#oncreate)
  * [onretrieve(handler, options)](#onretrieve)
  * [onupdate(handler, options)](#onupdate)
  * [ondelete(handler, options)](#ondelete)
  * [onerror(handler, request)](#onerror)
  * [notify(resource)](#notify)
  * [enablePresence(timeToLive)](#enable)
  * [disablePresence()](#disable)

Introduction
------------
The Server API provides the means
- to register and unregister resources,
- to register handlers that serve CRUDN requests in a device,
- to notify of resource changes, and
- to enable and disable presence functionality on the device.

A device that implements the Server API may provide special resources to handle CRUDN requests. A server implementation should encapsulate and manage OCF presence. Applications can only enable or disable presence. Clients can subscribe to presence information using the [OCF Client API](./client.md).

The Server API object does not expose its own properties, only methods for registering handlers. Events are not used for the following reasons:
- there should be one handler per request type, therefore multiple listeners are not desired;
- there is a need to pass options (e.g. filters) with listeners, and that is not supported by events;
- other server APIs like [Express](http://expressjs.com/en/4x/api.html) also use callbacks with filters.

1. Structures
-------------
<a name="ocfrequest"></a>
### 1.1. The `OcfRequest` interface
Describes an object that is passed to server event listeners.

| Property  | Type              | Optional | Default value | Represents |
| ---       | ---               | ---      | ---           | ---        |
| `source`  | [`ResourceId`](./client.md/#resourceid)  | no  | `undefined` | Requesting resource |
| `target`  |  [`ResourceId`](./client.md/#resourceid) | no  | `undefined` | Request handling resource |
| `data` | object   | no | `undefined` | Resource id or resource or resource representation |
| `options` | object | yes | `undefined` | Dictionary containing the request options |

The `data` property in a request is an object that contains data that depends on the request type (create, retrieve, update, delete) and is described in this document with the corresponding request.

<a name="requestoptions"></a>
The `options` property is an object whose properties represent the `REST` query parameters passed along with the request as a JSON-serializable dictionary. The semantics of the parameters are application-specific (e.g. requesting a resource representation in metric or imperial units). For instance request options may be used with the [retrieve](./client.md/#retrieveoptions) request.

#### `OcfRequest` methods
<a name="respond"></a>
##### `respond(data)`
- Sends a response to this request.
- The `data` argument is optional and used with requests such as `create` and `update`.

The method is typically used from request handlers, and internally reuses the request information in order to construct a response message.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Construct a response message to `request`, reusing the properties of `request`.
- If `data` is not `null`, then include it in the response message (when the protocol message format supports that).
- Send the response back to the sender.
- If there is an error during sending the response, reject `promise` with that error, otherwise resolve `promise`.

<a name="respondwitherror"></a>
##### `respondWithError(error)`
- Sends an error response to this request.
- The `error` argument is an `Error` object.

The method is typically used from request handlers, and internally reuses the request information in order to construct a response message.

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

<a name="serveroptions"></a>
### 1.2. The `ServerOptions` dictionary
Used by applications to specify what requests a provided handler function is meant to serve. All properties are read-write.

| Property        | Type    | Optional | Default value | Represents |
| ---             | ---     | ---      | ---           | ---     |
| `resourcePath`  | string  | yes      | `undefined`   | URI path of resource |
| `resourceTypes` | array of strings | no    | `undefined` | list of resource types |
| `interfaces`    | array of strings | no    | `undefined` | list of interfaces |


2. Methods
-----------

The [`oncreate(handler, options)`](#oncreate), [`onretrieve(handler, options)`](#onretrieve), [`onupdate(handler, options)`](#onupdate), [`ondelete(handler, options)`](#ondelete) and [`onerror()`](#onerror) methods register a function to handle OCF requests, and return a reference to the server object for chaining. The registered listener function replaces the previously registered listener.
The `handler` argument is a function that accepts an [`OcfRequest`](#ocfrequest) object `request` as argument.
The `options` argument is a [`ServerOptions`](#serveroptions) dictionary.

<a name="crudn-steps"></a>
The methods run the following common steps:
- 1. If `options` is `undefined` and `handler` is a `Function`, save `handler` as a callback invoked for OCF create requests.
- 2. Otherwise, if `options.resourceTypes` is a string array, then associate `handler` with each string element of the array.
- 3. If `options.interfaces` is a string array, then associate `handler` with each string element of the array.
- 4. If `options.resourcePath` is a string, then associate `handler` with it.
- 5. If there is any error the implementation should run the [error steps](#errorsteps).
- 6. Return `this`, a reference to the server object.

<a name="oncreate"></a>
##### 2.1. The `oncreate(handler, options)` method
Registers a function to handle OCF `create resource` requests and returns a reference to the server object for chaining.

Whenever the underlying platform notifies the implementation about an OCF create request, implementations should run the following steps:
- Create an [`OcfRequest`](#ocfrequest) object `request` as follows:
  * The value of `request.source` is the [ResourceId](./client.md/#resourceid) of the client resource requesting the operation.
  * The value of `request.target` is the [ResourceId](./client.md/#resourceid) of the server resource responsible to create the requested resource.
  * The value of `request.options` is an object that contains a list of properties with values created by the implementation from the REST query options of the request. For instance this object may contain client hints on what measurement units should be used in the resource representation.
  * The value of `request.data` is an object that contains at least the following properties of the [resource](./client.md/#resource) to be created: `resourcePath` and `resourceTypes`. In addition, other [resource](./client.md/#resource) properties may also be specified, such as `interfaces`, `mediaTypes`, and `properties` for resource representation initialization.
- If there is a previously saved handler associated with `request.data.resourcePath`, or any elements of `request.data.resourceTypes`, or any elements of `request.data.interfaces`, then invoke that function with `request` as argument.
- Otherwise, if there is a generic handler, then invoke that function with `request` as argument.

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
##### 2.2. The `onretrieve(handler, options)` method
Registers a function to handle OCF `retrieve resource` requests and returns a reference to the server object for chaining.

Whenever the underlying platform notifies the implementation about an OCF retrieve request, implementations should run the following steps:
- Create an [`OcfRequest`](#ocfrequest) object `request` as follows:
  * The value of the `source` property of `request` is the [ResourceId](./client.md/#resourceid) of the resource requesting the operation.
  * The value of the `target` property of `request` is the [ResourceId](./client.md/#resourceid) of the resource to be retrieved.
  * The value of the `data` property of `request` is `undefined`.
  * The value of the boolean `options.observe` property of `request` tells if the client wants to also observe the resource for changes.
- If there is a previously saved handler associated with `request.data.resourcePath`, or any elements of `request.data.resourceTypes`, or any elements of `request.data.interfaces`, then invoke that function with `request` as argument.
- Otherwise, if there is a generic handler, then invoke that function with `request` as argument.
- If `request.observe` is `true`, set up change notifications for the resource, and send a retrieve response with the resource representation every time the resource is changed, according to the [`notify` algorithm](#notify). If the `request.options` property is defined and it is an object, then save that object in order that it can be used by the `notify()` algorithm.
- Otherwise, if `request.observe` is not `true`, reset change notifications for the resource which are sent to the client identified by the `source` property.


```javascript
var server = require('ocf').server;
server.onretrieve(function(request) {
  console.log("Client resource id: " + request.source);
  console.log("Target resource id, to be retrieved: " + request.target);

  // Retrieve resource in a device specific way.
  let res = _getResource(request.target);
  let err = res ? null : new Error('retrieving resource failed');

  let res = _getResource(request.target);  // private function
  if (!res) {
    request.respondWithError(new Error('retrieving resource failed'));
    return;
  }
  request.respond(res);

  if (request.observe) {
    console.log("Enabled change notifications for the resource.");
  } else {
    console.log("Disabled change notifications for the resource.");
  }
});
```

<a name="onupdate"></a>
##### 2.3. The `onupdate(handler, options)` method
Registers a function to handle OCF `update resource` requests and returns a reference to the server object for chaining.

Whenever the underlying platform notifies the implementation about an OCF update request, implementations should run the following steps:
- Create an [`OcfRequest`](#ocfrequest) object `request` as follows:
  * The value of the `source` property of `request` is the [ResourceId](./client.md/#resourceid) of the resource requesting the operation.
  * The value of the `target` property of `request` is the [ResourceId](./client.md/#resourceid) of the resource to be updated.
  * The `data` property of `request` should be an object that contains the *resource representation* properties that should be updated, according to the data model of the given resource.
- If there is a previously saved handler associated with `request.target.resourcePath`, or any elements of `request.target.resourceTypes`, or any elements of `request.data.interfaces`, then invoke that function with `request` as argument.
- Otherwise, if there is a generic handler, then invoke that function with `request` as argument.

It is the responsibility of the application to call [`notify()](#notify) when the resource is updated, in order that all observers are notified, and the updated resource representation should be provided in the response.

<a name="exampleonupdate"></a>
```javascript
var server = require('ocf').server;
server.on('update', function(request) {
  console.log("Client resource path: " + request.source.resourcePath);
  console.log("Resource path to be updated: " + request.target.resourcePath);

  let res = _updateResource(request.target, request.data);  // private function
  if (!res) {
    request.respondWithError(new Error('updating resource failed'));
    return;
  }
  request.respond(res);
  server.notify(res);
});
```

<a name="ondelete"></a>
##### 2.4. The `ondelete(handler, options)` method
Registers a function to handle OCF `delete resource` requests and returns a reference to the server object for chaining.

Whenever the underlying platform notifies the implementation about an OCF delete request, implementations should run the following steps:
- Create an [`OcfRequest`](#ocfrequest) object `request` as follows:
  * The value of the `source` property of the request is the [ResourceId](./client.md/#resourceid) of the resource requesting the operation.
  * The value of the `target` property of the request is the [ResourceId](./client.md/#resourceid) of the resource to be deleted.
  * The rest of `request` properties are `undefined`.
- If there is a previously saved handler associated with `request.target.resourcePath`, or any elements of `request.target.resourceTypes`, or any elements of `request.data.interfaces`, then invoke that function with `request` as argument.
- Otherwise, if there is a generic handler, then invoke that function with `request` as argument.

```javascript
var server = require('ocf').server;
server.ondelete(function(request) {
  console.log("Client resource id: " + request.source);
  console.log("Resource to be deleted: " + request.target);

  if(_deleteResource(request.target))  // private function
    request.respond();
  else
    request.respondWithError(new Error('deleting resource failed'));
});
```

<a name="onerror"></a>
##### 2.5. The `onerror(handler, options)` method
Registers a function to handle OCF `delete resource` requests and returns a reference to the server object for chaining.

Whenever the underlying platform notifies the implementation about an error with a request, implementations should run the following steps:
- Pass the [`OcfRequest`](#ocfrequest) object as `request` to this algorithm.
- If there is a previously saved error handler associated with `request.target.resourcePath`, or any elements of `request.target.resourceTypes`, or any elements of `request.data.interfaces`, then invoke that function with `request` as argument.
- Otherwise, if there is a generic error handler, then invoke that function with `request` as argument.

<a name="notify"></a>
##### 2.6. `notify(resource)`
Notifies about resource representation change of local resource `resource` and returns a [`Promise`](./README.md/#promise) object. The `resource` argument is an [Resource](./client.md/#resource) object where `resource.properties` contains the properties updated by the application.

See the [example](#exampleonupdate) for the `update` event.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- For each client that requested observing `resource.resourceId`, do the following sub-steps:
    * If there were request options specified with the retrieve request associated with observing the resource, and if a [translate function](#translate) has been defined for the resource during its [registration](#register), then let `resource` be the result of invoking that translate function with `resource` and the [request options dictionary](#requestoptions) that has been saved for the [observation request](#onretrieve).
    * Send an OCF notification for `resource`, and wait for the answer.
    * If there is an error during the request, emit an `error` event with that error.
- When all the answers are received, resolve `promise`.
Note that the `notify()` method always resolves. Errors on notifying individual clients are considered non-critical and should be handled by the `error` event.

<a name="register"></a>
##### 2.7. The `register(resource, translate)` method
Registers a resource in the OCF network and returns a [`Promise`](./README.md/#promise) object. The `resource` argument is an object that should contain at least the following properties (other resource properties may also be specified):

| Property       | Type   | Optional | Default value | Represents        |
| ---            | ---    | ---      | ---           | ---               |
| `resourcePath` | string | no       | `undefined`   | OCF device UUID   |
| `resourceTypes` | array of strings | no       | `undefined`   | List of OCF resource types |

<a name="translate"></a>
- the `translate` argument is a function that is invoked by the implementation when the client requests a certain representation of the resource by the means of request options. The function takes two arguments, a resource `representation` object that comes from `resource.properties`, and a dictionary that contains the REST request options parsed into a dictionary. It returns the modified resource representation object.

See the [example](#exampleoncreate) for the `create` event.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to register the given `resource`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, update `resource` to be a [`Resource`](./client.md/#resource) object.
- If `translate` is a function, associate it with `resource.resourcePath` and save it for future use by the [`notify()` algorithm](#notify).
- Resolve `promise` with `resource`.

<a name="unregister"></a>
##### 2.8. The `unregister(resourceId)` method
Unregisters the given resource id from the OCF network and returns a [`Promise`](./README.md/#promise) object. The `resourceId` argument is an [ResourceId](./client.md/#resourceid) object.

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
- Send a request to unregister the given `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.

The OCF network should send the presence notifications to listeners.

<a name="enablepresence"></a>
##### 2.9. `enablePresence(timeToLive)`
Enables presence for the current device, with an optional time-to-live argument.
Returns a [`Promise`](./README.md/#promise) object. The `timeToLive` argument is optional. It is a number representing the time to live of the request in seconds.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to enable presence for the current device, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.

<a name="disablepresence"></a>
##### 2.10. `disablePresence()`
Disables presence for the current device and returns a [`Promise`](./README.md/#promise) object.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to disable presence for the current device, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.
