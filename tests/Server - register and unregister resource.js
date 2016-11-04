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

var legitimateResource;
var server = require( process.argv[ 3 ] ).server;
var legitimateResourceInit = {
	resourcePath: "/a/something",
	resourceTypes: [ "core.light" ],
	interfaces: [ "oic.if.baseline" ]
};

console.log( JSON.stringify( { assertionCount: 6 } ) );

Promise.all( [

	// No resource path
	server.register( {
		resourceTypes: [ "core.light" ],
		interfaces: [ "oic.if.baseline" ]
	} ).then(
		function( resource ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Resource creation succeeded without resource path resulting in " +
					"resource: " + JSON.stringify( resource, null, 4 )
			] } ) );
		},
		function( error ) {
			console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
				error.message, "Invalid ResourceInit",
				"Resource creation failed with correct error without resource path"
			] } ) );
			return Promise.resolve();
		} ),

	// No resource types
	server.register( {
		resourcePath: "/a/something",
		interfaces: [ "oic.if.baseline" ]
	} ).then(
		function( resource ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Resource creation succeeded without resource types resulting in " +
					"resource: " + JSON.stringify( resource, null, 4 )
			] } ) );
		},
		function( error ) {
			console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
				error.message, "Invalid ResourceInit",
				"Resource creation failed with correct error without resource types"
			] } ) );
			return Promise.resolve();
		} ),

	// No interfaces
	server.register( {
		resourcePath: "/a/something",
		resourceTypes: [ "core.light" ]
	} ).then(
		function( resource ) {
			console.log( JSON.stringify( { assertion: "ok", arguments: [
				false, "Resource creation succeeded without interfaces resulting in " +
					"resource: " + JSON.stringify( resource, null, 4 )
			] } ) );
		},
		function( error ) {
			console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
				error.message, "Invalid ResourceInit",
				"Resource creation failed with correct error without interfaces"
			] } ) );
			return Promise.resolve();
		} ),

	// Valid resource
	server.register( legitimateResourceInit )
		.then(
			function( resource ) {

				// Save the resource for the unregister portion of the test
				legitimateResource = resource;
				console.log( JSON.stringify( { assertion: "deepEqual", arguments: [

					// Restrict the deep comparison to interesting keys, because
					// implementation-dependent keys may also be present
					( function( object, keys ) {
						var index;
						var result = {};

						for ( index in keys ) {
							if ( keys[ index ] in object ) {
								result[ keys[ index ] ] = object[ keys[ index ] ];
							}
						}

						return result;
					} )( resource, [
						"resourcePath", "resourceTypes", "interfaces", "slow", "discoverable",
						"observable", "secure", "active", "properties"
					] ),
					{
						resourcePath: "/a/something",
						resourceTypes: [ "core.light" ],
						interfaces: [ "oic.if.baseline" ],
						slow: false,
						discoverable: false,
						observable: false,
						secure: false,
						active: true,
						properties: {}
					}, "Legitimate resource creation successful with correct result"
				] } ) );
			},
			function( error ) {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					false, "Legitimate resource creation failed: " +
						error.stack + "\n" + JSON.stringify( error, null, 4 )
				] } ) );
			} )
		.then( function() {
			return server.register( legitimateResourceInit );
		} )
		.then(
			function( resource ) {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					false, "Duplicate legitimate resource creation successful with " +
						JSON.stringify( resource, null, 4 )
				] } ) );
			},
			function( error ) {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					true, "Duplicate legitimate resource creation throws an error: \n" +
						( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
				] } ) );
			} )
		.then( function() {
			return server.unregister( legitimateResource );
		} ).then(
			function() {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					true, "Legitimate resource unregistration successful"
				] } ) );
			},
			function( error ) {
				console.log( JSON.stringify( { assertion: "ok", arguments: [
					false, "Legitimate resource unregistration failed with: \n" +
						( "" + error ) + "\n" + JSON.stringify( error, null, 4 )
				] } ) );
			} )
] ).then(
	function() {
		console.log( JSON.stringify( { finished: 0 } ) );
	},
	function() {
		console.log( JSON.stringify( { info: true, message: "Overall promise failed (O_o)" } ) );
		console.log( JSON.stringify( { finished: 1 } ) );
	} );
