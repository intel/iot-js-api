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
var expectedValue = {
	value: 42,
	anotherValue: "something",
	childValues: {
		nullValue: null,
		booleanValue: true
	}
};

console.log( JSON.stringify( { assertionCount: 7 } ) );

// Multiply a value by a scale given in the options
server
	.register( {
		resourcePath: "/a/" + process.argv[ 2 ],
		resourceTypes: [ "core.light" ],
		interfaces: [ "oic.if.baseline" ],
		discoverable: true
	} )
	.then(
		function( resource ) {
			var requestCount = 0;

			server
				.on( "update", function( request ) {
					requestCount++;
					console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
						requestCount, 1, "Server: The first request is 'update'"
					] } ) );
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						request.target === resource,
						"Server: 'update' request is directed at the correct resource"
					] } ) );
					console.log( JSON.stringify( { assertion: "deepEqual", arguments: [
						request.data, expectedValue,
						"Server: 'update' request contains the expected data"
					] } ) );
					resource.properties = request.data;
					request.respond()
						.then(
							function() {
								console.log( JSON.stringify( { assertion: "ok", arguments: [
									true, "Server: Successful response to update request"
								] } ) );
							},
							function( error ) {
								console.log( JSON.stringify( { assertion: "ok", arguments: [
									false, "Server: Failed to respond to update request: " +
										( "" + error.stack ) + "\n" +
										JSON.stringify( error, null, 4 )
								] } ) );
							} );
				} )
				.on( "retrieve", function( request ) {
					requestCount++;
					console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
						requestCount, 2, "Server: The second request is 'retrieve'"
					] } ) );
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						request.target === resource,
						"Server: 'retrieve' request is directed at the correct resource"
					] } ) );
					request.respond( resource.properties )
						.then(
							function() {
								console.log( JSON.stringify( { assertion: "ok", arguments: [
									true, "Server: Successful response to retrieve request"
								] } ) );
							},
							function( error ) {
								console.log( JSON.stringify( { assertion: "ok", arguments: [
									false, "Server: Failed to respond to retrieve request: " +
										( "" + error.stack ) + "\n" +
										JSON.stringify( error, null, 4 )
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
