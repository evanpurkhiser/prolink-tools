import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';
import {WebpackPluginServe} from 'webpack-plugin-serve';

import path from 'path';

import {baseConfig, withWebpackPluginServe} from './webpack.config.base';

const serve = new WebpackPluginServe({
  port: 2003,
  static: path.join(__dirname, 'dist'),
  historyFallback: {
    verbose: true,
    rewrites: [{from: /^\/overlay\/[^.]+$/, to: '/overlay/index.html'}],
  },
});

const rendererConfig: webpack.Configuration = merge(baseConfig, {
  target: 'electron-renderer',
  entry: {
    app: withWebpackPluginServe(['./src/renderer/app.tsx']),
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
    new HtmlWebpackPlugin({title: 'Prolink Tools'}),
    new webpack.DefinePlugin({'process.type': '"renderer"'}),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/renderer/**/*'}, {file: 'src/shared/**/*'}]},
    }),
    serve,
  ],
});

const overlayConfig: webpack.Configuration = merge(baseConfig, {
  entry: {
    overlay: ['./src/overlay/app.tsx', 'webpack-plugin-serve/client'],
  },
  output: {
    path: path.resolve(__dirname, 'dist/overlay'),
  },
  resolve: {
    fallback: {
      fs: 'empty',
      dgram: 'empty',
      net: 'empty',
      tls: 'empty',
    },
  },
  optimization: {minimize: false},
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
    new HtmlWebpackPlugin({title: 'Prolink Tools Overlay'}),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/overlay/**/*'}, {file: 'src/shared/**/*'}]},
    }),
    serve.attach(),
  ],
});

export default [rendererConfig, overlayConfig];
