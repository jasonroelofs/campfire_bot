(function() {
  var HttpFrontend, http;
  http = require("http");
  HttpFrontend = (function() {
    function HttpFrontend() {
      this.server = http.createServer(this.handleRequest);
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
    HttpFrontend.prototype.handleRequest = function(request, response) {
      console.log("Got request ", request);
      response.writeHead(200, {
        "Content-type": "Content-type",
        "text/plain": "text/plain"
      });
      return response.end();
    };
    return HttpFrontend;
  })();
  module.exports = HttpFrontend;
}).call(this);
