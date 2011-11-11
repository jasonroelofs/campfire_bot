Chat = require "./chat"
HttpFrontend = require "./http_frontend"
Database = require "./database"
Triggers = require "./triggers"
Sandbox = require "sandbox"

Config = require "../config/config"
_ = require("underscore")._

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

    @chat.onText "!list", "List all known triggers",
      =>
        @chat.paste "I respond to the following:\n  " + @triggers.all().join ", "

    @chat.onText "!remove (.*)", "!remove [trigger] [responseIndex]. Removes the pair. If no index is given lists out all responses for the given trigger.",
      (input) =>
        parsed = input.split " "
        trigger = parsed[0]
        responseIndex = parsed[1]

        if not responseIndex?
          msg = "I know the following responses for \"#{trigger}\"\n"
          _.each @triggers.responsesFor(trigger), (response, index) ->
            msg += " [#{index}] #{response}\n"

          @chat.paste msg
        else
          @triggers.removeResponse trigger, parseInt(responseIndex)
          @chat.speak "Response removed"

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
