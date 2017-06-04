///////////////////////////////////////////////////////////
// Forge React Boiler Webpack production config
// by Philippe Leefsma, 2016
// https://twitter.com/F3lipek
//
///////////////////////////////////////////////////////////
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeJsPlugin = require('optimize-js-plugin')
const WebpackMd5Hash = require('webpack-md5-hash')
const webpack = require('webpack')
const config = require('c0nfig')
const chalk = require('chalk')
const path = require('path')

///////////////////////////////////////////////////////////
// Silence deprecation warnings
// (caused by deprecated API used by webpack loaders)
//
///////////////////////////////////////////////////////////
//process.traceDeprecation = true
process.noDeprecation = true

///////////////////////////////////////////////////////////
// Webpack config production
//
///////////////////////////////////////////////////////////
module.exports = {

  // no dev tool, we are in Prod!
  devtool: false,

  // it's good to specify context
  context: path.join(__dirname, '..'),

  entry: {
    bundle: [
      path.resolve('./src/client/index.js')
    ]
  },

  // output arguments
  // it will append the [chunkhash] to each chunck
  // in order to perform long-term caching:
  // https://webpack.js.org/guides/caching/#components/sidebar/sidebar.jsx
  output: {
    path: path.resolve(__dirname, '../dist'),
    chunkFilename: "[name].[chunkhash].min.js",
    filename: "[name].[chunkhash].min.js",
    publicPath: '/'
  },

  // settings that control webpack compiler stats when building the app
  // see description for each setting below
  // straight from the doc:
  // https://webpack.js.org/configuration/stats/#components/sidebar/sidebar.jsx
  stats: {
    // Add asset Information
    assets: true,
    // Sort assets by a field
    assetsSort: "field",
    // Add information about cached (not built) modules
    cached: true,
    // Add children information
    children: true,
    // Add chunk information (setting this to `false` allows for a less verbose output)
    chunks: false,
    // Add built modules information to chunk information
    chunkModules: true,
    // Add the origins of chunks and chunk merging info
    chunkOrigins: false,
    // Sort the chunks by a field
    chunksSort: "field",
    // Context directory for request shortening
    context: path.resolve("../src/"),
    // `webpack --colors` equivalent
    colors: true,
    // Add errors
    errors: true,
    // Add details to errors (like resolving log)
    errorDetails: true,
    // Add the hash of the compilation
    hash: false,
    // Add built modules information
    modules: false,
    // Sort the modules by a field
    modulesSort: "field",
    // Add public path information
    publicPath: false,
    // Add information about the reasons why modules are included
    reasons: false,
    // Add the source code of modules
    source: false,
    // Add timing information
    timings: true,
    // Add webpack version information
    version: true,
    // Add warnings
    warnings: false
  },

  // webpack pluging: perform code splitting, optiomization
  // and html generation template from .ejs template
  plugins: [

    // default options
    new webpack.LoaderOptionsPlugin({
      minify: true,
      debug: false
    }),

    // enabled by default
    new webpack.optimize.OccurrenceOrderPlugin(),

    // generates chucks from all bundles
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity
    }),

    // MD5 hash, see long-term caching for more details
    // https://webpack.js.org/guides/caching/#components/sidebar/sidebar.jsx
    new WebpackMd5Hash(),

    // generate webpack file manifest on disk
    new ManifestPlugin(),

    // this will automatically embbed the chunck manifest in
    // generated html output from HtmlWebpackPlugin
    new InlineManifestWebpackPlugin({
      name: 'webpackManifest'
    }),

    // mangle and compress generated code
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        conditionals: true,
        comparisons:  true,
        screw_ie8:    true,
        sequences:    true,
        dead_code:    true,
        if_return:    true,
        join_vars:    true,
        warnings:     false,
        evaluate:     false,
        unused:       true
      },
      output: {
        comments: false
      }
    }),

    // provides some globals
    new webpack.ProvidePlugin({
      'window.jQuery': 'jquery',
      jQuery: 'jquery',
      _: 'lodash',
      $: 'jquery'
    }),

    new OptimizeJsPlugin({
      sourceMap: false
    }),

    // define env variables during the build
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
        WEBPACK: true
      }
    }),

    // outputs html from .ejs template
    new HtmlWebpackPlugin({

      viewer3D: config.forge.viewer.viewer3D,
      threeJS: config.forge.viewer.threeJS,
      style: config.forge.viewer.style,

      template: path.resolve(__dirname, '../src/client/layouts/index.ejs'),
      title: 'Forge | OSS',
      filename: 'index.html',
      minify: {
        removeStyleLinkTypeAttributes: true,
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true
      },
      inject: 'head'
    }),

    // just a progress bar to make compilation less boring
    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)',
      clear: false
    })
  ],

  // directories used by webpack to resolve dependencies
  resolve: {
    modules: [
      path.resolve('./src/client/Viewer/Viewing.Extensions'),
      path.resolve('./src/client/components'),
      path.resolve('./src/client/services'),
      path.resolve('./src/client/Viewer'),
      path.resolve('./src/client/styles'),
      path.resolve('./src/client/utils'),
      path.resolve('./node_modules'),
      path.resolve('./src/client')
    ],
    extensions : ['.js', '.jsx', '.json']
  },

  resolveLoader: {
    modules: ['node_modules']
  },

  // compilation rules: i.e. loaders
  module: {

    rules: [

      // all .js and .jsx code from the project goes through babel transpiler
      // also enable stage-0 features for async/await support
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['es2015', 'stage-0'],
            plugins: ['transform-runtime']
          }
        }]
      },

      // plain .css
      {
        test: /\.css$/,
        use: [{
          loader: 'style-loader'
        }, {
          loader: 'css-loader'
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('precss'),
                require('autoprefixer')
              ]
            }
          }
        }]
      },

      //.sass and .scss
      {
        test: /\.(sass|scss)$/,
        use: [{
          loader:'style-loader'
        },  {
          loader: 'css-loader'
        }, {
          loader: 'postcss-loader',
          options: {
            plugins: function () {
              return [
                require('precss'),
                require('autoprefixer')
              ]
            }
          }
        }, {
          loader:'sass-loader'
        }]
      },

      // bootstrap and font-awesome resources
      { test: /\.ttf(\?.*)?$/,   loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream' },
      { test: /\.woff2(\?.*)?$/, loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2' },
      { test: /\.woff(\?.*)?$/,  loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff' },
      { test: /\.otf(\?.*)?$/,   loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype' },
      { test: /\.svg(\?.*)?$/,   loader: 'url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml' },
      { test: /\.eot(\?.*)?$/,   loader: 'file-loader?prefix=fonts/&name=[path][name].[ext]' },
      { test: /\.(png|jpg)$/,    loader: 'url-loader?limit=8192' }
    ]
  }
}
