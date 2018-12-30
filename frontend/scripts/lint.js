// https://github.com/facebook/create-react-app/pull/3850
"use strict"

const CLIEngine = require("eslint").CLIEngine

const cli = new CLIEngine({
  fix: process.argv.slice(2).indexOf("--fix") >= 0
})
const report = cli.executeOnFiles(["src/**/*.{js,jsx}"])
const formatter = cli.getFormatter()

// persist changed files when using --fix option
CLIEngine.outputFixes(report)
console.log(formatter(report.results))

const errors = report.errorCount > 0
if (errors) {
  process.exit(1)
}

const ignoreWarnings = process.argv.slice(2).indexOf("--ignore-warnings") >= 0

const warnings = report.warningCount > 0
if (!ignoreWarnings && warnings) {
  process.exit(1)
}
