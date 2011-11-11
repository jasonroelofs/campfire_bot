task "test", "Run the test suite", (options) ->
  jasmine = require 'jasmine-node'
  path = require 'path'
  sys = require 'sys'
  specFolder = path.join __dirname, 'spec'

  isVerbose = true
  showColors = true
  teamcity = undefined
  junitreport = { report: false }

  jasmine.executeSpecsInFolder specFolder, (runner, log) ->
    sys.print '\n'
    process.exit runner.results().failedCount
  , isVerbose, showColors, teamcity, new RegExp(".spec\\.(js|coffee)$", 'i'), junitreport
