#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
向量資料庫設置腳本
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

def create_database():
    """創建資料庫和必要的表"""
    
    # 資料庫連接參數
    DB_PARAMS = {
        'host': 'localhost',
        'port': 5432,
        'user': 'postgres',
        'password': '2616'  # 你的密碼
    }
    
    try:
        # 連接到 PostgreSQL
        conn = psycopg2.connect(**DB_PARAMS)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # 創建資料庫
        cursor.execute("CREATE DATABASE stylemate_fashion;")
        print("✅ 資料庫 'stylemate_fashion' 創建成功")
        
        cursor.close()
        conn.close()
        
        # 連接到新資料庫
        DB_PARAMS['database'] = 'stylemate_fashion'
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        # 創建 pgvector 擴展
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        print("✅ pgvector 擴展啟用成功")
        
        # 創建服裝商品表
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
            description_en TEXT,
            description_zh TEXT,
            ai_confidence TEXT,
            embedding VECTOR(512),  -- FashionCLIP 向量維度
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(create_table_sql)
        print("✅ fashion_items 表創建成功")
        
        # 創建索引以提升查詢性能
        index_sql = [
            "CREATE INDEX IF NOT EXISTS idx_fashion_category ON fashion_items(category_en);",
            "CREATE INDEX IF NOT EXISTS idx_fashion_price ON fashion_items(price_twd);",
            "CREATE INDEX IF NOT EXISTS idx_fashion_embedding ON fashion_items USING ivfflat (embedding vector_cosine_ops);",
            "CREATE INDEX IF NOT EXISTS idx_fashion_created_at ON fashion_items(created_at);"
        ]
        
        for sql in index_sql:
            cursor.execute(sql)
        
        print("✅ 索引創建成功")
        
        # 創建用戶上傳圖片表
        user_images_sql = """
        CREATE TABLE IF NOT EXISTS user_images (
            id SERIAL PRIMARY KEY,
            session_id TEXT NOT NULL,
            image_path TEXT NOT NULL,
            embedding VECTOR(512),
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(user_images_sql)
        print("✅ user_images 表創建成功")
        
        # 創建搜尋記錄表
        search_logs_sql = """
        CREATE TABLE IF NOT EXISTS search_logs (
            id SERIAL PRIMARY KEY,
            session_id TEXT,
            query_type TEXT,  -- 'image' or 'text'
            query_data TEXT,
            results_count INTEGER,
            search_time FLOAT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        cursor.execute(search_logs_sql)
        print("✅ search_logs 表創建成功")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("🎉 向量資料庫設置完成！")
        print("="*60)
        print("資料庫名稱: stylemate_fashion")
        print("主要資料表:")
        print("  - fashion_items: 服裝商品和向量")
        print("  - user_images: 用戶上傳圖片")
        print("  - search_logs: 搜尋記錄")
        print("="*60)
        
    except psycopg2.Error as e:
        print(f"❌ 資料庫錯誤: {e}")
        if "already exists" in str(e):
            print("💡 資料庫可能已存在，繼續下一步...")
            return True
        return False
    except Exception as e:
        print(f"❌ 其他錯誤: {e}")
        return False

def test_connection():
    """測試資料庫連接"""
    DB_PARAMS = {
        'host': 'localhost',
        'port': 5432,
        'user': 'postgres',
        'password': '2616',  # 你的密碼
        'database': 'stylemate_fashion'
    }
    
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ PostgreSQL 版本: {version[0]}")
        
        cursor.execute("SELECT COUNT(*) FROM fashion_items;")
        count = cursor.fetchone()
        print(f"✅ fashion_items 資料表記錄數: {count[0]}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ 連接測試失敗: {e}")
        return False

if __name__ == "__main__":
    print("開始設置向量資料庫...")
    print("="*60)
    
    # 檢查 psycopg2 是否安裝
    try:
        import psycopg2
        print("✅ psycopg2 已安裝")
    except ImportError:
        print("❌ 請先安裝 psycopg2:")
        print("   pip install psycopg2-binary")
        exit(1)
    
    print("\n請確保:")
    print("1. PostgreSQL 已安裝並運行")
    print("2. pgvector 擴展已安裝")
    print("3. 修改了腳本中的資料庫密碼")
    print()
    
    confirm = input("是否繼續? (y/n): ")
    if confirm.lower() != 'y':
        print("取消設置")
        exit(0)
    
    # 創建資料庫和表
    if create_database():
        print("\n測試連接...")
        test_connection()
    else:
        print("設置失敗，請檢查 PostgreSQL 服務和配置")