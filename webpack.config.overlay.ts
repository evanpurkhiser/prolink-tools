import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import path from 'path';

import {baseConfig} from './webpack.config.base';

const overlayConfig: webpack.Configuration = merge(baseConfig, {
  entry: {
    overlay: './src/overlay/app.tsx',
  },
  output: {
    path: path.resolve(__dirname, 'dist/overlay'),
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
    new webpack.HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/overlay/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
});

export default overlayConfig;
