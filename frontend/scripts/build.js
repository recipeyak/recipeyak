// Do this as the first thing so that any code reading it knows the right env.
process.env.NODE_ENV = "production"

// Load environment variables from .env file.
// https://github.com/motdotla/dotenv
require("dotenv")

const chalk = require("chalk")
const fs = require("fs-extra")
const webpack = require("webpack")
const config = require("../config/webpack.config.prod")
const paths = require("../config/paths")
const checkRequiredFiles = require("react-dev-utils/checkRequiredFiles")
const FileSizeReporter = require("react-dev-utils/FileSizeReporter")
const measureFileSizesBeforeBuild = FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexTsx])) {
  process.exit(1)
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.

measureFileSizesBeforeBuild(paths.appBuild).then(previousFileSizes => {
  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuild)

  // Start the webpack build
  build(previousFileSizes)

  // Merge with the public folder
  copyPublicFolder()
})

// Print out errors
/** @param {string} summary @param {{message?: string}[]} errors */
function printErrors(summary, errors) {
  console.log(chalk.red(summary))
  console.log()
  errors.forEach(err => {
    console.log(err.message || err)
    console.log()
  })
}

// from create-react-app
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

// Create the production build and print the deployment instructions.
/** @param {{ root: string; sizes: unknown }} previousFileSizes */
function build(previousFileSizes) {
  console.log("Creating an optimized production build...")

  // @ts-ignore
  webpack(config).run(
    /** @param {Error} err @param {any} stats */ (err, stats) => {
      if (err) {
        printErrors("Failed to compile.", [err])
        process.exit(1)
      }

      if (stats.compilation.errors.length) {
        printErrors("Failed to compile.", stats.compilation.errors)
        process.exit(1)
      }

      if (process.env.CI && stats.compilation.warnings.length) {
        printErrors(
          "Failed to compile. When process.env.CI = true, warnings are treated as failures. Most CI servers set this automatically.",
          stats.compilation.warnings
        )
        process.exit(1)
      }

      console.log(chalk.green("Compiled successfully."))
      console.log()

      console.log("File sizes after gzip:\n")
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      )
      console.log()
    }
  )
}

function copyPublicFolder() {
  fs.copySync(paths.appPublic, paths.appBuild, {
    dereference: true,
    filter: file => file !== paths.appHtml
  })
}
