(function() {
  var Bot, Chat, Config, Database, HttpFrontend, Sandbox, Triggers, bot, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Chat = require("./chat");

  HttpFrontend = require("./http_frontend");

  Database = require("./database");

  Triggers = require("./triggers");

  Sandbox = require("sandbox");

  Config = require("../config/config");

  _ = require("underscore")._;

  Bot = (function() {

    function Bot() {
      this.listResponsesFor = __bind(this.listResponsesFor, this);
      this.handleEval = __bind(this.handleEval, this);
      this.handleMessage = __bind(this.handleMessage, this);      this.database = new Database();
      this.chat = new Chat();
      this.chat.connect();
      this.http = new HttpFrontend(this.chat);
      this.triggers = new Triggers(this.database);
      this.triggers.reload();
      this.sandbox = new Sandbox();
      this.registerChatHooks();
    }

    Bot.prototype.registerChatHooks = function() {
      var _this = this;
      this.chat.onPaste(/!record (.*)\n(.*)/i, "Add a new trigger and response", function(trigger, response) {
        return _this.triggers.add(trigger, response);
      });
      this.chat.onText("!alias (.*) -> (.*)", "Create an alias to a known trigger", function(alias, trigger) {
        alias = alias.trim();
        trigger = trigger.trim();
        if (alias === trigger) {
          return _this.chat.speak("I won't let you alias a trigger to itself!");
        } else if (!_this.triggers.addAlias(alias, trigger)) {
          return _this.chat.speak("Unknown trigger " + trigger);
        }
      });
      this.chat.onText("!help", "Print this help", function() {
        return _this.chat.printHelp();
      });
      this.chat.onText(/!eval (.*)/i, "Evaluate a Javascript expression", function(expr) {
        return _this.sandbox.run(expr, _this.handleEval);
      });
      this.chat.onText("!reload", "Reload configuration", function() {
        return _this.triggers.reload;
      });
      this.chat.onText("!list(.*)", "List all known triggers, or known responses to the given trigger", function(trigger) {
        if (trigger) {
          return _this.listResponsesFor(trigger.trim());
        } else {
          return _this.chat.paste("I respond to the following:\n  " + _this.triggers.all().sort().join(", "));
        }
      });
      this.chat.onText("!remove (.*)", "!remove [trigger] [responseIndex]. Removes the pair. If no index is given lists out all responses for the given trigger.", function(input) {
        var parsed, responseIndex, trigger;
        parsed = input.split(" ");
        trigger = parsed[0];
        responseIndex = parsed[1];
        if (!(responseIndex != null)) {
          return _this.listResponsesFor(trigger.trim());
        } else {
          _this.triggers.removeResponse(trigger, parseInt(responseIndex));
          return _this.chat.speak("Response removed");
        }
      });
      return this.chat.messageHandler(this.handleMessage);
    };

    Bot.prototype.handleMessage = function(message) {
      var response;
      if (Config.debug) console.log("Got message: ", message.body);
      if (response = this.triggers.findIn(message.body)) {
        if (Config.debug) console.log("Got response from triggers: ", response);
        return this.chat.speak(response);
      }
    };

    Bot.prototype.handleEval = function(output) {
      return this.chat.speak("eval: " + output.result);
    };

    Bot.prototype.listResponsesFor = function(trigger) {
      var msg;
      msg = "I know the following responses for \"" + trigger + "\"\n";
      _.each(this.triggers.responsesFor(trigger), function(response, index) {
        return msg += " [" + index + "] " + response + "\n";
      });
      return this.chat.paste(msg);
    };

    Bot.prototype.run = function() {
      var _this = this;
      this.chat.run();
      this.http.run();
      return process.on("SIGINT", function() {
        console.log("Bot shutting down now!");
        _this.database.shutdown();
        return _this.http.shutdown(function() {
          return _this.chat.shutdown(function() {
            return process.exit();
          });
        });
      });
    };

    return Bot;

  })();

  bot = new Bot();

  bot.run();

}).call(this);
