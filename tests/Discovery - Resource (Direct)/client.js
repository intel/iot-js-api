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

Promise.all( [
	new Promise( function( fulfill ) {
		function devicefound( device ) {
			if ( device.name === "test-device-" + process.argv[ 2 ] ) {
				ocf.client.removeListener( "devicefound", devicefound );
				fulfill( device );
			}
		}
		ocf.client.on( "devicefound", devicefound );
	} ),
	ocf.client
		.findDevices()
		.catch( function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Failed to start device discovery: " +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			] } ) );
		} )
] ).then( function( results ) {
	var device = results[ 0 ];
	return Promise.all( [
		new Promise( function( fulfill ) {
			ocf.client.on( "resourcefound", function( resource ) {
				if ( resource.deviceId === device.uuid &&
						resource.resourcePath === "/a/" + process.argv[ 2 ] ) {
					fulfill( resource );
				}
			} );
		} ),
		ocf.client
			.findResources( {
				deviceId: device.uuid,
				resourcePath: "/a/" + process.argv[ 2 ]
			} )
			.then(
				function() {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						true, "Client: Direct resource discovery successfully started"
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Client: Starting direct resource discovery failed: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} )
	] ).then( function() {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			true, "Client: Resource directly discovered"
		] } ) );
		console.log( JSON.stringify( { finished: 0 } ) );
	} );
} );
