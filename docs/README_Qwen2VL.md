# Qwen2-VL-7B-Instruct 整合指南

## 安裝需求

```bash
pip install "vllm>=0.6.2" transformers accelerate
```

**硬體需求：**
- GPU: 8GB+ VRAM（RTX 4070/5070Ti 以上）
- RAM: 16GB+ 推薦

## 啟動服務

### Windows
```bash
start_qwen_vl.bat
```

### Linux/Mac
```bash
chmod +x start_qwen_vl.sh
./start_qwen_vl.sh
```

### 手動啟動
```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2-VL-7B-Instruct \
  --port 8000 \
  --max-model-len 4096 \
  --trust-remote-code
```

## 服務確認

啟動後訪問：http://localhost:8000/v1/models

應該看到：
```json
{
  "object": "list",
  "data": [
    {
      "id": "Qwen/Qwen2-VL-7B-Instruct",
      "object": "model"
    }
  ]
}
```

## STYLEMATE 使用

1. 啟動 Qwen2-VL 服務（端口 8000）
2. 啟動 STYLEMATE 前端（端口 3001）
3. 訪問 http://localhost:3001/chat
4. 上傳圖片測試多模態分析

## 優勢

- ✅ 中文語義理解優秀
- ✅ 服裝細節辨識準確
- ✅ 不會拒絕分析圖片
- ✅ 本地部署，數據安全
- ✅ OpenAI 相容 API

## 替代方案

**更快速度：**
```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2-VL-2B-Instruct \
  --port 8000 \
  --max-model-len 4096 \
  --trust-remote-code
```

**更高精度：**
```bash
python -m vllm.entrypoints.openai.api_server \
  --model OpenGVLab/InternVL2-8B \
  --port 8000 \
  --max-model-len 4096 \
  --trust-remote-code
```