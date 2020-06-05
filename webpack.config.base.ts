import path from 'path';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import {execSync} from 'child_process';
import {prerelease} from 'semver';

export const IS_PROD = process.env.NODE_ENV === 'production';

const babelOptions = {
  cacheDirectory: true,
  babelrc: false,
  presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
  plugins: [
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    !IS_PROD && require.resolve('react-refresh/babel'),
  ].filter(Boolean),
};

const releaseId = execSync('git describe').toString().trim();
const latestTag = execSync('git describe --abbrev=0').toString().trim();
const commit = execSync('git rev-parse HEAD').toString().trim();

// Are we building a specifically tagged commit?
const isTagged = latestTag === releaseId;

// Specify the release channel (environment)
const releaseChannel = isTagged
  ? prerelease(releaseId) !== null
    ? 'stable'
    : 'prerelease'
  : 'master';

const envConfig = {
  // Tells MikroORM we're in a webpack build
  WEBPACK: true,
  NODE_ENV: 'development',
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
      src: path.resolve(__dirname, 'src/'),
    },
  },
  devtool: 'source-map',

  plugins: [new webpack.EnvironmentPlugin(envConfig)],

  optimization: {
    minimizer: [
      // MikroORM rqeuires that class names do NOT be changed
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
        options: babelOptions,
      },
    ],
  },
};
