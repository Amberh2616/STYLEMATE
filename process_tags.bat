@echo off
echo 🚀 韓國服裝照片批量標籤處理工具
echo.

REM 檢查 Python 環境
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 找不到 Python，請先安裝 Python
    pause
    exit /b 1
)

REM 安裝必要套件
echo 📦 安裝必要套件...
pip install openai pillow requests

REM 檢查 API Key
if "%OPENAI_API_KEY%"=="" (
    echo.
    echo 請設定您的 OpenAI API Key:
    set /p OPENAI_API_KEY="請輸入 OpenAI API Key: "
)

REM 執行選項
echo.
echo 選擇處理模式:
echo 1. 測試模式（處理前10張）
echo 2. 小批量模式（處理前50張）
echo 3. 完整處理（處理所有圖片）
echo.
set /p choice="請選擇 (1-3): "

if "%choice%"=="1" (
    echo 🧪 測試模式：處理前10張圖片...
    python batch_tag_processor.py --api-key %OPENAI_API_KEY% --input-dir ./picture --output ./test_results.json --limit 10
)

if "%choice%"=="2" (
    echo 📊 小批量模式：處理前50張圖片...
    python batch_tag_processor.py --api-key %OPENAI_API_KEY% --input-dir ./picture --output ./batch_results.json --limit 50
)

if "%choice%"=="3" (
    echo 🔥 完整處理：處理所有圖片...
    python batch_tag_processor.py --api-key %OPENAI_API_KEY% --input-dir ./picture --output ./full_results.json --generate-products
)

echo.
echo ✅ 處理完成！
echo.
echo 生成的檔案：
echo - JSON 結果檔案：包含所有圖片的AI分析標籤
echo - Korean Products 檔案：可直接整合到您的網站中
echo.
pause