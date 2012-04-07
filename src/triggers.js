
/*
   Handling of text triggers, which are simple request / response messages
*/

(function() {
  var Config, Triggers, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require("underscore")._;

  Config = require("../config/config");

  Triggers = (function() {

    function Triggers(database) {
      this.database = database;
      this.chooseRandomTrigger = __bind(this.chooseRandomTrigger, this);
      this.findIn = __bind(this.findIn, this);
      this.add = __bind(this.add, this);
      this.removeResponse = __bind(this.removeResponse, this);
      this.responsesFor = __bind(this.responsesFor, this);
      this.all = __bind(this.all, this);
      this.reload = __bind(this.reload, this);
      this.triggers = {};
    }

    Triggers.prototype.reload = function() {
      var _this = this;
      console.log("Loading all triggers");
      this.triggers = {};
      return this.database.loadAll("triggers", function(triggers) {
        return _.each(triggers, function(entry) {
          return _this.add(entry.trigger, entry.response, false);
        });
      });
    };

    Triggers.prototype.all = function() {
      return _.keys(this.triggers);
    };

    Triggers.prototype.responsesFor = function(trigger) {
      if (!(this.triggers[trigger] != null)) this.triggers[trigger] = [];
      return this.triggers[trigger];
    };

    Triggers.prototype.removeResponse = function(trigger, index) {
      var response, t;
      t = this.triggers[trigger];
      if ((t != null) && t.length > index) {
        response = t.splice(index, 1);
        return this.database.removeTrigger(trigger, response[0]);
      }
    };

    Triggers.prototype.add = function(trigger, response, toDb) {
      if (toDb == null) toDb = true;
      if (!(this.triggers[trigger] != null)) this.triggers[trigger] = [];
      this.triggers[trigger].push(response);
      if (toDb) return this.database.addTrigger(trigger, response);
    };

    Triggers.prototype.findIn = function(body) {
      var found,
        _this = this;
      found = _.detect(_.keys(this.triggers), function(trigger) {
        return (new RegExp("\\b" + trigger + "\\b", "i")).test(body);
      });
      if (found) {
        if (Config.debug != null) console.log("Found trigger ", found);
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
