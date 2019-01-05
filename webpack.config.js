const path = require("path");

module.exports = {
  entry: {
    App: "./src/js/main.js"
  },
  output: {
    path: path.resolve(__dirname, "./build/js"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  mode: "development"
};
