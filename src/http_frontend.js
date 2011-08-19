(function() {
  var HttpFrontend, http;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  http = require("http");
  HttpFrontend = (function() {
    function HttpFrontend() {
      this.server = http.createServer(__bind(function(request, response) {
        return this.handleRequest(request, response);
      }, this));
    }
    HttpFrontend.prototype.run = function() {
      console.log("HTTP Server now listening on localhost:8080");
      return this.server.listen(8080, "localhost");
    };
    HttpFrontend.prototype.shutdown = function(callback) {
      console.log("Shutting down HTTP listener");
      this.server.close();
      return callback();
    };
    HttpFrontend.prototype.handleRequest = function(request, response) {};
    return HttpFrontend;
  })();
  module.exports = HttpFrontend;
}).call(this);
