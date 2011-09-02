_ = require("underscore")._

beforeEach ->
  # Kill the console to keep output sane
  console.log = jasmine.createSpy "console spy"

  # A few custom matcher definitions
  this.addMatchers {
    # Matcher to see if the resulting value is in the
    # passed in array
    toBeIn: (array) ->
      _.include array, this.actual
  }

