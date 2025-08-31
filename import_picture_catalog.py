#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
導入 picture_tags_system.json 的71個商品到資料庫
"""

import psycopg2
import json
from datetime import datetime

def import_picture_catalog():
    """導入商品目錄資料"""
    try:
        # 讀取商品目錄資料
        with open('picture_tags_system.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        DB_PARAMS = {
            'host': 'localhost',
            'port': 5432,
            'user': 'postgres',
            'password': '2616',
            'database': 'stylemate_fashion'
        }
        
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        # 先清空現有資料（保留表結構）
        cursor.execute("DELETE FROM fashion_items;")
        print("清空現有資料")
        
        count = 0
        
        # 遍歷所有分類的商品
        for category_en, category_data in data['picture_catalog'].items():
            items = category_data.get('items', [])
            
            for item in items:
                # 構建圖片路徑
                image_path = f"{category_en}\\{item['filename']}"
                
                # 準備資料
                filename = item['filename']
                name_zh = item['name']
                name_en = item.get('name_en', item['name'])  # 如果沒有英文名，使用中文名
                
                # 分類轉換
                category_mapping = {
                    'DRESS': {'en': 'dress', 'zh': '洋裝'},
                    'TOP': {'en': 'top', 'zh': '上衣'},
                    'PANTS': {'en': 'bottom', 'zh': '褲子'},
                    'SHORTS': {'en': 'bottom', 'zh': '短褲'},
                    'SKIRTS': {'en': 'bottom', 'zh': '裙子'},
                    'JACKET': {'en': 'outer', 'zh': '外套'}
                }
                
                category_info = category_mapping.get(category_en, {'en': 'top', 'zh': '上衣'})
                
                # 處理顏色
                colors_zh = item.get('color', [])
                colors_en = colors_zh  # 暫時使用中文，之後可以做翻譯
                
                # 處理標籤
                style_tags_zh = item.get('tags', [])
                style_tags_en = [item.get('style', 'casual')]  # 使用style欄位
                
                # 處理場合
                occasions_en = item.get('occasion', ['daily'])
                occasions_zh = []
                occasion_mapping = {
                    'date': '約會', 'work': '上班', 'casual': '休閒',
                    'formal': '正式', 'party': '派對', 'vacation': '度假',
                    'summer': '夏季', 'daily': '日常', 'business': '商務'
                }
                for occ in occasions_en:
                    occasions_zh.append(occasion_mapping.get(occ, occ))
                
                # 處理季節
                seasons_zh = item.get('season', ['春', '夏'])
                season_mapping = {'春': 'spring', '夏': 'summer', '秋': 'autumn', '冬': 'winter'}
                seasons_en = [season_mapping.get(s, 'spring') for s in seasons_zh]
                
                # 處理特色
                features_en = item.get('features', [])
                features_zh = features_en  # 暫時相同
                
                # 價格處理
                price_twd = item.get('price', 3000)
                
                # 生成中文描述
                style_desc = ', '.join(style_tags_zh[:2]) if style_tags_zh else '時尚'
                color_desc = ', '.join(colors_zh[:2]) if colors_zh else '多色'
                description_zh = f"{style_desc}風格的{name_zh}，適合{', '.join(occasions_zh[:2])}穿著，展現韓式時尚魅力。"
                description_en = f"Stylish {category_info['en']} perfect for {', '.join(occasions_en[:2])} occasions."
                
                # 插入資料
                insert_sql = """
                INSERT INTO fashion_items (
                    image_path, filename, name_en, name_zh, category_en, category_zh,
                    colors_en, colors_zh, style_tags_en, style_tags_zh,
                    occasion_en, occasion_zh, season_en, season_zh,
                    fit_en, fit_zh, features_en, features_zh,
                    material_guess, price_tier, price_twd, 
                    description_en, description_zh, ai_confidence, 
                    file_size, processed_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s
                );
                """
                
                cursor.execute(insert_sql, (
                    image_path, filename, name_en, name_zh,
                    category_info['en'], category_info['zh'],
                    json.dumps(colors_en), json.dumps(colors_zh),
                    json.dumps(style_tags_en), json.dumps(style_tags_zh),
                    json.dumps(occasions_en), json.dumps(occasions_zh),
                    json.dumps(seasons_en), json.dumps(seasons_zh),
                    item.get('fit', 'regular'), '合身',
                    json.dumps(features_en), json.dumps(features_zh),
                    item.get('material', 'mixed fabric'),
                    'mid' if price_twd >= 3500 else 'budget' if price_twd <= 2500 else 'mid',
                    price_twd,
                    description_en, description_zh, 'medium',
                    0, datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                ))
                
                count += 1
                if count % 10 == 0:
                    print(f"已導入 {count} 個商品...")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"\n成功導入 {count} 個商品到資料庫！")
        return True
        
    except FileNotFoundError:
        print("未找到 picture_tags_system.json 檔案")
        return False
    except Exception as e:
        print(f"導入錯誤: {e}")
        return False

def test_imported_data():
    """測試導入的資料"""
    DB_PARAMS = {
        'host': 'localhost',
        'port': 5432,
        'user': 'postgres',
        'password': '2616',
        'database': 'stylemate_fashion'
    }
    
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        # 商品總數
        cursor.execute("SELECT COUNT(*) FROM fashion_items;")
        total_count = cursor.fetchone()[0]
        print(f"資料庫中共有 {total_count} 個商品")
        
        # 按分類統計
        cursor.execute("""
            SELECT category_zh, COUNT(*) 
            FROM fashion_items 
            GROUP BY category_zh 
            ORDER BY COUNT(*) DESC;
        """)
        categories = cursor.fetchall()
        print("商品分類統計:")
        for cat, count in categories:
            print(f"   {cat}: {count}個")
        
        # 價格範圍
        cursor.execute("SELECT MIN(price_twd), MAX(price_twd), AVG(price_twd) FROM fashion_items WHERE price_twd IS NOT NULL;")
        min_price, max_price, avg_price = cursor.fetchone()
        if min_price:
            print(f"價格範圍: ${min_price:,} - ${max_price:,} (平均: ${int(avg_price):,})")
        
        # 隨機顯示3個商品樣例
        cursor.execute("""
            SELECT name_zh, category_zh, price_twd 
            FROM fashion_items 
            ORDER BY RANDOM() 
            LIMIT 3;
        """)
        samples = cursor.fetchall()
        print("商品樣例:")
        for name, cat, price in samples:
            print(f"   {name} ({cat}) - ${price:,}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"測試錯誤: {e}")

if __name__ == "__main__":
    print("開始導入71個商品到資料庫")
    print("=" * 50)
    
    if import_picture_catalog():
        print("\n測試導入結果...")
        test_imported_data()
        print("\n導入完成！現在你的推薦系統有71個商品可選擇！")
    else:
        print("\n導入失敗")