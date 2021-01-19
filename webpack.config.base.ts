import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';

import path from 'path';

import {commit, releaseChannel, releaseId} from './scripts/release';

export const IS_PROD = process.env.NODE_ENV === 'production';

const envConfig = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  USE_LOCAL_API: !!process.env.USE_LOCAL_API,
  RELEASE: releaseId,
  RELEASE_CHANNEL: releaseChannel,
  COMMIT: commit,
};

export const withWebpackPluginServe = (appList: string[]) =>
  [...appList, IS_PROD ? '' : 'webpack-plugin-serve/client'].filter(s => s !== '');

export const baseConfig: webpack.Configuration = {
  mode: IS_PROD ? 'production' : 'development',
  watch: process.env.NODE_ENV !== 'production',

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
