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
  # Get the list of responses for the given trigger.
  # Returns empty list if no known responses
  ##
  responsesFor: (trigger) =>
    if not @triggers[trigger]?
      @triggers[trigger] = []

    @triggers[trigger]

  ##
  # Given a trigger and an index, remove the response
  # from the trigger, including from the database
  ##
  removeResponse: (trigger, index) =>
    t = @triggers[trigger]
    if t? and t.length > index
      response = t.splice index, 1
      @database.removeTrigger trigger, response[0]

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
  # Alias the given string to an existing trigger
  ##
  addAlias: (alias, trigger) =>
    return false unless @triggers[trigger]?
    @add(alias, "-> #{trigger}")
    true

  ##
  # Given a string from Campfire, look for any trigger
  # text in that string. Returns the response of the first one it finds,
  # or undefined/null if nothing is found
  ##
  findIn: (body) =>
    found =
      _.detect _.keys(@triggers), (trigger) =>
        re =
          if matches = trigger.match /^\/(.*)\/$/
            new RegExp(matches[1], "i")
          else
            new RegExp("\\b" + trigger + "\\b", "i")

        re.test(body)

    if found
      console.log "Found trigger ", found if Config.debug
      @findBestFitFor found

  findBestFitFor: (key, count = 0) =>
    if count >= 10
      return "Infinite loop detected ... jerks"

    trigger = @chooseRandomTrigger key

    if alias = trigger.match(/-> (.*)/)
      @findBestFitFor alias[1], count + 1
    else
      trigger

  chooseRandomTrigger: (key) =>
    if Config.debug
      console.log "Looking for triggers in ", @triggers

    @triggers[key][Math.floor(Math.random() * @triggers[key].length)]

module.exports = Triggers
