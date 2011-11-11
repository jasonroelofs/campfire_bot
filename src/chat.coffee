###
  Integration with Campfire for sending / recieving messages
###
Campfire = require("../vendor/node-campfire/lib/campfire").Campfire
_ = require("underscore")._

Config = require "../config/config"

String::trim ->
  this.replace /^\s+|\s+$/g,""

class Responder
  constructor: (regex_or_string, @help, @callback) ->
    if regex_or_string instanceof String
      @regex = new RegExp(regex)
    else
      @regex = regex_or_string

  getHelp: =>
    [@regex, "\t" + @help].join "\n"

  runAgainst: (body) =>
    if matches = body.match @regex
      @callback matches[1..-1]...
      true
    else
      false

class Chat
  constructor: ->
    @runner = null
    @pasteHandlers = []
    @textHandlers = []

    # Default handler no-op by default
    @defaultHandler = (body) ->

  connect: ->
    @runner = new Campfire { ssl: true, token: Config.apiKey, account: Config.subdomain }

  ##
  # Register callback for paste message
  # Takes a regex/string, help text, and a callback
  ##
  onPaste: (regex, help, callback) =>
    @pasteHandlers.push new Responder(regex, help, callback)

  ##
  # Register callback for text messages.
  # Takes a regex/string, help text, and a callback
  ##
  onText: (regex, help, callback) =>
    @textHandlers.push new Responder(regex, help, callback)

  ##
  # Define a fallback message handler that runs if none of the
  # paste or text handlers find a match
  ##
  messageHandler: (defaultText) =>
    @defaultHandler = defaultText

  run: =>
    @runner.join Config.roomId, (error, room) =>
      console.log "Joined room: ", room.name
      @room = room
      @room.listen this.handleMessage
      @runner.me (error, response) =>
        @me = response.user

  ##
  # Callback from Campfire.
  # Given a message that isn't from the bot
  # look for any handlers that match the message
  ##
  handleMessage: (message) =>
    console.log "Got message ", message if Config.debug
    return if @me.id == message.userId

    matchFound = false

    if message.type == "PasteMessage"
      _.each @pasteHandlers, (handler) =>
        if handler.runAgainst(message.body)
          matchFound = true

    else if message.type == "TextMessage"
      _.each @textHandlers, (handler) =>
        if handler.runAgainst(message.body)
          matchFound = true

    console.log "Message through, did we find? ", matchFound if Config.debug
    if !matchFound
      @defaultHandler message

  printHelp: =>
    toSay = ["I respond the following commands", ""]

    toSay.push " --- Paste Message Commands --- "
    _.each @pasteHandlers, (handler) => toSay.push handler.getHelp()
    toSay.push ""

    toSay.push " --- Text Message Commands --- "
    _.each @textHandlers, (handler) => toSay.push handler.getHelp()

    @room.paste toSay.join "\n"

  speak: (message) =>
    @room.speak message

  paste: (message) =>
    @room.paste message

  shutdown: (callback) =>
    @room.leave ->
      console.log "Left campfire room"
      callback()

module.exports = Chat
