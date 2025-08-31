#!/usr/bin/env node
/**
 * 測試嚴格讀圖系統 - 驗證AI識別精確度
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY || 'your-openai-api-key-here'
});

// 超級嚴格AI視覺分析 Prompt - 款式顏色中英文精確版
const STRICT_VISION_PROMPT = `
作為專業時尚商品分析師，請極度仔細地分析這張圖片中的服裝。

**🔍 MANDATORY 完整掃描程序**：
1. **從上到下掃描整張圖片** - 不得遺漏任何區域
2. **仔細觀察上半身** - 頭部、肩膀、手臂、胸部、腰部
3. **仔細觀察下半身** - 臀部、大腿、膝蓋、小腿、腳部
4. **識別所有可見的服裝件數** - 是1件還是2件還是更多件？

**🎨 顏色識別 - 必須極度精確**：
- 黑色 (black) / 白色 (white) / 灰色 (gray) / 深灰色 (dark gray)
- 深藍色 (navy blue) / 淺藍色 (light blue) / 牛仔藍 (denim blue)
- 粉色 (pink) / 淡粉色 (light pink) / 玫瑰粉 (rose pink)
- 米色 (beige) / 卡其色 (khaki) / 奶油色 (cream)

**👗 款式識別 - 必須準確描述**：
袖子：無袖 (sleeveless) / 短袖 (short sleeve) / 長袖 (long sleeve) / 泡泡袖 (puff sleeve)
領口：圓領 (crew neck) / V領 (V-neck) / 方領 (square neck) / 一字領 (off-shoulder)

**❌ 絕對禁止**：
- 不得使用模糊詞彙如"深色"、"淺色"、"亮色"
- 中英文必須完全對應，不得有翻譯錯誤
- 不得只看圖片上半部分就下結論

**✅ 強制要求**：
- 顏色必須具體：不是"藍色"而是"深藍色"或"淺藍色"
- 款式必須詳細：不是"上衣"而是"圓領短袖T恤"
- 中英文必須精確對應：
  - 圓領短袖T恤 = Round Neck Short Sleeve T-Shirt
  - 高腰牛仔短褲 = High Waist Denim Shorts
  - 方領泡泡袖上衣 = Square Neck Puff Sleeve Top

回傳精確的 JSON 格式：
{
  "category": "dress/top/bottom/outer/set",
  "name_zh": "精確的中文商品名（包含關鍵特徵）",
  "name_en": "精確的英文商品名",
  "description_zh": "詳細描述實際看到的服裝特徵",
  "colors_zh": ["主色", "次色"],
  "style_tags_zh": ["風格特徵", "設計元素"],
  "material_guess": "基於視覺線索判斷的材質",
  "confidence": "high/medium/low",
  "analysis_notes": "分析過程的關鍵觀察點"
}
`;

/**
 * 測試特定圖片的AI識別
 */
async function testImageAnalysis(imagePath, expectedCategory = null) {
  try {
    console.log(`\n🔍 測試圖片: ${path.basename(imagePath)}`);
    console.log(`📂 完整路徑: ${imagePath}`);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`❌ 圖片不存在: ${imagePath}`);
      return null;
    }
    
    // 讀取圖片並轉為 base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log(`📤 發送到 GPT-4V 進行嚴格分析...`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: STRICT_VISION_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1  // 降低隨機性，提高一致性
    });

    const content = response.choices[0].message.content;
    console.log(`📝 AI 原始回應:`);
    console.log(content);
    
    // 解析 JSON 回應
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      
      console.log(`\n✨ 解析結果:`);
      console.log(`🏷️  類別: ${analysis.category}`);
      console.log(`📋 名稱: ${analysis.name_zh} / ${analysis.name_en}`);
      console.log(`🎨 顏色: ${analysis.colors_zh?.join(', ') || '未指定'}`);
      console.log(`🏷️  風格: ${analysis.style_tags_zh?.join(', ') || '未指定'}`);
      console.log(`🔍 信心度: ${analysis.confidence}`);
      console.log(`📝 描述: ${analysis.description_zh}`);
      
      if (analysis.analysis_notes) {
        console.log(`💡 分析筆記: ${analysis.analysis_notes}`);
      }
      
      // 如果有預期類別，進行驗證
      if (expectedCategory) {
        const isCorrect = analysis.category === expectedCategory;
        console.log(`\n${isCorrect ? '✅' : '❌'} 預期類別: ${expectedCategory}, 實際識別: ${analysis.category}`);
      }
      
      return analysis;
    } else {
      throw new Error('無法解析 AI 回應為 JSON');
    }
    
  } catch (error) {
    console.error(`💥 分析失敗:`, error);
    return null;
  }
}

/**
 * 主測試程序
 */
async function main() {
  console.log('🧪 嚴格讀圖系統測試開始');
  console.log('==========================================');
  
  // 測試圖片列表 - 修正預期值
  const testImages = [
    {
      path: 'C:/Users/AMBER/Desktop/STYLEMATE/picture/TOP/LINE_ALBUM__250808_78.jpg',
      expected: 'top',
      description: 'DAMASCUSY印花T恤 - 應識別為純上衣'
    },
    {
      path: 'C:/Users/AMBER/Desktop/STYLEMATE/picture/TOP/LINE_ALBUM__250808_79.jpg',
      expected: 'set',
      description: '黑上衣+米色裙子套裝 - 必須識別為兩件式套裝'
    },
    {
      path: 'C:/Users/AMBER/Desktop/STYLEMATE/picture/PANTS/shorts/LINE_ALBUM_🪸七月 · 各種褲子、褲裙🪸_250808_34.jpg',
      expected: 'set',
      description: 'T恤+短褲完整穿搭 - 應識別為套裝'
    }
  ];
  
  let passCount = 0;
  let totalCount = testImages.length;
  
  for (const testImage of testImages) {
    console.log(`\n📝 測試說明: ${testImage.description}`);
    
    const result = await testImageAnalysis(testImage.path, testImage.expected);
    
    if (result && result.category === testImage.expected) {
      passCount++;
      console.log(`🎉 測試通過！`);
    } else if (result) {
      console.log(`⚠️  測試未通過 - 需要調整識別邏輯`);
    } else {
      console.log(`💥 測試失敗 - AI無法分析`);
    }
    
    // API 限制間隔
    console.log(`⏱️  等待 3 秒...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log('\n🏁 測試完成');
  console.log('==========================================');
  console.log(`✅ 通過: ${passCount}/${totalCount}`);
  console.log(`📊 準確率: ${Math.round(passCount / totalCount * 100)}%`);
  
  if (passCount === totalCount) {
    console.log(`🎉 所有測試通過！嚴格讀圖系統準備就緒`);
  } else {
    console.log(`⚠️  需要進一步調整 AI 提示詞以提高精確度`);
  }
}

// 執行測試
main().catch(console.error);