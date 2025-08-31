#!/usr/bin/env node
/**
 * AI 圖片重新標籤系統
 * 使用 GPT-4V 嚴格辨識圖片內容，重新生成正確標籤
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { Pool } from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY || 'your-openai-api-key-here'
});

// 資料庫連接
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'stylemate_fashion',
  user: 'postgres',
  password: '2616',
  max: 10,
  idleTimeoutMillis: 30000,
});

// 圖片資料夾路徑
const PICTURE_BASE_PATH = path.join(__dirname, '../picture');

// AI 視覺分析 Prompt - 超級嚴格模式
const VISION_ANALYSIS_PROMPT = `
作為專業時尚商品分析師，請極度仔細地分析這張圖片中的服裝。

**🔍 MANDATORY 完整掃描程序**：
1. **從上到下掃描整張圖片** - 不得遺漏任何區域
2. **仔細觀察上半身** - 頭部、肩膀、手臂、胸部、腰部
3. **仔細觀察下半身** - 臀部、大腿、膝蓋、小腿、腳部
4. **識別所有可見的服裝件數** - 是1件還是2件還是更多件？

**🔍 CRITICAL 識別規則**：

1. **連身洋裝 (dress) vs 套裝 (set) 嚴格區分**：
   - dress: 單一件連身服裝，從肩膀到裙襬是連續一體的布料
   - set: 明顯分為上衣+下裝兩個獨立服裝件，可能有不同顏色或材質
   - top: 純上衣（只有上半身服裝，下半身不在討論範圍）
   - bottom: 純下裝（只有裙子、短褲、長褲）
   - outer: 外套、夾克、開衫

**🎨 顏色識別 - 必須極度精確**：
- 黑色 (black) / 白色 (white) / 灰色 (gray)
- 深藍色 (navy) / 淺藍色 (light blue) / 牛仔藍 (denim blue)
- 粉色 (pink) / 淡粉色 (light pink) / 玫瑰粉 (rose pink)
- 米色 (beige) / 卡其色 (khaki) / 奶油色 (cream)
- 紅色 (red) / 酒紅色 (burgundy) / 橘色 (orange)
- 綠色 (green) / 軍綠色 (olive green) / 薄荷綠 (mint green)
- 棕色 (brown) / 焦糖色 (caramel) / 咖啡色 (coffee)
- 紫色 (purple) / 薰衣草紫 (lavender) / 深紫色 (deep purple)

**👗 款式識別 - 必須準確描述**：
袖子款式：
- 無袖 (sleeveless) / 短袖 (short sleeve) / 長袖 (long sleeve)
- 七分袖 (3/4 sleeve) / 泡泡袖 (puff sleeve) / 燈籠袖 (lantern sleeve)
- 喇叭袖 (bell sleeve) / 蝙蝠袖 (batwing sleeve)

領口款式：
- 圓領 (crew neck) / V領 (V-neck) / 高領 (turtleneck)
- 一字領 (off-shoulder) / 方領 (square neck) / 船領 (boat neck)
- 立領 (mandarin collar) / 翻領 (lapel collar)

**📏 長度與版型**：
- 短版 (cropped) / 標準版 (regular) / 中長版 (midi) / 長版 (long)
- 合身 (fitted) / 修身 (slim) / 寬鬆 (loose) / 直筒 (straight)

**❌ 絕對禁止**：
- 不得使用模糊詞彙如"深色"、"淺色"、"亮色"
- 不得只看圖片上半部分就下結論
- 不得忽略下半身的服裝
- 中英文必須完全對應，不得有翻譯錯誤
- **🚨 關鍵禁止：如果圖片中同時看到上衣和下裝，絕對不能標記為單品**

**🔥 SET 分類強制規則**：
- 如果圖片顯示完整穿搭（上衣+下裝都可見），必須標記為 "set"
- 如果看到上衣+褲子組合，必須是 "set"
- 如果看到上衣+裙子組合，必須是 "set"
- 如果看到任何兩件式搭配，必須是 "set"
- **只有圖片中只顯示單一服裝件時，才能標記為 top/bottom/dress/outer**

**✅ 強制要求**：
- 顏色必須具體：不是"藍色"而是"深藍色"或"淺藍色"
- 款式必須詳細：不是"上衣"而是"圓領短袖T恤"
- 中英文必須精確對應：
  - 圓領短袖T恤 = Round Neck Short Sleeve T-Shirt
  - 高腰寬鬆牛仔短褲 = High Waist Loose Denim Shorts
  - 方領泡泡袖上衣 = Square Neck Puff Sleeve Top
- **如果看到完整穿搭，商品名必須描述整套搭配**：
  - 黑色方領上衣搭配米色寬鬆褲 = Black Square Neck Top with Beige Loose Pants

回傳精確的 JSON 格式：
{
  "category": "dress/top/bottom/outer/set",
  "name_zh": "【精確中文商品名，包含顏色+款式+特徵】",
  "name_en": "【精確英文商品名，完全對應中文】",
  "description_zh": "詳細描述所有可見服裝特徵，包含顏色、款式、版型",
  "description_en": "Complete English description matching Chinese exactly",
  "colors_zh": ["精確主色名稱", "精確次色名稱"],
  "colors_en": ["exact_primary_color", "exact_secondary_color"],
  "style_tags_zh": ["具體風格特徵", "具體設計元素"],
  "style_tags_en": ["specific_style_feature", "specific_design_element"],
  "occasion_zh": ["適用場合"],
  "occasion_en": ["suitable_occasion"],
  "material_guess": "基於視覺線索的精確材質判斷",
  "garment_details": {
    "sleeve": "具體袖型名稱",
    "collar": "具體領型名稱", 
    "length": "具體長度描述",
    "fit": "具體版型描述"
  },
  "confidence": "high/medium/low",
  "analysis_notes": "說明為什麼選擇此分類，以及關鍵識別特徵"
}
`;

/**
 * 使用 GPT-4V 分析圖片
 */
