const { removeModuleScopePlugin } = require("customize-cra");
const webpack = require("webpack");

module.exports = function override(config, env) {
  removeModuleScopePlugin()(config);

  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
    buffer: require.resolve("buffer"),
    url: require.resolve("url/"),
    util: require.resolve("util/"),
  };
  config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"];
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    }),
  ];

  return config;
};
