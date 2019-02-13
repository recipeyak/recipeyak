// from: https://github.com/jdrouet/opengraph-html-webpack-plugin/blob/6f1ff72419e60cd0fa3a064709322cfa26bab599/source/index.js

const HtmlWebpackPlugin = require("html-webpack-plugin")
/**
 *
 * @typedef IOpenGraphItem
 * @property {string=} lang
 * @property {string} property
 * @property {string} content
 */

/**
 * @param {IOpenGraphItem} item
 */
const format = item => {
  if (item.lang) {
    return `<meta property="${item.property}" lang="${item.lang}" content="${
      item.content
    }" />`
  }
  return `<meta property="${item.property}" content="${item.content}" />`
}

/**
 * Generate Open Graph Data
 * see: http://ogp.me
 */
class OpenGraphPlugin {
  /** @param {ReadonlyArray<IOpenGraphItem>} options */
  constructor(options) {
    this.options = options
  }

  /**
   * @param {import("webpack").Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.make.tapAsync("OpenGraphPlugin", (compilation, callback) => {
      // @ts-ignore
      HtmlWebpackPlugin.getHooks(compilation).afterTemplateExecution.tapAsync(
        "OpenGraphPlugin",
        /**
         * @param {any} htmlPluginData
         * @param {Function} callback
         */
        (htmlPluginData, callback) => {
          const filesToInclude = this.options.map(format).join("\n")
          htmlPluginData.html = htmlPluginData.html.replace(
            "</head>",
            filesToInclude + "\n</head>"
          )
          callback(null, htmlPluginData)
        }
      )
      return callback()
    })
  }
}

module.exports = OpenGraphPlugin
