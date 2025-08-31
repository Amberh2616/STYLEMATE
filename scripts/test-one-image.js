#!/usr/bin/env node

import fs from 'fs';
import OpenAI from 'openai';

console.log('🧪 測試單張圖片 AI 分析');

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY || 'your-openai-api-key-here'
});

const VISION_ANALYSIS_PROMPT = `
請分析這張時尚服飾圖片：

**要求**：
- 顏色必須精確（深藍色、黑色、白色等）
- 款式必須詳細（圓領短袖T恤、高腰牛仔短褲等）  
- 中英文必須對應

回傳 JSON 格式：
{
  "category": "dress/top/bottom/outer/set",
  "name_zh": "精確中文商品名",
  "name_en": "精確英文商品名",
  "colors_zh": ["主色", "次色"],
  "confidence": "high/medium/low"
}
`;

async function testImage() {
  const imagePath = 'C:/Users/AMBER/Desktop/STYLEMATE/picture/TOP/LINE_ALBUM__250808_78.jpg';
  
  console.log(`🔍 分析圖片: ${imagePath}`);
  
  if (!fs.existsSync(imagePath)) {
    console.log('❌ 圖片不存在');
    return;
  }
  
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log('📤 發送到 OpenAI...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: VISION_ANALYSIS_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 800
    });

    console.log('✅ 收到回應:');
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  }
}

testImage();