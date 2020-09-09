import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpackMerge from 'webpack-merge';

import {baseConfig} from './webpack.config.base';

const websiteConfig: webpack.Configuration = webpackMerge.smart(baseConfig, {
  entry: {
    app: './src/website/app.tsx',
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
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({title: 'prolink tools', favicon: 'build/icon.png'}),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/website/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
  devServer: {
    port: 2004,
    compress: true,
    stats: 'errors-only',
    inline: true,
    hot: true,
    headers: {'Access-Control-Allow-Origin': '*'},
  },
});

export default websiteConfig;
