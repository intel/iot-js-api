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
var red = null;

function startDiscovery() {
  client.onresourcefound = function(resource) {
    if(resource && resource.id.path === "/light/ambience/red") {
      red = resource;
      red.on('update', redHandler);
    }
  }

  client.findResources({ resourceType: “ocf.r.light” })
    .then( () => { console.log("Resource discovery started.");})
    .catch((e) => {
      console.log("Error finding resources: " + e.message);
    });
};

function redHandler(red) {
  console.log("Update received on " + red.id);
  console.log("Running local business logic to determine further actions...");
  if (red.properties.dimmer > 0.5) {
    // do something, e.g. limit output
    client.update({ id: red.id, red.properties.dimmer: 0.5 })
      .then(() => { console.log("Changed red light dimmer"); })
      .catch((e) => { console.log("Error changing red light"); });
  }
};
```

### OIC Server exposing a local blue LED.

```javascript
let server = ocf.server;

var lightResource = null;
var lightResourceObserved = false;

function startServer() {
  // register the specific resources handled by this solution
  // which are not exposed by the device firmware
  server.registerResource({
    id: { deviceId: ocf.device.uuid; path: "/light/ambience/blue" },
    resourceTypes: [ "light" ],
    interfaces: [ "/oic/if/rw" ],
    discoverable: true,
    observable: true,
    properties: { color: "blue", dimmer: 0.2 }
  }).then((res) => {
    console.log("Local resource " + res.id.path + " has been registered.");
    lightResource = res;
    server.on("update", onLightUpdate);
    server.on("delete", onLightDelete);
    server.on("retrieve", onLightRetrieve);
    server.on("create", onLightCreate);
    }
  }).catch((error) => {
    console.log("Error creating resource " + error.resource.id.path + " : " + error.message);
  });
};

function onLightRetrieve(request, observe) {
  if (request.target.id.path === lightResource.id.path) {
    lightResourceObserved = observe;
    server.respond(request, null, lightResource)
    .catch( (err) => {
        console.log("Error sending retrieve response.");
    });
  } else {
    server.respond(request, new Event("NotFoundError"));
    .catch( (err) => {
          console.log("Error sending retrieve error response.");
      });
  }
};

function onLightUpdate(request) {
  // the implementation has by now updated this resource (lightResource)
  // this is a hook to update the business logic
  console.log("Resource " + request.target + " updated. Running the update hook.");
  var updates = request.options;
  for (p in updates) {
    if (lightResource[p] != updates[p])
      lightResource[p] = updates[p];
  }

  // do the notifications manually
  if (lightResourceObserved) {
    server.notify(lightResource)
      .then( () => { console.log("Update notification sent.");})
      .catch( (err) => {
        console.log("No observers or error sending: " + err.name);
      });
  }
};

function onLightDelete(request) {
  console.log("Resource " + request.target + " has been requested to be deleted.");
  console.log("Running the delete hook.");
  // clean up local state
  // notification about deletion is automatic
  server.respond(request)
  .catch( (err) => {
      console.log("Error sending delete response.");
  });
};

function onLightCreate(request) {
  server.respond(request, new Error("NotSupportedError"));
}

```
