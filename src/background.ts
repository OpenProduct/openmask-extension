import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    id: "sampleContextMenu",
    title: "Sample Context Menu",
    contexts: ["selection"],
  });
});
