const path = require('path')

const sourceDir = path.join(__dirname, 'src/dev')

module.exports = {
  mode: 'development',
  entry: './src/dev/index.js',
  output: {
    path: sourceDir,
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    static: {
      directory: sourceDir
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/, /dist/],
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      }
    ]
  }
}
