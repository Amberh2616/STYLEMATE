#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
韓國服裝照片批量AI標籤處理器
基於 OpenAI GPT-4 Vision API 為300張韓國服裝照片生成標籤
"""

import os
import json
import base64
import time
from pathlib import Path
from typing import Dict, List, Any
import openai
from PIL import Image
import argparse

class KoreanFashionTagger:
    def __init__(self, api_key: str):
        """初始化標籤處理器"""
        self.client = openai.OpenAI(api_key=api_key)
        
        # 韓式服裝標籤模板
        self.tag_template = {
            "category": ["dress", "top", "bottom", "outer", "set", "accessories"],
            "korean_style": ["韓系", "甜美", "優雅", "街頭", "文青", "簡約", "浪漫"],
            "occasion": ["casual", "date", "work", "formal", "party", "daily", "weekend"],
            "season": ["spring", "summer", "autumn", "winter", "all_season"],
            "color_family": ["白色", "黑色", "粉色", "藍色", "綠色", "黃色", "紫色", "棕色", "灰色", "米色"],
            "material_guess": ["棉質", "雪紡", "針織", "牛仔", "絲質", "麻質", "聚酯纖維", "混紡"],
            "fit": ["寬鬆", "合身", "修身", "直筒", "A字", "高腰", "低腰"],
            "features": ["顯瘦", "百搭", "舒適", "透氣", "保暖", "防曬", "易搭配"]
        }
    
    def compress_image(self, image_path: Path, max_size: tuple = (800, 800), quality: int = 85) -> str:
        """壓縮圖片並轉換為base64"""
        try:
            with Image.open(image_path) as img:
                # 轉換為RGB（如果是RGBA）
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # 按比例縮放
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # 保存到內存
                from io import BytesIO
                buffer = BytesIO()
                img.save(buffer, format='JPEG', quality=quality, optimize=True)
                buffer.seek(0)
                
                # 轉換為base64
                return base64.b64encode(buffer.read()).decode('utf-8')
        
        except Exception as e:
            print(f"圖片壓縮失敗 {image_path}: {e}")
            return None
    
    def analyze_single_image(self, image_path: Path, category_hint: str = None) -> Dict[str, Any]:
        """使用 GPT-4 Vision 分析單張圖片"""
        
        # 壓縮圖片
        image_base64 = self.compress_image(image_path)
        if not image_base64:
            return {"error": "圖片處理失敗"}
        
        # 根據資料夾名稱給出提示
        category_guidance = ""
        if category_hint:
            if "DRESS" in category_hint.upper():
                category_guidance = "這是一件連身裙或洋裝，"
            elif "TOP" in category_hint.upper():
                category_guidance = "這是一件上衣，"
            elif "OUTER" in category_hint.upper():
                category_guidance = "這是一件外套，"
            elif "PANTS" in category_hint.upper():
                category_guidance = "這是一件褲子或裙子，"
        
        prompt = f"""請分析這張韓國服裝照片。{category_guidance}提供精確的JSON格式標籤：

{{
  "category": "dress/top/bottom/outer/set",
  "korean_style": ["韓系風格標籤，如：甜美、優雅、簡約等"],
  "price_range": "estimated_price_range_TWD",
  "colors": ["主要顏色1", "主要顏色2"],
  "tags": ["相關標籤，如：韓系、甜美、約會等"],
  "occasion": ["適合場合：casual/date/work/formal/party"],
  "season": ["適合季節：spring/summer/autumn/winter"],
  "material_guess": "面料材質推測",
  "fit": "版型：寬鬆/合身/修身/直筒/A字",
  "features": ["特色：顯瘦/百搭/舒適/透氣等"],
  "description": "商品描述（繁體中文）"
}}

