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

console.log( JSON.stringify( { assertionCount: 10 } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.getDeviceInfo, "function", "client.getDeviceInfo is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.getPlatformInfo, "function", "client.getPlatformInfo is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.create, "function", "client.create is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.retrieve, "function", "client.retrieve is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.update, "function", "client.update is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.delete, "function", "client.delete is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.delete, "function", "client.findDevices is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.delete, "function", "client.findPlatforms is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.delete, "function", "client.findResources is a function"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof client.on, "function", "client.on is a function"
] } ) );

console.log( JSON.stringify( { finished: 0 } ) );
