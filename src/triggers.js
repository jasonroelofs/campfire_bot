(function() {
  /*
     Handling of text triggers, which are simple request / response messages
  */
  var Triggers, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  _ = require("underscore")._;
  Triggers = (function() {
    function Triggers(database) {
      this.database = database;
      this.findIn = __bind(this.findIn, this);
      this.add = __bind(this.add, this);
      this.reload = __bind(this.reload, this);
      this.reload();
    }
    Triggers.prototype.reload = function() {
      this.triggers = {};
      return this.database.loadAll("triggers", __bind(function(triggers) {
        return _.each(triggers, __bind(function(entry) {
          return this.triggers[entry.trigger] = entry.response;
        }, this));
      }, this));
    };
    Triggers.prototype.add = function(trigger, response) {
      this.triggers[trigger] = response;
      return this.database.addTrigger(trigger, response);
    };
    Triggers.prototype.findIn = function(body) {
      var found;
      found = _.detect(_.keys(this.triggers), __bind(function(trigger) {
        return (new RegExp(trigger)).test(body);
      }, this));
      if (found) {
        return this.triggers[found];
      }
    };
    return Triggers;
  })();
  module.exports = Triggers;
}).call(this);
