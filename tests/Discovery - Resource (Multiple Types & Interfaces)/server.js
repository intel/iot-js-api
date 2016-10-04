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

console.log( JSON.stringify( { assertionCount: 1 } ) );

server.register( {
	resourcePath: "/a/" + process.argv[ 2 ],
	resourceTypes: [ "core.light", "core.fan" ],
	interfaces: [ "oic.if.baseline", "oic.if.custom" ],
	discoverable: true
} ).then(
	function() {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			true, "Server: Resource registered successfully"
		] } ) );

		console.log( JSON.stringify( { ready: true } ) );
	},
	function( error ) {
		console.log( JSON.stringify( { assertion: "ok", arguments: [
			false, "Server: Resource registration failed: " +
				( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
		] } ) );
	} ).catch(
		function( error ) {
			console.log( JSON.stringify( {
				teardown: true,
				message: "Server: Fatal error: " +
					( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
			} ) );
		} );
