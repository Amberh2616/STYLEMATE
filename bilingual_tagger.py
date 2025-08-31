#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
雙語標籤處理器 - 生成英文標籤供 FashionCLIP 使用，中文標籤供前端顯示
"""

import os
import json
import base64
import time
from pathlib import Path
from PIL import Image
import openai

class BilingualFashionTagger:
    def __init__(self, api_key: str):
        self.client = openai.OpenAI(api_key=api_key)
        
        # 標籤映射字典
        self.tag_mappings = {
            # 服裝分類
            "category": {
                "dress": "洋裝",
                "top": "上衣", 
                "bottom": "下身",
                "outer": "外套",
                "set": "套裝"
            },
            
            # 風格標籤
            "style": {
                "korean": "韓系",
                "sweet": "甜美",
                "elegant": "優雅",
                "casual": "休閒",
                "street": "街頭",
                "minimalist": "簡約",
                "romantic": "浪漫",
                "cute": "可愛",
                "chic": "時尚",
                "vintage": "復古"
            },
            
            # 場合
            "occasion": {
                "daily": "日常",
                "casual": "休閒",
                "work": "上班",
                "date": "約會",
                "formal": "正式",
                "party": "派對",
                "shopping": "逛街",
                "weekend": "週末",
                "office": "辦公室",
                "vacation": "度假"
            },
            
            # 季節
            "season": {
                "spring": "春季",
                "summer": "夏季", 
                "autumn": "秋季",
                "winter": "冬季",
                "all_season": "四季"
            },
            
            # 顏色
            "colors": {
                "white": "白色",
                "black": "黑色",
                "pink": "粉色",
                "blue": "藍色",
                "red": "紅色",
                "green": "綠色",
                "yellow": "黃色",
                "purple": "紫色",
                "brown": "棕色",
                "gray": "灰色",
                "beige": "米色",
                "navy": "海軍藍",
                "cream": "米白色"
            },
            
            # 版型
            "fit": {
                "loose": "寬鬆",
                "regular": "合身",
                "slim": "修身",
                "oversized": "寬版",
                "tight": "緊身",
                "high_waist": "高腰",
                "a_line": "A字"
            },
            
            # 特色
            "features": {
                "slimming": "顯瘦",
                "versatile": "百搭",
                "comfortable": "舒適",
                "breathable": "透氣",
                "warm": "保暖",
                "stretchy": "彈性",
                "wrinkle_free": "不易皺",
                "easy_care": "好保養"
            }
        }
    
    def compress_image(self, image_path):
        """壓縮圖片"""
        try:
            with Image.open(image_path) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                
                from io import BytesIO
                buffer = BytesIO()
                img.save(buffer, format='JPEG', quality=85, optimize=True)
                buffer.seek(0)
                
                return base64.b64encode(buffer.read()).decode('utf-8')
        except Exception as e:
            print(f"Image compression failed {image_path}: {e}")
            return None
    
    def analyze_image_bilingual(self, image_path, category_hint=""):
        """生成雙語標籤"""
        
        image_base64 = self.compress_image(image_path)
        if not image_base64:
            return {"error": "Image processing failed"}
        
        category_guidance = ""
        if "DRESS" in category_hint.upper():
            category_guidance = "This is a dress or gown, "
        elif "TOP" in category_hint.upper():
            category_guidance = "This is a top/shirt, "
        elif "OUTER" in category_hint.upper():
            category_guidance = "This is an outerwear/jacket, "
        elif "PANTS" in category_hint.upper():
            category_guidance = "This is pants/skirt, "
        
        prompt = f"""Analyze this Korean fashion image. {category_guidance}Provide precise JSON format tags in ENGLISH for FashionCLIP compatibility:

{{
  "name_en": "Product name in English",
  "category": "dress/top/bottom/outer/set",
  "colors": ["main colors in English"],
  "style_tags": ["style tags like korean, sweet, casual, elegant"],
  "occasion": ["suitable occasions like daily, work, date"],
  "season": ["suitable seasons"],
  "fit": "loose/regular/slim/oversized",
  "features": ["key features like comfortable, versatile, slimming"],
  "material_guess": "fabric type in English",
  "price_tier": "budget/mid/premium",
  "description_en": "Product description in English (under 50 words)"
}}

