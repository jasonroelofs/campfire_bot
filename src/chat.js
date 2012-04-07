
/*
  Integration with Campfire for sending / recieving messages
*/

(function() {
  var Campfire, Chat, Config, Responder, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Campfire = require("../vendor/node-campfire/lib/campfire").Campfire;

  _ = require("underscore")._;

  Config = require("../config/config");

  String.prototype.trim(function() {
    return this.replace(/^\s+|\s+$/g, "");
  });

  Responder = (function() {

    function Responder(regex_or_string, help, callback) {
      this.help = help;
      this.callback = callback;
      this.runAgainst = __bind(this.runAgainst, this);
      this.getHelp = __bind(this.getHelp, this);
      if (regex_or_string instanceof String) {
        this.regex = new RegExp(regex);
      } else {
        this.regex = regex_or_string;
      }
    }

    Responder.prototype.getHelp = function() {
      return [this.regex, "\t" + this.help].join("\n");
    };

    Responder.prototype.runAgainst = function(body) {
      var matches;
      if (matches = body.match(this.regex)) {
        this.callback.apply(this, matches.slice(1));
        return true;
      } else {
        return false;
      }
    };

    return Responder;

  })();

  Chat = (function() {

    function Chat() {
      this.shutdown = __bind(this.shutdown, this);
      this.paste = __bind(this.paste, this);
      this.speak = __bind(this.speak, this);
      this.printHelp = __bind(this.printHelp, this);
      this.handleMessage = __bind(this.handleMessage, this);
      this.run = __bind(this.run, this);
      this.messageHandler = __bind(this.messageHandler, this);
      this.onText = __bind(this.onText, this);
      this.onPaste = __bind(this.onPaste, this);      this.runner = null;
      this.pasteHandlers = [];
      this.textHandlers = [];
      this.defaultHandler = function(body) {};
    }

    Chat.prototype.connect = function() {
      return this.runner = new Campfire({
        ssl: true,
        token: Config.apiKey,
        account: Config.subdomain
      });
    };

    Chat.prototype.onPaste = function(regex, help, callback) {
      return this.pasteHandlers.push(new Responder(regex, help, callback));
    };

    Chat.prototype.onText = function(regex, help, callback) {
      return this.textHandlers.push(new Responder(regex, help, callback));
    };

    Chat.prototype.messageHandler = function(defaultText) {
      return this.defaultHandler = defaultText;
    };

    Chat.prototype.run = function() {
      var _this = this;
      return this.runner.join(Config.roomId, function(error, room) {
        console.log("Joined room: ", room.name);
        _this.room = room;
        _this.room.listen(_this.handleMessage);
        return _this.runner.me(function(error, response) {
          return _this.me = response.user;
        });
      });
    };

    Chat.prototype.handleMessage = function(message) {
      var matchFound,
        _this = this;
      if (Config.debug) console.log("Got message ", message);
      if (this.me.id === message.userId) return;
      matchFound = false;
      if (message.type === "PasteMessage") {
        _.each(this.pasteHandlers, function(handler) {
          if (handler.runAgainst(message.body)) return matchFound = true;
        });
      } else if (message.type === "TextMessage") {
        _.each(this.textHandlers, function(handler) {
          if (handler.runAgainst(message.body)) return matchFound = true;
        });
      }
      if (Config.debug) console.log("Message through, did we find? ", matchFound);
      if (!matchFound) return this.defaultHandler(message);
    };

    Chat.prototype.printHelp = function() {
      var toSay,
        _this = this;
      toSay = ["I respond the following commands", ""];
      toSay.push(" --- Paste Message Commands --- ");
      _.each(this.pasteHandlers, function(handler) {
        return toSay.push(handler.getHelp());
      });
      toSay.push("");
      toSay.push(" --- Text Message Commands --- ");
      _.each(this.textHandlers, function(handler) {
        return toSay.push(handler.getHelp());
      });
      return this.room.paste(toSay.join("\n"));
    };

    Chat.prototype.speak = function(message) {
      return this.room.speak(message);
    };

    Chat.prototype.paste = function(message) {
      return this.room.paste(message);
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
