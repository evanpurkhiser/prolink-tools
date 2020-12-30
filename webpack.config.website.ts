import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';
import {WebpackPluginServe} from 'webpack-plugin-serve';

import path from 'path';

import {baseConfig} from './webpack.config.base';

const websiteConfig: webpack.Configuration = merge(baseConfig, {
  entry: {
    app: ['./src/website/app.tsx', 'webpack-plugin-serve/client'],
  },
  output: {
    path: path.resolve(__dirname, 'dist/website'),
  },
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g|svg|mp4|webm)$/,
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
      {
        test: /electron/,
        use: 'null-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({title: 'prolink tools', favicon: 'build/icon.png'}),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/website/**/*'}, {file: 'src/shared/**/*'}]},
    }),
    new WebpackPluginServe({
      port: 2004,
      static: path.join(__dirname, 'dist/website'),
      historyFallback: {
        verbose: true,
      },
    }),
  ],
});

export default websiteConfig;
