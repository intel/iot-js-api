OCF Server API
==============

- The [OcfServer API object](#ocfserver)
- The [ServerResource](#serverresource) interface
- The [OcfRequest](#ocfrequest) interface

Introduction
------------
<a name="ocfserver">
The Server API provides the means to
- register and unregister resources,
- register handlers that serve CRUDN requests on a device,
- notify of resource changes.

A device that implements the `OcfServer` API may provide special resources to handle CRUDN requests.

The `OcfServer` API object exposed the following properties and methods.

|Property    |Type     |Optional |Default value |
| ---        | ---     | ---     | ---          |
| `platform` | [`OcfPlatform`](./README.md/#ocfplatform) object | no | implementation provided |
| `device`   | [`OcfDevice`](./README.md/#ocfdevice) object | no | implementation provided |

| Method signature                | Description                |
| ---                             | ---                        |
| [`register(resource)`](#register) | register a local resource with the OCF network |
| [`oncreate(handler)`](#oncreate)  | save a handler for create requests on this device |

The `platform` property is an [`OcfPlatform`](./README.md/#ocfplatform) object that represents properties of the hardware platform that hosts the current device.

The `device` property is an [`OcfDevice`](./README.md/#ocfdevice) object that represents properties of the device (OCF stack).

<a name="register"></a>
##### The `register(resource)` method
Registers a resource in the OCF network.
The `resource` argument is an object that should contain at least the following properties (other resource properties may also be specified):
- `resourcePath` as string
- `resourceTypes` as array of strings with at least one element
- `interfaces` as array of strings (if not specified, then by default `"oic.if.baseline"` is added)
- `mediaTypes` as array of strings that can be empty (by default empty)
- `discoverable` (by default `true`)
- `observable` (by default `true`)
- `secure` (by default `true`)
- `slow` (by default `false`)
- either `properties` as an object, or `links` as array of [`ResourceLink`](../client.md/#resourcelink) objects.

See the [create example](#exampleoncreate).

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to register the given `resource`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, update `resource` to be a [`ServerResource`](#serverresource) object.
- Update the [device's](./README.md/#ocfdevice) `types` property, if `resourceType` of `resource` is not in `types`.
- Resolve `promise` with `resource`.

<a name="oncreate"></a>
##### The `oncreate(handler)` method
Registers a function to handle OCF `create resource` requests and returns `this` for chaining. If the provided `handler` argument is not a `Function`, throw `"TypeMismatchError"`.

Whenever the underlying platform notifies the implementation about an OCF create request, implementations should run the following steps:
- Create an [`OcfRequest`](#ocfrequest) object `request` as follows:
  * The value of `request.source` is the [`ResourceId`](./client.md/#resourceid) of the client resource requesting the operation.
  * The value of `request.target` is the [`ResourceId`](./client.md/#resourceid) of the server resource responsible to create the requested resource, or `null` if not specified.
  * The value of `request.options` is an object that contains a list of properties with values created by the implementation from the REST query options of the request. For instance this object may contain client hints on what measurement units should be used in the resource representation.
  * The value of `request.data` is an object that contains at least the following properties of the [resource](./client.md/#resource) to be created: `resourcePath` and `resourceTypes`. In addition, other [resource](./client.md/#resource) properties may also be specified, such as `interfaces`, `mediaTypes`, and `properties` for resource representation initialization.
- Let `handler` be `null`.
- If `request.target` is not `null`, run the following sub-steps:
  * Find the `ServerResource` object `resource` for which `resource.resourcePath` is equal to `request.target.resourcePath`.
  * If there is no such object, or if there is no registered create handler on `resource`, then invoke `request.respondWithError(error)` with `"NotFoundError"` and terminate these steps.
  * Otherwise, let `handler` be the registered create handler on `resource`.
- Otherwise, if `request.target` is `null`, and if there is a registered create handler on the server object, let `handler` be that function.
- If `handler` is `null`, invoke `request.respondWithError(error)` with `"NotSupportedError"` and terminate these steps.
- Invoke `handler` with `request` as argument.

<a name="exampleoncreate"></a>
```javascript
require('ocf').start("server").then(function(server) {
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
              // use sensor-specific code to get Celsius units
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
    server.register(res)
      .then(function(resource) {
        resource.ontranslate(translate);
        server.respond(request, null, resource);
      }).catch(function(error) {
        server.respond(request, error, res);
      });
  });
}).catch(function(error) { console.log("Error: " + error.message); });
```

<a name="ocfrequest"></a>
### The `OcfRequest` interface
Describes an object that is passed to server event listeners.

| Property  | Type              | Optional | Default value | Represents |
| ---       | ---               | ---      | ---           | ---        |
| `type`    | string            | no       | `undefined`   | OCF request type |
| `source`  | [`ResourceId`](./client.md/#resourceid)  | no  | `undefined` | Requesting resource |
| `target`  |  [`ResourceId`](./client.md/#resourceid) | no  | `undefined` | Request handling resource |
| `data` | object   | no | `undefined` | Resource id or resource or resource representation |
| `options` | object | yes | `undefined` | dictionary containing the request options |
| `observe` | boolean | no | `undefined` | whether observation is to be on or off |

| Method signature                | Description                |
| ---                             | ---                        |
| [`respond(data)`](#respond) | respond to the protocol request with OK or data |
| [`respondWithError(error)`](#respondwitherror) | respond to the protocol request with error |

<a name="requesttype"></a>
The `type` property represents the OCF request type: `"create"`, `"retrieve"`, `"update"`, `"delete"`.

<a name="data"></a>
The `data` property in a request is an object that contains data that depends on the request `type` and is described in this document with the corresponding request.

<a name="requestoptions"></a>
The `options` property is an object whose properties represent the `REST` query parameters passed along with the request as a JSON-serializable dictionary. The semantics of the parameters are application-specific (e.g. requesting a resource representation in metric or imperial units). For instance request options may be used with the [retrieve](./client.md/#retrieveoptions) request.

<a name="observeflag"></a>
The `observe` property is a flag for OCF retrieve requests that tells whether observation for the requested resource should be on or off. For requests other than `"retrieve"` the value SHOULD be `undefined`.

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
- If `error` is not `null` and is an instance of `Error`, then mark the error in the response message (the error may be application-specific). Otherwise, mark a generic error in the response message.
- Send the response back to the sender.
- If there is an error during sending the response, reject `promise` with that error, otherwise resolve `promise`.

<a name="serverresource"></a>
### The `ServerResource` interface
`ServerResource` extends [`Resource`](./client.md/#resource), so it has all the properties of [`Resource`](#resource) as read-only, and in addition it has the following methods:

| Method signature                        | Description                |
| ---                                     | ---                        |
| [`onretrieve(handler)`](#onretrieve)    | save a handler for retrieve requests |
| [`ontranslate(translateFunction)`](#ontranslate) | save a handler for a translating resource representation |
| [`onupdate(handler)`](#onupdate)        | save a handler for update requests |
| [`ondelete(handler)`](#ondelete)        | save a handler for delete requests |
| [`notify()`](#notify)                   | notify all OCF observers of this resource |
| [`unregister(resourceId)`](#unregister) | unregister the resource from the OCF network |

#### `ServerResource` methods

<a name="ontranslate"></a>
##### The `ontranslate(handler)` method
Registers a callback function `handler` for translation and returns `this` for chaining. If the provided `handler` argument is not a `Function`, throw `"TypeMismatchError"`.

The `handler` function will be invoked by the implementation when the client requests a certain representation of the resource by the means of request options. The `handler` function will receive as argument a dictionary object `options` that contains the REST request options parsed into property-value pairs. The `handler` can use `options` and `this.properties` in order to compute the modified resource representation object.

See the [create example](#exampleoncreate).

<a name="onretrieve"></a>
##### The `onretrieve(handler)` method
Registers the function `handler` to handle OCF `retrieve resource` requests and returns `this` for chaining. If the provided `handler` argument is not a `Function`, throw `"TypeMismatchError"`.

Whenever the underlying platform notifies the implementation about an OCF retrieve request, implementations should run the following steps:
- Create an [`OcfRequest`](#ocfrequest) object `request` as follows:
  * The value of the `source` property of `request` is the [`ResourceId`](./client.md/#resourceid) of the resource requesting the operation.
  * The value of the `target` property of `request` is the [`ResourceId`](./client.md/#resourceid) of the resource to be retrieved.
  * The value of the `data` property of `request` is `undefined`.
  * The value of the boolean `request.observe` property of `request` tells if the client wants to also observe the resource for changes.
- Find the `ServerResource` object `resource` for which `resource.resourcePath` is equal to `request.target.resourcePath`.
- If there is no such object, invoke `request.respondWithError(error)` with a new `"NotFoundError"` and terminate these steps.
- If there is a registered retrieve handler on `resource`, invoke that function with `request` as argument.
- If `request.observe` is `true`, set up change notifications for the resource, and send an OCF retrieve response including the resource representation every time the resource is changed, according to the [`notify` algorithm](#notify). If `request.options` is an object, then save that object in association with `request.source` in order that it can be used by the `notify()` algorithm.
- Otherwise, if `request.observe` is `false`, reset change notifications sent to the client identified by the `request.source` property.

```javascript
require('ocf').start("server").then(function(server) {
  server.onretrieve(function(request) {
    console.log("Client resource id: " + request.source);
    console.log("Target resource id, to be retrieved: " + request.target.resourcePath);

    // Retrieve resource in a device-specific way.
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
}).catch(function(error) { console.log("Error: " + error.message); });
```

<a name="onupdate"></a>
##### The `onupdate(handler)` method
Registers the function `handler` to handle OCF `update resource` requests and returns `this` for chaining. If the provided `handler` argument is not a `Function`, throw `"TypeMismatchError"`.

Whenever the underlying platform notifies the implementation about an OCF update request, implementations should run the following steps:
- Create an [`OcfRequest`](#ocfrequest) object `request` as follows:
  * The value of the `source` property of `request` is the [`ResourceId`](./client.md/#resourceid) of the resource requesting the operation.
  * The value of the `target` property of `request` is the [`ResourceId`](./client.md/#resourceid) of the resource to be updated.
  * The `data` property of `request` should be an object that contains the *resource representation* properties that should be updated, according to the data model of the given resource.
- Find the `ServerResource` object `resource` for which `resource.resourcePath` is equal to `request.target.resourcePath`.
- If there is no such object, invoke `request.respondWithError(error)` with a new `NotFoundError` and terminate these steps.
- If there is a registered update handler on `resource`, invoke that function with `request` as argument.

It is the responsibility of the application to call [`notify()`](#notify) after the resource is updated.

<a name="exampleonupdate"></a>
```javascript
require('ocf').start("server").then (function(server) {
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
}).catch(function(error) { console.log("Error: " + error.message); });
```

<a name="ondelete"></a>
##### The `ondelete(handler)` method
Registers the `handler` function to handle OCF `delete resource` requests and returns `this` for chaining. If the provided `handler` argument is not a `Function`, throw `"TypeMismatchError"`.

Whenever the underlying platform notifies the implementation about an OCF delete request, implementations should run the following steps:
- Create an [`OcfRequest`](#ocfrequest) object `request` as follows:
  * The value of the `source` property of the request is the [`ResourceId`](./client.md/#resourceid) of the resource requesting the operation.
  * The value of the `target` property of the request is the [`ResourceId`](./client.md/#resourceid) of the resource to be deleted.
  * The rest of `request` properties are `undefined`.
- Find the `ServerResource` object `resource` for which `resource.resourcePath` is equal to `request.target.resourcePath`.
- If there is no such object, invoke `request.respondWithError(error)` with a new `NotFoundError` and terminate these steps.
- If there is a registered delete handler on `resource`, invoke that function with `request` as argument.

```javascript
require('ocf').start("server").then(function(server) {
  server.ondelete(function(request) {
    console.log("Client resource id: " + request.source);
    console.log("Resource to be deleted: " + request.target.resourcePath);

    if(_deleteResource(request.target))  // private function
      request.respond();
    else
      request.respondWithError(new Error('deleting resource failed'));
  });
}).catch(function(error) { console.log("Error: " + error.message); });
```

<a name="notify"></a>
##### The `notify()` method
Notifies subscribed clients about a resource representation change and returns a [`Promise`](./README.md/#promise) object.

See the [example](#exampleonupdate) for the `update` event.

The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- For each client that requested observing `this.resourcePath`, run the following sub-steps:
    * If there were request options specified with the retrieve request associated with observing the resource, and if a [translate function](#ontranslate) has been defined for the resource, then let `translatedRepresentation` be the result of invoking that translate function with the [request options dictionary](#requestoptions) that has been saved for the [observation request](#onretrieve).
    * Send an OCF update notification to the client using `translatedRepresentation`.
- When all notifications are sent, resolve `promise`.

<a name="unregister"></a>
##### The `unregister()` method
Unregisters the given resource from the OCF network and returns a [`Promise`](./README.md/#promise) object.

```javascript
require('ocf').start("server").then(function(server) {
  server.unregister(resource)
    .then(resource) {
      console.log("Successfully unregistered resource " + resource.resourcePath)
    }.catch(error) {
      console.log("Error: " + error.message)
    };
}).catch(function(error) { console.log("Error: " + error.message); });
```
The method runs the following steps:
- Return a [`Promise`](./README.md/#promise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- Send a request to unregister `this.resourcePath` on `this.deviceId` and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.
