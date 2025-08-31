from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from gradio_client import Client, handle_file
import os
import shutil
from datetime import datetime
from werkzeug.utils import secure_filename
import uuid
import sys

# Set UTF-8 encoding for stdout/stderr
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

app = Flask(__name__)
CORS(app)

# ===== 重要：設定你的 Hugging Face Token =====
# 請到 https://huggingface.co/settings/tokens 取得你的 token
# 方法1：直接在程式中設定（較簡單）
HF_TOKEN = os.getenv('HUGGINGFACE_TOKEN') or 'your-huggingface-token-here'  # 請替換成你的實際 token

# 方法2：使用環境變數（較安全）
# 在命令行中執行：export HUGGINGFACE_TOKEN=your_token_here
# 然後取消下面這行的註解，並註解掉上面的 HF_TOKEN 行
# HF_TOKEN = os.getenv('HUGGINGFACE_TOKEN')

# 設定路徑
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
RESULTS_DIR = os.path.join(BASE_DIR, 'results')

# 建立必要的資料夾
for directory in [UPLOAD_DIR, RESULTS_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# 允許的檔案類型
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 首頁路由 - 提供前端介面
@app.route('/')
def index():
    # 讀取 HTML 檔案
    html_file = os.path.join(BASE_DIR, 'index.html')
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return '''
        <h1>找不到前端檔案</h1>
        <p>請確保 index.html 檔案在同一個資料夾中</p>
        <p>或者將前端 HTML 內容儲存為 index.html</p>
        '''

# 虛擬試衣 API
@app.route('/api/tryon', methods=['POST'])
def tryon_api():
    try:
        # 檢查 Token 是否設定
        if not HF_TOKEN or HF_TOKEN == "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx":
            return jsonify({
                'success': False, 
                'error': '請先設定 Hugging Face Token！\n請到 https://huggingface.co/settings/tokens 取得 token，\n然後在程式碼中替換 HF_TOKEN 的值。'
            })
        
        # Check files
        if 'personFile' not in request.files or 'garmentFile' not in request.files:
            return jsonify({'success': False, 'error': 'Missing required image files'})
        
        person_file = request.files['personFile']
        garment_file = request.files['garmentFile']
        
        if person_file.filename == '' or garment_file.filename == '':
            return jsonify({'success': False, 'error': 'Invalid filename'})
        
        # Debug file info
        print(f"Person file: {person_file.filename}")
        print(f"Garment file: {garment_file.filename}")
        
        if not (allowed_file(person_file.filename) and allowed_file(garment_file.filename)):
            return jsonify({'success': False, 'error': f'Unsupported file format. Person: {person_file.filename}, Garment: {garment_file.filename}. Supported: png, jpg, jpeg, gif, bmp, webp'})
        
        # Generate unique filenames
        session_id = str(uuid.uuid4())[:8]
        person_filename = f"{session_id}_person.{person_file.filename.rsplit('.', 1)[1].lower()}"
        garment_filename = f"{session_id}_garment.{garment_file.filename.rsplit('.', 1)[1].lower()}"
        
        # Save uploaded files
        person_path = os.path.join(UPLOAD_DIR, person_filename)
        garment_path = os.path.join(UPLOAD_DIR, garment_filename)
        
        person_file.save(person_path)
        garment_file.save(garment_path)
        
        # Use default parameters
        garment_desc = 'A beautiful garment'
        denoise_steps = 30
        seed = 42
        auto_mask = True
        crop_image = False
        
        print(f"Starting virtual try-on processing...")
        print(f"Person image: {person_path}")
        print(f"Garment image: {garment_path}")
        print(f"Using Token: {HF_TOKEN[:10]}...")
        
        # Connect to IDM-VTON API
        try:
            print("Connecting to IDM-VTON API...")
            client = Client("yisol/IDM-VTON", hf_token=HF_TOKEN)
            print("Successfully connected to IDM-VTON API")
        except Exception as e:
            error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
            print(f"Failed to connect API: {error_msg}")
            return jsonify({
                'success': False, 
                'error': f'Failed to connect IDM-VTON API: {error_msg} Please check your Hugging Face Token.'
            })
        
        # Execute virtual try-on
        result = client.predict(
            {"background": handle_file(person_path), "layers": [], "composite": None},
            handle_file(garment_path),
            garment_desc,
            auto_mask,
            crop_image,
            denoise_steps,
            seed,
            api_name="/tryon"
        )
        
        print(f"API Response: {result}")
        
        # Get result image path
        output_image_path = result[0]
        
        # Generate result filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        result_filename = f"tryon_result_{session_id}_{timestamp}.jpg"
        result_path = os.path.join(RESULTS_DIR, result_filename)
        
        # Copy result image
        shutil.copy2(output_image_path, result_path)
        
        print(f"Result saved: {result_path}")
        
        # Clean up temporary files
        try:
            os.remove(person_path)
            os.remove(garment_path)
        except:
            pass
        
        # Return result
        return jsonify({
            'success': True,
            'resultUrl': f'/results/{result_filename}',
            'message': 'Virtual try-on completed!'
        })
        
    except Exception as e:
        error_msg = str(e).encode('ascii', 'ignore').decode('ascii')
        print(f"Error: {error_msg}")
        
        # Handle quota-related errors
        if "quota" in error_msg.lower() or "exceeded" in error_msg.lower():
            error_msg += "\n\nSuggested solutions:\n1. Wait 24 hours and try again\n2. Upgrade to Hugging Face Pro ($9/month)\n3. Reduce denoise_steps parameter to save time"
        
        return jsonify({
            'success': False,
            'error': f'Processing failed: {error_msg}'
        })

# 提供結果圖片
@app.route('/results/<filename>')
def get_result(filename):
    return send_from_directory(RESULTS_DIR, filename)

# 代理圖片下載，解決 CORS 問題
@app.route('/proxy-image')
def proxy_image():
    image_url = request.args.get('url')
    if not image_url:
        return jsonify({'success': False, 'error': 'Missing image URL'}), 400
    
    try:
        import requests
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        # 設定正確的 Content-Type
        content_type = response.headers.get('content-type', 'image/jpeg')
        
        return response.content, 200, {
            'Content-Type': content_type,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 提供上傳圖片（如果需要）
@app.route('/uploads/<filename>')
def get_upload(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# 取得結果列表
@app.route('/api/results')
def list_results():
    try:
        files = []
        for filename in os.listdir(RESULTS_DIR):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(RESULTS_DIR, filename)
                files.append({
                    'filename': filename,
                    'url': f'/results/{filename}',
                    'created': datetime.fromtimestamp(os.path.getctime(file_path)).strftime('%Y-%m-%d %H:%M:%S')
                })
        
        # 按建立時間排序（最新的在前）
        files.sort(key=lambda x: x['created'], reverse=True)
        
        return jsonify({'success': True, 'files': files})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# 檢查 Token 狀態的 API
@app.route('/api/check-token')
def check_token():
    try:
        if not HF_TOKEN or HF_TOKEN == "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx":
            return jsonify({
                'success': False, 
                'message': '未設定 Hugging Face Token',
                'instructions': '請到 https://huggingface.co/settings/tokens 取得 token'
            })
        
        # 嘗試連接 API 來驗證 Token
        client = Client("yisol/IDM-VTON", hf_token=HF_TOKEN)
        return jsonify({
            'success': True, 
            'message': 'Token 驗證成功！',
            'token_preview': f"{HF_TOKEN[:10]}..."
        })
    except Exception as e:
        return jsonify({
            'success': False, 
            'message': f'Token 驗證失敗: {str(e)}'
        })

if __name__ == '__main__':
    print("STYLEMATE Virtual Try-On Server Starting...")
    print(f"Upload folder: {UPLOAD_DIR}")
    print(f"Results folder: {RESULTS_DIR}")
    
    # Check Token status
    if not HF_TOKEN or HF_TOKEN == "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx":
        print("WARNING: Hugging Face Token not set!")
        print("Please get token from: https://huggingface.co/settings/tokens")
        print("Then replace HF_TOKEN value in line 16")
    else:
        print(f"HF Token configured: {HF_TOKEN[:10]}...")
    
    print("Please open in browser: http://localhost:5000")
    print("Make sure Flask and flask-cors are installed:")
    print("   pip install flask flask-cors")
    
    app.run(debug=True, host='0.0.0.0', port=5000)