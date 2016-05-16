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

var ocf = require( process.argv[ 4 ] )( "server" );

var uuid = process.argv[ 2 ];

console.log( JSON.stringify( { assertionCount: 4 } ) );

ocf.register( {
	id: { path: "/a/" + uuid },
	resourceTypes: [ "core.light" ],
	interfaces: [ "oic.if.baseline" ],
	discoverable: true,
	properties: { someValue: 0 }
} ).then( function registerValidResourceSuccess( resource ) {
	console.log( JSON.stringify( { assertion: "ok",
		arguments: [ true, "Valid resource: registration successful" ]
	} ) );
	return ocf.unregister( resource );
}, function registerValidResourceError( error ) {
	console.log( JSON.stringify( { assertion: "strictEqual",
		arguments: [ ( "" + error ), "", "Valid resource registration: Unexpected error" ]
	} ) );
} ).then( function unregisterValidResourceSuccess() {
	console.log( JSON.stringify( { assertion: "ok",
		arguments: [ true, "Valid resource: unregistration successful" ]
	} ) );
	return ocf.register( {} );
}, function unregisterValidResourceError( error ) {
	console.log( JSON.stringify( { assertion: "strictEqual",
		arguments: [ ( "" + error ), "", "Valid resource unregistration: Unexpected error" ]
	} ) );
} ).then( function registerEmptyResourceSuccess() {
	console.log( JSON.stringify( { assertion: "ok",
		arguments: [ false, "Empty resource: registration successful" ]
	} ) );
	return ocf.register( { id: {} } );
}, function registerEmptyResourceError( error ) {
	console.log( JSON.stringify( { assertion: "strictEqual",
		arguments: [ "" + error, "Error: No ID found",
			"Empty resource: registration failed with expected error message" ]
	} ) );
	return ocf.register( { id: {} } );
} ).then( function registerWithoutPathSuccess() {
	console.log( JSON.stringify( { assertion: "ok",
		arguments: [ false, "Resource without path registration successful" ]
	} ) );
}, function registerWithoutPathError( error ) {
	console.log( JSON.stringify( { assertion: "strictEqual",
		arguments: [ "" + error, "Error: Constructing OicResource: malformed id",
			"Resource without path registration failed with expected error message" ]
	} ) );
} ).then( process.exit, process.exit );
