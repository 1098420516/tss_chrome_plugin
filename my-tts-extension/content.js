// GPT-SoVITS API 配置
const API_CONFIG = {
  baseUrl: "http://127.0.0.1:9880",
  textLanguage: "zh"
};

// 监听来自background的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "readText") {
    playTTS(request.text);
    sendResponse({ status: "playing" });
  }
  return true;
});

// 调用本地TTS API并播放音频
async function playTTS(text) {
  try {
    // 构建API URL
    const apiUrl = `${API_CONFIG.baseUrl}/?text=${encodeURIComponent(text)}&text_language=${API_CONFIG.textLanguage}`;

    console.log("[TTS] 正在请求:", apiUrl);

    // 创建音频元素并播放
    const audio = new Audio(apiUrl);

    audio.oncanplaythrough = () => {
      audio.play().catch(err => {
        console.error("[TTS] 播放失败:", err);
        showErrorNotification("播放失败，请确保API服务正在运行");
      });
    };

    audio.onerror = (e) => {
      console.error("[TTS] 音频加载错误:", e);
      showErrorNotification("无法连接到本地API服务，请确保GPT-SoVITS API正在运行");
    };

    audio.onended = () => {
      console.log("[TTS] 播放完成");
    };

  } catch (error) {
    console.error("[TTS] 请求失败:", error);
    showErrorNotification("请求失败: " + error.message);
  }
}

// 显示错误通知
function showErrorNotification(message) {
  // 创建一个简单的页面内通知
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 999999;
    font-family: sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  // 3秒后移除
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

console.log("[GPT-SoVITS Reader] Content script 已加载");