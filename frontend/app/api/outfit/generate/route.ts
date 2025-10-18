// frontend/app/api/outfit/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Product } from '@/lib/products';

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY || process.env.OPEN_AI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body as { products: Product[] };

    if (!products || products.length < 1 || products.length > 12) {
      return NextResponse.json(
        { success: false, error: '請選擇 1-12 件商品' },
        { status: 400 }
      );
    }

    console.log('🎨 開始生成 6 套穿搭組合，商品數量:', products.length);

    // 構建商品清單
    const productList = products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      style: p.style,
      colors: p.colors,
      occasion: p.occasion,
      season: p.season
    }));

    // 系統提示
    const systemPrompt = `你是 BE 27 的專業時尚顧問，專門負責穿搭組合規劃。

## 🎯 任務
根據用戶選擇的商品，生成 **6 套完整穿搭組合**。

## 📋 商品清單
${JSON.stringify(productList, null, 2)}

## ⚠️ 重要規則

### 1. 組合規則
- **洋裝**：可以單獨成為一套穿搭（1件）
- **上衣+下身**：必須成對出現（2件）
- **每套穿搭** = 1件洋裝 OR (1件上衣 + 1件下身)

### 2. 分類識別
- **上衣類**: category = "上衣", "襯衫", "T恤", "針織衫", "外套"
- **下身類**: category = "褲子", "裙子", "牛仔褲", "西裝褲"
- **洋裝類**: category = "洋裝", "連身裙"

### 3. 搭配原則
- 風格協調：注重整體風格一致性
- 色彩搭配：同色系或互補色
- 場合適配：根據 occasion 搭配合適的組合
- 多樣性：盡量讓6套穿搭展現不同風格

### 4. 輸出格式（必須嚴格遵守JSON格式）
\`\`\`json
{
  "looks": [
    {
      "id": 1,
      "productIds": ["商品ID"],  // 洋裝是1個ID，上下身是2個ID
      "style": "法式優雅",
      "occasion": "約會"
    },
    {
      "id": 2,
      "productIds": ["上衣ID", "下身ID"],
      "style": "休閒韓系",
      "occasion": "日常通勤"
    }
  ]
}
\`\`\`

## 💡 範例

假設商品：
- ID:1 白色襯衫（上衣）
- ID:2 黑色西裝褲（下身）
- ID:3 米色針織洋裝（洋裝）
- ID:4 藍色牛仔褲（下身）

正確輸出：
\`\`\`json
{
  "looks": [
    {
      "id": 1,
      "productIds": ["1", "2"],
      "style": "都會通勤",
      "occasion": "上班"
    },
    {
      "id": 2,
      "productIds": ["3"],
      "style": "溫柔法式",
      "occasion": "下午茶"
    },
    {
      "id": 3,
      "productIds": ["1", "4"],
      "style": "美式休閒",
      "occasion": "週末逛街"
    }
  ]
}
\`\`\`

**請根據提供的商品清單，生成6套完整穿搭組合，直接輸出JSON格式，不要有任何額外文字。**`;

    // 調用 OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: '請為我生成6套穿搭組合'
        }
      ],
      temperature: 0.8, // 增加創意性
      max_tokens: 1500,
      response_format: { type: 'json_object' } // 強制 JSON 輸出
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('AI 回應為空');
    }

    console.log('🔍 AI 原始回應:', aiResponse);

    // 解析 JSON
    const parsedResponse = JSON.parse(aiResponse);
    const looks = parsedResponse.looks;

    if (!looks || !Array.isArray(looks)) {
      throw new Error('AI 回應格式錯誤：缺少 looks 陣列');
    }

    // 驗證並轉換為完整的 Look 資料
    const validLooks = looks.slice(0, 6).map((look: any) => {
      const lookProducts = look.productIds.map((id: string) => {
        const product = products.find(p => p.id.toString() === id.toString());
        if (!product) {
          console.warn(`⚠️ 找不到商品 ID: ${id}`);
          return null;
        }
        return product;
      }).filter(Boolean);

      if (lookProducts.length === 0) {
        return null;
      }

      return {
        id: look.id,
        items: lookProducts,
        style: look.style || '時尚穿搭',
        occasion: look.occasion || '日常'
      };
    }).filter(Boolean);

    if (validLooks.length === 0) {
      throw new Error('AI 生成的穿搭組合無效');
    }

    console.log('✅ 成功生成穿搭組合:', validLooks.length, '套');

    return NextResponse.json({
      success: true,
      looks: validLooks
    });

  } catch (error: any) {
    console.error('❌ 生成穿搭組合失敗:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '生成穿搭組合時發生錯誤'
      },
      { status: 500 }
    );
  }
}
