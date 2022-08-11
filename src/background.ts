import browser from "webextension-polyfill";
import ExtensionPlatform from "./lib/extension";

browser.runtime.onInstalled.addListener(function () {
  console.log("background");
});

const platform = new ExtensionPlatform();