async function analyzeImageWithAI(imagePath) {
  try {
    console.log(`🔍 分析圖片: ${path.basename(imagePath)}`);
    
    // 讀取圖片並轉為 base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
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
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    console.log(`📝 AI 分析結果: ${content.substring(0, 100)}...`);
    
    // 解析 JSON 回應
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('無法解析 AI 回應為 JSON');
    }
    
  } catch (error) {
    console.error(`❌ 圖片分析失敗 ${imagePath}:`, error);
    return null;
  }
}

/**
 * 掃描所有圖片檔案
 */
function scanAllImages() {
  const images = [];
  const folders = ['DRESS', 'TOP', 'PANTS', 'jacket'];
  
  folders.forEach(folder => {
    const folderPath = path.join(PICTURE_BASE_PATH, folder);
    if (fs.existsSync(folderPath)) {
      scanFolder(folderPath, images, folder);
    }
  });
  
  return images;
}

function scanFolder(folderPath, images, category) {
  const items = fs.readdirSync(folderPath);
  
  items.forEach(item => {
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // 遞迴掃描子資料夾
      scanFolder(itemPath, images, category);
    } else if (isImageFile(item)) {
      // 計算相對路徑（從 picture/ 開始）
      const relativePath = path.relative(PICTURE_BASE_PATH, itemPath).replace(/\\/g, '/');
      images.push({
        fullPath: itemPath,
        relativePath: relativePath,
        filename: item,
        originalCategory: category
      });
    }
  });
}

function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

/**
 * 清除資料庫現有標籤
 */
async function clearExistingTags() {
  console.log('🗑️  清除資料庫現有標籤...');
  
  const client = await pool.connect();
  try {
    // 刪除現有資料
    await client.query('DELETE FROM fashion_items');
    console.log('✅ 已清除所有現有標籤');
  } catch (error) {
    console.error('❌ 清除標籤失敗:', error);
  } finally {
    client.release();
  }
}

/**
 * 插入新的標籤到資料庫
 */
