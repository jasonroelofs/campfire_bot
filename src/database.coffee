###
   Handles communicating with SQLite database, making sure it's up to date
   schema wise.
###
sqlite3 = require("sqlite3")
_ = require("underscore")._

class Database
  constructor: ->
    @db = new sqlite3.Database "db/database.db"
    @db.serialize =>
      this.ensureSchemaUpToDate()

  # Given a table name, calls the callback with an array
  # of all entries in the requested table
  load_all: (table_name, callback) ->
    @db.all "select * from " + table_name + ";", (error, rows) =>
      callback rows

  shutdown: ->
    @db.close()

  # Do a schema check to see if we're up to date
  ensureSchemaUpToDate: ->
    @db.all "select version from schema_versions", (error, rows) =>
      if error? or not rows?
        this.migrate_from 0
      else if rows[0].version < this.latestVersion()
        this.migrate_from rows[0].version

  latestVersion: ->
    _.size Database.migrations

  migrate_from: (version) ->
    console.log "Migrating from version ", version

    for query in Database.migrations[version..-1]
      try
        console.log "Running migration ", query
        @db.exec query
      catch error
        console.log "Unable to run query '", query, "' -- ", error

    stmt = @db.prepare "update schema_versions set version = ?"
    stmt.run this.latestVersion()

  ##
  # All migrations defined here
  ##
  @migrations: [
    # Base schema version tracking table
    "create table schema_versions (version NUMBER);",

    # Set initial schema version
    "insert into schema_versions (version) values (0);",

    # Triggers table for how the bot response
    #   trigger - regexp of what to look for
    #   response - text to reply with
    "create table triggers (id PRIMARY KEY, trigger TEXT, response TEXT);",

    # Initial triggers
    "insert into triggers (trigger, response) values ('gir', 'http://images2.wikia.nocookie.net/__cb20070612213825/uncyclopedia/images/thumb/c/c1/Duty_Mode_GIR.jpg/96px-Duty_Mode_GIR.jpg');"
  ]

module.exports = Database
