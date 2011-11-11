(function() {
  /*
     Handling of text triggers, which are simple request / response messages
  */
  var Config, Triggers, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require("underscore")._;
  Config = require("../config/config");
  Triggers = (function() {
    function Triggers(database) {
      this.database = database;
      this.chooseRandomTrigger = __bind(this.chooseRandomTrigger, this);
      this.findIn = __bind(this.findIn, this);
      this.add = __bind(this.add, this);
      this.all = __bind(this.all, this);
      this.reload = __bind(this.reload, this);
      this.triggers = {};
    }
    Triggers.prototype.reload = function() {
      console.log("Loading all triggers");
      this.triggers = {};
      return this.database.loadAll("triggers", __bind(function(triggers) {
        return _.each(triggers, __bind(function(entry) {
          return this.add(entry.trigger, entry.response, false);
        }, this));
      }, this));
    };
    Triggers.prototype.all = function() {
      return _.keys(this.triggers);
    };
    Triggers.prototype.add = function(trigger, response, toDb) {
      if (toDb == null) {
        toDb = true;
      }
      if (!(this.triggers[trigger] != null)) {
        this.triggers[trigger] = [];
      }
      this.triggers[trigger].push(response);
      if (toDb) {
        return this.database.addTrigger(trigger, response);
      }
    };
    Triggers.prototype.findIn = function(body) {
      var found;
      found = _.detect(_.keys(this.triggers), __bind(function(trigger) {
        return (new RegExp(trigger, "i")).test(body);
      }, this));
      if (found) {
        if (Config.debug != null) {
          console.log("Found trigger ", found);
        }
        return this.chooseRandomTrigger(found);
      }
    };
    Triggers.prototype.chooseRandomTrigger = function(key) {
      if (Config.debug != null) {
        console.log("Looking for triggers in ", this.triggers);
      }
      return this.triggers[key][Math.floor(Math.random() * this.triggers[key].length)];
    };
    return Triggers;
  })();
  module.exports = Triggers;
}).call(this);
