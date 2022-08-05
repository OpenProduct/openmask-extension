const { notify, exec } = require("./utils");

notify(`Build TonMask UI`);

exec("npx react-scripts build", {
  stdio: "inherit",
  env: {
    ...process.env,
    INLINE_RUNTIME_CHUNK: false,
  },
});

notify(`Build TonMask background.js`);

exec("npx webpack -c task/webpack.config.js", {
  stdio: "inherit",
  env: process.env,
});

notify(`Happy End! 🚀🚀🚀`);
