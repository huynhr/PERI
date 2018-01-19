var webpack = require('webpack');
var path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var BUILD_DIR = path.resolve(__dirname, './Client/dst');
var APP_DIR = path.resolve(__dirname, './Client/src');

module.exports = {
  entry: APP_DIR + '/index.js',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
  },
  plugins: [
    new UglifyJsPlugin({
      sourceMap: true,
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jsx?/,
        include: APP_DIR,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
          plugins: ['transform-decorators-legacy']
        }
      }
    ]
  },
};