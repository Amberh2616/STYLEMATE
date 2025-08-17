#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基礎資料庫設置（不含向量功能）
"""

import psycopg2
import json

def create_tables():
    """創建基本資料表"""
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
        
        # 創建服裝商品表（基礎版，暫無向量）
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS fashion_items (
            id SERIAL PRIMARY KEY,
            image_path TEXT NOT NULL UNIQUE,
            filename TEXT NOT NULL,
            name_en TEXT,
            name_zh TEXT,
            category_en TEXT,
            category_zh TEXT,
            colors_en JSONB,
            colors_zh JSONB,
            style_tags_en JSONB,
            style_tags_zh JSONB,
            occasion_en JSONB,
            occasion_zh JSONB,
            season_en JSONB,
            season_zh JSONB,
            fit_en TEXT,
            fit_zh TEXT,
            features_en JSONB,
            features_zh JSONB,
            material_guess TEXT,
            price_tier TEXT,
            price_krw INTEGER,
            price_twd INTEGER,
            discount_price_twd INTEGER,
            description_en TEXT,
            description_zh TEXT,
            ai_confidence TEXT,
            file_size INTEGER,
            processed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_table_sql)
        print("服裝商品表創建成功")
        
        # 創建索引
        indexes = [
            "CREATE INDEX IF NOT EXISTS idx_fashion_category ON fashion_items(category_en);",
            "CREATE INDEX IF NOT EXISTS idx_fashion_category_zh ON fashion_items(category_zh);",
            "CREATE INDEX IF NOT EXISTS idx_fashion_price ON fashion_items(price_twd);",
            "CREATE INDEX IF NOT EXISTS idx_fashion_created_at ON fashion_items(created_at);"
        ]
        
        for idx_sql in indexes:
            cursor.execute(idx_sql)
        
        print("索引創建成功")
        
        # 創建用戶搜尋記錄表
        search_table_sql = """
        CREATE TABLE IF NOT EXISTS search_logs (
            id SERIAL PRIMARY KEY,
            session_id TEXT,
            query_type TEXT,
            query_data TEXT,
            results_count INTEGER,
            search_time FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(search_table_sql)
        print("搜尋記錄表創建成功")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n資料庫設置完成!")
        return True
        
    except Exception as e:
        print(f"錯誤: {e}")
        return False

def import_existing_tags():
    """導入現有的 AI 標籤資料"""
    try:
        # 讀取現有的標籤資料
        with open('bilingual_fashion_tags.json', 'r', encoding='utf-8') as f:
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
        
        count = 0
        for image_path, item_data in data['bilingual_tags'].items():
            tags = item_data['tags']
            
            insert_sql = """
            INSERT INTO fashion_items (
                image_path, filename, name_en, name_zh, category_en, category_zh,
                colors_en, colors_zh, style_tags_en, style_tags_zh,
                occasion_en, occasion_zh, season_en, season_zh,
                fit_en, fit_zh, features_en, features_zh,
                material_guess, price_tier, description_en, description_zh,
                ai_confidence, file_size, processed_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s
            ) ON CONFLICT (image_path) DO NOTHING;
            """
            
            filename = image_path.split('\\')[-1]
            
            cursor.execute(insert_sql, (
                image_path, filename,
                tags.get('name_en'), tags.get('name_zh'),
                tags.get('category_en'), tags.get('category_zh'),
                json.dumps(tags.get('colors_en', [])),
                json.dumps(tags.get('colors_zh', [])),
                json.dumps(tags.get('style_tags_en', [])),
                json.dumps(tags.get('style_tags_zh', [])),
                json.dumps(tags.get('occasion_en', [])),
                json.dumps(tags.get('occasion_zh', [])),
                json.dumps(tags.get('season_en', [])),
                json.dumps(tags.get('season_zh', [])),
                tags.get('fit_en'), tags.get('fit_zh'),
                json.dumps(tags.get('features_en', [])),
                json.dumps(tags.get('features_zh', [])),
                tags.get('material_guess'), tags.get('price_tier'),
                tags.get('description_en'), tags.get('description_zh'),
                tags.get('ai_confidence'),
                item_data.get('file_size'),
                tags.get('processed_at')
            ))
            count += 1
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"成功導入 {count} 筆服裝資料")
        return True
        
    except FileNotFoundError:
        print("未找到 bilingual_fashion_tags.json 檔案")
        return False
    except Exception as e:
        print(f"導入錯誤: {e}")
        return False

def test_data():
    """測試資料查詢"""
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
        
        cursor.execute("SELECT COUNT(*) FROM fashion_items;")
        count = cursor.fetchone()[0]
        print(f"資料庫中有 {count} 筆服裝資料")
        
        cursor.execute("SELECT DISTINCT category_zh FROM fashion_items;")
        categories = cursor.fetchall()
        print("服裝分類:", [cat[0] for cat in categories])
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"測試錯誤: {e}")

if __name__ == "__main__":
    print("基礎資料庫設置")
    print("=" * 40)
    
    # 創建資料表
    if create_tables():
        print("\n導入現有標籤資料...")
        if import_existing_tags():
            print("\n測試資料...")
            test_data()
        
    print("\n完成!")