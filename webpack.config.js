const path = require('path');

module.exports = {
  entry: './src/client/app.tsx', // Adjust the entry point if necessary
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js', // This is the file you will upload to Canva
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'production', // Ensure the mode is set to production for the final bundle
};
