#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
OpenAI API 成本計算器 - 韓國服裝圖片標籤處理
"""

def calculate_gpt4o_cost(num_images=500):
    """計算 GPT-4o 處理圖片的成本"""
    
    # GPT-4o 價格 (2024年8月)
    INPUT_TOKEN_PRICE = 0.005   # $0.005 per 1K input tokens
    OUTPUT_TOKEN_PRICE = 0.015  # $0.015 per 1K output tokens
    
    # 每張圖片的Token估算
    IMAGE_TOKENS = 1105  # 每張圖片約1105個token (800x800壓縮後)
    
    # 文字Prompt Token估算
    PROMPT_TOKENS = 150  # Prompt約150個token
    
    # 輸出Token估算 (基於我們的測試結果)
    OUTPUT_TOKENS = 300  # 每個回應約300個token
    
    # 總Token計算
    total_input_tokens = num_images * (IMAGE_TOKENS + PROMPT_TOKENS)
    total_output_tokens = num_images * OUTPUT_TOKENS
    
    # 成本計算
    input_cost = (total_input_tokens / 1000) * INPUT_TOKEN_PRICE
    output_cost = (total_output_tokens / 1000) * OUTPUT_TOKEN_PRICE
    total_cost_usd = input_cost + output_cost
    
    # 轉換為台幣 (假設匯率 1 USD = 31 TWD)
    total_cost_twd = total_cost_usd * 31
    
    print("=" * 60)
    print("OpenAI GPT-4o 成本估算")
    print("=" * 60)
    print(f"處理圖片數量: {num_images:,} 張")
    print()
    print("Token 使用量:")
    print(f"  圖片Token: {IMAGE_TOKENS:,} x {num_images:,} = {num_images * IMAGE_TOKENS:,}")
    print(f"  Prompt Token: {PROMPT_TOKENS:,} x {num_images:,} = {num_images * PROMPT_TOKENS:,}")
    print(f"  輸入Token總計: {total_input_tokens:,}")
    print(f"  輸出Token總計: {total_output_tokens:,}")
    print()
    print("成本計算:")
    print(f"  輸入成本: ${input_cost:.2f} USD")
    print(f"  輸出成本: ${output_cost:.2f} USD")
    print(f"  總成本: ${total_cost_usd:.2f} USD")
    print(f"  總成本: NT$ {total_cost_twd:.0f} TWD")
    print()
    print("單張圖片成本:")
    print(f"  每張: ${total_cost_usd/num_images:.4f} USD")
    print(f"  每張: NT$ {total_cost_twd/num_images:.1f} TWD")
    print("=" * 60)
    
    return {
        "total_cost_usd": total_cost_usd,
        "total_cost_twd": total_cost_twd,
        "per_image_usd": total_cost_usd/num_images,
        "per_image_twd": total_cost_twd/num_images,
        "total_input_tokens": total_input_tokens,
        "total_output_tokens": total_output_tokens
    }

def compare_scenarios():
    """比較不同數量的成本"""
    scenarios = [50, 100, 300, 500, 1000]
    
    print("\n不同數量的成本比較:")
    print("-" * 80)
    print(f"{'數量':<8} {'USD成本':<12} {'TWD成本':<12} {'每張TWD':<10} {'處理時間'}")
    print("-" * 80)
    
    for num in scenarios:
        result = calculate_gpt4o_cost(num)
        processing_time = num * 2 / 60  # 每張2秒延遲
        
        print(f"{num:<8} ${result['total_cost_usd']:<11.2f} NT${result['total_cost_twd']:<11.0f} "
              f"NT${result['per_image_twd']:<9.1f} {processing_time:.1f}小時")
    
    print("-" * 80)

def cost_optimization_tips():
    """成本優化建議"""
    print("\n成本優化建議:")
    print("=" * 50)
    print("1. 圖片壓縮:")
    print("   目前: 800x800 = 1,105 tokens")
    print("   優化: 512x512 = ~700 tokens (節省 36%)")
    print()
    print("2. 批量處理:")
    print("   每次API調用包含多張圖片")
    print("   減少API調用次數")
    print()
    print("3. 時間分散:")
    print("   避免超出API限制")
    print("   分批處理降低峰值成本")
    print()
    print("4. 智能篩選:")
    print("   先用便宜模型篩選")
    print("   只對重要圖片使用GPT-4o")

if __name__ == "__main__":
    # 主要估算：500張圖片
    main_result = calculate_gpt4o_cost(500)
    
    # 比較不同數量
    compare_scenarios()
    
    # 優化建議
    cost_optimization_tips()
    
    print(f"\n結論:")
    print(f"處理500張韓國服裝圖片預估成本：NT$ {main_result['total_cost_twd']:.0f}")
    print(f"平均每張圖片成本：NT$ {main_result['per_image_twd']:.1f}")