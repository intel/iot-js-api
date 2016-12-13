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

var ocf = require( process.argv[ 3 ] );

console.log( JSON.stringify( { assertionCount: 4 } ) );

function handleDeviceFound( device ) {
	if ( device.name === "test-device-" + process.argv[ 2 ] ) {
		ocf.client.removeListener( "devicefound", handleDeviceFound );
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			true, "Client: Found device via .on()"
		] } ) );
		ocf.client.getDeviceInfo( device.uuid )
			.then(
				function( deviceViaGet ) {
					console.log( JSON.stringify( { assertion: "deepEqual", arguments: [
						deviceViaGet, device,
						"Client: Retrieved device info is identical to discovered device info"
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Client: Unexpectedly failed to retrieve device info: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} )
			.then( function() {
				console.log( JSON.stringify( { finished: 0 } ) );
			} );
	}
}

function handleDeviceFoundConvenience( device ) {
	if ( device.name === "test-device-" + process.argv[ 2 ] ) {
		ocf.client.removeListener( "devicefound", handleDeviceFoundConvenience );
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			true, "Client: Found device via convenience handler"
		] } ) );
	}
}

ocf.client
	.on( "devicefound", handleDeviceFound )
	.findDevices( handleDeviceFoundConvenience )
	.then(
		function() {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				true, "Client: Device discovery successfully started"
			] } ) );
		},
		function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Client: Starting device discovery failed: " +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			] } ) );
		} );
