require './spec_helper'

Triggers = require "./../src/triggers"
_ = require("underscore")._

describe "Triggers", ->
  database = null
  triggers = null

  beforeEach ->
    database = {}
    database.loadAll = jasmine.createSpy "loadAll Spy"
    database.addTrigger = jasmine.createSpy "addTrigger Spy"
    database.removeTrigger = jasmine.createSpy "removeTrigger Spy"

    triggers = new Triggers(database)

  it "can be constructed with a database", ->
    expect(triggers).not.toBeNull()

  it "can be asked to reload triggers from database", ->
    triggers.reload()
    expect(database.loadAll).toHaveBeenCalledWith "triggers", jasmine.any(Function)

  it "allows adding a new trigger without talking to db", ->
    triggers.add "trigger", "this is a response", false
    expect(database.addTrigger).not.toHaveBeenCalledWith "trigger", "this is a response"

  it "allows adding a new trigger and saving to db", ->
    triggers.add "trigger", "this is a response", true
    expect(database.addTrigger).toHaveBeenCalledWith "trigger", "this is a response"

  it "finds a trigger in a message body", ->
    triggers.add "trigger", "OMG HAI!", false

    expect(triggers.findIn("I'm looking for a trigger in here")).toEqual "OMG HAI!"
    expect(triggers.findIn("I'm looking for a TrIGGeR in here")).toEqual "OMG HAI!"
    expect(triggers.findIn("I'm looking for a trogger in here")).not.toEqual "OMG HAI!"

  it "takes word boundaries into account when searching", ->
    triggers.add "trigger", "OMG HAI!", false

    expect(triggers.findIn("I'm triggering my gun")).not.toEqual "OMG HAI!"
    expect(triggers.findIn("I'm thisthatTrIGGeRsomething in here")).not.toEqual "OMG HAI!"

  it "works with actual regex strings", ->
    triggers.add "/^start/", "Regex Found", false
    triggers.add "/\\^5/", "high five!", false

    expect(triggers.findIn("Doing something start")).not.toEqual "Regex Found"
    expect(triggers.findIn("start the awesome")).toEqual "Regex Found"

    expect(triggers.findIn("Eating 5 donuts")).not.toEqual "high five!"
    expect(triggers.findIn("^5 you rock")).toEqual "high five!"

  it "randomly chooses a response from multiple on a given trigger", ->
    triggers.add "trigger", "OMG HAI!", false
    triggers.add "trigger", "This again?", false
    triggers.add "trigger", "Oh leave me alone", false
    triggers.add "blipper", "Should never see", false

    expected = ["OMG HAI!", "This again?", "Oh leave me alone"]
    notExpected = ["Should never see"]

    _(10).times ->
      expect(triggers.findIn("I'm looking for a TrIGGeR in here")).toBeIn expected
      expect(triggers.findIn("I'm looking for a TrIGGeR in here")).not.toBeIn notExpected

  it "can be asked for all triggers currently known", ->
    triggers.add "trigger", "Oh leave me alone", false
    triggers.add "blipper", "Should never see", false

    found = triggers.all()

    expect("trigger").toBeIn found
    expect("blipper").toBeIn found
    expect(found.length).toEqual 2

  it "can return the list of responses for a requested trigger", ->
    triggers.add "trigger", "Oh leave me alone", false
    triggers.add "blipper", "Should never see", false

    found = triggers.responsesFor "trigger"
    found2 = triggers.responsesFor "unknown"

    expect(found).toEqual ["Oh leave me alone"]
    expect(found2).toEqual []

  it "allows removing a response from a trigger by index", ->
    triggers.add "trigger", "OMG HAI!", false
    triggers.add "trigger", "This again?", false
    triggers.add "trigger", "Oh leave me alone", false

    triggers.removeResponse "trigger", 1

    expect(triggers.responsesFor("trigger")).toEqual ["OMG HAI!", "Oh leave me alone"]

    expect(database.removeTrigger).toHaveBeenCalledWith "trigger", "This again?"

  describe "addAlias", ->
    it "can create an alias to a known trigger", ->
      triggers.add "trigger", "Do it", false
      result = triggers.addAlias "shooter", "trigger"

      expect(database.addTrigger).toHaveBeenCalledWith "shooter", "-> trigger"

      expect(result).toEqual true
      expect(triggers.findIn("shooter")).toEqual "Do it"

    it "returns false if the trigger is not known", ->
      result = triggers.addAlias("shooter", "johnson")
      expect(result).toEqual false

      expect(database.addTrigger).not.toHaveBeenCalled()

    it "eventually stops if aliases produce a loop", ->
      triggers.add "trigger", "-> shooter", false
      triggers.add "shooter", "-> trigger", false

      expect(triggers.findIn("shooter")).toEqual "Infinite loop detected ... jerks"
