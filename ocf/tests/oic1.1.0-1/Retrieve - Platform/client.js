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

console.log( JSON.stringify( { assertionCount: 2 } ) );

function devicefound( device ) {
	if ( device.name === "test-device-" + process.argv[ 2 ] ) {
		ocf.client.removeListener( "devicefound", devicefound );
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			true, "Client: Found device"
		] } ) );
		ocf.client.getPlatformInfo( device.uuid )
			.then(
				function( platform ) {
					console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
						platform.supportURL, "ocf://test-device-" + process.argv[ 2 ],
						"Client: Retrieved platform info has expected support URL"
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Client: Unexpectedly failed to retrieve platform info: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} )
			.then( function() {
				console.log( JSON.stringify( { finished: 0 } ) );
			} );
	}
}

ocf.client
	.on( "devicefound", devicefound )
	.findDevices()
	.catch( function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Client: Starting device discovery failed: " +
				( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
		] } ) );
	} );
