Campfire = require("../vendor/node-campfire/lib/campfire").Campfire

console.log "Got campfire: ", Campfire

runner = new Campfire { ssl: true, token: "b36e890502f03151a05c0f08babcdfbd33d2f7e2", account: "maestroelearning"}

runner.join 429966, (error, room) ->
  console.log "Joined room ", room

  process.on "SIGINT", ->
    room.leave ->
      console.log "Leaving the room!"
      process.exit()

  room.listen (message) ->
    console.log "Got message ", message
    if message.type == "TextMessage"
      if message.body.match /gir/i
        room.speak "Yes?"
      if message.body.match /PING/i
        room.speak "PONG"


