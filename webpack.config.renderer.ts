import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpackMerge from 'webpack-merge';

import {baseConfig, IS_PROD} from './webpack.config.base';

/**
 * Becuase prolink-connect bundles mikro-orm, which does not work well in
 * browser context, we stub it out.
 *
 * XXX: This may be brittle...
 */
const removeMikroORM = new webpack.NormalModuleReplacementPlugin(
  /mikro-orm/,
  (resource: any) => {
    resource.request = path.join(__dirname, 'src/renderer/mikrormShim.ts');
  }
);

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
    removeMikroORM,
    new HtmlWebpackPlugin({filename: 'app.html'}),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      reportFiles: ['src/renderer/**/*', 'src/shared/**/*'],
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
        test: /@sentry\/node|electron/,
        use: 'null-loader',
      },
    ],
  },
  plugins: [
    removeMikroORM,
    new HtmlWebpackPlugin(),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin({
      reportFiles: ['src/overlay/**/*', 'src/shared/**/*'],
    }),
  ],
});

export default [rendererConfig, overlayConfig];
