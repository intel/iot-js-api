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

console.log( JSON.stringify( { assertionCount: 3 } ) );

// We need to set the device name because we will not be using the resource to determine that we
// have found the correct device
var device = ocf.device;
device.name = uuid;
device.coreSpecVersion = "something.1.0.0";
device.dataModels = [ "somethingelse.1.0.0" ];
ocf.device = device;

ocf.register( {
	id: { path: "/a/" + uuid },
	resourceTypes: [ "core.light" ],
	interfaces: [ "oic.if.baseline" ],
	discoverable: true,
	observable: true,
	properties: { theResponse: uuid }
} ).then(
	function( resource ) {
		console.log( JSON.stringify( { assertion: "ok",
			arguments: [ true, "Server: resource registered successfully" ]
		} ) );
		ocf.on( "retrieverequest", function( request ) {
			console.log( JSON.stringify( { assertion: "strictEqual",
				arguments: [ request.type, "retrieverequest",
					"Server: Request is of type 'retrieve'" ]
			} ) );
			request.sendResponse( resource )
				.then( function() {
					console.log( JSON.stringify( { assertion: "ok",
						arguments: [ true, "Server: Response sent successfully" ]
					} ) );
				}, function() {
					console.log( JSON.stringify( { assertion: "ok",
						arguments: [ false, "Server: Unexpected error while sending response" ]
					} ) );
				} );
		} );
		console.log( JSON.stringify( { ready: true } ) );
	},
	function( error ) {
		console.log( JSON.stringify( { assertion: "strictEqual",
			arguments: [ ( "" + error ), "", "Server: register(): Unexpected error" ]
		} ) );
	} );
