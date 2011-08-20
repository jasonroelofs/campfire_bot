###
  Integration with Campfire for sending / recieving messages
###
Campfire = require("../vendor/node-campfire/lib/campfire").Campfire
_ = require("underscore")._

class Chat
  constructor: (@database) ->
    @triggers = {}
    @runner = new Campfire { ssl: true, token: "b36e890502f03151a05c0f08babcdfbd33d2f7e2", account: "maestroelearning"}
    @database.load_all "triggers", (triggers) =>
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
    if message.type == "TextMessage" and @me.id != message.userId
      trigger = this.findTrigger message.body
      @room.speak @triggers[trigger] if trigger

  findTrigger: (body) =>
    regex = new RegExp body, "i"
    _.detect _.keys(@triggers), (trigger) => regex.test trigger

  speak: (message) =>
    @room.speak message

  shutdown: (callback) =>
    @room.leave ->
      console.log "Left campfire room"
      callback()

module.exports = Chat
