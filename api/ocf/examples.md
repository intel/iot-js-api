OCF Web API Examples
====================

### Getting device configuration

```javascript
require('ocf').start("server").then(function(ocf) {
  // device is initialized by the underlying OCF stack
  console.log("Device id: " + ocf.device.uuid);
}).catch(function(error) { console.log("Error: " + error.message); });
```

### OIC Client controlling a remote red LED.

```javascript
require('ocf').start("client").then(function(client) {
  // Discover a remote red light, start observing it, and make sure it's not too bright.
  var red = null;

  client.findResources({ resourceType: "oic.r.light" }, function(resource) {
    if (resource && resource.resourcePath === "/light/ambience/red") {
      red = resource;
      red.on('update', redLightUpdated);
    })
    .then(function() { console.log("Resource discovery started."); })
    .catch(function(e) { console.log("Error finding resources: " + e.message); });

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
}).catch(function(error) { console.log("Error: " + error.message); });
```

### OIC Server exposing a local blue LED.

```javascript

var deviceInit = {
  name: "led",
  types: [ "oic.wk.d", "oic.wk.p", "oic.wk.res", "oic.d.light" ],
  dataModels: [“res.1.1.0”],
  coreSpecVersion: "OIC 1.1"
};

require('ocf').start("server", { device: deviceInit }).then(function(server) {
  let lightResource = null;
  let listenerCount = 0;

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

  // register the specific resources handled by this solution
  // which are not exposed by the device firmware
  server.registerResource({
    deviceId: ocf.device.uuid,
    resourcePath: "/light/ambience/blue/1",
    resourceTypes: [ "a/light", "oic.r.switch.binary" ],
    interfaces: [ "/oic/if/rw", "/oic/if/r" ],
    discoverable: true,
    observable: true,
    properties: { color: "blue", dimmer: 0.2, value: true }
  }).then(function(res) {
    console.log("Local resource " + res.resourcePath + " has been registered.");
    lightResource = res;
    lightResource
      .onupdate(lightUpdateHandler)
      .ondelete(lightDeleteHandler)
      .onretrieve(lightRetrieveHandler)
    }
  }).catch(function(error) {
    console.log("Error creating resource " + error.resourcePath + ": " + error.message);
  });
}).catch(function(error) { console.log("Error: " + error.message); });
```
