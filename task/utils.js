const { execSync } = require("child_process");

module.exports.exec = (cmd, options) => {
  try {
    return (
      execSync(cmd, {
        shell: "/bin/sh",
        stdio: "inherit",
        ...(options ?? {}),
        env: { ...process.env, ...(options?.env ?? {}) },
      }) ?? ""
    ).toString();
  } catch (e) {
    if (options?.noFail === true) {
      return (e.stdout ?? "").toString() + (e.stdout ?? "").toString();
    } else {
      process.exit(1);
    }
  }
};

module.exports.notify = (value) => {
  console.log();
  console.log(`---- ${value} ----`);
  console.log();
};
