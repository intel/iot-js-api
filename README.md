## Description
This suite provides tests for the [OCF JS API][].

## Build status
<a href="https://travis-ci.org/01org/iot-js-api/">
	<img alt="Build Status" src="https://travis-ci.org/01org/iot-js-api.svg?branch=ocf-new-api"></img>
</a>

## Usage:

```JS
// Load the test suite
var ocfTestSuite = require( "iot-js-api" );

// Run the test suite
ocfTestSuite( options );
```

### Options
In the above example, `options` is a hash containing four properties:  `tests`, `client`, `server`, and `single`. Briefly illustrated with default values:
```JS
ocfTestSuite( {
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
	}
	/* tests: array not provided, meaning run all available tests */
} );
```

`tests` is an array listing the tests to run. If absent, all tests in the `tests/` subdirectory will be run. When specified, the `tests` option can look like this:
```JS
options.tests = [ "Structure - OCF.js", "Retrieve - Resource", "Structure - Device.js", "Discovery - Device" ];
```

The other three options are each a hash pertaining to one of the endpoints of the test. Separating the options for launching a client from those for launching a server makes it possible to test one implementation of the API against another. `single` refers to the launch options for tests that have only a single endpoint, e.g. the structural tests.

The `single` hash may contain the property `skip` which, when set to `true`, will cause the test suite to skip all single-endpoint tests. This is useful when testing two different implementations against one another.

Each of `client`, `server`, and `single` is a hash where the following properties are recognized:

#### `interpreter`
The JS interpreter to use. The default value is `"node"`. If you choose to specify the `spawn` option instead, then this value will be passed to the function you specify therein as its second parameter. The interpreter is invoked with the following command line arguments, in the order given:
* the name of the test file. This will be a temporary file if the `preamble()` option is present, otherwise it will be the absolute file name of the test.
* a UUID. This will be shared by client/server tests and helps clients find their test server counterparts on the network.
* the string that the endpoint should pass to `require()` in order to load the OCF device.

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

The tests make two assumptions about the environment in which they run:

  0. `console.log()` is a function that writes to standard output.
  0. `process.argv[]` is an array containing the command line arguments passed by the suite. These are:
      <dl>
      <dt><code>process.argv[ 0 ]</code></dt><dd>The interpreter</dd>
      <dt><code>process.argv[ 1 ]</code></dt><dd>The filename of the test</dd>
      <dt><code>process.argv[ 2 ]</code></dt><dd>A UUID that helps a client distinguish its server counterpart from other devices that may be present on the network.</dd>
      <dt><code>process.argv[ 3 ]</code></dt><dd>The argument the test file should pass to ```require()``` (the <code>location</code> option).</dd>
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

[OCF JS API]: ./api/ocf
[spawn()]: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
