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

var async = require( "async" ),
	glob = require( "glob" ),
	_ = require( "lodash" ),
	tmp = require( "tmp" ),
	childProcess = require( "child_process" ),
	fs = require( "fs" ),
	path = require( "path" ),
	uuid = require( "uuid" ),
	defaultCallbacks = require( "./lib/callbacks" );

function identityLineFilter( value ) {
	return value;
}

function spawn( commandLine, interpreter ) {
	return childProcess.spawn( interpreter, commandLine, {
		stdio: [ process.stdin, "pipe", process.stderr ]
	} );
}

var testSuite = _.extend( function OcfTestSuite( options ) {

if ( !( this instanceof OcfTestSuite ) ) {
	return new OcfTestSuite( options );
}

var QUnit,
	runningProcesses = [],
	getQUnit = function() {
		if ( !QUnit ) {
			QUnit = require( "./lib/setup" );
		}
		return QUnit;
	};

// Spawn a single child and process its stdout.
function spawnOne( assert, options ) {
	var temporary;
	var commandLine = [ options.path, options.uuid, options.clientLocation,
		options.serverLocation
	];
	var theChild;

	if ( "preamble" in options ) {
		var temporary = tmp.fileSync();

		fs.writeSync( temporary.fd, options.preamble( options.uuid ) );
		fs.writeSync( temporary.fd, fs.readFileSync( options.path ).toString() );
		commandLine[ 0 ] = temporary.name;
	}

	theChild = options.spawn( commandLine, options.interpreter );

	runningProcesses.push( theChild );

	theChild
		.on( "exit", function( code, signal ) {
			code = ( "reportedExitStatus" in theChild ) ? theChild.reportedExitStatus : code;
			var exitCodeOK = ( code === 0 || code === null ),
				signalOK = ( signal !== "SIGSEGV" );

			assert.ok( exitCodeOK, options.name + " exited successfully (" + code + ")" );
			assert.ok( signalOK, options.name + " did not segfault" );

			var childIndex = runningProcesses.indexOf( theChild );
			if ( childIndex >= 0 ) {
				runningProcesses.splice( childIndex, 1 );
			}
			if ( temporary ) {
				temporary.removeCallback();
			}
			options.maybeQuit( theChild );
		} );

	// The stdout of the child is a sequence of \n-separated stringified JSON objects.
	theChild.stdout.on( "data", function serverStdoutData( data ) {
		_.each( data.toString().split( "\n" ), function( value ) {
			var jsonObject;

			value = options.lineFilter( value, options.path );

			if ( !value ) {
				return;
			}

			// Attempt to retrieve a JSON object from stdout.
			try {
				jsonObject = JSON.parse( value );
			} catch ( e ) {
				options.teardown( "Error parsing " + options.name + " JSON: '" + value + "'" +
					( e.message ? e.message : e ), true );
				return;
			}

			// The child is reporting the number of assertions it will be making. We add our own
			// two assertions ( 1.) successful exit and 2.) no segfault) to that count.
			if ( "assertionCount" in jsonObject ) {
				options.reportAssertions( jsonObject.assertionCount + 2 );

			// The child has requested that it and its peer(s) be killed.
			} else if ( "finished" in jsonObject ) {
				theChild.reportedExitStatus = jsonObject.finished;
				options.teardown( null, theChild );

			} else if ( jsonObject.info ) {
				console.log( "\x1b[46;30mi\x1b[0m " + jsonObject.message );

			// The child has requested a teardown.
			} else if ( jsonObject.teardown ) {
				options.teardown(
					options.name + " requested teardown: " + jsonObject.message );

			// The child is reporting that it is ready. Only servers do this.
			} else if ( jsonObject.ready ) {
				if ( options.onReady ) {
					options.onReady();
				}

			// The child is making an assertion.
			} else if ( jsonObject.assertion ) {
				assert[ jsonObject.assertion ].apply( assert, jsonObject.arguments );

			// Otherwise, we have received unknown JSON from the child - bail.
			} else {
				options.teardown( "Unkown JSON from " + options.name + ": " + value, true );
			}
		} );
	} );

	return theChild;
}

// Normalize options
if ( options.location ) {
	options.clientLocation = options.location;
	options.serverLocation = options.location;
} else if ( !( options.clientLocation && options.serverLocation ) ) {
	throw new Error( "Both clientLocation and serverLocation must be specified" );
}
options.lineFilter = options.lineFilter || identityLineFilter;
options.interpreter = options.interpreter || "node";
options.tests = ( ( options.tests && Array.isArray( options.tests ) ) ?
	_.map( options.tests, function( item ) {
		return path.join( __dirname, "tests", item );
	} ) :
	( glob.sync( path.join( __dirname, "tests", "*" ) ) ) );

_.each( options.tests, function( item ) {
	var clientPathIndex,
		clientPaths = glob.sync( path.join( item, "client*.js" ) ),
		serverPath = path.join( item, "server.js" );

	if ( fs.lstatSync( item ).isFile() ) {
		getQUnit()
			.test( path.basename( item ).replace( /\.js$/, "" ), function( assert ) {
				spawnOne( assert,
					_.extend( ( "preamble" in options ? { preamble: options.preamble } : {} ), {
						uuid: uuid.v4(),
						name: "Test",
						path: item,
						lineFilter: options.lineFilter,
						clientLocation: options.clientLocation,
						serverLocation: options.serverLocation,
						interpreter: options.interpreter,
						spawn: options.spawn || spawn,
						teardown: function( error, sourceProcess ) {
							sourceProcess.kill( "SIGINT" );
						},
						maybeQuit: assert.async(),
						reportAssertions: _.bind( assert.expect, assert )
					} ) );
			} );
		return;
	}

	if ( !fs.lstatSync( item ).isDirectory() ) {
		return;
	}

	for ( clientPathIndex in clientPaths ) {
		if ( !( fs.lstatSync( clientPaths[ clientPathIndex ] ).isFile() ) ) {
			throw new Error( "Cannot find client at " + clientPaths[ clientPathIndex ] );
		}
	}

	if ( !( fs.lstatSync( serverPath ).isFile() ) ) {
		throw new Error( "Cannot find server at " + serverPath );
	}

	getQUnit().test( path.basename( item ), function( assert ) {
		var totalChildren = clientPaths.length + 1,

			// Track the child processes involved in this test in this array
			children = [],

			// Turn this test async
			done = assert.async(),

			// Count assertions made by the children. Report them to assert.expect() when both
			// children have reported their number of assertions.
			totalAssertions = 0,
			childrenAssertionsReported = 0,

			spawnOptions = _.extend( {
				lineFilter: options.lineFilter,
				uuid: uuid.v4(),
				clientLocation: options.clientLocation,
				serverLocation: options.serverLocation,
				interpreter: options.interpreter,
				spawn: options.spawn || spawn,
				teardown: function( error ) {
					var index,

						// When killing child processes in a loop we have to copy the array
						// because it may become modified by the incoming notifications that a
						// process has exited.
						copyOfChildren = children.slice();

					for ( index in copyOfChildren ) {
						copyOfChildren[ index ].kill( "SIGINT" );
					}

					if ( error ) {
						throw new Error( error );
					}
				},
				maybeQuit: function( theChild ) {
					var childIndex = children.indexOf( theChild );
					if ( childIndex >= 0 ) {
						children.splice( childIndex, 1 );
					}
					if ( children.length === 0 ) {
						done();
					}
				},
				reportAssertions: function( assertionCount ) {
					childrenAssertionsReported++;
					totalAssertions += assertionCount;
					if ( childrenAssertionsReported === totalChildren ) {
						assert.expect( totalAssertions );
					}
				}
			}, ( "preamble" in options ? { preamble: options.preamble } : {} ) );

		// We run the server first, because the server has to be there before the clients
		// can run. OTOH, the clients may initiate the termination of the test via a non-error
		// teardown request.
		children.push( spawnOne( assert, _.extend( {}, spawnOptions, {
			name: "Server",
			path: serverPath,
			onReady: function() {
				var clientIndex = 0;
				async.eachSeries( clientPaths, function startOneChild( item, callback ) {
					children.push( spawnOne( assert, _.extend( {}, spawnOptions, {
						name: "Client" +
							( clientPaths.length > 1 ? " " + ( ++clientIndex ) : "" ),
					path: item } ) ) );

					// Spawn clients at least two seconds apart to avoid message uniqueness
					// issue in iotivity: https://jira.iotivity.org/browse/IOT-724
					setTimeout( callback, 2000 );
				} );
			}
		} ) ) );
	} );
} );

process.on( "SIGINT", process.exit );

process.on( "exit", function() {
	var childIndex;

	for ( childIndex in runningProcesses ) {
		runningProcesses[ childIndex ].kill( "SIGTERM" );
	}
} );

}, { defaultCallbacks: defaultCallbacks } );

module.exports = testSuite;
