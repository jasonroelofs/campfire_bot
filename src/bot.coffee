Chat = require "./chat"
HttpFrontend = require "./http_frontend"
Database = require "./database"

class Bot
  constructor: ->
    @database = new Database()
    @chat = new Chat(@database)
    @http = new HttpFrontend(@chat)

  run: ->
    @chat.run()
    @http.run()

    process.on "SIGINT", =>
      console.log "Bot shutting down now!"
      @database.shutdown()
      @http.shutdown =>
        @chat.shutdown =>
          process.exit()


bot = new Bot()
bot.run()
