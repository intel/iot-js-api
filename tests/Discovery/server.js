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

var utils = require( "../../lib/assert-to-console" );
var uuid = process.argv[ 2 ];
var serverLocation = process.argv[ 4 ];
var ocf = require( serverLocation )( "server" );

console.log( JSON.stringify( { assertionCount: 2 } ) );

ocf.register( {
	id: { path: "/a/" + uuid },
	resourceTypes: [ "core.light" ],
	interfaces: [ "oic.if.baseline" ],
	discoverable: true,
	properties: { someValue: 0 }
} ).then(
	function( resource ) {
		utils.assert( "ok", true, "Server: resource registered successfully" );

		process.on( "SIGINT", function() {
			ocf.unregister( resource ).then(
				function() {
					utils.assert( "ok", true, "Server: resource unregistered successfully" );
					process.exit( 0 );
				},
				function( error ) {
					utils.assertError( "Server: unregister()", error );
					process.exit( 0 );
				} );
		} );

		console.log( JSON.stringify( { ready: true } ) );
	},
	function( error ) {
		utils.assertError( "Server: register()", error );
	} );
