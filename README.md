# OCF Test Suite
This suite provides tests for the [OCF JS API][]

## Usage:

```JS
require( "ocf-test-suite" )( options );
```

where ```options``` is a hash wherein the following properties are recognized:
<dl>
<dt>location</dt><dd>A string which will be passed to ```require()``` in order to load the OCF device. If this option is present, the options ```clientLocation``` and ```serverLocation``` will be ignored.</dd>
<dt>clientLocation></dt><dd>A string which will be passed to ```require()``` in order to load the OCF device that will server as the client.</dd>
<dt>serverLocation></dt><dd>A string which will be passed to ```require()``` in order to load the OCF device that will server as the server.</dd>
<dt>callbacks</dt><dd>A hash containing callbacks to call upon test events. The names and semantics of the callbacks are the same as http://api.qunitjs.com/category/callbacks/. Information will be nicely formatted and printed to standard ouput by default.</dd>
</dl>


[OCF JS API]: https://github.com/solettaproject/soletta/blob/v1_beta19/doc/js-spec/oic.md