async function insertNewTags(imageData, analysisResult) {
  const client = await pool.connect();
  
  try {
    const insertQuery = `
      INSERT INTO fashion_items (
        image_path, filename, name_zh, name_en, category_zh, category_en,
        colors_zh, colors_en, style_tags_zh, style_tags_en,
        occasion_zh, occasion_en, description_zh, description_en,
        material_guess, ai_confidence, price_twd, price_tier,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
    `;
    
    // 價格計算邏輯
    const price = calculatePrice(analysisResult.category, analysisResult.style_tags_zh);
    const priceTier = price < 2000 ? 'budget' : price < 4000 ? 'mid' : 'premium';
    
    // 類別中英對照
    const categoryMap = {
      'dress': '洋裝',
      'top': '上衣', 
      'bottom': '裙褲',
      'outer': '外套',
      'set': '套裝'
    };
    
    await client.query(insertQuery, [
      imageData.relativePath,                    // image_path
      imageData.filename,                        // filename  
      analysisResult.name_zh,                    // name_zh
      analysisResult.name_en,                    // name_en
      categoryMap[analysisResult.category] || analysisResult.category, // category_zh
      analysisResult.category,                   // category_en
      JSON.stringify(analysisResult.colors_zh || []),    // colors_zh - 轉為 JSON 字串
      JSON.stringify(analysisResult.colors_en || []),    // colors_en - 轉為 JSON 字串
      JSON.stringify(analysisResult.style_tags_zh || []), // style_tags_zh - 轉為 JSON 字串
      JSON.stringify(analysisResult.style_tags_en || []), // style_tags_en - 轉為 JSON 字串
      JSON.stringify(analysisResult.occasion_zh || []),   // occasion_zh - 轉為 JSON 字串
      JSON.stringify(analysisResult.occasion_en || []),   // occasion_en - 轉為 JSON 字串
      analysisResult.description_zh,             // description_zh
      analysisResult.description_en,             // description_en
      analysisResult.material_guess,             // material_guess
      analysisResult.confidence,                 // ai_confidence
      price,                                     // price_twd
      priceTier                                  // price_tier
    ]);
    
    console.log(`✅ 已插入: ${analysisResult.name_zh}`);
    
  } catch (error) {
    console.error('❌ 插入標籤失敗:', error);
  } finally {
    client.release();
  }
}

/**
 * 價格計算邏輯
 */
function calculatePrice(category, styleTags) {
  let basePrice = {
    'dress': 3500,
    'top': 2000,
    'bottom': 2200,
    'outer': 3800,
    'set': 4200
  }[category] || 2500;
  
  // 根據風格調整價格
  if (styleTags.includes('法式') || styleTags.includes('高級')) {
    basePrice *= 1.3;
  } else if (styleTags.includes('街頭') || styleTags.includes('休閒')) {
    basePrice *= 0.8;
  }
  
  // 隨機波動 ±15%
  const variation = (Math.random() - 0.5) * 0.3;
  basePrice = Math.round(basePrice * (1 + variation));
  
  // 價格取整到 80 的倍數
  return Math.round(basePrice / 80) * 80;
}

/**
 * 主程式
 */
async function main() {
  console.log('🚀 開始 AI 圖片重新標籤程序');
  console.log('==========================================');
  
  try {
    // 1. 掃描所有圖片
    console.log('📂 掃描圖片檔案...');
    const images = scanAllImages();
    console.log(`📊 找到 ${images.length} 張圖片`);
    
    if (images.length === 0) {
      console.log('❌ 沒有找到圖片檔案');
      return;
    }
    
    // 顯示前幾張圖片路徑
    console.log('📋 前5張圖片：');
    images.slice(0, 5).forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.relativePath}`);
    });
    
    // 2. 清除現有標籤（正式執行）
    console.log('🗑️  正式模式：清除所有現有標籤...');
    await clearExistingTags();
    
    // 3. 批量處理所有圖片
    let successCount = 0;
    let failCount = 0;
    
    console.log(`📝 正式模式：處理全部 ${images.length} 張圖片`);
    const imagesToProcess = images; // 處理所有圖片
    
    for (let i = 0; i < imagesToProcess.length; i++) {
      const image = imagesToProcess[i];
      console.log(`\n📸 處理進度: ${i + 1}/${imagesToProcess.length}`);
      
      try {
        // AI 分析圖片
        const analysis = await analyzeImageWithAI(image.fullPath);
        
        if (analysis) {
          // 插入資料庫
          await insertNewTags(image, analysis);
          successCount++;
        } else {
          failCount++;
        }
        
        // 避免 API 限制，每次請求間隔
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ 處理失敗 ${image.filename}:`, error);
        failCount++;
      }
    }
    
    console.log('\n🎉 重新標籤完成！');
    console.log('==========================================');
    console.log(`✅ 成功: ${successCount} 張`);
    console.log(`❌ 失敗: ${failCount} 張`);
    console.log(`📊 成功率: ${Math.round(successCount / imagesToProcess.length * 100)}%`);
    
  } catch (error) {
    console.error('💥 程式執行失敗:', error);
  } finally {
    await pool.end();
  }
}

// 執行主程式
console.log('🔧 檢查執行條件...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

// 直接執行主程式
main().catch(console.error);