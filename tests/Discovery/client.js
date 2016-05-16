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

var ocf = require( process.argv[ 3 ] )( "client" );

var uuid = process.argv[ 2 ];

console.log( JSON.stringify( { assertionCount: 1 } ) );

new Promise( function( fulfill, reject ) {
	var teardown;
	var resourcefound = function( event ) {
		if ( event.resource.id.path === ( "/a/" + uuid ) ) {
			teardown();
		}
	};
	teardown = function( error ) {
		ocf.removeEventListener( "resourcefound", resourcefound );
		if ( error ) {
			reject( error );
			} else {
			fulfill();
		}
	};
	ocf.addEventListener( "resourcefound", resourcefound );
	ocf.findResources().catch( teardown );
} ).then(
	function() {
		console.log( JSON.stringify( { assertion: "ok",
			arguments: [ true, "Client: Resource found" ]
		} ) );
		console.log( JSON.stringify( { killPeer: true } ) );
		process.exit( 0 );
	},
	function( error ) {
		console.log( JSON.stringify( { assertion: "strictEqual",
			arguments: [ ( "" + error ), "", "Client: Unexpected error" ]
		} ) );
	} );
