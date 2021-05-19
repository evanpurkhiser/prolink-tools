import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import path from 'path';

import {baseConfig, hotReloadPlugins, IS_PROD} from './webpack.config.base';

const rendererConfig: webpack.Configuration = merge(baseConfig, {
  target: 'electron-renderer',
  entry: {
    app: './src/renderer/app.tsx',
    sentry: './src/shared/sentry/renderer.ts',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    historyApiFallback: true,
    port: 2003,
    hot: true,
  },
  optimization: {
    minimize: false,

    // Use runtime chunk in development to fix HMR. Do not use in production
    // because runtime chunks break sentry. Probably worth fixing this.
    runtimeChunk: !IS_PROD ? {name: 'runtime-renderer'} : false,
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
