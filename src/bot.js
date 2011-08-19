(function() {
  var Bot, Chat, HttpFrontend, bot;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Chat = require("./chat");
  HttpFrontend = require("./http_frontend");
  Bot = (function() {
    function Bot() {
      this.chat = new Chat();
      this.http = new HttpFrontend(this.chat);
    }
    Bot.prototype.run = function() {
      this.chat.run();
      this.http.run();
      return process.on("SIGINT", __bind(function() {
        console.log("Bot shutting down now!");
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
