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

// We assume that discovery results arrive in under this many milliseconds
var discoveryDuration = 6000;
var client = require( process.argv[ 3 ] ).client;
var firstRunResults;

console.log( JSON.stringify( { assertionCount: 3 } ) );

function doOneDiscovery() {
	var numberFound = 0, numberConvenientlyFound = 0;

	function resourcefound( resource ) {
		if ( resource.resourcePath === "/a/" + process.argv[ 2 ] ) {
			numberFound++;
		}
	}
	function resourcefoundConveniently( resource ) {
		if ( resource.resourcePath === "/a/" + process.argv[ 2 ] ) {
			numberConvenientlyFound++;
		}
	}

	return client
		.on( "resourcefound", resourcefound )
		.findResources( resourcefoundConveniently )
		.then( function() {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				true, "Client: Resource discovery successfully started"
			] } ) );
		} )

		// Spend some time collecting resources using the above listeners, then clean up and return
		// the resulting counts
		.then( function() {
			return new Promise( function( fulfill ) {
				setTimeout( function() {
					client.removeAllListeners( "resourcefound" );
					fulfill( [ numberFound, numberConvenientlyFound ] );
				}, discoveryDuration );
			} );
		} );
}

doOneDiscovery()
	.then( function( results ) {
		firstRunResults = results;
		return doOneDiscovery();
	} )
	.then( function( results ) {
		console.log( JSON.stringify( { assertion: "deepEqual", arguments: [
			results, firstRunResults,
				"Client: Second discovery round results are identical to the first"
		] } ) );
		console.log( JSON.stringify( { finished: 0 } ) );
	} )
	.catch( function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Client: Fatal error: " + ( "" + error ) + "\n" +
				JSON.stringify( error, null, 4 )
		] } ) );
	} );
