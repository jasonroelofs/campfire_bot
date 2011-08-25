(function() {
  /*
    Integration with Campfire for sending / recieving messages
  */
  var Campfire, Chat, Sandbox, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Campfire = require("../vendor/node-campfire/lib/campfire").Campfire;
  Sandbox = require("sandbox");
  _ = require("underscore")._;
  String.prototype.trim(function() {
    return this.replace(/^\s+|\s+$/g, "");
  });
  Chat = (function() {
    function Chat(database) {
      this.database = database;
      this.shutdown = __bind(this.shutdown, this);
      this.speak = __bind(this.speak, this);
      this.findTrigger = __bind(this.findTrigger, this);
      this.handleEval = __bind(this.handleEval, this);
      this.handleMessage = __bind(this.handleMessage, this);
      this.run = __bind(this.run, this);
      this.reloadTriggers = __bind(this.reloadTriggers, this);
      this.runner = new Campfire({
        ssl: true,
        token: "b36e890502f03151a05c0f08babcdfbd33d2f7e2",
        account: "maestroelearning"
      });
      this.sandbox = new Sandbox();
      this.reloadTriggers();
    }
    Chat.prototype.reloadTriggers = function() {
      this.triggers = {};
      return this.database.loadAll("triggers", __bind(function(triggers) {
        return _.each(triggers, __bind(function(entry) {
          return this.triggers[entry.trigger] = entry.response;
        }, this));
      }, this));
    };
    Chat.prototype.run = function() {
      return this.runner.join(429966, __bind(function(error, room) {
        this.room = room;
        this.room.listen(this.handleMessage);
        return this.runner.me(__bind(function(error, response) {
          return this.me = response;
        }, this));
      }, this));
    };
    Chat.prototype.handleMessage = function(message) {
      var match, matches, response, trigger;
      console.log("Got message ", message);
      if (this.me.id === message.userId) {
        return;
      }
      if (message.type === "PasteMessage") {
        match = message.body.match(/!record (.*)\n(.*)/i);
        if (match.length === 3) {
          trigger = match[1].trim();
          response = match[2].trim();
          this.triggers[trigger] = response;
          this.database.saveTrigger(trigger, response);
          return console.log("Recorded: ", trigger, " -> ", response);
        }
      } else if (message.type === "TextMessage") {
        if (/!reload/i.test(message.body)) {
          this.reloadTriggers();
          return this.room.speak("Reloading configuration");
        } else if (/^!eval/.test(message.body)) {
          matches = message.body.match(/!eval (.*)/);
          return this.sandbox.run(matches[1], this.handleEval);
        } else {
          trigger = this.findTrigger(message.body);
          if (trigger) {
            return this.room.speak(this.triggers[trigger]);
          }
        }
      }
    };
    Chat.prototype.handleEval = function(output) {
      return this.room.speak("eval: " + output.result);
    };
    Chat.prototype.findTrigger = function(body) {
      return _.detect(_.keys(this.triggers), __bind(function(trigger) {
        return (new RegExp(trigger)).test(body);
      }, this));
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
