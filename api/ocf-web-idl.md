OCF JavaScript API Web IDL
==========================

The Web IDL of the OCF JavaScript API is provided for convenience, but does not describe the API in a normative manner.

For instance, note that an `EventListener` callback adherent to Web IDL conventions would always get an instance of `Event` as parameter, but this API uses the Node.js [EventListener](https://nodejs.org/api/events.html#events_passing_arguments_and_this_to_listeners) convention, that allows registering any function object as an event callback. Therefore, event listener signatures are specified separately for each event in this API. See also this [note](http://heycam.github.io/webidl/#dfn-callback-interface).

As such, the `EventHandler<typelist>` notation denotes an event that accepts listeners with the type of the arguments enumerated in `typelist`. For instance `EventHandler<OcfResource>` provides listeners with one `OcfResource` object argument, and `EventHandler<OcfResourceId, OcfResourceId>` provides listeners with two `OcfResourceId` object arguments.


## OCF API entry point

```javascript
enum OcfRole { "all", "client", "server", "discovery" };

[Constructor(optional OcfRole role = "all")]
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

## OCF Discovery API
```javascript
[NoInterfaceObject]
interface OcfDiscovery: EventEmitter {
  // get device info of a given remote device
  // id is either a device UUID or a URL (host:port)
  Promise<OcfDevice> getDeviceInfo(USVString id);

  // get platform info of a given remote device
  Promise<OcfPlatform> getPlatformInfo(USVString id);

  //fire 'resourcefound' for each resource found
  Promise<void> findResources(optional OcfDiscoveryOptions options);

  // fire a 'devicefound' event for each found
  Promise<void> findDevices();

  // multicast platform discovery
  Promise<void> findPlatforms();  // fire a 'platformfound' event for each found

  attribute EventHandler<OcfResource> onresourcefound;
  attribute EventHandler<OcfDevice> ondevicefound;
  attribute EventHandler<OcfPlatform> onplatformfound;
  attribute EventHandler<Error> onerror;
};

dictionary OcfDiscoveryOptions {
  USVString deviceId;      // if provided, make direct discovery
  DOMString resourceType;  // if provided, include this in the discovery request
  USVString resourcePath;  // if provided, filter the results locally
};

```

## OCF Client API
```javascript
[NoInterfaceObject]
interface OcfClient {
  Promise<OcfResource> create(OcfResourceId target, OcfResourceInit resource);
  Promise<OcfResource> retrieve(OcfResourceId id, optional Dictionary options);
  Promise<void> update(OcfResource resource);  // partial dictionary
  Promise<void> delete(OcfResourceId id);

  readonly attribute EventHandler<OcfDevice> ondeviceadded;
  readonly attribute EventHandler<OcfDevice> ondevicechanged;
  readonly attribute EventHandler<OcfDevice> ondevicelost;
};

OcfClient implements OcfDiscovery;

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
interface OcfResource {
  // gets the properties of OcfResourceInit, all read-only
  readonly attribute ResourceId id;
  readonly attribute sequence<DOMString> resourceTypes;
  readonly attribute sequence<DOMString> interfaces;
  readonly attribute sequence<DOMString> mediaTypes;
  readonly attribute boolean discoverable;
  readonly attribute boolean observable;
  readonly attribute boolean slow;
  readonly attribute sequence<OcfResourceId> links;  // for resource hierarchies
  readonly attribute OcfResourceRepresentation properties;
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
  Promise<void> reply(OcfRequest request, Error error, optional OicResource? resource);
};

[NoInterfaceObject]
interface OcfRequest {
  readonly attribute OcfResourceId source;
  readonly attribute OcfResourceId target;
  readonly attribute Dictionary options;
};

```
