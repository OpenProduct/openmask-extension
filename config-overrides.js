const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const { removeModuleScopePlugin } = require("customize-cra");

module.exports = function override(config, env) {
  removeModuleScopePlugin()(config);

  config.resolve.extensions = [...config.resolve.extensions, ".ts", ".js"];
  config.plugins = [...config.plugins, new NodePolyfillPlugin()];

  return config;
};
