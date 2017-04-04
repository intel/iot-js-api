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

var property, newValue;
var ocf = require( process.argv[ 3 ] );

console.log( JSON.stringify( { assertionCount: 14 } ) );

function assertPlatformStructure( prefix ) {

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		typeof ocf.platform.manufacturerName, "string",
		prefix + ": ocf.platform.manufacturerName is a string"
	] } ) );

	console.log( JSON.stringify( { assertion: "notStrictEqual", arguments: [
		ocf.platform.manufacturerName, "",
		prefix + ": ocf.platform.manufacturerName is not an empty string"
	] } ) );

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		typeof ocf.platform.id, "string", prefix + ": ocf.platform.id is a string"
	] } ) );

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		!!ocf.platform.id.match( /[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/ ), true,
		prefix + ": ocf.platform.id is a UUID"
	] } ) );

}

assertPlatformStructure( "Initially" );

ocf.platform.manufacturerName = "Test Name";

assertPlatformStructure( "Set individual platform info member" );
console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	ocf.platform.manufacturerName, "Test Name",
	"Set individual platform info member: ocf.platform.manufacturerName has the expected value"
] } ) );

newValue = {};
for ( property in ocf.platform ) {
	newValue[ property ] = ocf.platform[ property ];
}
newValue.manufacturerName = "Another Name";
ocf.platform = newValue;

assertPlatformStructure( "Set entire platform info" );
console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	ocf.platform.manufacturerName, "Another Name",
	"Set entire platform info: ocf.platform.manufacturerName has the expected value"
] } ) );

console.log( JSON.stringify( { finished: 0 } ) );
