process.env.NODE_ENV = "test"
process.env.PUBLIC_URL = ""

// Load environment variables from .env file.
// https://github.com/motdotla/dotenv
require("dotenv")

// @ts-ignore
const jest = require("jest")
const argv = process.argv.slice(2)

// Watch unless on CI or in coverage mode
if (!process.env.CI && argv.indexOf("--coverage") < 0) {
  argv.push("--watchAll")
}

jest.run(argv)
