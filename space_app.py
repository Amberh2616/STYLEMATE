import gradio as gr
import os
import requests
from PIL import Image, ImageOps
import io
import base64
import numpy as np
from transformers import pipeline
import torch

# 設置模型緩存目錄
os.environ['TRANSFORMERS_CACHE'] = './models'
os.environ['HF_HOME'] = './models'

# 初始化 Hugging Face pipeline for virtual try-on
# 使用 yisol/IDM-VTON 模型進行虛擬試穿
def initialize_model():
    try:
        # 嘗試使用官方的 IDM-VTON API
        return "api_mode"
    except Exception as e:
        print(f"無法初始化模型: {e}")
        return None

model = initialize_model()

def virtual_tryon_api(person_img_url, cloth_img_url):
    """使用 IDM-VTON API 進行虛擬試穿"""
    try:
        # 調用 yisol/IDM-VTON Space API
        from gradio_client import Client
        
        client = Client("yisol/IDM-VTON")
        result = client.predict(
            person_img_url,
            cloth_img_url,
            api_name="/tryon"
        )
        
        return result
        
    except Exception as e:
        print(f"API 調用失敗: {e}")
        return None

def preprocess_image(image, target_size=(384, 512)):
    """預處理圖片"""
    if image is None:
        return None
        
    # 確保圖片是 RGB 格式
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # 調整大小並保持長寬比
    image = ImageOps.fit(image, target_size, Image.Resampling.LANCZOS)
    
    return image

def tryon(person_img, cloth_img):
    """虛擬試穿主函數"""
    try:
        if person_img is None or cloth_img is None:
            return None, "請上傳人物照片和服裝圖片"
        
        # 預處理圖片
        person_processed = preprocess_image(person_img)
        cloth_processed = preprocess_image(cloth_img)
        
        if person_processed is None or cloth_processed is None:
            return None, "圖片處理失敗"
        
        # 方法1: 嘗試使用 API
        if model == "api_mode":
            # 將圖片轉換為 base64 用於 API 調用
            person_buffer = io.BytesIO()
            person_processed.save(person_buffer, format='PNG')
            person_b64 = base64.b64encode(person_buffer.getvalue()).decode()
            
            cloth_buffer = io.BytesIO()
            cloth_processed.save(cloth_buffer, format='PNG')
            cloth_b64 = base64.b64encode(cloth_buffer.getvalue()).decode()
            
            # 調用 API
            api_result = virtual_tryon_api(
                f"data:image/png;base64,{person_b64}",
                f"data:image/png;base64,{cloth_b64}"
            )
            
            if api_result:
                return api_result, "使用 IDM-VTON 成功完成虛擬試穿"
        
        # 方法2: 備用 - 使用簡單的圖像合成作為 fallback
        # 這不是真正的虛擬試穿，但至少能工作
        result_img = simple_compose(person_processed, cloth_processed)
        
        return result_img, "使用備用方法完成合成（非真實虛擬試穿）"
        
    except Exception as e:
        print(f"虛擬試穿失敗: {e}")
        return None, f"處理失敗: {str(e)}"

def simple_compose(person_img, cloth_img):
    """簡單的圖像合成作為備用方案"""
    try:
        # 創建結果畫布
        result_width = 384
        result_height = 512
        result = Image.new('RGB', (result_width, result_height), (255, 255, 255))
        
        # 調整人物圖片大小
        person_resized = person_img.resize((result_width, result_height))
        
        # 調整服裝大小 - 將其放在胸部區域
        cloth_size = (int(result_width * 0.4), int(result_height * 0.3))
        cloth_resized = cloth_img.resize(cloth_size)
        
        # 將人物圖片作為背景
        result.paste(person_resized, (0, 0))
        
        # 將服裝放在適當位置（胸部區域）
        cloth_x = int(result_width * 0.3)
        cloth_y = int(result_height * 0.25)
        
        # 使用透明度合成
        result.paste(cloth_resized, (cloth_x, cloth_y), cloth_resized if cloth_resized.mode == 'RGBA' else None)
        
        return result
        
    except Exception as e:
        print(f"簡單合成失敗: {e}")
        # 如果合成也失敗，返回原始人物圖片
        return person_img

# 創建 Gradio 界面
def create_interface():
    with gr.Blocks(title="STYLEMATE - AI 虛擬試穿") as demo:
        gr.Markdown("# 🧥 STYLEMATE - AI 虛擬試穿平台")
        gr.Markdown("使用先進的 AI 技術進行虛擬服裝試穿")
        
        with gr.Row():
            with gr.Column():
                person_img = gr.Image(
                    label="👤 上傳人物照片",
                    type="pil",
                    height=400
                )
                
            with gr.Column():
                cloth_img = gr.Image(
                    label="👕 上傳服裝圖片", 
                    type="pil",
                    height=400
                )
                
            with gr.Column():
                result_img = gr.Image(
                    label="✨ 試穿結果",
                    height=400
                )
        
        with gr.Row():
            tryon_btn = gr.Button("🚀 開始虛擬試穿", variant="primary", size="lg")
            
        status_text = gr.Textbox(
            label="📊 處理狀態",
            interactive=False,
            placeholder="等待開始..."
        )
        
        # 綁定按鈕事件
        tryon_btn.click(
            fn=tryon,
            inputs=[person_img, cloth_img],
            outputs=[result_img, status_text],
            api_name="tryon"
        )
        
        # 添加示例
        gr.Examples(
            examples=[
                ["./examples/person1.jpg", "./examples/cloth1.jpg"],
                ["./examples/person2.jpg", "./examples/cloth2.jpg"],
            ] if os.path.exists("./examples") else [],
            inputs=[person_img, cloth_img],
        )
        
        gr.Markdown("""
        ### 使用說明
        1. 上傳一張清晰的人物正面照片
        2. 上傳一張服裝圖片（最好是去背的）
        3. 點擊「開始虛擬試穿」按鈕
        4. 等待 AI 處理完成
        
        ### 注意事項
        - 人物照片建議使用正面、直立的姿勢
        - 服裝圖片建議使用白色背景或透明背景
        - 處理時間約 30-60 秒，請耐心等待
        """)
    
    return demo

if __name__ == "__main__":
    demo = create_interface()
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=True,
        show_error=True
    )