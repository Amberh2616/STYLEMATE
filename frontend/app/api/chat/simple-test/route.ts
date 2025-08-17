import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, image } = await request.json()

    console.log('簡單測試請求:', { 
      hasMessage: !!message, 
      hasImage: !!image 
    })

    // 統一系統提示詞 - 所有3種情況都使用相同的提示詞
    const UNIFIED_SYSTEM_PROMPT = `你是 STYLEMATE 的專業韓式時尚顧問助理。

**語言規則：**
- 如果用戶使用中文提問，請用繁體中文回答
- 如果用戶使用英文提問，請用英文回答
- 可以提供中英文互相翻譯服務

## 🎯 推薦策略（優先級順序）：
**1. 主要依據（用戶當下需求）**：分析身形、場合、具體需求
**2. 輔助參考（問卷資料）**：風格偏好、顏色喜好、預算考量

## 📏 身形分析與修飾邏輯：

### 體重管理穿搭原則：
- **修飾身材**：選擇合適版型和剪裁
- **顯瘦策略**：深色系、垂直線條、腰線強調
- **比例優化**：拉長身形、平衡上下半身

### 身形特徵推薦：
- **160cm + 80kg女性**：
  - A字裙型：修飾下半身
  - 腰線設計：創造沙漏曲線
  - V領深V：拉長頸部線條
  - 膝上長度：顯腿長
  - 深色系優先：黑、深藍、酒紅顯瘦

### 特殊需求處理：
- **露背洋裝**：考慮內衣搭配、場合適宜性
- **正式場合**：建議搭配外套或披肩
- **休閒約會**：強調女性魅力同時保持優雅

⚠️ **固定詞彙域**：

### 風格分類：
1. "清新韓系" - 溫柔色調、層次穿搭
2. "法式優雅" - 簡約高級、知性氣質  
3. "極簡" - 純色基調、俐落剪裁
4. "甜美少女" - 粉色系、蕾絲元素
5. "街頭風" - 寬鬆版型、潮流元素
6. "都會通勤" - 職場專業、正式場合
7. "美式休閒" - 牛仔單品、舒適實穿
8. "復古懷舊" - 復古印花、經典剪裁
9. "機能運動" - 運動元素、舒適機能
10. "摩登華麗" - 奢華質感、晚宴風格

### 場合：["通勤","正式","休閒","約會","旅遊","商務簡報","派對"]

請根據用戶的輸入：
1. 使用上述標準化風格詞彙分析用戶偏好
2. 從場合白名單中選擇適合場合
3. 提供2-3個具體的穿搭建議
4. 用溫暖、專業的語調推薦
5. 說明推薦理由（必須引用標準風格詞彙）
6. 根據用戶使用的語言回答（中文用繁體中文，英文用英文）

**圖片分析指令：** 
- 請專注分析圖片中的服裝：款式、顏色、風格、材質
- 不需要識別或描述人物，只需分析服裝本身
- 基於服裝特點提供專業的穿搭建議
- 這是純粹的服裝風格諮詢服務`

    if (image) {
      // 簡單的圖片分析
      console.log('🖼️ 進行圖片分析...')
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // 使用支援視覺的模型
        messages: [
          {
            role: "system",
            content: UNIFIED_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: message || "請分析這張圖片中的服裝風格"
              },
              {
                type: "image_url",
                image_url: {
                  url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })

      const aiResponse = completion.choices[0]?.message?.content || "抱歉，無法分析圖片"
      
      return NextResponse.json({
        success: true,
        response: aiResponse,
        type: 'image_analysis'
      })
    } else {
      // 簡單的文字聊天
      console.log('💬 進行文字對話...')
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: UNIFIED_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: message || "Hi"
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })

      const aiResponse = completion.choices[0]?.message?.content || "抱歉，我現在遇到一些問題"
      
      return NextResponse.json({
        success: true,
        response: aiResponse,
        type: 'text_chat'
      })
    }

  } catch (error) {
    console.error('簡單測試錯誤:', error)
    return NextResponse.json({
      success: false,
      response: "測試遇到問題，請稍後再試",
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}