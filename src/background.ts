import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(function () {
  console.log("background");
});
