import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type webpack from 'webpack';
import {merge} from 'webpack-merge';

import path from 'node:path';

import {baseConfig, hotReloadPlugins} from './webpack.config.base.ts';

const projectRoot = process.cwd();

class CloudflareRedirectsPlugin {
  apply(compiler: webpack.Compiler) {
    compiler.hooks.thisCompilation.tap('CloudflareRedirectsPlugin', compilation => {
      const notionManualUrl =
        'https://evanpurkhiser.notion.site/Prolink-Tools-User-Manual-1c0e5b28732b435a9804b992939ed791';
      const redirects = `/manual ${notionManualUrl} 302\n`;

      compilation.emitAsset(
        '_redirects',
        new compiler.webpack.sources.RawSource(redirects),
      );
    });
  }
}

const websiteConfig: webpack.Configuration = merge(baseConfig, {
  entry: {
    app: './src/website/app.tsx',
  },
  output: {
    path: path.resolve(projectRoot, 'dist/website'),
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(projectRoot, 'dist/website'),
    historyApiFallback: true,
    port: 2004,
    hot: true,
  },
  optimization: {
    runtimeChunk: {name: 'runtime-website'},
  },
  module: {
    rules: [
      {
        test: /\.(gif|png|jpe?g|svg|mp4|webm)$/,
        use: ['file-loader'],
      },
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
    new HtmlWebpackPlugin({title: 'prolink tools', favicon: 'build/icon.png'}),
    new CloudflareRedirectsPlugin(),
    new ForkTsCheckerWebpackPlugin({
      issue: {include: [{file: 'src/website/**/*'}, {file: 'src/shared/**/*'}]},
    }),
  ],
});

export default websiteConfig;
