import browser from "webextension-polyfill";

export class Logger {
  static debug: boolean;

  static async isDebug() {
    if (Logger.debug === undefined) {
      Logger.debug = await browser.storage.local
        .get("debug")
        .then((result) => result["debug"] != null);
    }
    return Logger.debug;
  }

  static async log(...params: unknown[]) {
    if (await Logger.isDebug()) {
      console.log(...params);
    }
  }

  static error(...params: unknown[]) {
    console.error(params);
  }
}
