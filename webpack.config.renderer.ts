import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import path from 'path';

import {baseConfig} from './webpack.config.base';

const rendererConfig: webpack.Configuration = merge(baseConfig, {
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
    new HtmlWebpackPlugin({title: 'Prolink Tools', filename: 'app.html'}),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/renderer/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
  devServer: {
    port: 2003,
    // This can be removed once the types are released for webpack-dev-server 4.0
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    hot: 'only',
    headers: {'Access-Control-Allow-Origin': '*'},
    historyApiFallback: {
      disableDotRule: true,
      verbose: true,
      rewrites: [{from: /^\/overlay\//, to: '/overlay/index.html'}],
    },
  },
});

const overlayConfig: webpack.Configuration = merge(baseConfig, {
  entry: {
    overlay: './src/overlay/app.tsx',
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
  ],
});

export default [rendererConfig, overlayConfig];
