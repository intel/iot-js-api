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

var Listener = function Listener( prefix, desiredNotificationCount ) {
	var countSoFar = 0;
	var listener = function listenToResource( resource ) {
		countSoFar++;
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			resource.properties.value > 0, "Client: " + prefix + ": Received notification " +
				countSoFar + " of " + desiredNotificationCount
		] } ) );
		if ( countSoFar >= desiredNotificationCount ) {
			resource.removeListener( "update", listener );
		}
	};

	return listener;
};

console.log( JSON.stringify( { assertionCount: 20 } ) );

function doOneRetrieveAndObserve( prefix, resource ) {
	client
		.retrieve( resource )
		.then( function( resource ) {
			resource.on( "update", Listener( prefix, 10 ) );
		} )
		.catch( function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Unexpected error attaching listener: " +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			] } ) );
		} );
}

function performObservation( resource ) {
	client.removeListener( "resourcefound", performObservation );

	setTimeout( function() {
		doOneRetrieveAndObserve( "immediate", resource );

		setTimeout( function() {
			doOneRetrieveAndObserve( "delayed", resource );
		}, 1000 );
	}, 1000 );
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
