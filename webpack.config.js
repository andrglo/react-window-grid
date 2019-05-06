const webpack = require('webpack');

module.exports = {
  entry: './src/dev/index.js',
  output: {
    path: __dirname + '/src/dev',
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    contentBase: './src/dev',
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /dist/],
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
