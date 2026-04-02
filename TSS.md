# GPT-SoVITS 语音克隆全流程实战指南 (2026版)

本指南涵盖了从 B 站素材获取、音频处理、模型微调，到最终构建浏览器插件实现本地调用的完整闭环。

---

## 阶段一：素材获取与预处理 (Data Collection)

### 1. 下载 B 站视频
推荐使用命令行工具 **yt-dlp**，它是目前最稳定且支持 4K/8K 的下载器。
*   **安装**：`pip install yt-dlp`
*   **下载命令**：
    ```bash
    # 下载最高画质视频并自动合并
    yt-dlp -f "ba+bv" "https://www.bilibili.com/video/BVxxxxxx"
    ```

### 2. 提取并清洗音频
*   **转音频**：使用 FFmpeg 提取 `.wav` 格式。
    ```bash
    ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 44100 -ac 2 output.wav
    ```
*   **人声分离 (关键)**：使用 **UVR5 (Ultimate Vocal Remover)**。
    *   模型推荐：`MDX-Net` -> `UVR-MDX-NET-Voc_FT` (提取纯净人声)。
    *   模型推荐：`Demucs` -> `htdemucs_ft` (去除混响)。
*   **切分音频**：将长音频切分为 5-10 秒的小段（GPT-SoVITS 训练要求）。可以使用 UVR5 自带的切分功能或 GPT-SoVITS 预处理脚本。

---

## 阶段二：GPT-SoVITS 环境搭建与微调 (Fine-tuning)

### 1. 下载源码与环境配置
*   **克隆仓库**：
    ```bash
    git clone https://github.com/RVC-Boss/GPT-SoVITS.git
    cd GPT-SoVITS
    ```
*   **安装依赖**：建议使用 Conda 环境。
    ```bash
    conda create -n GPTSoVITS python=3.9
    conda activate GPTSoVITS
    pip install -r requirements.txt
    ```
*   **下载预训练模型**：从 HuggingFace 下载 `GPT_SoVITS/pretrained_models` 下的所有文件。

### 2. 开启 WebUI 进行微调
运行 `python webui.py` 进入可视化界面：
1.  **数据预处理**：在“0-前置数据集获取工具”中，填入音频文件夹路径，依次点击“语音切割”、“ASR标注”（推荐使用 Whisper 模型）。
2.  **微调训练**：
    *   在“1A-训练集格式化工具”中开启格式化。
    *   在“1B-微调训练”中，先进行 **SoVITS 训练**（建议 8-15 epoch），再进行 **GPT 训练**（建议 8-15 epoch）。
3.  **推理测试**：在“1C-推理”中加载训练好的模型，输入参考音频和目标文本进行测试。

---

## 阶段三：部署本地 API 服务 (Deployment)

训练完成后，我们需要启动一个 API 接口供外部调用。
*   **启动命令**：
    ```bash
    python api.py --gpt_model "path/to/your_gpt.ckpt" --sovits_model "path/to/your_sovits.pth"
    ```
*   默认接口地址：`http://127.0.0.1:9880`。
*   接口格式：支持 GET/POST 请求，返回音频流。

---

## 阶段四：构建浏览器插件 (Browser Extension)

为了在浏览器中直接调用模型阅读网页内容，我们需要创建一个简单的 Chrome 扩展。

### 1. 项目结构
```text
my-tts-extension/
├── manifest.json
├── background.js
└── content.js
```

### 2. 核心代码实现
*   **manifest.json**：
    ```json
    {
      "manifest_version": 3,
      "name": "Local GPT-SoVITS Reader",
      "version": "1.0",
      "permissions": ["contextMenus", "storage"],
      "background": { "service_worker": "background.js" },
      "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content.js"] }]
    }
    ```
*   **background.js** (监听右键菜单并发送请求)：
    ```javascript
    chrome.runtime.onInstalled.addListener(() => {
      chrome.contextMenus.create({
        id: "readText",
        title: "使用克隆声音阅读",
        contexts: ["selection"]
      });
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === "readText") {
        chrome.tabs.sendMessage(tab.id, { text: info.selectionText });
      }
    });
    ```
*   **content.js** (调用本地 API 并播放音频)：
    ```javascript
    chrome.runtime.onMessage.addListener((request) => {
      const apiUrl = `http://127.0.0.1:9880/?text=${encodeURIComponent(request.text)}&text_language=zh`;
      const audio = new Audio(apiUrl);
      audio.play();
    });
    ```

---

## 阶段五：使用与调试

1.  **加载插件**：打开 Chrome 浏览器 -> `chrome://extensions/` -> 开启“开发者模式” -> “加载已解压的扩展程序” -> 选择插件目录。
2.  **运行服务**：确保本地 GPT-SoVITS 的 `api.py` 正在运行。
3.  **开始阅读**：在网页上选中一段文字，点击右键菜单中的“使用克隆声音阅读”，即可听到您克隆的声音。

---

## 💡 避坑小贴士
*   **跨域问题**：如果插件调用 API 报错，请在 `api.py` 中添加 CORS 支持，或使用插件的 `background.js` 进行中转请求。
*   **显存溢出**：微调时如果显存不足，请调小 `batch_size`。
*   **素材质量**：克隆效果 80% 取决于素材的纯净度，请务必做好 UVR5 的降噪处理。
