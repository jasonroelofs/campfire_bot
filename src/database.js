
/*
   Handles communicating with SQLite database, making sure it's up to date
   schema wise.
*/

(function() {
  var Database, sqlite3, _;

  sqlite3 = require("sqlite3");

  _ = require("underscore")._;

  Database = (function() {

    function Database() {
      var _this = this;
      this.db = new sqlite3.Database("db/database.db");
      this.db.serialize(function() {
        return _this.ensureSchemaUpToDate();
      });
    }

    Database.prototype.loadAll = function(tableName, callback) {
      var _this = this;
      return this.db.all("select * from " + tableName + ";", function(error, rows) {
        return callback(rows);
      });
    };

    Database.prototype.addTrigger = function(trigger, response) {
      var stmt;
      stmt = this.db.prepare("insert into triggers (trigger, response) values (?, ?)");
      stmt.run(trigger, response);
      return stmt.finalize();
    };

    Database.prototype.removeTrigger = function(trigger, response) {
      var stmt;
      stmt = this.db.prepare("delete from triggers where trigger = ? and response = ?");
      stmt.run(trigger, response);
      return stmt.finalize();
    };

    Database.prototype.shutdown = function() {
      return this.db.close();
    };

    Database.prototype.ensureSchemaUpToDate = function() {
      var _this = this;
      return this.db.all("select version from schema_versions", function(error, rows) {
        if ((error != null) || !(rows != null)) {
          return _this.migrateFrom(0);
        } else if (rows[0].version < _this.latestVersion()) {
          return _this.migrateFrom(rows[0].version);
        }
      });
    };

    Database.prototype.latestVersion = function() {
      return _.size(Database.migrations);
    };

    Database.prototype.migrateFrom = function(version) {
      var query, stmt, _i, _len, _ref;
      console.log("Migrating from version ", version);
      _ref = Database.migrations.slice(version);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        query = _ref[_i];
        try {
          console.log("Running migration ", query);
          this.db.exec(query);
        } catch (error) {
          console.log("Unable to run query '", query, "' -- ", error);
        }
      }
      stmt = this.db.prepare("update schema_versions set version = ?");
      return stmt.run(this.latestVersion());
    };

    Database.migrations = ["create table schema_versions (version NUMBER);", "insert into schema_versions (version) values (0);", "create table triggers (id PRIMARY KEY, trigger TEXT, response TEXT);", "insert into triggers (trigger, response) values ('gir', 'http://images2.wikia.nocookie.net/__cb20070612213825/uncyclopedia/images/thumb/c/c1/Duty_Mode_GIR.jpg/96px-Duty_Mode_GIR.jpg');"];

    return Database;

  })();

  module.exports = Database;

}).call(this);
