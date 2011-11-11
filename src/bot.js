(function() {
  var Bot, Chat, Config, Database, HttpFrontend, Sandbox, Triggers, bot;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Chat = require("./chat");
  HttpFrontend = require("./http_frontend");
  Database = require("./database");
  Triggers = require("./triggers");
  Sandbox = require("sandbox");
  Config = require("../config/config");
  Bot = (function() {
    function Bot() {
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
      this.chat.onPaste(/!record (.*)\n(.*)/i, "Add a new trigger and response", __bind(function(trigger, response) {
        return this.triggers.add(trigger, response);
      }, this));
      this.chat.onText("!help", "Print this help", __bind(function() {
        return this.chat.printHelp();
      }, this));
      this.chat.onText(/!eval (.*)/i, "Evaluate a Javascript expression", __bind(function(expr) {
        return this.sandbox.run(expr, this.handleEval);
      }, this));
      this.chat.onText("!reload", "Reload configuration", __bind(function() {
        return this.triggers.reload;
      }, this));
      this.chat.onText("!list", "List all known triggers", __bind(function() {
        return this.chat.paste("I respond to the following:\n  " + this.triggers.all().join(", "));
      }, this));
      return this.chat.messageHandler(this.handleMessage);
    };
    Bot.prototype.handleMessage = function(message) {
      var response;
      if (Config.debug) {
        console.log("Got message: ", message.body);
      }
      if (response = this.triggers.findIn(message.body)) {
        if (Config.debug) {
          console.log("Got response from triggers: ", response);
        }
        return this.chat.speak(response);
      }
    };
    Bot.prototype.handleEval = function(output) {
      return this.chat.speak("eval: " + output.result);
    };
    Bot.prototype.run = function() {
      this.chat.run();
      this.http.run();
      return process.on("SIGINT", __bind(function() {
        console.log("Bot shutting down now!");
        this.database.shutdown();
        return this.http.shutdown(__bind(function() {
          return this.chat.shutdown(__bind(function() {
            return process.exit();
          }, this));
        }, this));
      }, this));
    };
    return Bot;
  })();
  bot = new Bot();
  bot.run();
}).call(this);
