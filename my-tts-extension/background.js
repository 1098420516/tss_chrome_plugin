// 监听插件安装，创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "readText",
    title: "使用克隆声音阅读",
    contexts: ["selection"]
  });
  console.log("GPT-SoVITS Reader 已加载");
});

// 监听右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readText" && info.selectionText) {
    // 发送选中的文本到content script
    chrome.tabs.sendMessage(tab.id, {
      action: "readText",
      text: info.selectionText
    });
  }
});

// 监听来自content script的消息（用于调试或状态反馈）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "log") {
    console.log("[Content Script]", request.message);
  }
  sendResponse({ received: true });
});