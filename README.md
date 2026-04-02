# TTS Chrome Plugin

基于 GPT-SoVITS 的语音克隆浏览器插件。

## 功能

- 在浏览器中选中文本，右键使用克隆声音朗读
- 调用本地 GPT-SoVITS API 服务

## 安装

### 1. 安装Chrome扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `my-tts-extension` 目录

### 2. 启动GPT-SoVITS API服务

```bash
# 克隆 GPT-SoVITS 仓库
git clone https://github.com/RVC-Boss/GPT-SoVITS.git
cd GPT-SoVITS

# 创建虚拟环境
conda create -n GPTSoVITS python=3.9
conda activate GPTSoVITS
pip install -r requirements.txt

# 下载预训练模型后启动API
python api.py --gpt_model "path/to/your_gpt.ckpt" --sovits_model "path/to/your_sovits.pth"
```

API 默认运行在 `http://127.0.0.1:9880`

## 使用方法

1. 确保 GPT-SoVITS API 服务正在运行
2. 在任意网页上选中一段文字
3. 右键点击，选择"使用克隆声音阅读"
4. 听到克隆的声音朗读选中文本

## 项目结构

```
my-tts-extension/
├── manifest.json    # 扩展配置
├── background.js    # 后台脚本（右键菜单）
└── content.js       # 内容脚本（API调用）
```

## 依赖

- yt-dlp: 视频下载
- ffmpeg: 音频处理
- demucs: 人声分离
- GPT-SoVITS: 语音克隆模型

## 参考

详细流程请参考 [TSS.md](TSS.md)