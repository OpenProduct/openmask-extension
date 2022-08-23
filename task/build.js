const { notify, exec } = require("./utils");
const fs = require("fs");

notify(`Build TonMask UI`);

exec("npx react-app-rewired build", {
  stdio: "inherit",
  env: {
    ...process.env,
    INLINE_RUNTIME_CHUNK: false,
  },
});

notify(`Build TonMask background.js, provider.js`);

exec("npx webpack -c task/webpack.config.js", {
  stdio: "inherit",
  env: process.env,
});

notify(`Copy TonMask content.js and provider.js`);

fs.copyFileSync("src/content.js", "build/content.js");

notify(`Happy End! 🚀🚀🚀`);
