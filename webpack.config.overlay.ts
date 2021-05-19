import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import path from 'path';

import {baseConfig, hotReloadPlugins} from './webpack.config.base';

const overlayConfig: webpack.Configuration = merge(baseConfig, {
  entry: {
    overlay: './src/overlay/app.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist/overlay'),
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist/overlay'),
    historyApiFallback: true,
    port: 2005,
    hot: true,
  },
  resolve: {
    fallback: {
      fs: 'empty',
      dgram: 'empty',
      net: 'empty',
      tls: 'empty',
    },
  },
  optimization: {
    minimize: false,
    runtimeChunk: {name: 'runtime-overlay'},
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
    ...hotReloadPlugins,
    new HtmlWebpackPlugin({title: 'Prolink Tools Overlay'}),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/overlay/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
});

export default overlayConfig;
