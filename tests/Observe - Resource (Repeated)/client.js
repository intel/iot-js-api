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

console.log( JSON.stringify( { assertionCount: 2 } ) );

function observeResource( resource ) {
	return new Promise( function( fulfill ) {
		var updateCount = 0;
		function update( resource ) {
			if ( ++updateCount === 6 ) {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					true, "Client: Observation sequence complete"
				] } ) );
				resource.removeListener( "update", update );
				fulfill();
			}
		}
		resource.on( "update", update );
	} );
}

function resourcefound( resource ) {
	client.removeListener( "resourcefound", resourcefound );
	observeResource( resource )
		.then( function() {
			return new Promise( function( fulfill ) {
				setTimeout( function() {
					fulfill( observeResource( resource ) );
				}, 5000 );
			} );
		} )
		.catch( function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Client: Error during observation: " + ( "" + error ) + "\n" +
					JSON.stringify( error, null, 4 )
			] } ) );
		} );
}

client
	.findResources( { resourcePath: "/a/" + process.argv[ 2 ] }, resourcefound )
	.catch( function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Client: Failed to initiate resource discovery: " + ( "" + error ) + "\n" +
				JSON.stringify( error, null, 4 )
		] } ) );
	} );
