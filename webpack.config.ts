import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const IS_PROD =
  process.argv.find(a => a.includes('mode=production')) !== undefined ||
  process.env.NODE_ENV === 'production';

const config: webpack.Configuration = {
  mode: IS_PROD ? 'production' : 'development',
  target: 'electron-renderer',
  entry: {
    app: ['@babel/polyfill', './src/renderer/app.tsx'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      app: path.resolve(__dirname, 'src/renderer/'),
      src: path.resolve(__dirname, 'src/'),
    },
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        // Avoid loading mikro-orm related drivers, these do not work in browser
        test: [
          /acorn-loose/,
          /mikro-orm\/dist\/connections/,
          /mikro-orm\/dist\/cli/,
          /mikro-orm\/dist\/drivers/,
          /mikro-orm\/dist\/migrations/,
        ],
        use: 'null-loader',
      },
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
            !IS_PROD && require.resolve('react-refresh/babel'),
          ].filter(Boolean),
        },
      },
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
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      reportFiles: ['src/renderer/**/*'],
    }),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    ...(!IS_PROD ? [new ReactRefreshWebpackPlugin()] : []),
  ],
  devServer: {
    port: 2003,
    compress: true,
    stats: 'errors-only',
    inline: true,
    hot: true,
    headers: {'Access-Control-Allow-Origin': '*'},
    historyApiFallback: {
      verbose: true,
    },
  },
};

export default config;
