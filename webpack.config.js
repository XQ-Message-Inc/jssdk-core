const path = require("path");

module.exports = {
  mode: "production",
  entry: "./index.ts",
  output: {
    filename: "jssdk-core.min.js",
    path: path.resolve(__dirname, "dist/browser"),
    library: {
      type: "umd",
      name: "jssdk-core",
    },
  },
  devtool: "source-map",
  resolve: {
    // Add '.ts' as resolvable extensions
    extensions: [".ts", ".js"],

    // Support `path` in the browser
    fallback: {
      path: require.resolve("path-browserify"),
      buffer: require.resolve("buffer/"),
    },
  },
  module: {
    rules: [
      // All files with a '.ts' extension will be handled by 'ts-loader'.
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          configFile: path.resolve(__dirname, "tsconfig-browser.json"),
        },
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },
};
