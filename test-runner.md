<a href="https://travis-ci.org/01org/iot-js-api/ocf/test-suite">
	<img alt="Build Status" src="https://travis-ci.org/01org/iot-js-api.svg?branch=master"></img>
</a>

## Description
This repository provides [Javascript API specifications](./README.md) for a variety of APIs necessary for creating and communicating with Internet-of-Things(IoT) devices.

It also contains a collection of test scripts which serve both as example code illustrating the usage of the APIs specified, and as test cases which can be executed given an implementation. The test cases can be conveyed to an implementation using a flexible [test runner](#running-the-test-suite) provided herein both as a [npm][] package and as a [grunt][] plugin.

<a name="running-the-test-suite"></a>
## Running the test suite

The test suite requires Node.js to run. Note, however, that the tests themselves do not require Node.js. The test suite runs each test script in its own process, and the test scripts output a sequence of JSON objects to standard output which the test suite then collects. The name of the interpreter responsible for running the test script, the preamble to add to the test script (if necessary), and even the Node.js code for spawning the child process that runs the test script can be [configured](#options). Thus, you can run the test scripts using a different Javascript interpreter than node, and you can even modify them before your interpreter receives them.

To start using the test suite from your project:

  0. Make sure you have a recent version of Node.js installed.

  0. Turn your project into a npm package by running `npm init .` in the root of your project. Follow the prompts to create an appropriate `package.json` file which defines your npm package. The defaults offered are most often satisfactory.

  0. Run `npm install --save-dev iot-js-api`. This will install this repository and append it to the list of development dependencies for your npm package, and will allow you to load the suite via `require( "iot-js-api" )` from a Node.js script.

  0. Add `package.json` to your project. If you purge your project's intermediate files, you will need to run `npm install` from your project root to re-install this package before you can run the test suite.

### Running as a npm package

Create a script for running your tests. The following example illustrates basic usage. Fill out `options` as appropriate. The available options and their possible values are documented [below](#options).

```JS
// Load the test suite
var testSuite = require( "iot-js-api" );

// Run the test suite
testSuite( options );
```

### Running as a grunt plugin
This repository provides a grunt multitask named `iot-js-api`.

Add the following to your Gruntfile.js:

```JS
grunt.task.loadNpmTasks( "iot-js-api" );
grunt.initConfig( {
	"iot-js-api": {
		plain: options
	}
} );

```

where `options` is a hash as documented [below](#options). You can then run the test suite with the command `grunt iot-js-api:plain` and build it into your grunt-based workflow.

<a name="options"></a>
### Options
In the above examples, `options` is a hash containing the following properties:  `api`, `apiVersion`, `tests`, `client`, `server`, and `single`. Briefly illustrated with default values:
```JS
testSuite( {
	client: {
		interpreter: "node",
		lineFilter: function( line, /* fileName */ ) { return line; },
		location: "ocf",
		/* preamble: function not provided, meaning run the test as is */
		/* spawn: function not provided, meaning spawn the endpoint in the default fashion */
	},
	server: {
		interpreter: "node",
		lineFilter: function( line, /* fileName */ ) { return line; },
		location: "ocf",
		/* preamble: function not provided, meaning run the test as is */
		/* spawn: function not provided, meaning spawn the endpoint in the default fashion */
	},
	single: {
		interpreter: "node",
		lineFilter: function( line, /* fileName */ ) { return line; },
		location: "ocf",
		skip: false,
		/* preamble: function not provided, meaning run the test as is */
		/* spawn: function not provided, meaning spawn the endpoint in the default fashion */
	},
	api: "ocf",
	apiVersion: "oic1.1.0-0"
	/* tests: array not provided, meaning run all available tests */
} );
```

`api` is a string that informs the test runner of the API for which to run the tests. The keys specified under the [package.json](./package.json) `versions` property are possible values for this option. The `api` property must be provided.

`apiVersion` is a string that informs the test runner of the version of the given API for which to run the tests. The names of the directories under the `tests/` subdirectory for the given API give the possible values for this option. The `apiVersion` property must be provided.

`tests` is an array listing the tests to run. If absent, all tests in the `tests/` subdirectory of the given `api` at the given `apiVersion` will be run. When specified, the `tests` option can look like this:
```JS
options.tests = [ "Structure - OCF.js", "Retrieve - Resource", "Structure - Device.js" ];
```
Each string in the list is the name of a file or a directory in the `tests/` subdirectory of the requested API at the requested version.

The other three options are each a hash pertaining to one of the endpoints of the test. Separating the options for launching a client from those for launching a server makes it possible to test one implementation of the API against another. `single` refers to the launch options for tests that have only a single endpoint, e.g. the structural tests.

The `single` hash may contain the property `skip` which, when set to `true`, will cause the test suite to skip all single-endpoint tests. This is useful when testing two different implementations against one another.

Each of `client`, `server`, and `single` is a hash where the following properties are recognized:

#### `interpreter`
The JS interpreter to use. The default value is `"node"`. If you choose to specify the `spawn` option instead, then this value will be passed to the function you specify therein as its first parameter. The interpreter is invoked with the following command line arguments, in the order given:
* the name of the test file. This will be a temporary file if the `preamble()` option is present, otherwise it will be the absolute file name of the test.
* a UUID. This will be shared by client/server tests and helps clients find their test server counterparts on the network.
* the string that the endpoint should pass to `require()` in order to load the API implementation.

#### `lineFilter( line, fileName )`
A function that receives a line from the output of the child process and returns it, potentially with modifications. By default, the output interpreter ignores empty lines, so if the function returns `""`, the line will be ignored. The output of the child process is expected to be a sequence of JSON objects. The test prints these objects to standard output, but if the runtime produces additional output, this will cause the test suite to throw an exception. This hook provides you with an opportunity to filter out all output lines except the ones produced by the test. For example:

```JS
// Ignore lines that do not start with a brace.
function ignoreNonBraceLines( line /*, fileName */ ) {
	return line.match( /^{/ ) ? line : "";
}
```

You can also use this hook to save all output from the child process to a file, or to output it to the terminal. Since the majority of tests involve a client/server pair, the file name is provided in the second parameter so you can distinguish the output of the client from the output of the server. For example:
```JS
// Print all lines to the terminal and ignore lines that do not start with a brace.
function ignoreNonBraceLines( line, fileName ) {

	// Strip carriage returns
	line = line.replace( /\r/g, "" );

	// Output the line, prefixed by the name of the test. We assume that all tests are rooted in a
	// directory called "tests", so we match the rest of the path and use it to prefix the line we
	// have received from the child process. This can result in output like this:
	//
	// Discovery - Resource/server.js:
	// Discovery - Resource/server.js:
	// Discovery - Resource/server.js: zjs_ocf_register_resources()
	// Discovery - Resource/server.js: oc_main: Stack successfully initialized
	// Discovery - Resource/server.js:
	// Discovery - Resource/server.js: {"assertionCount":1}
	// Discovery - Resource/server.js: {"ready":true}
	// Discovery - Resource/server.js:
	// Discovery - Resource/client.js:
	// Discovery - Resource/client.js:
	// Discovery - Resource/client.js: zjs_ocf_register_resources()
	// Discovery - Resource/client.js: oc_main: Stack successfully initialized
	// Discovery - Resource/client.js:
	// Discovery - Resource/client.js: {"assertionCount":3}
	// ...
	console.log( ( childPath.match( /tests[/](.*)$/ ) || [])[1] + ": " + line );

	// Return an empty string if the line doesn't start with an opening brace
	return ( line[ 0 ] === "{" ) ? line : "";
}
```

#### `location`
A string which will be passed to `require()` in order to load the OCF device.

#### `preamble( uuid )`
A function which returns a string and receives as its argument the uuid that the child process(es) in the test instance will be given. When `preamble()` is given, for each child process a temporary file is created consisting of the string returned by `preamble()` followed by the body of the test. This file is then launched in a child process.

The tests make the following assumptions about the environment in which they run:

  0. `console.log()` is a function that writes to standard output.
  0. `require()` is a function that can load a JavaScript module.
  0. `process.argv[]` is an array containing the command line arguments passed by the suite. These are:
      <dl>
      <dt><code>process.argv[ 0 ]</code></dt><dd>The interpreter</dd>
      <dt><code>process.argv[ 1 ]</code></dt><dd>The filename of the test</dd>
      <dt><code>process.argv[ 2 ]</code></dt><dd>A UUID that helps a client distinguish its server counterpart from other devices that may be present on the network.</dd>
      <dt><code>process.argv[ 3 ]</code></dt><dd>The argument the test file should pass to `require()` (the <code>location</code> option).</dd>
      </dl>

Thus, if the environment in which you wish to run the tests does not provide these values, you can use the `preamble()` option to prepend code to the file. For example:

```JS
	options.preamble = function( uuid ) {
		return [
			"var process = { argv: [",

			// The tests do not make use of these parameters
			"null, null,",

			// The UUID that was passed in
			"\"" + uuid + "\",",

			// This will result in the test performing require( "ocf" ) to acquire the OCF device
			"\"ocf\"",
			"] };"
		].join( "\n" ) + "\n";
	};
```

#### `spawn( interpreter, commandLine )`
A function responsible for creating the child process that contains the endpoint. This function returns an object such as the one produced by node's [spawn()][]. This option gives you finer control over the process of launching a test endpoint than the `interpreter` and `preamble` options alone, since you can precede the launch of the child process with any number of custom actions, such as setting up the file system in preparation for the child process, or passing it custom environment variables.

[spawn()]: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
[npm]: https://npmjs.com/
[grunt]: http://gruntjs.com/
