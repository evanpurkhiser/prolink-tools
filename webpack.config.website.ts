import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import path from 'path';

import {baseConfig} from './webpack.config.base';

const websiteConfig: webpack.Configuration = merge(baseConfig, {
  entry: {
    app: './src/website/app.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist/website'),
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist/website'),
    historyApiFallback: true,
    port: 2004,
    hot: true,
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
    new webpack.HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/website/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
});

export default websiteConfig;
