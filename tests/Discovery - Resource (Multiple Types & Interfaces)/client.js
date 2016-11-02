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
	.on( "resourcefound", function( resource ) {
		if ( resource.resourcePath === "/a/" + process.argv[ 2 ] ) {
			console.log( JSON.stringify( { assertion: "deepEqual", arguments: [
				filterKeys( resource, [
					"resourcePath", "interfaces", "resourceTypes", "discoverable", "observable",
					"secure"
				] ),
				{
					resourcePath: "/a/" + process.argv[ 2 ],
					interfaces: [ "oic.if.baseline", "oic.if.custom" ],
					resourceTypes: [ "core.light", "core.fan" ],
					discoverable: true,
					observable: false,
					secure: false
				}, "Client: Resource found"
			] } ) );
			console.log( JSON.stringify( { finished: 0 } ) );
		}
	} )
	.findResources()
	.then(
		function() {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				true, "Client: Resource discovery successfully started"
			] } ) );
		},
		function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Client: Starting resource discovery failed: " +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			] } ) );
		} );
