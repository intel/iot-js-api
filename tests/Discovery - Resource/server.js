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

var server = require( process.argv[ 4 ] ).server;

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

console.log( JSON.stringify( { assertionCount: 1 } ) );

var desiredResource = {
	resourcePath: "/a/" + process.argv[ 2 ],
	resourceTypes: [ "core.light" ],
	interfaces: [ "oic.if.baseline" ],
	discoverable: true
};

server.register( desiredResource ).then(
	function( resource ) {
		console.log( JSON.stringify( { assertion: "deepEqual", arguments: [
			filterKeys( resource, [
				"resourcePath", "resourceTypes", "interfaces", "resourceTypes", "discoverable"
			] ), desiredResource, "Server: Resource registered successfully"
		] } ) );

		console.log( JSON.stringify( { ready: true } ) );
	},
	function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Server: Resource registration failed: " +
				( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
		] } ) );
	} ).catch(
		function( error ) {
			console.log( JSON.stringify( {
				teardown: true,
				message: "Server: Fatal error: " +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			} ) );
		} );
