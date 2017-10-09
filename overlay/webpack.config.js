const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, '../dist/assets'),
    filename: 'app.js',
  },
  devtool: 'source-map',
  devServer: { port: 9000 },
  module: {
    loaders: [{
      test:   /\.js$/,
      loader: 'babel-loader',
      query: { presets: ['env', 'stage-1', 'react'] },
    },
    {
      test: /\.scss$/,
      loaders: ['style-loader', 'css-loader', 'sass-loader'],
    }],
  },
  plugins: [new HtmlWebpackPlugin({ template: 'index.html' })],
};
