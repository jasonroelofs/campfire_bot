(function() {
  var Campfire, runner;
  Campfire = require("../vendor/node-campfire/lib/campfire").Campfire;
  console.log("Got campfire: ", Campfire);
  runner = new Campfire({
    ssl: true,
    token: "b36e890502f03151a05c0f08babcdfbd33d2f7e2",
    account: "maestroelearning"
  });
  runner.join(429966, function(error, room) {
    console.log("Joined room ", room);
    return room.listen(function(message) {
      console.log("Got message ", message);
      if (message.type === "TextMessage") {
        if (message.body.match(/gir/i)) {
          room.speak("Yes?");
        }
        if (message.body.match(/PING/i)) {
          return room.speak("PONG");
        }
      }
    });
  });
}).call(this);
