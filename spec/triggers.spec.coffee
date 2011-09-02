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