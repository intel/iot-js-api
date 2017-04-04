IoT Web APIs
============

<a name="introduction"></a>
Introduction
------------
The following JavaScript APIs are aimed for handling Internet of Things (IoT) applications on a given device:
* [Open Connect Foundation (OCF) API](./ocf/README.md), exposing OCF Client and Server APIs
  - [OCF API Test Suite](./ocf/test-suite/README.md)
* [Bluetooth Smart API](./ble/README.md), exposing functionality for Bluetooth Peripheral mode
* [Sensor API](./sensors/README.md), exposing sensor functionality supported on the device
* [Board API](./board/README.md) providing low-level interfaces for I/O operations supported by the device board, so that applications could implement support for new types of sensors that are not supported by the Sensor API.

Since implementations of these APIs exist also on constrained hardware, they might not support the latest [ECMAScript](http://www.ecma-international.org) versions. However, implementations should support at least [ECMAScript 5.1](http://www.ecma-international.org/ecma-262/5.1/). Examples are limited to ECMAScript 5.1 with the exception of using [Promises](#promise).

<a name="structures"></a>
Structures
----------
The following structures SHOULD be implemented in a constrained environment:
  - [Promise](#promise)
  - [Buffer](#buffer)
  - [EventEmitter](#events)
  - [Error](#error).

<a name="promise"></a>
### Promises
The API uses [Promises](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects). In constrained implementations, at least the following [`Promise`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects) methods MUST be implemented:
- the [`Promise` constructor](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-constructor)
- the [`then(onFulfilled, onRejected)`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise.prototype.then) method
- the [`catch(onRejected)`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise.prototype.catch) method.

<a name="buffer"></a>
### Buffer
Buffer is a [node.js API](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html)
to read and write binary data accurately from JavaScript. This API supports a subset that will be expanded as needed:
- constructor with a number argument `size`
- the `length` property
- the [`readUint8(offset)`](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html#buffer_buf_readuint8_offset_noassert) method
- the [`writeUint8(value, offset)`](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html#buffer_buf_writeuint8_value_offset_noassert) method
- the [`toString(encoding)`](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html#buffer_buf_tostring_encoding_start_end) method.

<a name="events"></a>
### Events
The API uses Node.js-style [events](https://nodejs.org/api/events.html#events_events). In constrained implementations, at least the following subset of the [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) interface MUST be supported:
- the [`on(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener) method
- the [`addListener(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_addlistener_eventname_listener) method, as an alias to the `on()` method
- the [`removeListener(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener) method
- the [`removeAllListeners`](https://nodejs.org/api/events.html#events_emitter_removealllisteners_eventname) method.

Note that in order to make sure only one entity responds to a request, server request handling is done with registering callbacks at the serving objects (end points), rather than using events. Also, when subscribing to notifications requires options or filters, callbacks are used instead of events.

In the future events may be replaced by [`Observables`](https://github.com/tc39/proposal-observable) with signal semantics.

<a name="error"></a>
### Error handling
Errors are exposed via `onerror` events and `Promise` rejections, using augmented instances of a minimal subset of [`Error`](https://nodejs.org/api/errors.html#errors_class_error) objects with added properties.

The `Error` object MUST contain at least the following properties:

| Property        | Type    | Optional | Default value | Represents |
| ---             | ---     | ---      | ---           | ---     |
| name            | string  | no       | "Error"       | The standard name of the error |
| message         | string  | yes      | ""            | The error reason |

The following error names may be used by all APIs:
- `SecurityError` for lack of permission or invalid access.
- `NotSupportedError` for features not implemented.
- `SyntaxError` for broken JavaScript and `eval` errors. Use it sparingly.
- `TypeError` for invalid types, parameters, etc.
- `RangeError` for parameters out of permitted range.
- `TimeoutError` for timeouts.
- `NetworkError` for generic connection or protocol related errors.
- `SystemError` for generic platform errors, including reference errors.

Further errors may be defined in specific APIs.

Examples:
```
var error = new SecurityError("No permissions");

if ((error instanceof Error) && (error instanceof SecurityError)) {  // true
  console.log(error.name);  // "SecurityError"
  console.log(error.message);  // "No permissions"
}
```
