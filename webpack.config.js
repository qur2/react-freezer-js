var webpack = require('webpack');

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];

if (process.env.COMPRESS) {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    })
  );
}

module.exports = {

  output: {
    library: 'ReactFreezer',
    libraryTarget: 'umd',
  },

  externals: {
    "react": {
      root: "React",
      commonjs2: "react",
      commonjs: "react",
      amd: "react",
    },
    "freezer-js": {
      root: "Freezer",
      commonjs2: "freezer-js",
      commonjs: "freezer-js",
      amd: "freezer-js",
    }
  },

  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
    }],
  },

  node: {
    Buffer: false
  },

  plugins: plugins,
};