Focus on:
1. All tags must be in English for FashionCLIP
2. Use standard fashion terminology
3. Include Korean style characteristics
4. Consider Taiwanese consumer preferences"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
                    ]
                }],
                max_tokens=500,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            
            # 解析 JSON
            try:
                start = content.find('{')
                end = content.rfind('}') + 1
                json_str = content[start:end]
                
                en_tags = json.loads(json_str)
                
                # 生成雙語標籤
                bilingual_tags = self.generate_bilingual_tags(en_tags)
                bilingual_tags["ai_confidence"] = "high"
                bilingual_tags["processed_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
                
                return bilingual_tags
                
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed: {e}")
                return {"error": "JSON parsing failed", "raw_response": content}
                
        except Exception as e:
            print(f"API call failed: {e}")
            return {"error": str(e)}
    
    def generate_bilingual_tags(self, en_tags):
        """將英文標籤轉換為雙語標籤"""
        
        bilingual = {
            # 英文標籤 (供 FashionCLIP 使用)
            "name_en": en_tags.get("name_en", ""),
            "category_en": en_tags.get("category", "top"),
            "colors_en": en_tags.get("colors", []),
            "style_tags_en": en_tags.get("style_tags", []),
            "occasion_en": en_tags.get("occasion", []),
            "season_en": en_tags.get("season", []),
            "fit_en": en_tags.get("fit", "regular"),
            "features_en": en_tags.get("features", []),
            "description_en": en_tags.get("description_en", ""),
            
            # 中文標籤 (供前端顯示)
            "name_zh": self.translate_name(en_tags.get("name_en", "")),
            "category_zh": self.tag_mappings["category"].get(en_tags.get("category", "top"), "上衣"),
            "colors_zh": [self.tag_mappings["colors"].get(color.lower(), color) for color in en_tags.get("colors", [])],
            "style_tags_zh": [self.tag_mappings["style"].get(style.lower(), style) for style in en_tags.get("style_tags", [])],
            "occasion_zh": [self.tag_mappings["occasion"].get(occ.lower(), occ) for occ in en_tags.get("occasion", [])],
            "season_zh": [self.tag_mappings["season"].get(season.lower(), season) for season in en_tags.get("season", [])],
            "fit_zh": self.tag_mappings["fit"].get(en_tags.get("fit", "regular").lower(), "合身"),
            "features_zh": [self.tag_mappings["features"].get(feat.lower(), feat) for feat in en_tags.get("features", [])],
            
            # 其他資訊
            "material_guess": en_tags.get("material_guess", "mixed fabric"),
            "price_tier": en_tags.get("price_tier", "mid")
        }
        
        # 生成中文描述
        bilingual["description_zh"] = self.generate_chinese_description(bilingual)
        
        return bilingual
    
    def translate_name(self, en_name):
        """翻譯英文商品名稱為中文"""
        # 簡單的關鍵詞翻譯
        translations = {
            "dress": "洋裝",
            "top": "上衣",
            "shirt": "襯衫", 
            "cardigan": "開衫",
            "jacket": "外套",
            "skirt": "裙子",
            "pants": "褲子",
            "korean": "韓系",
            "casual": "休閒",
            "elegant": "優雅",
            "sweet": "甜美"
        }
        
        zh_name = en_name.lower()
        for en_word, zh_word in translations.items():
            zh_name = zh_name.replace(en_word, zh_word)
        
        return zh_name.title() if zh_name != en_name.lower() else f"韓系{en_name}"
    
    def generate_chinese_description(self, tags):
        """基於標籤生成中文描述"""
        category = tags["category_zh"]
        colors = "、".join(tags["colors_zh"][:2]) if tags["colors_zh"] else "多色"
        styles = "、".join(tags["style_tags_zh"][:2]) if tags["style_tags_zh"] else "時尚"
        occasions = "、".join(tags["occasion_zh"][:2]) if tags["occasion_zh"] else "日常"
        
        return f"{styles}風格的{colors}{category}，適合{occasions}穿著，展現韓式時尚魅力。"
    
    def process_batch(self, input_dir, output_file, limit=None):
        """批量處理圖片"""
        
        input_path = Path(input_dir)
        if not input_path.exists():
            return {"error": f"Directory not found: {input_path}"}
        
        # 收集圖片
        all_images = []
        categories = ["DRESS", "TOP", "OUTER", "PANTS"]
        
        for category in categories:
            cat_dir = input_path / category
            if cat_dir.exists():
                images = list(cat_dir.glob("*.jpg"))
                if limit:
                    images = images[:limit//4]  # 每類平均分配
                
                for img_path in images:
                    all_images.append({
                        'path': img_path,
                        'category': category,
                        'relative_path': img_path.relative_to(input_path)
                    })
        
        if limit:
            all_images = all_images[:limit]
        
        print(f"Found {len(all_images)} images to process")
        
        results = {
            "total_images": len(all_images),
            "processed_count": 0,
            "success_count": 0,
            "failed_count": 0,
            "bilingual_tags": {},
            "processing_time": 0
        }
        
        start_time = time.time()
        
        for i, img_info in enumerate(all_images, 1):
            print(f"Processing {i}/{len(all_images)}")
            
            # 分析圖片
            tags = self.analyze_image_bilingual(img_info['path'], img_info['category'])
            
            # 儲存結果
            results["bilingual_tags"][str(img_info['relative_path'])] = {
                "tags": tags,
                "category_hint": img_info['category'],
                "file_size": img_info['path'].stat().st_size if img_info['path'].exists() else 0
            }
            
            results["processed_count"] += 1
            
            if "error" not in tags:
                results["success_count"] += 1
                print(f"Success: {tags.get('name_en', 'N/A')} / {tags.get('name_zh', 'N/A')}")
            else:
                results["failed_count"] += 1
                print(f"Failed: {tags.get('error', 'Unknown error')}")
            
            # API 限制延遲
            time.sleep(2)
            
            # 每10張儲存一次
            if i % 10 == 0:
                self._save_results(results, Path(output_file))
                print(f"Intermediate results saved")
        
        results["processing_time"] = time.time() - start_time
        
        # 儲存最終結果
        self._save_results(results, Path(output_file))
        
        return results
    
    def _save_results(self, results, output_file):
        """儲存結果"""
        try:
            output_file.parent.mkdir(parents=True, exist_ok=True)
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Save failed: {e}")


def main():
    """主程式"""
    api_key = "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"
    
    tagger = BilingualFashionTagger(api_key)
    
    print("Starting bilingual fashion tagging...")
    print("English tags for FashionCLIP, Chinese tags for frontend")
    
    # 擴充商品選擇範圍
    test_limit = 50  # 擴充到50張，提供更豐富的推薦選項
    
    results = tagger.process_batch(
        input_dir="./picture",
        output_file="./bilingual_fashion_tags.json",
        limit=test_limit
    )
    
    print(f"\nProcessing completed:")
    print(f"Total: {results['total_images']}")
    print(f"Processed: {results['processed_count']}")
    print(f"Success: {results['success_count']}")
    print(f"Failed: {results['failed_count']}")
    print(f"Time: {results['processing_time']:.2f} seconds")


if __name__ == "__main__":
    main()