#!/bin/bash
echo "啟動 Qwen2-VL-7B-Instruct with vLLM..."
echo ""
echo "確保已安裝："
echo "pip install \"vllm>=0.6.2\" transformers accelerate"
echo ""
echo "正在啟動模型服務器..."
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2-VL-7B-Instruct \
  --port 8000 \
  --max-model-len 4096 \
  --trust-remote-code