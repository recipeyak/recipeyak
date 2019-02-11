const autoprefixer = require("autoprefixer")
const webpack = require("webpack")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const ManifestPlugin = require("webpack-manifest-plugin")
const InterpolateHtmlPlugin = require("react-dev-utils/InterpolateHtmlPlugin")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin
const paths = require("./paths")
const getClientEnvironment = require("./env")

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1)
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl)

if (env.stringified["process.env"].NODE_ENV !== '"production"') {
  throw new Error("Production builds must have NODE_ENV=production.")
}

module.exports = {
  mode: "production",
  // Don't attempt to continue if there are any errors.
  bail: true,
  devtool: "source-map",
  performance: {
    hints: false
  },
  optimization: {
    splitChunks: {
      chunks: "all"
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            comparisons: false,
            inline: 2 // inline functions with arguments
          },
          output: {
            ascii_only: true
          }
        },
        parallel: true,
        cache: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          inline: false,
          annotation: true
        }
      })
    ]
  },
  entry: [paths.appIndexTsx],
  output: {
    path: paths.appBuild,
    filename: "static/js/[name].[contenthash:8].js",
    chunkFilename: "static/js/[name].[contenthash:8].chunk.js",
    publicPath
  },
  resolve: {
    modules: ["node_modules", paths.appNodeModules, paths.appSrc],
    extensions: [".js", ".json", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": paths.appSrc
    }
  },

  module: {
    rules: [
      // ** ADDING/UPDATING LOADERS **
      // The "url" loader handles all assets unless explicitly excluded.
      // The `exclude` list *must* be updated with every change to loader extensions.
      // When adding a new loader, you must add its `test`
      // as a new entry in the `exclude` list in the "url" loader.

      // "url" loader embeds assets smaller than specified size as data URLs to avoid requests.
      // Otherwise, it acts like the "file" loader.
      {
        exclude: [
          /\.html$/,
          /\.(js|jsx)$/,
          /\.(ts|tsx)$/,
          /\.css$/,
          /\.(scss|sass)$/,
          /\.json$/,
          /\.svg$/,
          /\.png$/,
          /\.jpg$/
        ],
        loader: "url-loader",
        query: {
          limit: 10000,
          name: "static/media/[name].[hash:8].[ext]"
        }
      },
      {
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        use: {
          loader: "babel-loader",
          query: {
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.(ts|tsx)$/,
        include: paths.appSrc,
        loaders: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: () => [
                autoprefixer({
                  browsers: [
                    ">1%",
                    "last 4 versions",
                    "Firefox ESR",
                    "not ie < 9" // React doesn't support IE8 anyway
                  ],
                  // don't include unused previosu versons of the flexbox spec
                  flexbox: "no-2009"
                })
              ]
            }
          }
        ]
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          },
          "sass-loader"
        ]
      },
      {
        test: /\.(svg|png|jpg)$/,
        use: {
          loader: "file-loader",
          query: {
            name: "static/media/[name].[hash:8].[ext]"
          }
        }
      }
      // ** STOP ** Are you adding a new loader?
      // Remember to add the new extension(s) to the "url" loader exclusion list.
    ]
  },

  plugins: [
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
    new HtmlWebpackPlugin({
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    new webpack.DefinePlugin(env.stringified),
    new MiniCssExtractPlugin({
      filename: "static/css/[name].[contenthash:8].css",
      chunkFilename: "static/css/[name].[contenthash:8].chunk.css"
    }),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      // @ts-ignore
      fileName: "asset-manifest.json"
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      generateStatsFile: true,
      openAnalyzer: false
    })
  ]
}
