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

// The file names for client and server are reversed in this test, because the test suite uses the
// file name to decide which to run first ("server.js"). In the case of presence, however, the
// client must run first, because it must catch the announcement from the server when it comes up.

var ocf = require( process.argv[ 4 ] );

console.log( JSON.stringify( { assertionCount: 4 } ) );

ocf.device.name = "test-device-" + process.argv[ 2 ];

ocf.server
	.on( "update", function( request ) {
		if ( request.target.resourcePath === "/disable-presence" ) {
			ocf.server.disablePresence().then(
				function() {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						true, "Server: disablePresence() succeeded"
					] } ) );
					setTimeout( function() {
						ocf.server.enablePresence().then(
							function() {
								console.log( JSON.stringify( { assertion: "ok", arguments: [
									true, "Server: enablePresence() succeeded"
								] } ) );
							},
							function( error ) {
								console.log( JSON.stringify( { assertion: "ok", arguments: [
									false, "Server: enablePresence() failed: " +
										( "" + error ) + "\n" + JSON.stringify( error )
								] } ) );
							} );
					}, 5000 );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Server: disablePresence() failed: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} );
		}
		request.respond()
			.then(
				function() {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						true, "Server: response successfully sent"
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Server: sending response failed" +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} );
	} )
	.register( {
		resourcePath: "/disable-presence",
		interfaces: [ "oic.if.baseline" ],
		resourceTypes: [ "core.light" ],
		discoverable: true
	} ).then(
		function() {
			ocf.server.enablePresence().then(
				function() {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						true, "Server: enablePresence() succeeded"
					] } ) );
				},
				function( error ) {
					console.log( JSON.stringify( { assertion: "ok", arguments: [
						false, "Server: enablePresence() failed: " +
							( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
					] } ) );
				} );
		},
		function( error ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Server: Failed to register resource" +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			] } ) );
		} );
