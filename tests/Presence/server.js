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

console.log( JSON.stringify( { assertionCount: 3 } ) );

var disableSent = false;

var eventSequence = [];
function pushEvent( event ) {
	eventSequence.push( event );
	if ( eventSequence.length === 3 ) {
		console.log( JSON.stringify( { assertion: "deepEqual", arguments: [
			eventSequence, [
				{ name: "devicefound", device: "test-device-" + process.argv[ 2 ] },
				{ name: "devicelost", device: "test-device-" + process.argv[ 2 ] },
				{ name: "devicefound", device: "test-device-" + process.argv[ 2 ] }
			],
			"Client: Events are in the expected sequence"
		] } ) );
		console.log( JSON.stringify( { finished: 0 } ) );
	}
}

client
	.on( "devicefound", function( device ) {

		if ( device.name === "test-device-" + process.argv[ 2 ] ) {
			pushEvent( { name: "devicefound", device: device.name } );

			if ( disableSent ) {
				return;
			}

			client.update( {
				deviceId: device.uuid,
				resourcePath: "/disable-presence"
			} ).then(
				function() {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						true, "Client: Successfully turned off presence"
					] } ) );
					disableSent = true;
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Client: Request to turn off presence failed: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} );
		}
	} )
	.on( "devicelost", function( device ) {
		if ( device.name === "test-device-" + process.argv[ 2 ] ) {
			pushEvent( { name: "devicelost", device: device.name } );
			client.update( {
				deviceId: device.uuid,
				resourcePath: "/disable-presence"
			} ).then(
				function() {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Client: Device accessible even after it was lost"
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
						error.message, "Device not found",
						"Client: Device not found after it was lost"
					] } ) );
				} );
		}
	} );

console.log( JSON.stringify( { ready: true } ) );
