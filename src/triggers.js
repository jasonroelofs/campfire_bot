
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
      this.findBestFitFor = __bind(this.findBestFitFor, this);
      this.findIn = __bind(this.findIn, this);
      this.addAlias = __bind(this.addAlias, this);
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

    Triggers.prototype.addAlias = function(alias, trigger) {
      if (this.triggers[trigger] == null) return false;
      this.add(alias, "-> " + trigger);
      return true;
    };

    Triggers.prototype.findIn = function(body) {
      var found,
        _this = this;
      found = _.detect(_.keys(this.triggers), function(trigger) {
        var matches, re;
        re = (matches = trigger.match(/^\/(.*)\/$/)) ? new RegExp(matches[1], "i") : new RegExp("\\b" + trigger + "\\b", "i");
        return re.test(body);
      });
      if (found) {
        if (Config.debug) console.log("Found trigger ", found);
        return this.findBestFitFor(found);
      }
    };

    Triggers.prototype.findBestFitFor = function(key, count) {
      var alias, trigger;
      if (count == null) count = 0;
      if (count >= 10) return "Infinite loop detected ... jerks";
      trigger = this.chooseRandomTrigger(key);
      if (alias = trigger.match(/-> (.*)/)) {
        return this.findBestFitFor(alias[1], count + 1);
      } else {
        return trigger;
      }
    };

    Triggers.prototype.chooseRandomTrigger = function(key) {
      if (Config.debug) console.log("Looking for triggers in ", this.triggers);
      return this.triggers[key][Math.floor(Math.random() * this.triggers[key].length)];
    };

    return Triggers;

  })();

  module.exports = Triggers;

}).call(this);
