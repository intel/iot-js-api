IoT Web APIs
============

<a name="introduction"></a>
Introduction
------------
The following JavaScript APIs are aimed for handling Internet of Things (IoT) applications.

* [Sensor API](./sensors/README.md): high level sensor APIs standardized in the [W3C Generic Sensor Working Group](https://www.w3.org/2009/dap/) and defines the [Generic Sensor API](https://www.w3.org/TR/generic-sensor/), but adapted to constrained environments. It also exposes interfaces to handle various [sensor types](https://www.w3.org/2009/dap/).
* [Board API](./board/README.md): provides low level interfaces for I/O operations supported by the board, and define pin mappings between board pin names and pin values mapped by the OS, so that developers could use board pin names in the API methods.
* [OCF - Open Connect Foundation](./ocf/README.md) API
* [Bluetooth Smart API](./ble/README.md) API (Peripheral mode).

Since implementations of these APIs will partly be running on constrained hardware, they might not support the latest [ECMAScript](http://www.ecma-international.org) versions.

However, implementations should support at least [ECMAScript 5.1](http://www.ecma-international.org/ecma-262/5.1/). Examples are limited to ECMAScript 5.1 with the exception of using Promises.

The API avoids using events in the server APIs ([OCF Server API](./ocf/README.md), [Bluetooth Smart API](./ble/README.md), and [Board API](./board/README.md)). The reason for this is that servers implement request handling, and one request has one request handler, therefore no need for multiple listeners. The [Sensor API](./sensors/README.md) continues to use events for compatibility with the W3C specification.

On the other hand, the way to use the event model is debated (e.g. `EventTarget` vs `EventEmitter`).

In order to ensure code compatibility between various clients (browser, Node.js, constrained runtimes), the client APIs use an event model that supports both `EventTarget` and `EventEmitter` with the constraints described below.

In the future events may be replaced by [`Observable`](https://github.com/tc39/proposal-observable).


<a name="structures"></a>
Structures
----------
The following structures MAY be implemented in a constrained version:
  - [Promise](#promise)
  - [Buffer](.#buffer)
  - [Error](#errors)
  - [EventEmitter](#events)
  - [EventTarget](#events)
  - [Observable](#observable).

<a name="promise"></a>
### Promises
The API uses [Promises](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects). In constrained implementations, at least the following [`Promise`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-objects) methods MUST be implemented:
- the [`Promise` constructor](http://www.ecma-international.org/ecma-262/6.0/#sec-promise-constructor)
- the [`then(onFulfilled, onRejected)`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise.prototype.then) method
- the [`catch(onRejected)`](http://www.ecma-international.org/ecma-262/6.0/#sec-promise.prototype.catch) method.

<a name="buffer"></a>
### Buffer
Buffer is a [node.js API](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html)
to read and write binary data accurately from JavaScript. This API supports a subset that will be expanded on need:
- constructor with a number argument `size`
- the `length` property
- the [`readUint8(offset)`](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html#buffer_buf_readuint8_offset_noassert) method
- the [`writeUint8(value, offset)`](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html#buffer_buf_writeuint8_value_offset_noassert) method
- the [`toString(encoding)`](https://nodejs.org/dist/latest-v6.x/docs/api/buffer.html#buffer_buf_tostring_encoding_start_end) method.

<a name="errors"></a>
### Error handling
Errors are exposed via `onerror` events and `Promise` rejections, using augmented [`Error`](https://nodejs.org/api/errors.html#errors_class_error) objects with added properties.

<a name="events"></a>
### Events
The API uses Node.js-style [events](https://nodejs.org/api/events.html#events_events). In constrained implementations, at least the following subset of the [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) interface MUST be supported:
- the [`on(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_on_eventname_listener) method
- the [`addListener(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_addlistener_eventname_listener) method, as an alias to the `on()` method
- the [`removeListener(eventName, callback)`](https://nodejs.org/api/events.html#events_emitter_removelistener_eventname_listener) method
- the [`removeAllListeners`](https://nodejs.org/api/events.html#events_emitter_removealllisteners_eventname) method.

Additionally, for compatibility it is recommended to support the following [EventTarget](https://developer.mozilla.org/en/docs/Web/API/EventTarget) methods:
- the [`addEventListener(eventName, listener)`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) method
- the [`removeEventListener(eventName, listener)`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) method
- the [`dispatchEvent(event)`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) method
- note that listeners receive an [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) object, following the semantics of `EventTarget`(https://developer.mozilla.org/en/docs/Web/API/EventTarget)
- the [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) objects MUST contain at least the following properties:
  * [`Event.type`](https://developer.mozilla.org/en-US/docs/Web/API/Event/type)
  * [`Event.cancelable`](https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable), with the default value `false`
  * [`Event.bubbles`](https://developer.mozilla.org/en-US/docs/Web/API/Event/bubbles), with the default value `false`
  * [`Event.eventPhase`](https://developer.mozilla.org/en-US/docs/Web/API/Event/eventPhase).

<a name="observable"></a>
### Observables
[Observables](https://github.com/tc39/proposal-observable) are a proposal for inclusion in ECMAScript. In order to replace events, in the future this API may use a subset of `Observable` with [signal semantics](https://github.com/kriskowal/gtor/blob/master/observables.md).

```javascript
interface Observable {
  Subscription subscribe(Function onevent, optional ErrorFunction onerror);
};

interface Subscription {
  void unsubscribe();
  boolean closed();
};

callback ErrorFunction = void (Error error);

```
The Web IDL notation `Observable<Type>` used in this API means the first argument `subscribe()` is a function that accepts an argument of type `Type`.

The second argument to `subscribe()` is an error function that accepts an `Error` object as parameter.
