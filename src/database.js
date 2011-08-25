(function() {
  /*
     Handles communicating with SQLite database, making sure it's up to date
     schema wise.
  */
  var Database, sqlite3, _;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  sqlite3 = require("sqlite3");
  _ = require("underscore")._;
  Database = (function() {
    function Database() {
      this.db = new sqlite3.Database("db/database.db");
      this.db.serialize(__bind(function() {
        return this.ensureSchemaUpToDate();
      }, this));
    }
    Database.prototype.loadAll = function(tableName, callback) {
      return this.db.all("select * from " + tableName + ";", __bind(function(error, rows) {
        return callback(rows);
      }, this));
    };
    Database.prototype.saveTrigger = function(trigger, response) {
      var stmt;
      stmt = this.db.prepare("insert into triggers (trigger, response) values (?, ?)");
      stmt.run(trigger, response);
      return stmt.finalize();
    };
    Database.prototype.shutdown = function() {
      return this.db.close();
    };
    Database.prototype.ensureSchemaUpToDate = function() {
      return this.db.all("select version from schema_versions", __bind(function(error, rows) {
        if ((error != null) || !(rows != null)) {
          return this.migrateFrom(0);
        } else if (rows[0].version < this.latestVersion()) {
          return this.migrateFrom(rows[0].version);
        }
      }, this));
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
