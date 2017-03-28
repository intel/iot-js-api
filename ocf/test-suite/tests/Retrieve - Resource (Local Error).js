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

console.log( JSON.stringify( { assertionCount: 1 } ) );

client.retrieve( { resourcePath: "/a/xyzzy", deviceId: "xyzzy" } )
	.then(
		function() {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Succeeded retrieving fake resource - Welcome to the Twilight Zone™!"
			] } ) );
		},
		function( error ) {
			console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
				error.message, "Device not found", "Retrieving fake resource failed as expected"
			] } ) );
		} )
	.then( function() {
		console.log( JSON.stringify( { finished: 0 } ) );
	} );
