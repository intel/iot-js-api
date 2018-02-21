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

// Expected sequence of server notifications (|) resulting in assertions (x)
// positive         |xx|x|x|x| |
// second positive  |  | |x|x|x|x
// negative         |xx|x|x|x| |
// second negative  |  |x|x|x|x|x

var client = require( process.argv[ 3 ] ).client;

var positiveCount = 0;
var negativeCount = 0;
var secondNegativeCount = 0;
var secondPositiveCount = 0;
var addSecondNegativeListener = true;
var addSecondPositiveListener = true;

console.log( JSON.stringify( { assertionCount: 21 } ) );

function pickEndpoint( endpoints ) {
	var index, isSecureEndpoint;

	for ( index in endpoints ) {
		isSecureEndpoint = endpoints[ index ].origin.substr( 0, 5 ) === "coaps";
		if ( isSecureEndpoint && process.argv[ 4 ] === "true" ) {
			return endpoints[ index ];
		} else if ( !isSecureEndpoint && process.argv[ 4 ] === "false" ) {
			return endpoints[ index ];
		}
	}
}

function secondPositiveListener( resource ) {
	secondPositiveCount++;
	console.log( JSON.stringify( { assertion: "ok", arguments: [
		resource.properties.value > 0,
		"Client: Second listener: sensor value is positive at observation " + secondPositiveCount
	] } ) );
	if ( secondPositiveCount >= 4 ) {
		resource.removeListener( "update", secondPositiveListener );
	}
}

function positiveListener( resource ) {
	positiveCount++;
	console.log( JSON.stringify( { assertion: "ok", arguments: [
		resource.properties.value > 0,
		"Client: sensor value is positive at observation " + positiveCount
	] } ) );

	// After three notifications, hand over to the second listener, with two notifications where
	// both listeners are attached
	if ( positiveCount > 2 && addSecondPositiveListener ) {
		addSecondPositiveListener = false;
		resource.endpoint = pickEndpoint( resource.endpoints );
		client.retrieve( resource, secondPositiveListener )
			.then(
				function( secondResource ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						resource === secondResource,
						"Client: No new resource was created when the empty query options line up"
					] } ) );
				}, function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						"Client: Failed to attach second listener for positive view: " +
							( "" + error ) + JSON.stringify( error, null, 4 )
					] } ) );
				} );
	}

	if ( positiveCount >= 5 ) {
		resource.removeListener( "update", positiveListener );
	}
}

function secondNegativeListener( resource ) {
	secondNegativeCount++;
	console.log( JSON.stringify( { assertion: "ok", arguments: [
		resource.properties.value < 0,
		"Client: Second listener: sensor value is negative at observation " + secondNegativeCount
	] } ) );
	if ( secondNegativeCount >= 5 ) {
		resource.removeListener( "update", secondNegativeListener );
	}
}

function negativeListener( resource ) {
	negativeCount++;
	console.log( JSON.stringify( { assertion: "ok", arguments: [
		resource.properties.value < 0,
		"Client: sensor value is negative at observation " + negativeCount
	] } ) );

	// After two notifications, hand over to the second listener, with three notifications where
	// both listeners are attached
	if ( negativeCount > 1 && addSecondNegativeListener ) {
		addSecondNegativeListener = false;
		resource.endpoint = pickEndpoint( resource.endpoints );
		client.retrieve( resource, { scale: -1 }, secondNegativeListener )
			.then(
				function( secondResource ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						resource === secondResource,
						"Client: No new resource was created when the query options line up"
					] } ) );
				}, function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						"Client: Failed to attach second listener: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} );
	}
	if ( negativeCount >= 5 ) {
		resource.removeListener( "update", negativeListener );
	}
}

function performObservation( resource ) {
	resource.endpoint = pickEndpoint( resource.endpoints );
	resource.on( "update", positiveListener );

	client
		.removeListener( "resourcefound", performObservation )
		.retrieve( resource, { scale: -1 }, negativeListener ).catch( function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Unexpected error attaching negative listener: " +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			] } ) );
		} );
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
