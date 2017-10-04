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

var ocf = require( process.argv[ 3 ] );
var server = ocf.server;

var oldObserverCount = 0;
var observerCount = 0;
var timeoutId;
var fakeSensorStarted = false;

ocf.device.name = "test-device-" + process.argv[ 2 ];

console.log( JSON.stringify( { assertionCount: 0 } ) );

function fakeSensorLoop( resource ) {
	var notificationCount = 0;
	function timeout() {
		resource.properties.value = Math.random() + 1;

		// Ensure a total of six notifications
		timeoutId = ( ++notificationCount < 2 ) ?
			setTimeout( timeout, ( Math.random() ) * 1000 + 500 ) : 0;

		resource.notify()
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
		properties: {
			value: Math.random() + 1
		}
	} )
	.then(
		function( resource ) {
			resource.onretrieve( function( request ) {
				oldObserverCount = observerCount;
				observerCount += ( "observe" in request ) ? ( request.observe ? 1 : -1 ) : 0;

				// Start the notification loop when all observers have checked in
				if ( observerCount >= 1 && !fakeSensorStarted ) {
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
											"observer signed off"
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
