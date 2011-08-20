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
      this.db = new sqlite3.Database("db/database.sqlite3");
      this.db.serialize(__bind(function() {
        return this.ensureSchemaUpToDate();
      }, this));
    }
    Database.prototype.load_all = function(table_name, callback) {};
    Database.prototype.shutdown = function() {
      return this.db.close();
    };
    Database.prototype.ensureSchemaUpToDate = function() {
      return this.db.all("select version from schema_versions", __bind(function(error, rows) {
        if ((error != null) || !(rows != null)) {
          return this.migrate_from(0);
        } else if (rows[0].version < this.latestVersion()) {
          return this.migrate_from(currentVersion);
        }
      }, this));
    };
    Database.prototype.latestVersion = function() {
      return _.size(Database.migrations);
    };
    Database.prototype.migrate_from = function(version) {
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
    Database.migrations = ["create table schema_versions (version NUMBER);", "insert into schema_versions (version) values (0);", "create table triggers (id PRIMARY KEY, trigger TEXT, response TEXT);"];
    return Database;
  })();
  module.exports = Database;
}).call(this);
