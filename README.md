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
In the above example, `options` is a hash wherein the following properties are recognized:

#### `clientLocation`
A string which will be passed to `require()` in order to load the OCF device that will serve as the client.

#### `interpreter`
The JS interpreter to use. The default value is `"node"`. If you choose to specify the `spawn` option instead, then this value will be passed to the function you specify therein as its second parameter. The interpreter is invoked with the following command line arguments, in the order given:
* the name of the test file. This will be a temporary file if the `preamble()` option is present, otherwise it will be the absolute file name of the test.
* a UUID. This will be shared by client/server tests and helps clients find their test server counterparts on the network.
* the string that the client should pass to `require()` in order to load the OCF device.
* the string that the server should pass to `require()` in order to load the OCF device.

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
// Ignore lines that do not start with a brace, and print all lines to the terminal.
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
A string which will be passed to `require()` in order to load the OCF device. If this option is present, the options `clientLocation` and 
`serverLocation` will be ignored. On the other hand, if this option is absent, both `clientLocation` and `serverLocation` must be present.

#### `preamble( uuid )`
A function which returns a string and receives as its argument the uuid that the child process(es) in the test instance will be given. When `preamble()` is given, for each child process a temporary file is created consisting of the string returned by `preamble()` and the body of the test. This file is then launched in a child process.

The tests make two assumptions about the environment in which they run:

  0. `console.log()` is a function that writes to standard output.
  0. `process.argv[]` is an array containing the command line arguments passed by the suite. These are:
      <dl>
      <dt><code>process.argv[ 0 ]</code></dt><dd>The interpreter</dd>
      <dt><code>process.argv[ 1 ]</code></dt><dd>The filename of the test</dd>
      <dt><code>process.argv[ 2 ]</code></dt><dd>A UUID that helps a client distinguish its server counterpart from other devices that may be present on the network.</dd>
      <dt><code>process.argv[ 3 ]</code></dt><dd>The argument the client should pass to ```require()``` (the <code>clientLocation</code> option).</dd>
      <dt><code>process.argv[ 4 ]</code></dt><dd>The argument the server should pass to ```require()``` (the <code>serverLocation</code> option).</dd>
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

			// This will result in the test suite performing require( "ocf" ) on both the client
			// and the server
			"\"ocf\", \"ocf\"",
			"] };"
		].join( "\n" );
	};
```

#### `serverLocation`
A string which will be passed to `require()` in order to load the OCF device that will serve as the server.

#### `tests`
An optional array containing the list of tests to run. By default all tests will be run. For example:
```JS
options.tests = [ "Structure - OCF.js", "Retrieve - Resource", "Structure - Device.js", "Discovery - Device" ];
```


[OCF JS API]: https://github.com/01org/iot-js-api/tree/master/api/ocf
