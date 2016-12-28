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

var server = require( process.argv[ 3 ] ).server;
var timeoutId = 0;
var observerCount = 0;
var cycleCount = 0;

console.log( JSON.stringify( { assertionCount: 8 } ) );

function fakeSensorLoop( resource ) {
	resource.properties.value = Math.random() + 1;

	// Ensure a total of six notifications
	timeoutId = setTimeout( fakeSensorLoop, ( Math.random() ) * 1000 + 500, resource );

	resource.notify().catch( function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Server: Notification error: " +
				( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
		] } ) );
	} );
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
	} )
	.then(
		function( resource ) {
			resource.onretrieve( function( request ) {

				observerCount += ( "observe" in request ) ? ( request.observe ? 1 : -1 ) : 0;

				console.log( JSON.stringify( { assertion: "ok", arguments: [
					true, "Server: Retrieve request " +
						"(observe: " + request.observe + ", count: " + observerCount + ")"
				] } ) );

				// Start the notification loop when all observers have checked in
				if ( observerCount > 0 && !timeoutId ) {
					timeoutId = setTimeout( fakeSensorLoop, 1000, resource );
				} else if ( observerCount === 0 && timeoutId ) {
					timeoutId = clearTimeout( timeoutId );
					cycleCount++;
				}

				request.respond().then(
					function() {
						console.log( JSON.stringify( { assertion: "ok", arguments: [
							true, "Server: Successfully responded to retrieve request"
						] } ) );
						if ( cycleCount === 2 ) {
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
