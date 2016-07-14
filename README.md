## Description
This suite provides tests for the [OCF JS API][].

## Build status
<a href="https://travis-ci.org/gabrielschulhof/iot-js-api-test-suite">
	<img alt="Build Status" src="https://travis-ci.org/gabrielschulhof/iot-js-api-test-suite.svg?branch=master"></img>
</a>

## Usage:

```JS
// Load the test suite
var ocfTestSuite = require( "iot-js-api-test-suite" );

// At your option you may modify the set of default logging callbacks before you run the suite.
ocfTestSuite.defaultCallbacks.log = ( function( originalLog ) {
	return function() {

		// Do something and then chain up to the original log() function
		console.log( "The test suite has just made an assertion" );
		return originalLog.apply( this, arguments );
	}
} )( ocfTestSuite.defaultCallbacks.log );

// Run the test suite
ocfTestSuite( options );
```

where ```options``` is a hash wherein the following properties are recognized:
<dl>

<dt><code>callbacks</code></dt>
<dd>An optional hash containing callbacks to call upon test events. The names and semantics of the callbacks are the same as http://api.qunitjs.com/category/callbacks/. The callbacks will be called in the context of the <code>QUnit</code> object. Information will be nicely formatted and printed to standard ouput by default.</dd>

<dt><code>clientLocation</code></dt>
<dd>A string which will be passed to <code>require()</code> in order to load the OCF device that will serve as the client.</dd>

<dt><code>environment</code></dt>
<dd>A hash containing environment key value pairs, similar to <a href="https://nodejs.org/api/process.html#process_process_env">process.env</a>.</dd>

<dt><code>interpreter</code></dt>
<dd>String: The JS interpreter to use. The default value is <code>"node"</code>.</dd>

<dt><code>location</code></dt>
<dd>A string which will be passed to <code>require()</code> in order to load the OCF device. If this option is present, the options <code>clientLocation</code> and 
<code>serverLocation</code> will be ignored. On the other hand, if this option is absent, both <code>clientLocation</code> and <code>serverLocation</code> must be present.</dd>

<dt><code>preamble()</code></dt>
<dd>A function which returns a string and receives as its argument the uuid that the child process(es) in the test instance will be given. When <code>preamble()</code> is given, for each child process a temporary file is created consisting of the string returned by <code>preamble()</code> and the body of the test. This file is then launched in a child process.</dd>

<dt><code>serverLocation</code></dt>
<dd>A string which will be passed to <code>require()</code> in order to load the OCF device that will serve as the server.</dd>

<dt><code>tests</code></dt>
<dd>An optional array containing the list of tests to run. By default all tests will be run.</dd>

</dl>


[OCF JS API]: https://github.com/solettaproject/soletta/blob/v1_beta19/doc/js-spec/oic.md
