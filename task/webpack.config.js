const path = require("path");
const { DefinePlugin } = require("webpack");

module.exports = [
  {
    target: "node",
    mode: "production",
    entry: "./src/background.ts",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "background.js",
      path: path.resolve(__dirname, "../build"),
    },
    plugins: [
      new DefinePlugin({
        "process.env.REACT_APP_TONCENTER_API_KEY": JSON.stringify(
          process.env.REACT_APP_TONCENTER_API_KEY || ""
        ),
        "process.env.REACT_APP_TONCENTER_TESTNET_API_KEY": JSON.stringify(
          process.env.REACT_APP_TONCENTER_TESTNET_API_KEY || ""
        ),
      }),
    ],
  },
  {
    target: "node",
    mode: "production",
    entry: "./src/provider.ts",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "provider.js",
      path: path.resolve(__dirname, "../build"),
    },
  },
  {
    target: "node",
    mode: "production",
    entry: "./src/content.ts",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    output: {
      filename: "content.js",
      path: path.resolve(__dirname, "../build"),
    },
  },
];
