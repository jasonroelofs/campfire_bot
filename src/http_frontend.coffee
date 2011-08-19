###
   An HTTP frontend for sending messages to the bot outside of Campfire
###
http = require("http")

class HttpFrontend
  constructor: (@chat) ->
    @server = http.createServer (request, response) =>
      this.handleRequest request, response

  run: ->
    console.log "HTTP Server now listening on localhost:8080"
    @server.listen 8080, "localhost"

  shutdown: (callback) ->
    console.log "Shutting down HTTP listener"
    @server.close()
    callback()

  handleRequest: (request, response) ->
    console.log "Got request ", request
    @chat.speak "I gots an HTTP message from someone!"
    response.writeHead 200, {"Content-type", "text/plain"}
    response.end()


module.exports = HttpFrontend
