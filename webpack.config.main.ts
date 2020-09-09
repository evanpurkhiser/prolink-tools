import webpack from 'webpack';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpackMerge from 'webpack-merge';

import {baseConfig} from './webpack.config.base';

// And anything MikroORM's packaging can be ignored if it's not on disk. Check
// these dynamically and ignore the ones we don't have
const optionalModules = new Set([
  ...Object.keys(require('knex/package.json').browser),
  ...Object.keys(require('mikro-orm/package.json').peerDependencies),
  ...Object.keys(require('mikro-orm/package.json').devDependencies),
]);

const ignoreMikroORMModules = new webpack.IgnorePlugin({
  checkResource: (resource: any) => {
    const [baseResource] = resource.split('/');

    if (optionalModules.has(baseResource)) {
      try {
        require.resolve(resource);
        return false;
      } catch {
        return true;
      }
    }

    return false;
  },
});

const config: webpack.Configuration = webpackMerge.smart(baseConfig, {
  target: 'electron-main',
  entry: {
    main: './src/main/main.ts',
  },
  externals: {
    sqlite3: 'commonjs sqlite3',
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
    ignoreMikroORMModules,
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/main/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
});

export default config;
