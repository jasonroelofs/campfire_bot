###
   Handling of text triggers, which are simple request / response messages
###
_ = require("underscore")._
Config = require "../config/config"

class Triggers
  constructor: (@database) ->
    @triggers = {}

  reload: =>
    console.log "Loading all triggers"
    @triggers = {}
    @database.loadAll "triggers", (triggers) =>
      _.each triggers, (entry) =>
        this.add entry.trigger, entry.response, false

  ##
  # Get an array of all triggers known.
  ##
  all: =>
    _.keys(@triggers)

  ##
  # Add a new trigger / response to the system.
  # Sets the new trigger in memory and throws out a request
  # to the database to persist the new trigger
  ##
  add: (trigger, response, toDb = true) =>
    if not @triggers[trigger]?
      @triggers[trigger] = []
    @triggers[trigger].push response

    @database.addTrigger trigger, response if toDb

  ##
  # Given a string from Campfire, look for any trigger
  # text in that string. Returns the response of the first one it finds,
  # or undefined/null if nothing is found
  ##
  findIn: (body) =>
    found =
      _.detect _.keys(@triggers), (trigger) =>
        (new RegExp(trigger, "i")).test(body)

    if found
      console.log "Found trigger ", found if Config.debug?
      this.chooseRandomTrigger found

  chooseRandomTrigger: (key) =>
    console.log "Looking for triggers in ", @triggers if Config.debug?
    @triggers[key][Math.floor(Math.random() * @triggers[key].length)]

module.exports = Triggers
