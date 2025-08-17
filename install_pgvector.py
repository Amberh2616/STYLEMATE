#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
安裝 pgvector 擴展
"""

import psycopg2
import subprocess
import os

def install_pgvector():
    """安裝 pgvector 擴展"""
    print("安裝 pgvector 擴展...")
    
    # 方法1: 嘗試直接在資料庫中創建擴展
    DB_PARAMS = {
        'host': 'localhost',
        'port': 5432,
        'user': 'postgres',
        'password': '2616'
    }
    
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        # 測試 PostgreSQL 連接
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"✅ PostgreSQL 連接成功: {version[0][:50]}...")
        
        # 檢查是否已有 pgvector
        cursor.execute("SELECT * FROM pg_available_extensions WHERE name = 'vector';")
        result = cursor.fetchone()
        
        if result:
            print("✅ pgvector 擴展已可用")
        else:
            print("❌ pgvector 擴展未安裝")
            print("\n需要手動安裝 pgvector:")
            print("1. 下載預編譯版本:")
            print("   https://github.com/pgvector/pgvector/releases")
            print("2. 或使用 Docker 版本的 PostgreSQL")
            print("3. 或編譯源碼安裝")
        
        cursor.close()
        conn.close()
        
        return result is not None
        
    except psycopg2.Error as e:
        print(f"❌ 資料庫連接錯誤: {e}")
        return False
    except Exception as e:
        print(f"❌ 其他錯誤: {e}")
        return False

def create_test_database():
    """創建測試資料庫，即使沒有 pgvector 也能工作"""
    DB_PARAMS = {
        'host': 'localhost',
        'port': 5432,
        'user': 'postgres',
        'password': '2616'
    }
    
    try:
        # 連接到 PostgreSQL
        conn = psycopg2.connect(**DB_PARAMS)
        conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # 檢查資料庫是否存在
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'stylemate_fashion';")
        exists = cursor.fetchone()
        
        if not exists:
            # 創建資料庫
            cursor.execute("CREATE DATABASE stylemate_fashion;")
            print("✅ 資料庫 'stylemate_fashion' 創建成功")
        else:
            print("✅ 資料庫 'stylemate_fashion' 已存在")
        
        cursor.close()
        conn.close()
        
        # 連接到新資料庫
        DB_PARAMS['database'] = 'stylemate_fashion'
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        # 嘗試創建 pgvector 擴展
        try:
            cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
            conn.commit()
            print("✅ pgvector 擴展創建成功")
            return True
        except psycopg2.Error as e:
            print(f"⚠️  pgvector 擴展創建失敗: {e}")
            print("繼續創建基礎表結構...")
            conn.rollback()
            return False
        
    except Exception as e:
        print(f"❌ 錯誤: {e}")
        return False

if __name__ == "__main__":
    print("檢查 pgvector 擴展...")
    print("="*50)
    
    # 檢查 pgvector 可用性
    pgvector_available = install_pgvector()
    
    print("\n創建基礎資料庫...")
    print("="*50)
    
    # 創建資料庫
    create_test_database()
    
    if not pgvector_available:
        print("\n" + "="*60)
        print("⚠️  pgvector 未安裝，但可以先繼續開發")
        print("建議:")
        print("1. 使用 Docker 版本的 PostgreSQL + pgvector")
        print("2. 或下載預編譯的 pgvector:")
        print("   https://github.com/pgvector/pgvector/releases")
        print("3. 暫時可以不用向量搜尋，先開發其他功能")
        print("="*60)