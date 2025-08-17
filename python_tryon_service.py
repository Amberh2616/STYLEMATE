"""
簡化的虛擬試穿 Python 服務
使用 Gradio Client 調用 Hugging Face Spaces
"""
import gradio_client
import base64
import io
from PIL import Image
from flask import Flask, request, jsonify
import os

app = Flask(__name__)

class VirtualTryOnService:
    def __init__(self):
        # 使用 Gradio Client 連接到 Hugging Face Spaces 上的 IDM-VTON
        try:
            self.client = gradio_client.Client("yisol/IDM-VTON")
            print("✅ IDM-VTON 客戶端初始化成功")
        except Exception as e:
            print(f"❌ IDM-VTON 客戶端初始化失敗: {e}")
            self.client = None
    
    def base64_to_image(self, base64_str):
        """Base64 轉換為 PIL Image"""
        image_data = base64.b64decode(base64_str.split(',')[1])
        return Image.open(io.BytesIO(image_data))
    
    def image_to_base64(self, image):
        """PIL Image 轉換為 Base64"""
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{image_base64}"
    
    def virtual_tryon(self, person_image, clothing_image):
        """執行虛擬試穿"""
        if not self.client:
            return None, "IDM-VTON 服務不可用"
        
        try:
            # 保存臨時圖片
            person_path = "temp_person.png"
            clothing_path = "temp_clothing.png"
            
            person_image.save(person_path)
            clothing_image.save(clothing_path)
            
            # 調用 IDM-VTON
            result = self.client.predict(
                dict={"background": person_path, "layers": [], "composite": None},
                garm_img=clothing_path,
                garment_des="upper body clothing",
                is_checked=True,
                is_checked_crop=False,
                denoise_steps=20,
                seed=42,
                api_name="/tryon"
            )
            
            # 清理臨時文件
            os.remove(person_path)
            os.remove(clothing_path)
            
            # 返回結果圖片
            if result and os.path.exists(result):
                result_image = Image.open(result)
                return result_image, "成功"
            else:
                return None, "生成失敗"
                
        except Exception as e:
            return None, f"處理錯誤: {str(e)}"

# 初始化服務
tryon_service = VirtualTryOnService()

@app.route('/virtual_tryon', methods=['POST'])
def virtual_tryon_api():
    try:
        data = request.json
        
        # 解析輸入圖片
        person_base64 = data.get('person_image')
        clothing_base64 = data.get('clothing_image')
        
        if not person_base64 or not clothing_base64:
            return jsonify({'error': '缺少圖片數據'}), 400
        
        # 轉換圖片
        person_img = tryon_service.base64_to_image(person_base64)
        clothing_img = tryon_service.base64_to_image(clothing_base64)
        
        # 執行虛擬試穿
        result_img, message = tryon_service.virtual_tryon(person_img, clothing_img)
        
        if result_img:
            result_base64 = tryon_service.image_to_base64(result_img)
            return jsonify({
                'success': True,
                'result_image': result_base64,
                'message': message
            })
        else:
            return jsonify({
                'success': False,
                'error': message
            }), 500
            
    except Exception as e:
        return jsonify({'error': f'服務錯誤: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 啟動虛擬試穿服務...")
    app.run(host='0.0.0.0', port=8000, debug=True)