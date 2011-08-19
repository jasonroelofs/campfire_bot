(function() {
  /*
    Integration with Campfire for sending / recieving messages
  */
  var Campfire, Chat;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Campfire = require("../vendor/node-campfire/lib/campfire").Campfire;
  Chat = (function() {
    function Chat() {
      this.runner = new Campfire({
        ssl: true,
        token: "b36e890502f03151a05c0f08babcdfbd33d2f7e2",
        account: "maestroelearning"
      });
    }
    Chat.prototype.run = function() {
      return this.runner.join(429966, __bind(function(error, room) {
        this.room = room;
        return this.room.listen(this.handleMessage);
      }, this));
    };
    Chat.prototype.handleMessage = function(message) {
      console.log("Got message ", message);
      if (message.type === "TextMessage") {
        if (message.body.match(/gir/i)) {
          this.room.speak("Yes?");
        }
        if (message.body.match(/PING/i)) {
          return this.room.speak("PONG");
        }
      }
    };
    Chat.prototype.speak = function(message) {
      return this.room.speak(message);
    };
    Chat.prototype.shutdown = function(callback) {
      return this.room.leave(function() {
        console.log("Left campfire room");
        return callback();
      });
    };
    return Chat;
  })();
  module.exports = Chat;
}).call(this);
