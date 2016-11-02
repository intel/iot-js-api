
OCF JavaScript API Web IDL
==========================

The Web IDL of the OCF JavaScript API is provided for convenience, but does not describe the API in a normative manner.

For instance, note that an `EventListener` callback adherent to Web IDL conventions would always get an instance of `Event` as parameter, but this API uses the Node.js [EventListener](https://nodejs.org/api/events.html#events_passing_arguments_and_this_to_listeners) convention, that allows registering any function object as an event callback. Therefore, event listener signatures are specified separately for each event in this API. See also this [note](http://heycam.github.io/webidl/#dfn-callback-interface).

As such, the `EventHandler<typelist>` notation denotes an event that accepts listeners with the type of the arguments enumerated in `typelist`. For instance `EventHandler<Resource>` provides listeners with one `Resource` object argument, and `EventHandler<ResourceId, ResourceId>` provides listeners with two `ResourceId` object arguments.

OCF API entry point
-------------------

```javascript

interface OCF {
  readonly attribute Device device;  // getter for local device info
  readonly attribute Platform platform;  // getter for local platform info

  readonly attribute OCFClient client;
  readonly attribute OCFServer server;
};

[NoInterfaceObject]
interface Platform {
  readonly attribute DOMString id;
  readonly attribute DOMString osVersion;
  readonly attribute DOMString model;
  readonly attribute DOMString manufacturerName;
  readonly attribute USVString manufacturerUrl;
  readonly attribute Date manufactureDate;
  readonly attribute DOMString platformVersion;
  readonly attribute DOMString firmwareVersion;
  readonly attribute USVString supportUrl;
};

[NoInterfaceObject]
interface Device {
  readonly attribute USVString uuid;
  readonly attribute USVString url;  // host:port
  readonly attribute DOMString name;
  readonly attribute sequence<DOMString> dataModels;
    // list of <vertical>.major.minor, e.g. vertical = “Smart Home”
  readonly attribute DOMString coreSpecVersion;   // core.<major>.<minor>
};

```

OCF Client API
--------------

```javascript
interface OcfClient {
  Promise<void> findResources(optional DiscoveryOptions options,
                              optional ResourceCallback listener);
  Promise<void> findDevices(optional DeviceCallback listener);
  Promise<void> findPlatforms(optional PlatformCallback listener);

  Promise<Device> getDeviceInfo(USVString deviceId);
  Promise<Platform> getPlatformInfo(USVString deviceId);

  Promise<ClientResource> create(ResourceId target,
                           Resource resource);

  Promise<ClientResource> retrieve(ResourceId resource,
                             optional Dictionary options,
                             optional ResourceCallback listener);

  Promise<void> update(Resource resource);  // at least resourceId + properties
  Promise<void> delete(ResourceId resource);

  attribute EventHandler<Platform> onplatformfound;
  attribute EventHandler<Device> ondevicefound;
  attribute EventHandler<Device> ondevicelost;
  attribute EventHandler<Device> ondevicechanged;
  attribute EventHandler<ClientResource> onresourcefound;
  attribute EventHandler<Error> onerror;
};

OCFClient implements EventEmitter;

callback ResourceCallback = void (ClientResource resource);
callback DeviceCallback = void (Device device);
callback PlatformCallback = void (Platform platform);

dictionary DiscoveryOptions {
  USVString deviceId;      // if provided, make direct discovery
  DOMString resourceType;  // if provided, include this in the discovery request
  USVString resourcePath;  // if provided, filter the results locally
};

dictionary ResourceId {
  USVString deviceId;
  USVString resourcePath;
};

dictionary Resource: ResourceId {
  sequence<DOMString> resourceTypes;
  sequence<DOMString> interfaces;
  sequence<DOMString> mediaTypes;
  boolean discoverable;
  boolean observable;
  boolean slow;
  ResourceRepresentation properties;
};

[NoInterfaceObject]
interface ClientResource: Resource {
  attribute EventHandler onupdate;
  attribute EventHandler ondelete;
};

ClientResource implements EventEmitter;

dictionary ResourceRepresentation {
  readonly attribute TimeStamp timeStamp;

  // here come the properties added by various sensor/resource data models
};

```

OCF Server API
--------------

```javascript

interface OcfServer {
  // Register a resource with the OCF network and get a resource Id.
  Promise<ServerResource> register(Resource resource);

  void oncreate(RequestHandler handler);

  // Enable/disable presence for this device.
  Promise<void> enablePresence(optional unsigned long timeToLive);  // in ms
  Promise<void> disablePresence();
};

[NoInterfaceObject]  // ServerResource can only be created by register().
interface ServerResource: Resource {
  // Register CRUDN request handlers.
  ServerResource onretrieve(RequestHandler handler);
  ServerResource onupdate(RequestHandler handler);
  ServerResource ondelete(RequestHandler handler);

  // Give the implementation a translate function for the resource representation.
  ServerResource ontranslate(TranslateCallback translator);

  // Update notification could be done automatically in most cases,
  // but in a few cases manual notification is needed.
  // Delete notifications should be made automatically by implementations.
  Promise<void> notify();

  Promise<void> unregister();
};

callback RequestHandler = void (Request request);

callback ErrorHandler = void (Error error);

// The function that is called by implementation to select resource representation.
callback TranslateCallback = ResourceRepresentation (Dictionary requestOptions);

// The request types below hide the request id, source, and target (this) deviceId.

[NoInterfaceObject]
interface OcfRequest {
  readonly attribute RequestType type;
  readonly attribute ResourceId source;
  readonly attribute ResourceId target;
  readonly attribute ResourceId? data;
  readonly attribute Dictionary options;
  readonly attribute boolean? observe;

  // Reply to a given request
  Promise<void> respond(optional Resource? resource);
  Promise<void> respondWithError(Error error);
}

enum RequestType { "create", "retrieve", "update", "delete" };

```
