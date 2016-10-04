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

var ocf = require( process.argv[ 4 ] );
var manufacturerURLError;

console.log( JSON.stringify( { assertionCount: 2 } ) );

manufacturerURLError = null;
try {
	ocf.platform.manufacturerURL =
		"This is a really long URL, designed to trip the length check associated with the " +
		"manufacturerURL validation";
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
