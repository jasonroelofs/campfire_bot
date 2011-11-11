require './spec_helper'

Chat = require "./../src/chat"
_ = require("underscore")._

describe "Chat", ->
  chat = null
  runner = null
  room = null

  beforeEach ->
    runner = {}
    room = {}
    room.speak = jasmine.createSpy "speak spy"
    room.paste = jasmine.createSpy "paste spy"
    room.leave = jasmine.createSpy "leave spy"

    chat = new Chat()
    chat.me = {id: 1}
    chat.runner = runner
    chat.room = room

  it "registers and handles Paste message handlers", ->
    something = null
    chat.onPaste /doing\n(.*)/, "Doing Something", (found) ->
      something = found

    message = {
      userId: 0,
      type: "PasteMessage",
      body: "doing\nsomething cool"
    }
    chat.handleMessage message

    expect(something).toEqual "something cool"

  it "registers Text message handlers", ->
    hello = null
    chat.onText /Hello (\d+)/, "Find a number", (found) ->
      hello = found

    goodbye = null
    chat.onText /Goodbye (\d+)/, "Find a number", (found) ->
      goodbye = found

    message = {
      userId: 0,
      type: "TextMessage",
      body: "Hello 126"
    }
    chat.handleMessage message

    message.body = "Goodbye 987"

    chat.handleMessage message

    expect(hello).toEqual "126"
    expect(goodbye).toEqual "987"

  it "ignores messages sent by itself", ->
    hello = null
    chat.onText /Hello (\d+)/, "Find a number", (found) ->
      hello = found

    message = {
      userId: 1,
      type: "TextMessage",
      body: "Hello 126"
    }
    chat.handleMessage message

    expect(hello).toBeNull()

  it "registers a default message handler", ->
    gotMessage = null
    chat.messageHandler (message) ->
      gotMessage = message

    message = {
      userId: 0,
      type: "TextMessage",
      body: "Hello 126"
    }
    chat.handleMessage message

    expect(gotMessage).toBe message

  it "sends messages to campfire room", ->
    chat.speak "This is a message"
    expect(room.speak).toHaveBeenCalledWith "This is a message"

  it "sends a paste message to campfire room", ->
    chat.paste "I paste a lot of things"
    expect(room.paste).toHaveBeenCalledWith "I paste a lot of things"

  it "shows help message of all message handlers", ->
    chat.onPaste /doing\n(.*)/, "Doing Something", (found) ->
    chat.onText /Hello (\d+)/, "Find a number", (found) ->

    chat.printHelp()
    output = room.paste.mostRecentCall.args[0]

    expect(output).toMatch(/Doing Something/)
    expect(output).toMatch(/Find a number/)

  it "shutsdown connection", ->
    chat.shutdown( -> )
    expect(room.leave).toHaveBeenCalled
