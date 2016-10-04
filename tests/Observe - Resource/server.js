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

var oldObserverCount = 0;
var observerCount = 0;
var timeoutId;
var fakeSensorStarted = false;

console.log( JSON.stringify( { assertionCount: 7 } ) );

// Multiply a value by a scale given in the options
function transformSensorData( representation, options ) {
	var scale = ( options && "scale" in options ) ? ( +options.scale ) : 1;

	if ( isNaN( scale ) ) {
		scale = 1;
	}

	return { value: representation.value * scale };
}

function fakeSensorLoop( resource ) {
	var notificationCount = 0;
	function timeout() {
		resource.properties.value = Math.random() + 1;

		// Ensure a total of six notifications
		timeoutId = ( ++notificationCount < 6 ) ?
			setTimeout( timeout, ( Math.random() ) * 1000 + 500 ) : 0;

		server.notify( resource )
			.then(
				function() {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						true, "Server: Notification successful"
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Server: Notification error: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} );
	}
	timeout();
}

server
	.register( {
		resourcePath: "/a/" + process.argv[ 2 ],
		resourceTypes: [ "core.light" ],
		interfaces: [ "oic.if.baseline" ],
		discoverable: true,
		observable: true,
		properties: {
			value: Math.random() + 1
		}
	}, transformSensorData )
	.then(
		function( resource ) {
			server.on( "retrieve", function( request ) {
				oldObserverCount = observerCount;
				observerCount += ( "observe" in request ) ? ( request.observe ? 1 : -1 ) : 0;

				// Start the notification loop when all observers have checked in
				if ( observerCount >= 2 && !fakeSensorStarted ) {
					fakeSensorLoop( resource );
					fakeSensorStarted = true;
				}

				request.respond()
					.then(
						function() {

							// We quit when the last observer was removed
							if ( oldObserverCount > 0 && observerCount === 0 ) {
								console.log( JSON.stringify( {
									assertion: "ok",
									arguments: [
										timeoutId === 0,
										"Server: Timeout was removed by the time the last " +
											"observer has signed off"
									] } ) );
								console.log( JSON.stringify( { finished: 0 } ) );
							}
						},
						function( error ) {
							console.log( JSON.stringify( { assertion: "ok", arguments: [
								false, "Server: Failed to respond to retrieve request: " +
									( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
							] } ) );
						} );
			} );
			console.log( JSON.stringify( { ready: true } ) );
		},
		function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Server: Registering resource failed unexpectedly: " +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			] } ) );
		} );
