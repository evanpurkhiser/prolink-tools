import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpackMerge from 'webpack-merge';

import {baseConfig} from './webpack.config.base';

const rendererConfig: webpack.Configuration = webpackMerge.smart(baseConfig, {
  target: 'electron-renderer',
  entry: {
    app: './src/renderer/app.tsx',
  },
  optimization: {minimize: false},
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g|svg)$/,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              disable: true,
            },
          },
        ],
      },
      {
        test: /\.ttf$/,
        use: [{loader: 'file-loader'}],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({filename: 'app.html'}),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/renderer/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
  devServer: {
    port: 2003,
    compress: true,
    stats: 'errors-only',
    inline: true,
    hot: true,
    headers: {'Access-Control-Allow-Origin': '*'},
    historyApiFallback: {
      disableDotRule: true,
      verbose: true,
      rewrites: [{from: /^\/overlay\//, to: '/overlay/index.html'}],
    },
  },
});

const overlayConfig: webpack.Configuration = webpackMerge.smart(baseConfig, {
  entry: {
    overlay: './src/overlay/app.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist/overlay'),
  },
  optimization: {minimize: false},
  node: {
    fs: 'empty',
    dgram: 'empty',
    net: 'empty',
    tls: 'empty',
    console: true,
  },
  module: {
    rules: [
      {
        test: /\.ttf$/,
        use: [{loader: 'file-loader'}],
      },
      {
        test: /electron/,
        use: 'null-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/overlay/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
});

export default [rendererConfig, overlayConfig];
