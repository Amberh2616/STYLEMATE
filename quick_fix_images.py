#!/usr/bin/env python3
import psycopg2
from datetime import datetime

# 修復特定產品的圖片映射
def fix_specific_products():
    try:
        # 連接資料庫
        conn = psycopg2.connect(
            host='localhost',
            port=5432,
            user='postgres',
            password='2616',
            database='stylemate_fashion'
        )
        cursor = conn.cursor()
        
        # 更新產品 ID 44 和 45 的圖片
        updates = [
            (44, 'LINE_ALBUM__250808_82.jpg'),
            (45, 'LINE_ALBUM__250808_83.jpg')
        ]
        
        for product_id, new_filename in updates:
            cursor.execute("""
                UPDATE fashion_items 
                SET filename = %s, 
                    image_path = %s,
                    updated_at = %s
                WHERE id = %s
            """, (new_filename, new_filename, datetime.now(), product_id))
            
            print(f"Fixed product {product_id}: {new_filename}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("Fix completed!")
        return True
        
    except Exception as e:
        print(f"Fix failed: {e}")
        return False

if __name__ == "__main__":
    fix_specific_products()