const path = require("path")

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/tutorial-webpack.html

module.exports = {
  /** @param {string} _src @param {string} filename */
  process(_src, filename) {
    return "module.exports = " + JSON.stringify(path.basename(filename)) + ""
  },
}
