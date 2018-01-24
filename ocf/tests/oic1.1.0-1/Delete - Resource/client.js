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

var client = require( process.argv[ 3 ] ).client;

console.log( JSON.stringify( { assertionCount: 1 } ) );

// Perform the create() method on a device if it's the right device
function tryDevice( device ) {
	if ( device.name !== "test-device-" + process.argv[ 2 ] ) {
		return;
	}

	// We've found the server, so stop looking
	client.removeListener( "devicefound", tryDevice );

	client
		.delete( { deviceId: device.uuid, resourcePath: "/some/new/resource" } )
		.then(
			function() {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					true, "Client: Resource successfully deleted"
				] } ) );
			},
			function( anError ) {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					false, "Client: failed to delete resource: " +
						( "" + anError ) + "\n" + JSON.stringify( anError, null, 4 )
				] } ) );
			} )
		.then( function() {
			console.log( JSON.stringify( { finished: 0 } ) );
		} );
}

client.findDevices( tryDevice )
	.catch( function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Client: Starting device discovery failed: " +
				( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
		] } ) );
	} );
