
/*
   An HTTP frontend for sending messages to the bot outside of Campfire
*/

(function() {
  var HttpFrontend, http;

  http = require("http");

  HttpFrontend = (function() {

    function HttpFrontend(chat) {
      var _this = this;
      this.chat = chat;
      this.server = http.createServer(function(request, response) {
        return _this.handleRequest(request, response);
      });
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
      this.chat.speak("I gots an HTTP message from someone!");
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
