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

function filterKeys( object, keys ) {
	var index;
	var returnValue = {};

	for ( index in keys ) {
		if ( keys[ index ] in object ) {
			returnValue[ keys[ index ] ] = object[ keys[ index ] ];
		}
	}

	return returnValue;
}

var client = require( process.argv[ 3 ] ).client;

console.log( JSON.stringify( { assertionCount: 2 } ) );

client
	.findDevices( function( device ) {
		if ( device.name !== "test-device-" + process.argv[ 2 ] ) {
			return;
		}
		client.retrieve( { deviceId: device.uuid, resourcePath: "/non-existing-resource" } )
			.then(
				function( resource ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Client: Retrieved non-existing resource: " +
							JSON.stringify( resource, null, 4 )
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
						error.message, "Resource not found",
						"Client: Error indicating inability to directly access resource has " +
							"the expected message"
					] } ) );
				} )
			.then( function() {
				return client.retrieve( { deviceId: device.uuid, resourcePath: "/direct" } );
			} )
			.then(
				function( resource ) {
					console.log( JSON.stringify( { assertion: "deepEqual", arguments: [
						filterKeys( resource, [
							"resourcePath", "interfaces", "resourceTypes", "properties",
							"discoverable", "deviceId"
						] ), {
							deviceId: device.uuid,
							resourcePath: "/direct",
							interfaces: [ "oic.if.baseline" ],
							resourceTypes: [ "core.light" ],
							properties: {
								name: "Pankovski"
							},
							discoverable: true
						}, "Client: Directly accessed resource has expected structure"
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Client: Failed to directly retrieve resource: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} )
			.then( function() {
				console.log( JSON.stringify( { finished: 0 } ) );
			} );
	} )
	.catch( function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Client: Failed to start device discovery: " +
				( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
		] } ) );
	} );
