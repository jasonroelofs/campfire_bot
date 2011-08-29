###
   Handling of text triggers, which are simple request / response messages
###
_ = require("underscore")._

class Triggers
  constructor: (@database) ->
    this.reload()

  reload: =>
    console.log "Loading all triggers"
    @triggers = {}
    @database.loadAll "triggers", (triggers) =>
      _.each triggers, (entry) =>
        @triggers[entry.trigger] = entry.response

  ##
  # Add a new trigger / response to the system.
  # Sets the new trigger in memory and throws out a request
  # to the database to persist the new trigger
  ##
  add: (trigger, response) =>
    @triggers[trigger] = response
    @database.addTrigger trigger, response

  ##
  # Given a string from Campfire, look for any trigger
  # text in that string. Returns the response of the first one it finds,
  # or undefined/null if nothing is found
  ##
  findIn: (body) =>
    found =
      _.detect _.keys(@triggers), (trigger) =>
        (new RegExp(trigger)).test(body)

    if found
      @triggers[found]

module.exports = Triggers
