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

var ocf = require( process.argv[ 3 ] )( "client" );

var uuid = process.argv[ 2 ];

console.log( JSON.stringify( { assertionCount: 4 } ) );

new Promise( function( fulfill, reject ) {
	var teardown;
	var devicefound = function( event ) {
		if ( event.device.name === uuid ) {
			teardown( null, event.device );
		}
	};
	teardown = function( error, device ) {
		ocf.removeEventListener( "devicefound", devicefound );
		if ( error ) {
			reject( error );
		} else {
			fulfill( device );
		}
	};
	ocf.addEventListener( "devicefound", devicefound );
	ocf.findDevices().catch( teardown );
} ).then( function( device ) {
	console.log( JSON.stringify( { assertion: "ok",
		arguments: [ true, "Client: Device found" ]
	} ) );
	return Promise.all( [
		new Promise( function( resolve, reject ) {
			var timeoutId = setTimeout( function() {
				reject( new Error( "Client: resourcefound has not fired within 5 seconds" ) );
			}, 5000 );

			var resourcefound = function( event ) {
				ocf.removeEventListener( "resourcefound", resourcefound );
				clearTimeout( timeoutId );
				resolve( event.resource );
			};
			ocf.addEventListener( "resourcefound", resourcefound );
		} ),
		ocf.retrieve( { deviceId: device.uuid, path: "/a/" + uuid } )
	] );
}, function( error ) {
	console.log( JSON.stringify( { assertion: "strictEqual",
		arguments: [ ( "" + error ), "", "Client: Unexpected error finding device" ]
	} ) );
} ).then( function( resourceList ) {
	console.log( JSON.stringify( { assertion: "ok",
		arguments: [ true, "Client: Resource found" ]
	} ) );
	console.log( JSON.stringify( { assertion: "deepEqual",
		arguments: [ resourceList[ 0 ].properties, { theResponse: uuid },
			"Client: Correct response from server via resourcefound" ]
	} ) );
	console.log( JSON.stringify( { assertion: "deepEqual",
		arguments: [ resourceList[ 1 ].properties, { theResponse: uuid },
			"Client: Correct response from server via retrieve()" ]
	} ) );
}, function() {
	console.log( JSON.stringify( { assertion: "ok",
		arguments: [ false, "Client: Unexpected error retrieving resource" ]
	} ) );
} ).then( function() {
	console.log( JSON.stringify( { killPeer: true } ) );
	process.exit( 0 );
} );
