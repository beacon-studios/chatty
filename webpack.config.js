module.exports = {
  entry: './src/api',
  output: {
      path: './dist',
      filename: 'chatty.js',
      libraryTarget: 'var',
      library: 'chatty'
  },
  resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: ['.ts', '.js']
  },
  module: {
      loaders: [
          // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
          { test: /\.ts$/, loader: 'ts-loader' }
      ]
  }
}
