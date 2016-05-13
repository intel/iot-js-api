# OCF Test Suite
This suite provides tests for the [OCF JS API][].

## Usage:

```JS
require( "ocf-test-suite" )( options );
```

where ```options``` is a hash wherein the following properties are recognized:
<dl>

<dt><code>location</code></dt>
<dd>A string which will be passed to <code>require()</code> in order to load the OCF device. If this option is present, the options <code>clientLocation</code> and 
<code>serverLocation</code> will be ignored. On the other hand, if this option is absent, both <code>clientLocation</code> and <code>serverLocation</code> must be present.</dd>

<dt><code>clientLocation</code></dt>
<dd>A string which will be passed to <code>require()</code> in order to load the OCF device that will serve as the client.</dd>

<dt><code>serverLocation</code></dt>
<dd>A string which will be passed to <code>require()</code> in order to load the OCF device that will serve as the server.</dd>

<dt><code>callbacks</code></dt>
<dd>An optional hash containing callbacks to call upon test events. The names and semantics of the callbacks are the same as http://api.qunitjs.com/category/callbacks/. Information will be nicely formatted and printed to standard ouput by default.</dd>

<dt><code>tests</code></dt>
<dd>An optional array containing the list of tests to run. By default all tests will be run.</dd>

</dl>


[OCF JS API]: https://github.com/solettaproject/soletta/blob/v1_beta19/doc/js-spec/oic.md
