OCF JavaScript API Web IDL
==========================

The Web IDL of the OCF JavaScript API is provided for convenience, but does not describe the API in a normative manner.

For instance, note that an `EventListener` callback adherent to Web IDL conventions would always get an instance of `Event` as parameter, but this API uses the Node.js [EventListener](https://nodejs.org/api/events.html#events_passing_arguments_and_this_to_listeners) convention, that allows registering any function object as an event callback. Therefore, event listener signatures are specified separately for each event in this API. See also this [note](http://heycam.github.io/webidl/#dfn-callback-interface).

As such, the `EventHandler<typelist>` notation denotes an event that accepts listeners with the type of the arguments enumerated in `typelist`. For instance `EventHandler<OcfResource>` provides listeners with one `OcfResource` object argument, and `EventHandler<OcfResourceId, OcfResourceId>` provides listeners with two `OcfResourceId` object arguments.


## OCF API entry point

```javascript

[Constructor()]
interface OCF {
  readonly attribute OcfDevice device;  // getter for local device info
  readonly attribute OcfPlatform platform;  // getter for local platform info

  readonly attribute OcfClient client;
  readonly attribute OcfServer server;
};

[NoInterfaceObject]
interface OcfDevice {
  readonly attribute USVString uuid;
  readonly attribute USVString url;  // host:port
  readonly attribute DOMString name;
  readonly attribute sequence<DOMString> dataModels;
    // list of <vertical>.major.minor, e.g. vertical = “Smart Home”
  readonly attribute DOMString coreSpecVersion;   // core.<major>.<minor>
};

[NoInterfaceObject]
interface OcfPlatform {
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
```

## OCF Client API
```javascript
[NoInterfaceObject]
interface OcfClient {
  Promise<OcfDevice> getDeviceInfo(USVString deviceId);
  Promise<OcfPlatform> getPlatformInfo(USVString deviceId);

  Promise<void> findResources(optional OcfDiscoveryOptions options,
                              optional ResourceCallback listener);
  Promise<void> findDevices(optional DeviceCallback listener);
  Promise<void> findPlatforms(optional PlatformCallback listener);

  Promise<OcfResource> create(OcfResourceId target, OcfResourceInit resource);
  Promise<OcfResource> retrieve(OcfResourceId id,
                                optional Dictionary options,
                                optional ResourceCallback listener);
  Promise<void> update(OcfResource resource);  // partial dictionary
  Promise<void> delete(OcfResourceId id);

  attribute EventHandler<OcfPlatform> onplatformfound;
  attribute EventHandler<OcfDevice> ondevicefound;
  attribute EventHandler<OcfDevice> ondevicelost;
  attribute EventHandler<OcfResource> onresourcefound;
  attribute EventHandler<Error> onerror;
};

callback ResourceCallback = void (OcfResource resource);
callback DeviceCallback = void (OcfDevice device);
callback PlatformCallback = void (OcfPlatform platform);

dictionary OcfDiscoveryOptions {
  USVString deviceId;      // if provided, make direct discovery
  DOMString resourceType;  // if provided, include this in the discovery request
  USVString resourcePath;  // if provided, filter the results locally
};

dictionary OcfResourceId {
  USVString deviceId;  // UUID
  USVString path;  // resource path (short form)
};

dictionary OcfResourceInit {
  OcfResourceId id;
  sequence<DOMString> resourceTypes;
  sequence<DOMString> interfaces;
  sequence<DOMString> mediaTypes;
  boolean discoverable;
  boolean observable;
  boolean secure;
  boolean slow;
  sequence<OcfResourceId> links;
  Dictionary properties;
};

[NoInterfaceObject]
interface OcfResource: EventEmitter {
  // gets the properties of OcfResourceInit, all read-only
  readonly attribute ResourceId id;
  readonly attribute sequence<DOMString> resourceTypes;
  readonly attribute sequence<DOMString> interfaces;
  readonly attribute sequence<DOMString> mediaTypes;
  readonly attribute boolean discoverable;
  readonly attribute boolean observable;
  readonly attribute boolean slow;
  readonly attribute OcfResourceRepresentation properties;

  attribute EventHandler onupdate;
  attribute EventHandler ondelete;
};

```

## OCF Server API
```javascript
[NoInterfaceObject]
interface OcfServer: EventEmitter {
  Promise<OcfResource> register(OcfResourceInit resource);
  Promise<void> unregister(OcfResourceId id);

  // handle CRUDN requests from clients
  attribute EventHandler<OcfRequest> oncreate;
  attribute EventHandler<OcfRequest> onretrieve;
  attribute EventHandler<OcfRequest> onupdate;
  attribute EventHandler<OcfRequest> ondelete;

  attribute EventHandler<OcfResourceId, OcfResourceId> onobserve;
  attribute EventHandler<OcfResourceId, OcfResourceId> onunobserve;

  // update notification could be done automatically in most cases,
  // but in a few cases manual notification is needed
  // delete notifications should be made automatic by implementations
  Promise<void> notify(OcfResource resource);

  // enable/disable presence for this device
  Promise<void> enablePresence(optional unsigned long long ttl);  // in ms
  Promise<void> disablePresence();

  // Reply to a given request
  Promise<void> respond(OcfRequest request, Error? result, optional OicResource? resource);
};

[NoInterfaceObject]
interface OcfRequest {
  readonly attribute OcfResourceId source;
  readonly attribute OcfResourceId target;
  readonly attribute Dictionary options;
};

```
