http = require("http")

class HttpFrontend
  constructor: ->
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


module.exports = HttpFrontend
