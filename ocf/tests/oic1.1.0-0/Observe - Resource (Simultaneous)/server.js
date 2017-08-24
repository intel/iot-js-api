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

function FakeSensor( resource ) {
	var breakLength = function randomBreakLength() {
		return Math.random() * 1000 + 500;
	};
	var timeout = function fakeSensorTimeout() {

		// Pick a random value for the fake sensor
		resource.properties.value = Math.random() + 1;

		// Set up the next notification
		this._timeoutId = setTimeout( timeout, breakLength() );

		// Notify observers
		resource.notify()
			.catch( function( error ) {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					false, "Server: Notification error: " +
						( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
				] } ) );
			} );
	};

	if ( !( this instanceof FakeSensor ) ) {
		return new FakeSensor( resource );
	}

	this._timeoutId = setTimeout( timeout, breakLength() );
}

FakeSensor.prototype.stop = function stopFakeSensor() {
	clearTimeout( this._timeoutId );
	this._timeoutId = 0;
};

var fakeSensor;
var oldObserverCount = 0;
var observerCount = 0;

console.log( JSON.stringify( { assertionCount: 0 } ) );

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
				oldObserverCount = observerCount;
				observerCount += ( "observe" in request ) ? ( request.observe ? 1 : -1 ) : 0;

				// Start the notification loop when all observers have checked in
				if ( observerCount >= 1 && oldObserverCount === 0 ) {
					fakeSensor = new FakeSensor( resource );
				} else if ( oldObserverCount >= 1 && observerCount === 0 ) {
					fakeSensor = fakeSensor.stop();
					console.log( JSON.stringify( { finished: 0 } ) );
				}

				request
					.respond()
					.catch( function( error ) {
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
