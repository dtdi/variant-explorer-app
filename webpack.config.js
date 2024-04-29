const path = require('path');

/** @type {import('webpack').Configuration} */
const config = {
  mode: 'production',
  target: 'electron-preload',
  entry: './app/lib/preload.js',
  output: {
    path: path.resolve(__dirname, 'app/preload'),
    filename: 'preload.js'
  },
  resolve: {
    mainFields: ['main'],
  }
};

module.exports = config;
