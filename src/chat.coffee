###
  Integration with Campfire for sending / recieving messages
###
Campfire = require("../vendor/node-campfire/lib/campfire").Campfire
_ = require("underscore")._

String::trim ->
  this.replace /^\s+|\s+$/g,""

class Chat
  constructor: (@database) ->
    @runner = new Campfire { ssl: true, token: "b36e890502f03151a05c0f08babcdfbd33d2f7e2", account: "maestroelearning"}
    this.reloadTriggers()

  reloadTriggers: =>
    @triggers = {}
    @database.loadAll "triggers", (triggers) =>
      _.each triggers, (entry) =>
        @triggers[entry.trigger] = entry.response

  run: =>
    @runner.join 429966, (error, room) =>
      @room = room
      @room.listen this.handleMessage
      @runner.me (error, response) =>
        @me = response

  handleMessage: (message) =>
    console.log "Got message ", message
    return if @me.id == message.userId
    if message.type == "PasteMessage"
      match = message.body.match /!record (.*)\n(.*)/i

      if match.length == 3
        trigger = match[1].trim()
        response = match[2].trim()

        # As database is async, we store it locally
        # to ensure it's immediately available then
        # send it down to the db
        @triggers[trigger] = response
        @database.saveTrigger trigger, response

        console.log "Recorded: ", trigger, " -> ", response

    else if message.type == "TextMessage"
      if /!reload/i.test(message.body)
        this.reloadTriggers()
        @room.speak "Reloading configuration"
      else
        trigger = this.findTrigger message.body

        if trigger
          @room.speak @triggers[trigger]

  findTrigger: (body) =>
    _.detect _.keys(@triggers), (trigger) =>
      (new RegExp(trigger)).test(body)

  speak: (message) =>
    @room.speak message

  shutdown: (callback) =>
    @room.leave ->
      console.log "Left campfire room"
      callback()

module.exports = Chat
