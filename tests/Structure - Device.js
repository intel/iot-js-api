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

var property, updatedDevice;
var ocf = require( process.argv[ 3 ] );

console.log( JSON.stringify( { assertionCount: 30 } ) );

function assertDeviceStructure( prefix ) {
	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		typeof ocf.device.name, "string", prefix + ": ocf.device.name is a string"
	] } ) );

	console.log( JSON.stringify( { assertion: "notStrictEqual", arguments: [
		ocf.device.name, "", prefix + ": ocf.device.name is not an empty string"
	] } ) );

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		typeof ocf.device.coreSpecVersion, "string",
		prefix + ": ocf.device.coreSpecVersion is a string"
	] } ) );

	console.log( JSON.stringify( { assertion: "notStrictEqual", arguments: [
		ocf.device.coreSpecVersion, "",
		prefix + ": ocf.device.coreSpecVersion is not an empty string"
	] } ) );

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		typeof ocf.device.uuid, "string", prefix + ": ocf.device.uuid is a string"
	] } ) );

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		!!ocf.device.uuid.match( /[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}/ ), true,
		prefix + ": ocf.device.uuid is a UUID"
	] } ) );

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		ocf.device.dataModels instanceof Array, true,
		prefix + ": ocf.device.dataModels is an array"
	] } ) );

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		ocf.device.dataModels.length > 0, true,
		prefix + ": ocf.device.dataModels has at least one element"
	] } ) );

	console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
		typeof ocf.device.dataModels[ 0 ], "string",
			prefix + ": First element of ocf.device.dataModels is a string"
	] } ) );

	console.log( JSON.stringify( { assertion: "notStrictEqual", arguments: [
		ocf.device.dataModels[ 0 ], "",
			prefix + ": First element of ocf.device.dataModels is not an empty string"
	] } ) );
}

assertDeviceStructure( "Initially" );

ocf.device.name = "some-other-name";

assertDeviceStructure( "After setting a member of ocf.device" );

// Copy the device information from ocf.device, creating a new object in the process, then
// change one of the properties on the new object, and assign the whole object to ocf.device.
updatedDevice = {};
for ( property in ocf.device ) {
	updatedDevice[ property ] = ocf.device[ property ];
}
updatedDevice.name = "yet-another-name";
ocf.device = updatedDevice;

assertDeviceStructure( "After setting the whole ocf.device structure" );

console.log( JSON.stringify( { finished: 0 } ) );
