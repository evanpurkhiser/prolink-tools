import path from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';

import {releaseId, releaseChannel, commit} from './scripts/release';

export const IS_PROD = process.env.NODE_ENV === 'production';

const envConfig = {
  // Tells mikro-orm we're in a webpack build
  WEBPACK: true,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  RELEASE: releaseId,
  RELEASE_CHANNEL: releaseChannel,
  COMMIT: commit,
};

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
      main: path.resolve(__dirname, 'src/main/'),
      app: path.resolve(__dirname, 'src/renderer/'),
      overlay: path.resolve(__dirname, 'src/overlay/'),
      web: path.resolve(__dirname, 'src/website/'),
      src: path.resolve(__dirname, 'src/'),
    },
  },
  devtool: IS_PROD ? 'source-map' : 'eval-source-map',

  plugins: [new webpack.EnvironmentPlugin(envConfig)],

  optimization: {
    minimizer: [
      // mikro-orm rqeuires that class names do NOT be changed
      new TerserPlugin({terserOptions: {mangle: false}}),
    ],
    namedModules: true,
  },

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
            '@babel/preset-react',
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
        use: ['source-map-loader'],
      },
    ],
  },
};
