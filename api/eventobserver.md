Event Observers
===============

This is a proposal for extending `EventEmitter` with filtering support, named `EventObserver`. It can be implemented with minimal polyfill on top of `EventEmitter` or `EventTarget`, in browser, Node.js and constrained runtimes.

[Observables](https://github.com/tc39/proposal-observable) are also a proposed model to handle asynchronous samples streams. [Xstream](https://github.com/staltz/xstream) is also targeting similar use cases. Even though there is a lot of overlap, these seem to be slightly different use cases than the one in IoT implementations.

The minimum feature set needed in IoT:
- Optional filters on events.
- At least one event listener (server side), or multiple listeners (client side).
- Add and remove listeners.
- cancel observation.

That is close to `EventTarget` or `EventListener` with the added functionality of supporting optional event filters.

An event for IoT may need to contain the following information:
- event name
- data representation as a dictionary, including
  * timestamp
  * data origin
  * other properties from the data model.

The best existing structure to fulfill these requirements would be [EventSource](https://developer.mozilla.org/en/docs/Web/API/EventSource), see also a [Node.js implementation](https://www.npmjs.com/package/eventsource). However, it carries too many things for constrained implementations.

 The main features of the proposed `EventObserver` are:
- inherits `EventEmitter`
- implements `EventTarget` for compatibility
- overloads the `on()` method to accept an optional filter argument
- adds convenience functions to add a filter, list filters, and replace the listener
- returns a reference to itself for chaining.

Web IDL
=======
```javascript

EventObserver: EventEmitter {
  // 'on()' now takes an optional filter and returns a watch
  EventObserver on(String eventName,
                optional Function listener,
                optional Filter filter);
  void cancel(String eventName);  // remove filters and listener for an event
  EventObserver filter(Filter filter);  // append a new filter, return `this`
  EventObserver listener(EventHandler listener);  // replace listener

  readonly attribute sequence<Filter> filters;
};

EventObserver implements EventTarget;
// addEventListener, removeEventListener, dispatchEvent

callback EventFilter = boolean (any data);

typedef (Dictionary or EventFilter) Filter;
```

Using `EventObserver`
=====================

Objects that normally implement `EventTarget` or `EventEmitter`, will implement `EventObserver` instead, and will expose event names normally as `EventHandler` properties.

Listeners are added to events as before, only that `on()` now returns an `EventObserver` self-reference instead of `EventEmitter` self reference.

Also, `on()` will accept an optional filter, which is either a dictionary where all properties must match a property in the event data, or a filter function that receives the event data and returns `true` or `false`.

When a filter is a function, it receives the same arguments as listeners.

When a filter is a dictionary, the listener receives only one argument that is an object, and each property found in the filter is a value-match of a property with the same name in the argument object.

When a new filter is appended to the watch, it is applied after the previous filters, so it restricts more and more the invocation of the event listener ('AND' semantics).

Since a listener can be added or changed later, the listener parameter to the `on()` method becomes optional.

Filtering functionality could be part of the listeners implementations themselves, and then `EventObserver` would be reduced to `EventEmitter`. Then `EventObserver` is the same as `EventEmitter`.

Code written with `EventEmitter` is compatible with `EventObserver`.

If `EventObserver` is not implemented, then code written with `EventObserver` will work with events and listeners, but filters won't work, therefore filters need to be implemented inside listeners.


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

obj.on("change")
  .filter(function(data) {
    if (data.threshold > 0)
      return true;
    return false;
  }).listener(function(data) {
    // now it is guaranteed that data.threshold > 0
)

// alternative syntax, without filter
obj.on("change", function(data) {
  // use data;
  console.log("Timestamp: " + data.timestamp);
  console.log("Origin: " + data.origin);
});

// alternative syntax, with data filter
obj.on("change",
        function(data) {
          // use data;
        },
        { value: 0 });  // will trigger only when data.value is 0

obj.cancel("change");
```

Applications
============

## Discovery
```javascript
partial interface ThingClient: EventObserver {
    EventObserver discover(Dictionary filter);
    attribute EventHandler ondiscovery;
};

dictionary DiscoveryFilter {
    // Thing properties
};
```
It would be used like:

```javascript
client.discover({ type: "lightSensor" })  // sets filter for EventObserver
  .on("discovery", function(thing) {  // sets listener for EventObserver
      console.log("Thing: " + thing.toString());
  }).on("error", function(error)) {  // sets specific discovery error listener for EventObserver
     console.log("Discovery error: " + error.message);
  };
```

## Reporting sensor data

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

interface Sensor: EventObserver {
  attribute EventHandler ondata;
}

```
Used as
```javascript
var s = new Sensor();

s.on("data")
.filter(function(data){
    if (data.value > 1)
      return true;
    return false;
}).listener(function(data) {
  console.log("Data: " + data.value);
});
```
