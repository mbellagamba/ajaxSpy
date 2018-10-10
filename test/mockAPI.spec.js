describe('Ajax Spy', function(){

  var ajaxSpy;
  var SIMPLE_URL;
  var COMPLEX_URL;

  beforeEach(function(){
    ajaxSpy = new AjaxSpy('127.0.0.1',1337);
    SIMPLE_URL = 'https://www.example.com';
    COMPLEX_URL = 'https://www.example.com:8080/login?user=demo@example.com&pass=demo';
  });

  it('should set localhost and port 1337 by default', function(){
    var ajaxSpyDefault = new AjaxSpy();
    expect(ajaxSpyDefault.hostname).toEqual('127.0.0.1');
    expect(ajaxSpyDefault.port).toEqual(1337);
  });

  it('should parse a simple URL, recognizing protocol, host, path', function(){
    var urlParts = ajaxSpy.parseUri(SIMPLE_URL);
    expect(urlParts.protocol).toEqual('https:');
    expect(urlParts.hostname).toEqual('www.example.com');
    expect(urlParts.pathname).toEqual('/');
  });

  it('should parse a URL, recognizing protocol, host, port, path and search parameters', function(){
    var urlParts = ajaxSpy.parseUri(COMPLEX_URL);
    expect(urlParts.protocol).toEqual('https:');
    expect(urlParts.hostname).toEqual('www.example.com');
    expect(urlParts.port).toEqual('8080');
    expect(urlParts.pathname).toEqual('/login');
    expect(urlParts.search).toEqual('?user=demo@example.com&pass=demo');
  });

  it('should mock a complex URL', function(){
    var mockParsedUrl = {
      protocol : 'https:',
      hostname : 'www.example.com',
      port : '',
      pathname : '/ticketing/box-office-ticketing',
      search : '?user=demo@example.com&pass=demo'
    };
    spyOn(ajaxSpy,'parseUri').and.returnValue(mockParsedUrl);
    var url = 'https://www.example.com:8080/ticketing/box-office-ticketing?user=demo@example.com&pass=demo';
    var mockUrl  = ajaxSpy.mockUrl(COMPLEX_URL);
    expect(mockUrl).toEqual('http://127.0.0.1:1337/ticketing/box-office-ticketing?user=demo@example.com&pass=demo');
  });

  it('should mock a simple URL', function(){
    var mockParsedUrl = {
      protocol : 'https:',
      hostname : 'www.example.com',
      port : '',
      pathname : '/',
      search : ''
    };
    spyOn(ajaxSpy,'parseUri').and.returnValue(mockParsedUrl);
    var mockUrl  = ajaxSpy.mockUrl(SIMPLE_URL);
    expect(mockUrl).toEqual('http://127.0.0.1:1337/');
  });

  it('should save requests', function(){
    ajaxSpy.spy('GET', SIMPLE_URL, 'user=demo@example.com&pass=demo');
    ajaxSpy.spy('POST', /\w+login/);
    ajaxSpy.spy('GET', SIMPLE_URL + '/events');
    expect(ajaxSpy.patterns).toContain({
      "method": "GET",
      "url": SIMPLE_URL,
      "data" : "user=demo@example.com&pass=demo"
    });
    expect(ajaxSpy.patterns).toContain({
      "method": "POST",
      "url": /\w+login/
    });
    expect(ajaxSpy.patterns).toContain({
      "method": "GET",
      "url": SIMPLE_URL + '/events'
    });
  });

  it('should call the main \'spy\' function spy using the shortcut methods', function(){
    spyOn(ajaxSpy, 'spy');
    ajaxSpy.spyGET(SIMPLE_URL);
    expect(ajaxSpy.spy).toHaveBeenCalledWith('GET', SIMPLE_URL, undefined);
    ajaxSpy.spyPOST(SIMPLE_URL);
    expect(ajaxSpy.spy).toHaveBeenCalledWith('POST', SIMPLE_URL, undefined);
  });

  it('should throw an error if the url parameter is not a string nor a regular expression', function(){
    expect(ajaxSpy.spy).toThrowError(URIError, /INVALID_URL/);
  });

  it('should recognize url to be mocked', function(){
    ajaxSpy.patterns[0] = {url:SIMPLE_URL};
    expect(ajaxSpy.toBeMocked(SIMPLE_URL)).toBeTruthy();
    expect(ajaxSpy.toBeMocked(SIMPLE_URL + '/some/path')).toBeFalsy();

    ajaxSpy.patterns[1] = {url:/example\.com/};
    expect(ajaxSpy.toBeMocked(SIMPLE_URL)).toBeTruthy();
    expect(ajaxSpy.toBeMocked(SIMPLE_URL + '/some/path')).toBeTruthy();
  });

  it('should mock the send method of XMLHttpRequest for matching requests', function(){
    spyOn(ajaxSpy, 'toBeMocked').and.returnValue(true);
    spyOn(ajaxSpy, 'mockUrl').and.returnValue('http://127.0.0.1:1337/');
    var xhr = new XMLHttpRequest();
    ajaxSpy.setup();
    spyOn(ajaxSpy,'realOpen');
    xhr.open('GET', SIMPLE_URL);
    expect(ajaxSpy.realOpen).toHaveBeenCalledWith('GET', 'http://127.0.0.1:1337/');
  });

  it('should not mock the send method of XMLHttpRequest for not matching requests', function(){
    spyOn(ajaxSpy, 'toBeMocked').and.returnValue(false);
    var xhr = new XMLHttpRequest();
    ajaxSpy.setup();
    spyOn(ajaxSpy,'realOpen');
    xhr.open('GET', SIMPLE_URL);
    expect(ajaxSpy.realOpen).toHaveBeenCalledWith('GET', SIMPLE_URL);
  });

  it('should reset the real open on tearing down', function () {
    var xhr = new XMLHttpRequest();
    var realOpenFunction = xhr.open;
    var fakeOpenFunction = function () {};
    spyOn(ajaxSpy, 'setup').and.callFake(function () {
      ajaxSpy.realOpen = realOpenFunction;
      XMLHttpRequest.prototype.open = fakeOpenFunction;
    });
    ajaxSpy.setup();
    ajaxSpy.tearDown();
    expect(xhr.open).toEqual(realOpenFunction);
    expect(ajaxSpy.realOpen).toBeUndefined();
  });

  it('should does nothing on tearing down, if setup is not called', function () {
    ajaxSpy.tearDown();
    expect(ajaxSpy.realOpen).toBeUndefined();
  });
});
