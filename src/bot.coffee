Chat = require("./chat")
HttpFrontend = require("./http_frontend")

class Bot
  constructor: ->
    @chat = new Chat()
    @http = new HttpFrontend(@chat)

  run: ->
    @chat.run()
    @http.run()

    process.on "SIGINT", =>
      console.log "Bot shutting down now!"
      @http.shutdown =>
        @chat.shutdown =>
          process.exit()


bot = new Bot()
bot.run()
