import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import dotenv from 'dotenv';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

import path from 'path';

import {commit, releaseChannel, releaseId} from './scripts/release';

export const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * Load dotenv for overrides to some environment variables
 */
const dotenvConfig = dotenv.config().parsed ?? {};

const envConfig = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  RELEASE: releaseId,
  RELEASE_CHANNEL: releaseChannel,
  COMMIT: commit,
  BASE_WEB_URL: dotenvConfig.BASE_WEB_URL ?? null,
  BASE_API_URL: dotenvConfig.BASE_API_URL ?? null,
};

export const hotReloadPlugins = !IS_PROD
  ? [new ReactRefreshWebpackPlugin(), new webpack.HotModuleReplacementPlugin()]
  : [];

export const baseConfig: webpack.Configuration = {
  mode: IS_PROD ? 'production' : 'development',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.ttf'],
    alias: {
      src: path.resolve(__dirname, 'src/'),
      main: path.resolve(__dirname, 'src/main/'),
      ui: path.resolve(__dirname, 'src/renderer/'),
      overlay: path.resolve(__dirname, 'src/overlay/'),
      web: path.resolve(__dirname, 'src/website/'),
      api: path.resolve(__dirname, 'src/api/'),
    },
  },
  devtool: IS_PROD ? 'source-map' : 'eval-source-map',

  optimization: {
    minimizer: [
      // Avoid mangling class names as we reflectively look at the constructor
      // name for deserialization.
      //
      // FIXME: Not sure why webpack types are complaining here
      new TerserPlugin({terserOptions: {mangle: false}}) as any,
    ],
  },

  plugins: [new webpack.EnvironmentPlugin(envConfig)],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          babelrc: false,
          presets: [
            '@babel/preset-env',
            '@babel/preset-typescript',
            ['@babel/preset-react', {runtime: 'automatic'}],
          ],
          plugins: [
            ['@babel/plugin-proposal-decorators', {legacy: true}],
            ['@babel/plugin-proposal-class-properties', {loose: true}],
            ['@babel/plugin-proposal-private-methods', {loose: true}],
            ['@babel/plugin-proposal-optional-chaining'],
            ['@babel/plugin-proposal-nullish-coalescing-operator'],
            !IS_PROD && require.resolve('react-refresh/babel'),
          ].filter(Boolean),
        },
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: {
          loader: 'source-map-loader',
          options: {
            filterSourceMappingUrl: (_: string, resourcePath: string) =>
              !/.*\/node_modules\/.*/.test(resourcePath),
          },
        },
      },
    ],
  },
};
