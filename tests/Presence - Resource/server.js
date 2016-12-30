// Copyright 2016 Intel Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var device = require( process.argv[ 3 ] );
var server = device.server;

var objectResourceInit = {
	resourcePath: "/a/" + process.argv[ 2 ],
	resourceTypes: [ "core.light" ],
	interfaces: [ "oic.if.baseline" ],
	discoverable: true
};

var objectResource;

device.device.name = "presence-resource-test-server";

console.log( JSON.stringify( { assertionCount: 0 } ) );

// Register two resources: /target-resource and /a/<uuid>. /target-resource responds to update by
// registering/unregistering /a/<uuid>, depending on whether the .register property is true or
// false, respectively.
Promise.all( [
	server.register( {
		resourcePath: "/target-resource",
		resourceTypes: [ "core.light" ],
		interfaces: [ "oic.if.baseline" ],
		discoverable: true,
		observable: true
	} ),
	server.register( objectResourceInit )
] ).then( function( resources ) {
	function responseError( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Server: Failed to respond: " + ( "" + error ) + "\n" +
				JSON.stringify( error, null, 4 )
		] } ) );
	}

	// Store /a/<uuid> in objectResource, and set/unset the variable with the results of the
	// resource registration/null in response to the incoming update requests.
	objectResource = resources[ 1 ];
	resources[ 0 ].onupdate( function( request ) {
		if ( request.data.register === true ) {
			server.register( objectResourceInit ).then(
				function( resource ) {
					objectResource = resource;
					request.respond().catch( responseError );
				},
				function( error ) {
					request.respondWithError( error ).catch( responseError );
				} );
		} else if ( request.data.register === false && objectResource ) {
			objectResource.unregister().then(
				function() {
					objectResource = null;
					request.respond().catch( responseError );
				},
				function( error ) {
					request.respondWithError( error ).catch( responseError );
				} );
		}
	} );
	console.log( JSON.stringify( { ready: true } ) );
} ).catch( function( error ) {
	console.log( JSON.stringify( { assertion: "ok", arguments: [
		false, "Server: Failure: " + ( "" + error ) + "\n" +
			JSON.stringify( error, null, 4 )
	] } ) );
} );
