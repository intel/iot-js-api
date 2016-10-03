
Event Observers
===============

This is a proposal for a minimal event handling interface based on watches that monitor, filter and handle events in IoT use cases. It can be implemented with minimal polyfill on top of `EventTarget` or `EventEmitter`, in browser, Node.js and constrained runtimes.

Based on use cases and issues from the [W3C Generic Sensor API](https://github.com/w3c/sensors/issues/21), the [W3C Web of Things](https://github.com/w3c/wot/issues/235),  and [Node.js style events](https://nodejs.org/api/events.html#events_events), it seems there are divergent views on how (sensor reading) events should be handled in IoT.

[Observables](https://github.com/tc39/proposal-observable) are also a proposed model to handle asynchronous samples streams. [Xstream](https://github.com/staltz/xstream) is also targeting similar use cases. Even though there is a lot of overlap, these seem to be slightly different use cases than the one in IoT implementations.

The minimum feature set needed in IoT:
- Event emitters with multiple event listeners (= streams).
- Functionality for adding listeners.
- Functionality for removing listeners.
- Optional filters on events.

An `event` for IoT may need to contain the following informations:
- event name
- data representation, including
  * timestamp
  * data origin
  * other properties from the data model.

Another requirement would be that client code written in browser should be compatible with Node.js clients and also with constrained JS runtimes.

The best existing structure to fulfill these requirements would be [EventSource](https://developer.mozilla.org/en/docs/Web/API/EventSource), see also a [Node.js implementation](https://www.npmjs.com/package/eventsource). However, it carries too many things for constrained implementations.

The following proposal distillates the most needed features in a minimal package; it inherits `EventEmitter`, implements `EventTarget` for compatibility, and overloads the `on()` method to return a watch that is used in a manner similar to `Subscription` in [Observables](https://github.com/tc39/proposal-observable).

Web IDL
=======
```javascript

EventObserver: EventEmitter {
  // 'on()' now takes an optional filter and returns a watch
  EventWatch on(String eventName,
                optional EventHandler listener,
                optional Filter filter);
};

EventObserver implements EventTarget;
// addEventListener, removeEventListener, dispatchEvent

interface EventWatch {
  void cancel();  // remove all filters and listener and cancel this watch

  // syntactic sugar for managing filters and listener
  EventWatch filter(Filter filter);  // append a new filter, return `this`
  void listener(EventHandler listener);  // replace listener
};

callback EventFilter = boolean (any data);

typedef (Dictionary or EventFilter) Filter;
```

A practical application would be reporting sensor data.

```javascript
interface SensorData {
  readonly attribute String timestamp;
  readonly attribute String origin;  // the URL of the data source
  // ... other properties, according to the data model
};

[Constructor (String name, optional SensorData data)]
interface SensorEvent: Event {
  readonly attribute SensorData data;
};

```

Using `EventObserver`
=====================

Objects that normally implement `EventTarget` or `EventEmitter`, will implement `EventObserver` instead, and will expose event names normally as `EventHandler` properties.

Listeners are added to events as before, only that `on()` now returns an `EventWatch` object instead of `EventEmitter` self reference, so we lose cascading (of course, `EventWatch` could extend `EventEmitter` to solve that, but not in this version).

Also, `on()` will accept an optional filter, either a dictionary where all properties must match a property in event data, or a filter function that receives event data and returns `true` or `false`.

The returned `EventWatch` object always refers to one event, has one listener, 0 or more filters, and exposes:
- a `cancel()` function for the watch, that removes all filters and the listener,
- a method to append a new filter to the watch,
- a method to change the listener associated to the watch.

When a filter is a function, receives the same arguments as listeners.
When a filter is a dictionary, the listener MUST receive only one argument that is an object, and each property found in the filter MUST value-match a property with the same name in the argument object in order that the listener is invoked.

When a new filter is appended to the watch, it is applied after the previous filters, so it restricts more and more the invocation of the event listener.

Since a listener can be added or changed in a watch, the listener parameter to the `on()` method becomes optional. A watch without a listener just doesn't work, i.e. it does not invoke any listener, until one is added.

Note that the filtering functionality could be part of the listeners themselves, and then `EventObserver` would be reduced to `EventEmitter`. However, in IoT, using watches brings added value for cancellation, clarity with explicit cumulative filters, and flexibility with replaceable listeners.

Also note that watches are only supported by the overloaded `on()` method of `EventEmitter`, and `EventTarget` is supported in [compatibility mode](#eventtarget).

How `EventObserver` is used in specifications:
```javascript

interface MyObject : EventObserver {
  // ...
  attribute EventHandler onchange;
  attribute EventHandler ondelete;
  // ...
};
```

And how is it used in client code:
```javascript
var obj = new MyObject();

watch = obj.on("change")
  .filter(function(data) {
    if (data.threshold > 0)
      return true;
    return false;
  }).listener(function(data) {
    // now it is guaranteed that data.threshold > 0
)

// ...

watch.cancel();

// alternative syntax, without filter
watch = obj.on("change", function(data) {
  // use data;
  console.log("Timestamp: " + data.timestamp);
  console.log("Origin: " + data.origin);
});

// alternative syntax, with data filter
watch = obj.on("change", function(data) {
  // use data;
}, { value: 0 });  // will trigger only when data.value is 0

```

<a name="promise"></a>
`EventTarget` compatibility
===========================
In constrained runtimes it is recommended to support the following [EventTarget](https://developer.mozilla.org/en/docs/Web/API/EventTarget) methods:
- the [`addEventListener(eventName, listener)`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) method
- the [`removeEventListener(eventName, listener)`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener) method
- the [`dispatchEvent(event)`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent) method
- note that listeners receive an [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) object, following the semantics of `EventTarget`(https://developer.mozilla.org/en/docs/Web/API/EventTarget)
- the [`Event`](https://developer.mozilla.org/en-US/docs/Web/API/Event) objects MUST contain at least the following properties:
  * [`Event.type`](https://developer.mozilla.org/en-US/docs/Web/API/Event/type)
  * [`Event.cancelable`](https://developer.mozilla.org/en-US/docs/Web/API/Event/cancelable), with the default value `false`
  * [`Event.bubbles`](https://developer.mozilla.org/en-US/docs/Web/API/Event/bubbles), with the default value `false`
  * [`Event.eventPhase`](https://developer.mozilla.org/en-US/docs/Web/API/Event/eventPhase).

```javascript

var obj = new MyObject();

obj.addEventListener("change", function(event) {
  // use event.data as listeners receive an Event object
  console.log("Timestamp: " + event.data.timestamp);
  console.log("Origin: " + event.data.origin);
});

```
