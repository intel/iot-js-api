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

console.log( JSON.stringify( { assertionCount: 1 } ) );

function dummyListener() {}

function performObservation( resource ) {
	resource
		.on( "error", function( error ) {
			console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
				error.message, "Server responded with error",
				"Client: Failure to observe resulted in expected error"
			] } ) );
			console.log( JSON.stringify( { finished: 0 } ) );
		} )
		.on( "update", dummyListener );
	client.removeListener( "resourcefound", performObservation );
}

client
	.on( "resourcefound", performObservation )
	.findResources( { resourcePath: "/a/" + process.argv[ 2 ] } )
	.catch( function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Client: Starting device discovery failed: " +
				( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
		] } ) );
	} );
