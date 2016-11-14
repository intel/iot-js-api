OCF Web API Examples
====================

### Getting device configuration

```javascript
var ocf = require('ocf');

if (ocf.device.uuid) {  // configuration is valid
  // start server
} else {
  console.log("Error: device is not configured.");
}
```

### OIC Client controlling a remote red LED.
```javascript
let client = ocf.client;

// Discover a remote red light, start observing it, and make sure it's not too bright.
let red = null;

function startDiscovery() {
  client.findResources({ resourceType: "ocf.r.light" }, function(resource) {
    if (resource && resource.resourcePath === "/light/ambience/red") {
      red = resource;
      red.on('update', redLightUpdated);
    })
    .then(function() { console.log("Resource discovery started."); })
    .catch(function(e) { console.log("Error finding resources: " + e.message); });
};

function redLightUpdated(changedProperties) {
  console.log("Update received on " + red.resourcePath);

  if (red.properties.dimmer > 0.5) {
    // do something, e.g. limit output
    red.properties.dimmer = 0.5;
    client.update(red)
      .then(function() { console.log("Changed red light dimmer"); })
      .catch(function(e) { console.log("Error changing red light"); });
  }
};
```

### OIC Server exposing a local blue LED.

```javascript
let server = ocf.server;

let lightResource = null;
let listenerCount = 0;

function startServer() {
  // register the specific resources handled by this solution
  // which are not exposed by the device firmware
  server.registerResource({
    deviceId: ocf.device.uuid,
    resourcePath: "/light/ambience/blue/1",
    resourceTypes: [ "light" ],
    interfaces: [ "/oic/if/rw" ],
    discoverable: true,
    observable: true,
    properties: { color: "blue", dimmer: 0.2 }
  }).then(function(res) {
    console.log("Local resource " + res.resourcePath + " has been registered.");
    lightResource = res;
    lightResource
      .onupdate(lightUpdateHandler)
      .ondelete(lightDeleteHandler)
      .onretrieve(lightRetrieveHandler)
      .oncreate(lightCreateHandler);
    }
  }).catch(function(error) {
    console.log("Error creating resource " + error.resourcePath + ": " + error.message);
  });
};

function lightRetrieveHandler(request) {
    listenerCount += request.observe ? 1 : -1;
    request.respond(lightResource)  // lightResource === this
    .catch(function(err) {
      console.log("Error sending retrieve response.");
    });
};

function lightUpdateHandler(request) {
  // the implementation has by now updated this resource (lightResource)
  // this is a hook to update the business logic
  console.log("Resource " + request.target.resourcePath + " updated.");

  if (this.updateRepresentation(request.data.properties))
    server.notify()
      .then(function() { console.log("Update notifications sent."); })
      .catch(function(err) { console.log("Error sending notifications: " + err.message); });
  }
};

function lightDeleteHandler(request) {
  console.log("Deleting resource " + request.target.resourcePath);

  // clean up local state; notification about deletion is automatic
  request.respond()
  .catch(function(err) { console.log("Error sending delete response."); });
};

function lightCreateHandler(request) {
  var resourceInit = request.data;

  if (resourceInit.resourcePath !== "/light/ambience/blue/1") {
      request.respondWithError(new TypeError("create"));
      return;
  }

  console.log("Creating resource " + resourceInit.resourcePath +
              " at " + request.target.resourcePath);

  // Process the resource creation using a local call.
  let res = _createResource(request.target.resourcePath, resourceInit);

  // Register the new local resource, then respond to the create request.
  server.register(res)
    .then(function(resource) {
      request.respond(resource);
    }).catch(function(error) {
      request.respondWithError(error);
    });
};

```
