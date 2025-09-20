# MX550 (2GB VRAM) 多模態解決方案

## 🎯 推薦方案：SiliconFlow API

**優勢：**
- ✅ 支援 Qwen2-VL-7B-Instruct
- ✅ 有免費額度測試
- ✅ OpenAI 相容 API
- ✅ 中文服裝分析優秀
- ✅ 不需要本地GPU

## 申請步驟

### 1. 註冊 SiliconFlow
1. 前往：https://cloud.siliconflow.cn
2. 註冊帳號
3. 前往 API Keys 頁面
4. 創建新的 API Key

### 2. 設定環境變數
在 `.env.local` 中設定：
```
SILICONFLOW_API_KEY=sk-你的API金鑰
```

### 3. 測試多模態功能
1. 啟動 STYLEMATE 前端
2. 訪問 http://localhost:3001/chat
3. 上傳服裝圖片
4. 點擊「🎯 開始圖片風格分析」

## 🔄 備用方案

### 方案 A：DashScope API（阿里巴巴）
```javascript
const qwenVL = new OpenAI({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.DASHSCOPE_API_KEY,
})
```

### 方案 B：Hugging Face Inference API
```javascript
const hfEndpoint = 'https://api-inference.huggingface.co/models/Qwen/Qwen2-VL-7B-Instruct'
```

### 方案 C：本地 CPU 運行（較慢）
使用 Ollama：
```bash
ollama pull qwen2-vl:7b
ollama serve
```

## 💰 成本比較

| 方案 | 成本 | 速度 | 準確度 |
|------|------|------|--------|
| SiliconFlow | 免費額度 + ¥0.1/千tokens | 快 | 高 |
| DashScope | ¥0.02/千tokens | 快 | 高 |
| Hugging Face | 免費（有限制） | 中 | 高 |
| 本地CPU | 免費 | 慢 | 高 |

## ⚡ 最佳實踐

1. **優先使用 SiliconFlow** - 免費額度夠測試
2. **備用 DashScope** - 如果需要更穩定服務
3. **關注使用量** - 避免超出免費額度
4. **圖片預處理** - 壓縮圖片減少token消耗