請確保：
1. 所有標籤都是繁體中文或英文
2. 基於韓國時尚風格特點
3. 考慮台灣消費者喜好
4. 標籤要具體且實用
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
                        }
                    ]
                }],
                max_tokens=600,
                temperature=0.3
            )
            
            # 解析 JSON 回應
            content = response.choices[0].message.content
            
            # 嘗試解析 JSON
            try:
                # 尋找 JSON 部分
                start = content.find('{')
                end = content.rfind('}') + 1
                json_str = content[start:end]
                
                tags = json.loads(json_str)
                tags["ai_confidence"] = "high"
                tags["processed_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
                
                return tags
                
            except json.JSONDecodeError as e:
                print(f"JSON 解析失敗 {image_path.name}: {e}")
                print(f"原始回應: {content}")
                return {"error": "JSON解析失敗", "raw_response": content}
                
        except Exception as e:
            print(f"API 調用失敗 {image_path.name}: {e}")
            return {"error": str(e)}
    
    def process_folder(self, folder_path: Path, output_file: Path = None, limit: int = None) -> Dict[str, Any]:
        """批量處理資料夾中的圖片"""
        
        if not folder_path.exists():
            return {"error": f"資料夾不存在: {folder_path}"}
        
        # 支援的圖片格式
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.gif'}
        
        # 收集所有圖片檔案
        all_images = []
        
        # 遞迴搜尋所有圖片
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if Path(file).suffix.lower() in image_extensions:
                    full_path = Path(root) / file
                    
                    # 獲取分類提示（從上層資料夾名稱）
                    category_hint = Path(root).name
                    
                    all_images.append({
                        'path': full_path,
                        'category_hint': category_hint,
                        'relative_path': full_path.relative_to(folder_path)
                    })
        
        print(f"找到 {len(all_images)} 張圖片")
        
        # 限制處理數量
        if limit:
            all_images = all_images[:limit]
            print(f"限制處理前 {limit} 張")
        
        # 處理結果
        results = {
            "total_images": len(all_images),
            "processed_count": 0,
            "success_count": 0,
            "failed_count": 0,
            "results": {},
            "processing_time": 0
        }
        
        start_time = time.time()
        
        for i, img_info in enumerate(all_images, 1):
            print(f"處理中 {i}/{len(all_images)}: {img_info['relative_path']}")
            
            # 分析圖片
            tags = self.analyze_single_image(img_info['path'], img_info['category_hint'])
            
            # 儲存結果
            results["results"][str(img_info['relative_path'])] = {
                "tags": tags,
                "category_hint": img_info['category_hint'],
                "file_size": img_info['path'].stat().st_size if img_info['path'].exists() else 0
            }
            
            results["processed_count"] += 1
            
            if "error" not in tags:
                results["success_count"] += 1
                print("✅ 處理成功")
            else:
                results["failed_count"] += 1
                print(f"❌ 處理失敗: {tags.get('error', '未知錯誤')}")
            
            # API 限制延遲
            time.sleep(1)
            
            # 每10張儲存一次中間結果
            if i % 10 == 0 and output_file:
                self._save_results(results, output_file)
                print(f"中間結果已儲存到 {output_file}")
        
        results["processing_time"] = time.time() - start_time
        
        # 儲存最終結果
        if output_file:
            self._save_results(results, output_file)
            print(f"最終結果已儲存到 {output_file}")
        
        return results
    
    def _save_results(self, results: Dict[str, Any], output_file: Path):
        """儲存結果到JSON檔案"""
        try:
            output_file.parent.mkdir(parents=True, exist_ok=True)
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"儲存結果失敗: {e}")
    
    def generate_products_js(self, results_file: Path, output_js: Path):
        """從結果生成 products.ts 格式的資料"""
        
        try:
            with open(results_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            products = []
            
            for i, (image_path, result) in enumerate(data["results"].items(), 1):
                if "error" in result["tags"]:
                    continue
                
                tags = result["tags"]
                
                # 生成商品資料
                product = {
                    "id": f"korean_{i:03d}",
                    "name": tags.get("description", f"韓系服裝 {i}"),
                    "price": self._estimate_price(tags.get("price_range", "middle")),
                    "image": f"/images/products/korean/{image_path}",
                    "category": tags.get("category", "top"),
                    "style": self._map_style(tags.get("korean_style", ["韓系"])[0]),
                    "description": tags.get("description", "韓國進口時尚單品"),
                    "rating": 4.5 + (i % 5) * 0.1,  # 4.5-4.9 隨機評分
                    "reviews": 50 + i * 3,
                    "colors": tags.get("colors", ["白色"]),
                    "sizes": ["S", "M", "L"],
                    "tags": tags.get("tags", []),
                    "aiMetadata": {
                        "occasion": tags.get("occasion", ["casual"]),
                        "season": tags.get("season", ["all_season"]),
                        "features": tags.get("features", ["百搭"]),
                        "material": tags.get("material_guess", "混紡"),
                        "fit": tags.get("fit", "合身")
                    }
                }
                
                products.append(product)
            
            # 生成 TypeScript 格式
            ts_content = self._generate_ts_content(products)
            
            # 儲存檔案
            with open(output_js, 'w', encoding='utf-8') as f:
                f.write(ts_content)
            
            print(f"已生成 {len(products)} 個商品資料到 {output_js}")
            
        except Exception as e:
            print(f"生成商品檔案失敗: {e}")
    
    def _estimate_price(self, price_range: str) -> int:
        """根據價格範圍估算價格"""
        price_map = {
            "low": 599,
            "middle": 899,
            "high": 1299,
            "premium": 1699
        }
        return price_map.get(price_range.lower(), 899)
    
    def _map_style(self, korean_style: str) -> str:
        """映射韓系風格到系統風格"""
        style_map = {
            "甜美": "sweet",
            "優雅": "elegant", 
            "街頭": "street",
            "簡約": "casual",
            "文青": "casual",
            "浪漫": "sweet"
        }
        return style_map.get(korean_style, "casual")
    
    def _generate_ts_content(self, products: List[Dict]) -> str:
        """生成 TypeScript 內容"""
        
        ts_content = '''// 韓國服裝商品資料 - AI 自動生成
import { Product } from './product'

export const koreanProducts: Product[] = [
'''
        
        for product in products:
            ts_content += f"  {json.dumps(product, ensure_ascii=False, indent=2)},\n"
        
        ts_content += '''
]

export const getKoreanProductById = (id: string): Product | undefined => {
  return koreanProducts.find(product => product.id === id)
}

export const getKoreanProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return koreanProducts
  return koreanProducts.filter(product => product.category === category)
}
'''
        
        return ts_content


def main():
    """主程式"""
    parser = argparse.ArgumentParser(description='韓國服裝照片批量標籤處理')
    parser.add_argument('--api-key', required=True, help='OpenAI API Key')
    parser.add_argument('--input-dir', default='./picture', help='輸入圖片資料夾')
    parser.add_argument('--output', default='./clothing_tags_results.json', help='輸出JSON檔案')
    parser.add_argument('--limit', type=int, help='限制處理圖片數量（測試用）')
    parser.add_argument('--generate-products', action='store_true', help='生成商品資料檔案')
    
    args = parser.parse_args()
    
    # 初始化處理器
    tagger = KoreanFashionTagger(args.api_key)
    
    input_path = Path(args.input_dir)
    output_path = Path(args.output)
    
    print("🚀 開始批量處理韓國服裝照片標籤...")
    print(f"📁 輸入資料夾: {input_path}")
    print(f"📄 輸出檔案: {output_path}")
    
    if args.limit:
        print(f"🔢 限制處理: {args.limit} 張圖片")
    
    # 執行批量處理
    results = tagger.process_folder(input_path, output_path, args.limit)
    
    # 顯示結果統計
    print(f"\n📊 處理完成統計:")
    print(f"   總圖片數: {results['total_images']}")
    print(f"   已處理: {results['processed_count']}")
    print(f"   成功: {results['success_count']}")
    print(f"   失敗: {results['failed_count']}")
    print(f"   處理時間: {results['processing_time']:.2f} 秒")
    
    # 生成商品資料檔案
    if args.generate_products and results['success_count'] > 0:
        products_file = Path('./frontend/lib/korean_products.ts')
        tagger.generate_products_js(output_path, products_file)
        print(f"✅ 商品資料已生成: {products_file}")


if __name__ == "__main__":
    main()