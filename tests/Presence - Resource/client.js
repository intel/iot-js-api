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

console.log( JSON.stringify( { assertionCount: 5 } ) );

// Find the target resource, used for registering/unregistering, and the object resource, which
// appears and disappears as controlled by update requests to the target resource.
new Promise( function( fulfill, reject ) {
	var index, objectResource;
	var resources = [];
	var resourcefound = function( resource ) {
		if ( resource.resourcePath === "/a/" + process.argv[ 2 ] && !objectResource ) {
			objectResource = resource;
		} else {
			resources.push( resource );
		}
		if ( objectResource ) {
			for ( index = resources.length - 1; index >= 0; index-- ) {
				if ( resources[ index ].resourcePath === "/target-resource" &&
						resources[ index ].deviceId === objectResource.deviceId ) {
					client.removeListener( "resourcefound", resourcefound );
					fulfill( [ objectResource, resources[ index ] ] );
					break;
				}
			}
			if ( index === -1 ) {
				resources = [];
			}
		}
	};
	client.findResources( resourcefound ).catch( reject );
} ).then( function( resources ) {

	// Issue the update request to the target resource requesting that the object resource be
	// deleted, and assert that the 'delete' event is received
	return new Promise( function( fulfill, reject ) {
		resources[ 0 ].on( "delete", function() {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				true, "Client: Received 'delete' event for resource"
			] } ) );
			fulfill( resources[ 1 ].deviceId );
		} );
		resources[ 1 ].properties.register = false;
		client.update( resources[ 1 ] ).catch( reject );
	} );
} ).then( function( deviceId ) {
	var resources = [];
	var resourcefound = function( resource ) {
		resources.push( resource );
	};

	// Issue a directed discovery to the now-known deviceId of the test device and collect the
	// resources. This works if "resourcefound" signals are emitted synchronously, because they
	// will all have been emitted before the findResources() promise is resolved.
	return client.findResources( { deviceId: deviceId }, resourcefound ).then( function() {
		client.removeListener( "resourcefound", resourcefound );
		return resources;
	} );
} ).then( function( resources ) {
	var index, targetResource, objectResource;

	// Assert that only the target resource was collected from the device. The object resource must
	// now be absent.
	for ( index in resources ) {
		if ( resources[ index ].resourcePath === "/a/" + process.argv[ 2 ] ) {
			objectResource = resources[ index ];
		} else if ( resources[ index ].resourcePath === "/target-resource" ) {
			targetResource = resources[ index ];
		}
	}

	console.log( JSON.stringify( { assertion: "ok", arguments: [
		!!targetResource, "Client: Target resource still present"
	] } ) );
	console.log( JSON.stringify( { assertion: "ok", arguments: [
		!objectResource, "Client: Object resource now absent"
	] } ) );

	return targetResource;
} ).then( function( targetResource ) {

	// Reinstate the object resource on the device and assert that it then announces itself
	return new Promise( function( fulfill, reject ) {
		var maybeQuit = ( function( quitConditions ) {
			return function() {
				quitConditions--;
				if ( quitConditions === 0 ) {
					console.log( JSON.stringify( { finished: 0 } ) );
					fulfill();
				}
			};
		} )( 2 );

		var resourcefound = function( resource ) {
			if ( resource.deviceId === targetResource.deviceId &&
					resource.resourcePath === "/a/" + process.argv[ 2 ] ) {
				client.removeListener( "resourcefound", resourcefound );
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					true, "Client: Object resource has reappeared"
				] } ) );
				maybeQuit();
			}
		};

		var devicefound = function( device ) {
			if ( device.uuid === targetResource.deviceId ) {
				client.removeListener( "devicefound", devicefound );
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					true, "Client: 'devicefound' was issued"
				] } ) );
				maybeQuit();
			}
		};

		targetResource.properties.register = true;
		client
			.on( "devicefound", devicefound )
			.on( "resourcefound", resourcefound )
			.update( targetResource )
			.catch( reject );
	} );
} ).catch( function( error ) {
	console.log( JSON.stringify( { assertion: "ok", arguments: [
		false, "Client: Error: " + ( "" + error.stack ) + "\n" +
			JSON.stringify( error, null, 4 )
	] } ) );
} );
