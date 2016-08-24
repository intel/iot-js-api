OCF Server API
==============
The Server API implements functionality to serve CRUDN requests in a device. A device that implements the Server API may provide special resources to handle CRUDN requests. The requests are exposed by the [`OcfRequest`](#ocfrequest) interface.

 Also, the Server API provides means to register and unregister resources, to notify resource changes, and to enable and disable presence functionality on the device.

The Server API object does not expose own properties, only events and methods.

When a device is constructed, the implementation should announce presence, together with the resources it contains.

When a device is changed or shut down, the implementation should update presence information. Clients can subscibe to presence information in the [OCF Client API](./ocf-client-api.md).

## 1. Helper objects
<a name="ocfrequest"></a>
### 1.1. The `OcfRequest` object
#### `OcfRequest` Properties
| Property  | Type              | Optional | Default value | Represents |
| ---       | ---               | ---      | ---           | ---        |
| `source`  | [`OcfResourceId`](./ocf-client-api.md/#ocfresourceid)  | no  | `undefined` | Id of the requesting resource |
| `target`  |  [`OcfResourceId`](./ocf-client-api.md/#ocfresourceid) | no  | `undefined` | Id of the request handling resource |
| `options` | object               | it depends | `undefined` | Additional properties |

The `options` property is mandatory for `create` and `update`, and optional for the rest.
The `options` property is an object that contains resource specific properties and values, usually described in the [RAML](http://www.oneiota.org/documents?filter%5Bmedia_type%5D=application%2Framl%2Byaml) definition of the resource. It comes from the query portion of the request URI.

## 2. Events
The requests are dispatched using events. The Server API supports the following events:

| Event name  | Event callback argument            |
| ----------- | -----------------------            |
| *create*    | [`OcfRequest`](#ocfrequest) object |
| *retrieve*  | [`OcfRequest`](#ocfrequest) object |
| *update*    | [`OcfRequest`](#ocfrequest) object |
| *delete*    | [`OcfRequest`](#ocfrequest) object |

Note that the OCF retrieve request contains the `observe` flag, which tells whether the client requires change notifications for the given resource.

<a name="oncreate"></a>
##### 2.1. The `create` event
Fired when a client asks for a resource to be created on the device. The event callback receives as argument an [`OcfRequest`](#ocfrequest) object that can be used to respond to the request.
The value of the `source` property of the request is the [OcfResourceId](./ocf-client-api.md/#ocfresourceid) of the resource requesting the operation.
The value of the `target` property of the request is the [OcfResourceId](./ocf-client-api.md/#ocfresourceid) of the resource responsible to create the requested resource.
The value of the `options` property of the request should be an object that contains at least the following properties of the resource to be created:

| Property       | Type   | Optional | Default value | Represents            |
| ---            | ---    | ---      | ---           | ---                   |
| `resourcePath` | string | no       | `undefined`   | OCF resource URI path |
| `resourceType` | string | no       | `undefined`   | OCF resource type     |

Other resource properties may also be specified.
<a name="exampleoncreate"></a>
```javascript
var server = require('ocf').server;
server.on('create', function(request) {
  console.log("Client resource id: " + request.source);
  console.log("Target resource id, responsible to create the resource: " + request.target);
  console.log("Request options (initial resource properties): ");
  console.log("Requested resource path: " + request.options.resourcePath);
  console.log("Requested resource type: " + request.options.resourceType);

  let res = _createResource(request.options);  // create resource in a device specific way
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
- A boolean `observe` flag.

The value of the `source` property of the request is the [OcfResourceId](./ocf-client-api.md/#ocfresourceid) of the resource requesting the operation.
The value of the `target` property of the request is the [OcfResourceId](./ocf-client-api.md/#ocfresourceid) of the resource to be retrieved.

When the `observe` argument is `true`, then implementations SHOULD set up change notifications for the resource, and send a retrieve response with the resource representation every time the resource is changed.

When the `observe` argument is `true`, then implementations SHOULD reset change notifications for the resource.

```javascript
var server = require('ocf').server;
server.on('retrieve', function(request, observe) {
  console.log("Client resource id: " + request.source);
  console.log("Target resource id, to be retrieved: " + request.target);

  let res = _getResource(request.target);  // retrieve resource in a device specific way
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
The value of the `source` property of the request is the [OcfResourceId](./ocf-client-api.md/#ocfresourceid) of the resource requesting the operation.
The value of the `target` property of the request is the [OcfResourceId](./ocf-client-api.md/#ocfresourceid) of the resource to be updated.
The `options` property of the request should be an object that contains the resource properties that should be updated, according to the data model of the given resource.

When the resource is updated, all observers should be notified, and the updated resource representation should be sent back in the response.

<a name="exampleonupdate"></a>
```javascript
var server = require('ocf').server;
server.on('update', function(request) {
  console.log("Client resource id: " + request.source);
  console.log("Target resource id, to be updated: " + request.target);
  console.log("Updating the following properties: " + request.options);

  let res = _updateResource(request.target, request.options);
  let err = res ? null : new Error('updating resource failed');
  server.notify(res);
  server.respond(request, err, res);
});
```

<a name="ondelete"></a>
##### 2.4. The `delete` event
Fired when a client asks for a resource to be deleted on the device. The event callback receives as argument an [`OcfRequest`](#ocfrequest) object that can be used in the response.
The value of the `source` property of the request is the [OcfResourceId](./ocf-client-api.md/#ocfresourceid) of the resource requesting the operation.
The value of the `target` property of the request is the [OcfResourceId](./ocf-client-api.md/#ocfresourceid) of the resource to be deleted.
The `options` property of the request is not used.
```javascript
var server = require('ocf').server;
server.on('delete', function(request) {
  console.log("Client resource id: " + request.source);
  console.log("Target resource id, to be deleted: " + request.target);

  let res = _deleteResource(request.target);
  // Presence should notify clients about the deletion of the resource
  let err = res ? null : new Error('deleting resource failed');
  server.respond(request, err);
});
```

## 3. Methods
<a name="register"></a>
##### 3.1. `register(resourceInit)` method
- Registers the provided [`resourceInit`](./ocf-client-api.md/#ocfresourceinit) object as a resource in the OCF network, obtains a resource id for it, and then resolves with an [OcfResource](./ocf-client-api.md/#ocfresource) object.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `resourceInit` argument is an [OcfResourceInit](./ocf-client-api.md/#ocfresourceinit) object. It should contain at least the following properties (other resource properties may also be specified):

| Property       | Type   | Optional | Default value | Represents        |
| ---            | ---    | ---      | ---           | ---               |
| `resourcePath` | string | no       | `undefined`   | OCF device UUID   |
| `resourceType` | string | no       | `undefined`   | OCF resource type |

See the [example](#exampleoncreate) for the `create` event.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to register the given `resourceInit` structure, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise` with an [`OcfResource`](./ocf-client-api.md/#ocfresource) object created from the response.


<a name="unregister"></a>
##### 3.2. `unregister(resourceId)`
- Unregisters the given resource id from the OCF network.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `resourceId` argument is an [OcfResourceId](./ocf-client-api.md/#ocfresourceid) object.

```javascript
let server = require('ocf').server;

server.unregister(resource)
  .then(resource) {
    console.log("Successfully unregistered resource with id: " + resource.id.path)
  }.catch(error) {
    console.log("Error: " + error.message)
  };
```
The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to unregister the given `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.

<a name="notify"></a>
##### 3.3. `notify(resource)`
- Notifies the observers of `resource` with the current resource representation.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `resource` argument is an [OcfResource](./ocf-client-api.md/#ocfresource) object.

See the [example](#exampleonupdate) for the `update` event.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to unregister the given `resourceId`, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.

<a name="enablepresence"></a>
##### 3.4. `enablePresence(ttl)`
- Enables presence for the current device, with an optional time to live argument.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.
- The `ttl` argument is optional. It is a number representing the time to live of the request in seconds.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to enable presence for the current device, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.

<a name="disablepresence"></a>
##### 3.5. `disablePresence()`
- Disables presence for the current device.
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Send a request to disable presence for the current device, and wait for the answer.
- If there is an error during the request, reject `promise` with that error.
- When the answer is received, resolve `promise`.


<a name="respond"></a>
##### 3.6. `respond(request, result, data)`
- Sends a response to a given [`OcfRequest`](#ocfrequest).
- Returns a [`Promise`](./ocf-api.md/#ocfpromise) object that resolves when the response is successfully sent, otherwise rejects.
- The `request` argument is mandatory, and it should be the `OcfRequest` object which is being responded to.
- The `result` arguments is mandatory, it should be `null` in case of success, and should be an instance of [`Error`](https://nodejs.org/api/errors.html#errors_class_error) in case of error.
- The `data` argument is optional and used with requests that return data, such as `create` and `update`.

The method is typically used from request event handlers, and internally reuses the request information (type, requestId, source, target) in order to construct a response message.

The method runs the following steps:
- Return a [`Promise`](./ocf-api.md/#ocfpromise) object `promise` and continue [in parallel](https://html.spec.whatwg.org/#in-parallel).
- If there is no permission to use the method, reject `promise` with `"SecurityError"`.
- If the functionality is not supported, reject `promise` with `"NotSupportedError"`.
- Construct a response message to `request`, reusing the properties of `request`.
- If `result` is not `null` and an instance of `Error`, then mark the error in the response message.
- If `data` is not `null`, then include it in the response message (when the protocol message format supports that).
- Send the response back to the sender.
- If there is an error during sending the response, reject `promise` with that error, otherwise resolve `promise`.
