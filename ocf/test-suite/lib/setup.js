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

var QUnit = require( "qunitjs" ),
	_ = require( "lodash" ),
	callbacks = require( "./callbacks" );

QUnit.load();
QUnit.config.requireExpects = true;
QUnit.config.testTimeout = 30000;

_.forEach( callbacks, function( value, key ) {
	if ( QUnit.config.callbacks[ key ] ) {
		QUnit.config.callbacks[ key ].push( _.bind( value, QUnit ) );
	}
} );

module.exports = QUnit;
