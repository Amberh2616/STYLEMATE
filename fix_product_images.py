#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修復產品圖片映射問題
將資料庫中的產品映射到實際存在的圖片檔案
"""

import psycopg2
import os
import json
import random
from datetime import datetime

def get_existing_images():
    """獲取實際存在的圖片檔案列表"""
    img_dir = 'C:/Users/AMBER/Desktop/STYLEMATE/frontend/public/images/korean-fashion'
    existing_files = []
    
    if os.path.exists(img_dir):
        for file in os.listdir(img_dir):
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                existing_files.append(file)
    
    return existing_files

def categorize_images(image_files):
    """根據檔案名推測圖片分類"""
    categories = {
        'dress': [],
        'top': [],
        'bottom': [],
        'outer': [],
        'set': []
    }
    
    for filename in image_files:
        filename_lower = filename.lower()
        
        # 根據檔案名關鍵字分類
        if any(keyword in filename_lower for keyword in ['dress', '洋裝', '裙子', '套裝']):
            categories['dress'].append(filename)
        elif any(keyword in filename_lower for keyword in ['外套', '開衫', '背心', 'jacket', 'coat']):
            categories['outer'].append(filename)
        elif any(keyword in filename_lower for keyword in ['褲子', '褲裙', '短褲', 'pants', 'shorts']):
            categories['bottom'].append(filename)
        elif any(keyword in filename_lower for keyword in ['上衣', 'top', 'shirt']):
            categories['top'].append(filename)
        else:
            # 根據路徑資訊推測
            if '外套' in filename or 'jacket' in filename_lower:
                categories['outer'].append(filename)
            elif '褲' in filename or 'pants' in filename_lower:
                categories['bottom'].append(filename)
            elif '裙' in filename or 'dress' in filename_lower:
                categories['dress'].append(filename)
            else:
                categories['top'].append(filename)  # 預設為上衣
    
    return categories

def fix_product_images():
    """修復產品圖片映射"""
    try:
        # 獲取實際存在的圖片
        existing_images = get_existing_images()
        print(f"找到 {len(existing_images)} 個實際圖片檔案")
        
        # 分類圖片
        categorized_images = categorize_images(existing_images)
        for category, images in categorized_images.items():
            print(f"{category}: {len(images)} 個檔案")
        
        # 連接資料庫
        DB_PARAMS = {
            'host': 'localhost',
            'port': 5432,
            'user': 'postgres',
            'password': '2616',
            'database': 'stylemate_fashion'
        }
        
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        # 獲取所有產品
        cursor.execute("""
            SELECT id, name_zh, category_en, category_zh, filename 
            FROM fashion_items 
            ORDER BY id
        """)
        products = cursor.fetchall()
        
        print(f"\n找到 {len(products)} 個產品需要修復")
        
        fixed_count = 0
        for product in products:
            product_id, name_zh, category_en, category_zh, old_filename = product
            
            # 根據產品分類選擇對應的圖片
            if category_en == 'dress':
                available_images = categorized_images['dress'] + categorized_images['set']
            elif category_en == 'outer':
                available_images = categorized_images['outer']
            elif category_en == 'bottom':
                available_images = categorized_images['bottom']
            else:  # top 或其他
                available_images = categorized_images['top']
            
            # 如果該分類沒有圖片，使用所有圖片
            if not available_images:
                available_images = existing_images
            
            # 隨機選擇一個圖片（確保不重複）
            if available_images:
                # 檢查是否已經有產品使用這個圖片
                cursor.execute("SELECT COUNT(*) FROM fashion_items WHERE filename = %s AND id != %s", 
                             (available_images[0], product_id))
                used_count = cursor.fetchone()[0]
                
                # 選擇未被使用的圖片
                selected_image = None
                for img in available_images:
                    cursor.execute("SELECT COUNT(*) FROM fashion_items WHERE filename = %s AND id != %s", 
                                 (img, product_id))
                    if cursor.fetchone()[0] == 0:
                        selected_image = img
                        break
                
                # 如果都被使用了，就隨機選一個
                if not selected_image:
                    selected_image = random.choice(available_images)
                
                # 更新產品的圖片資訊
                new_image_path = selected_image  # 直接使用檔案名，不需要子目錄
                
                cursor.execute("""
                    UPDATE fashion_items 
                    SET filename = %s, 
                        image_path = %s,
                        updated_at = %s
                    WHERE id = %s
                """, (selected_image, new_image_path, datetime.now(), product_id))
                
                print(f"Fixed product {product_id}: {name_zh} -> {selected_image}")
                fixed_count += 1
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"\nSuccessfully fixed {fixed_count} product image mappings")
        return True
        
    except Exception as e:
        print(f"Fix failed: {e}")
        return False

def verify_fix():
    """驗證修復結果"""
    try:
        DB_PARAMS = {
            'host': 'localhost',
            'port': 5432,
            'user': 'postgres',
            'password': '2616',
            'database': 'stylemate_fashion'
        }
        
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        # 檢查是否還有不存在的圖片
        img_dir = 'C:/Users/AMBER/Desktop/STYLEMATE/frontend/public/images/korean-fashion'
        
        cursor.execute("SELECT id, name_zh, filename FROM fashion_items ORDER BY id LIMIT 10")
        sample_products = cursor.fetchall()
        
        print("\n=== 驗證結果（前10個產品）===")
        for product in sample_products:
            product_id, name_zh, filename = product
            img_path = os.path.join(img_dir, filename)
            exists = os.path.exists(img_path)
            status = "EXISTS" if exists else "NOT FOUND"
            print(f"ID {product_id}: {name_zh} -> {filename} {status}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"驗證錯誤: {e}")

if __name__ == "__main__":
    print("開始修復產品圖片映射")
    print("=" * 50)
    
    if fix_product_images():
        print("\nVerifying fix results...")
        verify_fix()
        print("\nFix complete! Products should now display correct images!")
    else:
        print("\nFix failed")