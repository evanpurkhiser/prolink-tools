import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpack from 'webpack';
import merge from 'webpack-merge';

import {baseConfig} from './webpack.config.base';

const config: webpack.Configuration = merge(baseConfig, {
  target: 'electron-main',
  entry: {
    main: './src/main/main.ts',
  },
  externals: {
    'better-sqlite3': 'commonjs better-sqlite3',
  },
  module: {
    rules: [
      // We do not want ts-morph bundled up in the application, as it drags in
      // typescript, which is huge. We are not using either of these at runtime, but
      // they can't be ignored using IgnorePlugin because Mikro still requires them,
      // and this causes an error at runtime. Packaging them with the null-loader
      // allows them to be required without erroring then simply be swapped with null
      // at runtime.
      {
        test: /(TsMorphMetadataProvider|ts-morph)/,
        loader: 'null-loader',
      },
      // Native modules
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      // Some of MikroORM's dependencies use mjs files
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/main/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
});

export default config;
