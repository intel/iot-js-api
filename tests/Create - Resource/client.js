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

var desiredNewResource = {
	resourcePath: "/some/new/resource",
	interfaces: [ "oic.if.baseline" ],
	resourceTypes: [ "core.light" ],
	discoverable: true
};

console.log( JSON.stringify( { assertionCount: 3 } ) );

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

// Perform directed resource discovery on a device
function getResources( device ) {
	var resourceList = {};

	function resourcefound( resource ) {
		if ( resource.resourcePath === desiredNewResource.resourcePath ) {
			resourceList.desired = resource;
		} else if ( resource.resourcePath === "/target-resource" ) {
			resourceList.target = resource;
		}
	}

	return client.findResources( { deviceId: device.uuid }, resourcefound )
		.then( function() {
			client.removeListener( "resourcefound", resourcefound );
			return resourceList;
		} );
}

// Perform the create() method on a device if it's the right device
function tryDevice( device ) {
	if ( !device.name === "test-device-" + process.argv[ 2 ] ) {
		return;
	}

	// We've found the server, so stop looking
	client.removeListener( "devicefound", tryDevice );

	getResources( device )
		.then( function( resourceList ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				resourceList.target && !resourceList.desired,
				"Client: Initially the device contains the target resource but not the desired one"
			] } ) );
			return client.create( resourceList.target, desiredNewResource );
		} )
		.then( function( newResource ) {
			console.log( JSON.stringify( { assertion: "deepEqual", arguments: [
				filterKeys( newResource, [
					"resourcePath", "interfaces", "resourceTypes", "discoverable"
				] ),
				desiredNewResource,
				"Client: The newly created resource has the expected structure"
			] } ) );
			return getResources( device );
		} )
		.then( function( resourceList ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				resourceList.target && resourceList.desired,
				"Client: After creating the resource, the device contains the target resource " +
					"as well as the desired one"
			] } ) );
			console.log( JSON.stringify( { finished: 0 } ) );
		} )
		.catch( function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Client: Failed to process device: " +
					( "" + error ) + "\n" + JSON.stringify( {
						error: error,
						device: device
					}, null, 4 )
			] } ) );
		} );
}

client.findDevices( tryDevice )
	.catch( function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Client: Starting device discovery failed: " +
				( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
		] } ) );
	} );
