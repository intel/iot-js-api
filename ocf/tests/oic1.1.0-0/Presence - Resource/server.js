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

// The file names for client and server are reversed in this test, because the test suite uses the
// file name to decide which to run first ("server.js"). In the case of presence, however, the
// client must run first, because it must catch the announcement from the server when it comes up.

var client = require( process.argv[ 3 ] ).client;

console.log( JSON.stringify( { assertionCount: 1 } ) );

var interesting = {};

var devices = [];
var resources = [];

// Collect the information we need for setting up the "delete" listener
function testSetUp() {
	var device, resource;

	while ( devices.length > 0 && !interesting.device ) {
		device = devices.shift();
		if ( device.name === "test-device-" + process.argv[ 2 ] ) {
			interesting.device = device;
		}
	}

	while ( resources.length > 0 && interesting.device &&
			!( interesting.object && interesting.control ) ) {
		resource = resources.shift();
		if ( resource.deviceId === interesting.device.uuid ) {
			if ( resource.resourcePath === "/a/" + process.argv[ 2 ] ) {
				interesting.object = resource;
			} else if ( resource.resourcePath === "/target-resource" ) {
				interesting.control = resource;
			}
		}
	}

	if ( interesting.device && interesting.control && interesting.object ) {
		client
			.removeListener( "resourcefound", resourcefound )
			.removeListener( "devicefound", devicefound );
		interesting.object.on( "delete", function() {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				true, "Client: Received 'delete' event"
			] } ) );
			console.log( JSON.stringify( { finished: 0 } ) );
		} );
		interesting.control.properties.uuid = process.argv[ 2 ];
		client.update( interesting.control ).catch( function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Client: Failed to update() control resource: " + ( "" + error ) + "\n" +
					JSON.stringify( error, null, 4 )
			] } ) );
		} );
	}
}

function resourcefound( resource ) {
	resources.push( resource );
	testSetUp();
}

function devicefound( device ) {
	devices.push( device );
	testSetUp();
}

client
	.on( "resourcefound", resourcefound )
	.on( "devicefound", devicefound );

console.log( JSON.stringify( { ready: true } ) );
