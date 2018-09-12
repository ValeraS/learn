const webpack = require('webpack');
const path = require('path');
const UglifyPlugin = require('uglifyjs-webpack-plugin');

const __DEV__ = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: __DEV__ ? 'development' : 'production',
  entry: './src/client/frame-runner.js',
  devtool: __DEV__ ? 'inline-source-map' : 'source-map',
  node: {
    // Mock Node.js modules that Babel require()s but that we don't
    // particularly care about.
    fs: 'empty',
    module: 'empty',
    net: 'empty'
  },
  output: {
    filename: __DEV__ ? 'frame-runner.js' : 'frame-runner-[hash].js',
    path: path.join(__dirname, './static/js')
  },
  stats: {
    // Examine all modules
    maxModules: Infinity,
    // Display bailout reasons
    optimizationBailout: true
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      include: [ path.join(__dirname, 'src/client/') ],
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            [ '@babel/preset-env', { modules: false } ]
          ],
          plugins: [
            require('@babel/plugin-transform-runtime')
          ]
        }
      }
    }]
  },
  resolve: {
    // options for resolving module requests
    // (does not apply to resolving to loaders)
    modules: [
      'node_modules'
    ]
  },
  externals: {
    rxjs: 'Rx'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(__DEV__ ? 'development' : 'production')
      },
      __DEVTOOLS__: !__DEV__
    }),
    // Use browser version of visionmedia-debug
    new webpack.NormalModuleReplacementPlugin(
      /debug\/node/,
      'debug/src/browser'
    )
  ],
  optimization: {
    minimizer: [
      new UglifyPlugin({
        test: /\.js($|\?)/i,
        cache: true,
        sourceMap: true
      })
    ]
  }
};
