const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const IS_PROD =
  process.argv.find(a => a.includes('mode=production')) !== undefined;

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[hash].js',
  },
  devtool: IS_PROD ? 'source-map' : 'cheap-module-eval-source-map',
  devServer: { port: 9000, hot: true },
  optimization: {
    splitChunks: { chunks: 'all' },
  },

  resolve: {
    alias: { app: path.resolve(__dirname, 'src/') },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-transform-react-display-name'],
            ['@babel/plugin-proposal-export-default-from'],
            ['react-hot-loader/babel'],
          ],
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({ template: 'index.html' }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
