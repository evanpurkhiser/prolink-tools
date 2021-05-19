import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import path from 'path';

import {baseConfig, hotReloadPlugins} from './webpack.config.base';

const rendererConfig: webpack.Configuration = merge(baseConfig, {
  target: 'electron-renderer',
  entry: {
    app: './src/renderer/app.tsx',
    sentry: './src/shared/sentry/renderer.ts',
  },
  output: {
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    port: 2003,
    hot: true,
  },
  optimization: {
    minimize: false,
    runtimeChunk: {name: 'runtime-renderer'},
  },
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
    ...hotReloadPlugins,
    new HtmlWebpackPlugin({title: 'Prolink Tools'}),
    new webpack.DefinePlugin({'process.type': '"renderer"'}),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/renderer/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
});

export default rendererConfig;
