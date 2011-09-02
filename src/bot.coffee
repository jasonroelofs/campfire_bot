Chat = require "./chat"
HttpFrontend = require "./http_frontend"
Database = require "./database"
Triggers = require "./triggers"
Sandbox = require "sandbox"

Config = require "../config/config"

class Bot
  constructor: ->
    @database = new Database()

    @chat = new Chat()
    @chat.connect()

    @http = new HttpFrontend(@chat)

    @triggers = new Triggers(@database)
    @triggers.reload()

    @sandbox = new Sandbox()

    this.registerChatHooks()

  registerChatHooks: ->
    @chat.onPaste /!record (.*)\n(.*)/i, "Add a new trigger and response",
      (trigger, response) =>
        @triggers.add trigger, response

    @chat.onText "!help", "Print this help",
      => @chat.printHelp()

    @chat.onText /!eval (.*)/i, "Evaluate a Javascript expression",
      (expr) =>
        @sandbox.run expr, this.handleEval

    @chat.onText "!reload", "Reload configuration",
      => @triggers.reload

    @chat.messageHandler this.handleMessage

  ##
  # If none of the callbacks are hit then the message
  # falls back to this callback
  ##
  handleMessage: (message) =>
    console.log "Got message: ", message.body if Config.debug
    if response = @triggers.findIn(message.body)
      console.log "Got response from triggers: ", response if Config.debug
      @chat.speak response

  handleEval: (output) =>
    @chat.speak "eval: " + output.result

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
