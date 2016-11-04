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

var ocf = require( process.argv[ 3 ] );

console.log( JSON.stringify( { assertionCount: 4 } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof ocf.device, "object", "ocf.device is an object"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof ocf.platform, "object", "ocf.platform is an object"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof ocf.client, "object", "ocf.client is an object"
] } ) );

console.log( JSON.stringify( { assertion: "strictEqual", arguments: [
	typeof ocf.server, "object", "ocf.server is an object"
] } ) );

console.log( JSON.stringify( { finished: 0 } ) );
