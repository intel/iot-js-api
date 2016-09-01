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
    server.on("update", lightUpdateHandler);
    server.on("delete", lightDeleteHandler);
    server.on("retrieve", lightRetrieveHandler);
    server.on("create", lightCreatoHandler);
    }
  }).catch(function(error) {
    console.log("Error creating resource " + error.resourcePath + ": " + error.message);
  });
};

function lightRetrieveHandler(request, observe) {
  if (request.target.resourcePath === lightResource.resourcePath) {
    listenerCount += observe ? 1 : -1;

    server.respond(request, null, lightResource)
    .catch(function(err) {
      console.log("Error sending retrieve response.");
    });
  } else {
    server.respond(request, new Error("NotFoundError"));
    .catch(function(err) {
      console.log("Error sending retrieve error response.");
    });
  }
};

function lightUpdateHandler(request) {
  // the implementation has by now updated this resource (lightResource)
  // this is a hook to update the business logic
  console.log("Resource " + request.target.resourcePath + " updated.");

  for (p of request.resource.properties) {
    if (lightResource.properties[p] != request.resource.properties[p])
      lightResource.properties[p] = request.resource.properties[p];
  }

  // Notify other listeners about the change.
  server.notify(lightResource)
      .then(function() { console.log("Update notification sent."); })
      .catch(function(err) { console.log("Error sending notifications: " + err.message); });
};

function lightDeleteHandler(request) {
  console.log("Deleting resource " + request.target.resourcePath);

  // clean up local state; notification about deletion is automatic
  server.respond(request)
  .catch(function(err) { console.log("Error sending delete response."); });
};

function lightCreateHandler(request) {
  if (request.resource.resourcePath !== "/light/ambience/blue/1") {
      server.respond(request, new TypeError("create"), res);
      return;
  }

  console.log("Creating resource " + request.resource.resourcePath +
              " at " + request.target.resourcePath);

  // Process the resource creation using a local call.
  let res = _createResource(request.target.resourcePath, request.resource);

  // Register the new local resource, then respond to the create request.
  server.register(res)
    .then(function(resource) {
      server.respond(request, null, resource);
    }).catch(function(error) {
      server.respond(request, error, res);
    });
};

```
