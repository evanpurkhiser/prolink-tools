module.exports = {
  entry: "./src/app.js",
  output: { filename: "app.js" },
  devtool: 'source-map',
  module: {
    loaders: [{
      test:   /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015', 'react'],
        plugins: ['transform-object-assign'],
      },
    },
    {
      test: /\.scss$/,
      loaders: ['style', 'css', 'sass'],
    }],
  }
};
