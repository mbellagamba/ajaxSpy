# Ajax Spy
It provides a simple interface for hijacking AJAX requests. It spies AJAX
requests and it sends them to the desired server. It could be useful for testing
a web app backed by a REST service, using another endpoint for the service,
without changing the code.

## Usage
You should import the `ajaxSpy.js` file in your browser/headless browser.
Create an `AjaxSpy` object using the constructor. Then specify all the requests
pattern that should be redirected to another URL, for example of the test server.
``` javascript
var ajaxSpy = new AjaxSpy("127.0.0.1", 1337);
ajaxSpy.setup();
ajaxSpy.spy("POST", /\w+login/, 'user=demo@example.com&pass=demo');
ajaxSpy.spy("GET", /\w+events/);

// Now AJAX requests that match the specified pattern will be redirected to the AjaxSpy object address.

// Run some tests.

ajaxSpy.tearDown();

```
AjaxSpy could be useful to write tests without modifying anything in the
application code during tests. In order to be effective, requests to server
must rely on AJAX protocol, for example as in a single page application.

## Installation
Install dependencies running the following command:
``` shell
$ npm install
```
## Tests
Run tests from command line with:
``` shell
$ npm test
```
