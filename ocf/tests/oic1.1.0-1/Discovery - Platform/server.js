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
var manufacturerURLError;

console.log( JSON.stringify( { assertionCount: 2 } ) );

manufacturerURLError = null;
try {
	ocf.platform.manufacturerURL =
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla viverra sed nulla sed " +
		"vestibulum. Praesent placerat elit quis libero tempus tincidunt. Quisque pharetra " +
		"nunc eget sapien commodo interdum. Maecenas sit amet quam aliquam, auctor nisi ac, " +
		"ornare eros. Morbi varius interdum urna, vel scelerisque nulla consequat in. " +
		"Suspendisse vestibulum risus vitae tellus rutrum, id vulputate turpis placerat. Mauris " +
		"tempor dignissim egestas. Sed finibus porttitor dapibus. Curabitur auctor efficitur mi " +
		"in iaculis. In in diam finibus, viverra lectus vitae, tristique diam. Interdum et " +
		"malesuada fames ac ante ipsum primis in faucibus. Phasellus auctor mauris vel libero " +
		"lacinia pellentesque. Nam eu ullamcorper neque. Morbi sodales dapibus eros et sodales. " +
		"In hac habitasse platea dictumst. Cras sodales, purus id facilisis faucibus, lorem " +
		"ligula lacinia odio, id tincidunt dolor ipsum et sem. Cras dignissim ipsum vitae nisl " +
		"euismod, vel aliquet tortor facilisis. Praesent dui urna, tincidunt sed metus ut, " +
		"blandit scelerisque est. Nunc ut arcu sapien. Vestibulum elementum id quam et " +
		"vestibulum. Donec id cursus purus. Donec fringilla, magna iaculis semper varius, justo " +
		"est euismod nisl, at lobortis tortor tortor vel libero. Sed et libero vulputate, " +
		"tincidunt est non, lacinia tortor. Etiam porttitor nulla ligula, nec euismod nunc " +
		"egestas non. Integer nec libero id lorem bibendum pellentesque a non massa. Nam " +
		"commodo felis elit, at sollicitudin libero fermentum quis. Donec quis dui pretium, " +
		"congue orci sit amet, consectetur est. Phasellus pharetra magna faucibus nulla euismod " +
		"ullamcorper. Curabitur pharetra purus interdum leo consequat, commodo interdum neque " +
		"faucibus. Pellentesque pretium erat ligula, in sollicitudin nisi pellentesque " +
		"interdum. Curabitur ultrices est eu ultrices pellentesque. Sed sagittis metus nec ante " +
		"condimentum, at blandit augue ultricies. Donec dapibus lectus quam. Duis sit amet dui " +
		"elementum, tincidunt odio ut, pellentesque felis. Donec diam sem, suscipit sed gravida " +
		"semper, tristique luctus risus. Nulla sit amet est iaculis, lacinia nisi eu, finibus " +
		"massa. Phasellus ultrices massa a odio commodo interdum. Proin ligula ante, mollis ac " +
		"dapibus vel, dictum vel justo. Pellentesque vulputate lectus dolor, rutrum pharetra " +
		"velit tincidunt vel. Suspendisse sodales consectetur laoreet. Duis eu justo at est " +
		"scelerisque laoreet a volutpat odio. Etiam consequat sed velit et cursus. Donec " +
		"ultricies posuere eleifend. Aliquam sagittis quis leo sit amet egestas. Pellentesque " +
		"ut mattis nulla.";
} catch ( anError ) {
	manufacturerURLError = anError;
}

console.log( JSON.stringify( { assertion: "ok", arguments: [
	!!manufacturerURLError, "Server: Attempting to set the manufacturer URL to an overly long " +
		"value failed as expected"
] } ) );

manufacturerURLError = null;
try {
	ocf.platform.manufacturerURL = "iotivity-node";
} catch ( anError ) {
	manufacturerURLError = anError;
}

console.log( JSON.stringify( { assertion: "ok", arguments: [
	!manufacturerURLError, "Server: Attempting to set the manufacturer URL to an appropriately" +
		" long value succeeded"
] } ) );

ocf.platform.supportURL = "ocf://test-device-" + process.argv[ 2 ];

console.log( JSON.stringify( { ready: true } ) );
