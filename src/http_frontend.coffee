http = require("http")

class HttpFrontend
  constructor: ->
    @server = http.createServer this.handleRequest

  run: ->
    console.log "HTTP Server now listening on localhost:8080"
    @server.listen 8080, "localhost"

  shutdown: (callback) ->
    console.log "Shutting down HTTP listener"
    @server.close()
    callback()

  handleRequest: (request, response) ->
    console.log "Got request ", request
    response.writeHead 200, {"Content-type", "text/plain"}
    response.end()


module.exports = HttpFrontend
