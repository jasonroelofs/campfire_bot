###
  Integration with Campfire for sending / recieving messages
###
Campfire = require("../vendor/node-campfire/lib/campfire").Campfire

class Chat
  constructor: ->
    @runner = new Campfire { ssl: true, token: "b36e890502f03151a05c0f08babcdfbd33d2f7e2", account: "maestroelearning"}

  run: ->
    @runner.join 429966, (error, room) =>
      @room = room

      @room.listen (message) ->
        console.log "Got message ", message
        if message.type == "TextMessage"
          if message.body.match /gir/i
            @room.speak "Yes?"
          if message.body.match /PING/i
            @room.speak "PONG"

  shutdown: (callback) ->
    @room.leave ->
      console.log "Left campfire room"
      callback()

module.exports = Chat