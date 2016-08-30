/**
 * Create an AjaxSpy object.
   @param {string} hostname the hostname or IP address (default localhost).
   @param {int} port the port number (default 1337).
 */
function AjaxSpy(hostname, port) {
  this.hostname = hostname || "127.0.0.1";
  this.port = port || 1337;
}

AjaxSpy.prototype = {

  patterns: [],

  setup : function() {
    var mock = this;
    var xhr = new XMLHttpRequest();
    this.realOpen = xhr.open;
    XMLHttpRequest.prototype.open = function(mehtod, url, async, user, password) {
      if(mock.toBeMocked(url)) {
        url = mock.mockUrl(url);
      }
      // call the native open()
      mock.realOpen.apply(this, arguments);
    };
  },
  spy: function (method, url, data) {
    var request;
    if(typeof url != "string" && !(url instanceof RegExp))
    throw new URIError('INVALID_URL : ' + url);
    if(data){
      request = {
        "method": method,
        "url": url,
        "data": data
      };
    } else {
      request = {
        "method": method,
        "url": url
      };
    }
    var index = this.patterns.length;
    this.patterns[index] = request;
  },
  spyGET : function(url, data) {
    this.spy('GET',url, data);
  },
  spyPOST : function(url, data) {
    this.spy('POST',url, data);
  },
  toBeMocked : function(url) {
    var match = false;
    for(var i = 0; i < this.patterns.length && !match; i++){
      var element = this.patterns[i];
      var stringMatch = typeof element.url == "string" && element.url == url;
      var patternMatch = element.url instanceof RegExp && element.url.test(url);
      match = stringMatch || patternMatch;
    }
    return match;
  },
  mockUrl : function(url, protocol){
    protocol = protocol || 'http://';
    var urlObject = this.parseUri(url);
    var mockedUrl = protocol + this.hostname + ':' + this.port + urlObject.pathname;
    if(urlObject.search){
      mockedUrl += urlObject.search;
    }
    return mockedUrl;
  },
  parseUri: function (href) {
    var anchor = document.createElement('a');
    anchor.href = href;
    return anchor;
  },
  tearDown : function() {
    if(this.realOpen){
      XMLHttpRequest.prototype.open = this.realOpen;
      delete this.realOpen;
    }
  }
};
