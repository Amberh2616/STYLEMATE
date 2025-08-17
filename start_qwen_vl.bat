@echo off
echo 启动 Qwen2-VL-7B-Instruct with vLLM...
echo.
echo 确保已安装：
echo pip install "vllm>=0.6.2" transformers accelerate
echo.
echo 正在启动模型服务器...
python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-VL-7B-Instruct --port 8000 --max-model-len 4096 --trust-remote-code
pause