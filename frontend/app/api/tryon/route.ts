import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { personImageUrl, garmentImageUrl } = await req.json();

  const backend = process.env.TRYON_BACKEND || "hf_space";
  
  try {
    if (backend === "gemini") {
      console.log('🎯 使用 Gemini 後端進行虛擬試穿');
      const url = await tryonViaGemini(personImageUrl, garmentImageUrl);
      console.log('🎉 Gemini 虛擬試穿完成，返回結果');
      return NextResponse.json({ 
        url,
        backend: 'gemini',
        message: 'Gemini 2.5 Flash Image Preview 處理完成'
      });
    } else if (backend === "hf_space") {
      console.log('🎯 使用 HF Space 後端進行虛擬試穿');
      const url = await tryonViaHF(personImageUrl, garmentImageUrl);
      console.log('🎉 HF Space 虛擬試穿完成，返回結果');
      return NextResponse.json({ 
        url,
        backend: 'hf_space',
        message: 'Hugging Face Space 處理完成'
      });
    }
    
    return NextResponse.json({ 
      success: false,
      error: "AI 虛擬試穿服務暫時不可用",
      message: "需要真正的 AI 模型，不提供疊圖功能"
    }, { status: 503 });
    
  } catch (e) {
    console.error('🚨 API 路由錯誤:', e);
    
    // 如果 Gemini 失敗，自動切換到 HF Space 作為備援
    if (backend === "gemini") {
      console.log('🔄 Gemini 失敗，切換至 HF Space 備援...');
      console.log('💥 Gemini 失敗原因:', String(e));
      
      // 分析失敗類型
      if (String(e).includes('429') || String(e).includes('quota')) {
        console.log('📊 失敗類型: API 配額或頻率限制');
      } else if (String(e).includes('403') || String(e).includes('permission')) {
        console.log('📊 失敗類型: API 權限問題');
      } else if (String(e).includes('timeout')) {
        console.log('📊 失敗類型: 請求超時');
      } else {
        console.log('📊 失敗類型: 其他網絡或服務錯誤');
      }
      
      try {
        console.log('🔄 開始 HF Space 備援處理...');
        const fallbackUrl = await tryonViaHF(personImageUrl, garmentImageUrl);
        console.log('✅ HF Space 備援成功！');
        return NextResponse.json({ 
          url: fallbackUrl,
          backend: 'hf_space_fallback',
          message: "Gemini 暫時不可用，已使用 HF Space 備援成功處理"
        });
      } catch (fallbackError) {
        console.error('💥 HF Space 備援也失敗:', fallbackError);
        return NextResponse.json({ 
          success: false,
          error: "虛擬試穿失敗: Gemini 和 HF Space 都不可用",
          message: "主要服務和備援服務都暫時不可用，請稍後再試"
        }, { status: 503 });
      }
    }
    
    return NextResponse.json({ 
      success: false,
      error: "AI 虛擬試穿失敗: " + String(e),
      message: "服務暫時不可用，請稍後再試"
    }, { status: 503 });
  }
}

/** Google Gemini API 虛擬試穿 */
async function tryonViaGemini(personUrl: string, clothUrl: string): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiApiKey || geminiApiKey === 'your-gemini-api-key-here') {
    throw new Error('Gemini API Key 未設定');
  }

  try {
    console.log('🤖 使用 Gemini API 進行虛擬試穿...');
    
    // 準備圖片數據
    const personImageData = await prepareImageForGemini(personUrl);
    const garmentImageData = await prepareImageForGemini(clothUrl);
    
    const prompt = `You are a professional virtual try-on AI. Replace the person's current clothing with the new clothing item from the second image.

CRITICAL INSTRUCTIONS:
- REMOVE the person's existing clothing completely
- REPLACE it with ONLY the clothing item from the second image
- DO NOT layer or overlay clothing - completely substitute the original clothing
- The person should appear to be naturally wearing ONLY the new clothing item
- Maintain person's exact pose, face, hair, skin tone, and background unchanged
- Ensure the new clothing fits naturally with proper sizing, proportions, and realistic draping
- Apply realistic lighting, shadows, and fabric textures
- Generate in high resolution with professional photography quality

IMPORTANT: This is clothing replacement, not clothing layering. The result should show the person wearing ONLY the new clothing item, as if they had changed clothes completely.`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: personImageData.mimeType,
                data: personImageData.base64Data
              }
            },
            {
              inline_data: {
                mime_type: garmentImageData.mimeType,
                data: garmentImageData.base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 16,
        topP: 0.8,
        maxOutputTokens: 8192
      }
    };

    console.log('📤 發送請求到 Gemini API...');
    
    // 使用帶重試機制的單一模型請求，提高穩定性
    const model = 'gemini-2.5-flash-image-preview';
    const maxRetries = 3;
    const baseDelay = 1000; // 1秒基礎延遲
    
    let response;
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 第 ${attempt}/${maxRetries} 次嘗試 ${model}...`);
        
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': geminiApiKey,
            },
            body: JSON.stringify(requestBody),
            // 增加請求超時設定
            signal: AbortSignal.timeout(30000) // 30秒超時
          }
        );
        
        if (response.ok) {
          console.log(`✅ 第 ${attempt} 次嘗試成功！`);
          break;
        } else {
          const errorText = await response.text();
          console.log(`❌ 第 ${attempt} 次失敗: ${response.status} ${response.statusText}`);
          console.log(`💥 錯誤詳情: ${errorText}`);
          
          // 詳細的錯誤分析
          if (response.status === 429) {
            console.log('🚫 API 配額超限或請求過於頻繁');
          } else if (response.status === 503) {
            console.log('🚫 Gemini 服務暫時不可用'); 
          } else if (response.status === 400) {
            console.log('🚫 請求格式錯誤');
          } else if (response.status === 403) {
            console.log('🚫 API 密鑰權限問題');
          } else {
            console.log(`🚫 未知錯誤: ${response.status}`);
          }
          
          lastError = new Error(`API 錯誤 ${response.status}: ${errorText}`);
          
          // 如果是 429 (quota exceeded) 或 503 (service unavailable)，延遲重試
          if ((response.status === 429 || response.status === 503) && attempt < maxRetries) {
            const delay = baseDelay * Math.pow(2, attempt - 1); // 指數退避
            console.log(`⏳ 延遲 ${delay}ms 後重試...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else if (attempt < maxRetries) {
            // 其他錯誤也稍作延遲
            const delay = 1000;
            console.log(`⏳ 稍作延遲 ${delay}ms 後重試...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
      } catch (error) {
        console.log(`❌ 第 ${attempt} 次異常:`, error.message);
        lastError = error;
        
        // 網路錯誤也進行延遲重試
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ 網路錯誤，延遲 ${delay}ms 後重試...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error(`${model} 在 ${maxRetries} 次嘗試後仍然失敗`);
    }

    const result = await response.json();
    console.log('✅ Gemini API 回應成功');

    // 解析 Gemini 2.5 Flash Image Preview 的回應
    console.log('🔍 解析 Gemini 圖片生成回應...');
    
    // 首先檢查是否有錯誤
    if (result.error) {
      console.error('❌ Gemini API 返回錯誤:', result.error);
      throw new Error(`Gemini API 錯誤: ${result.error.message || JSON.stringify(result.error)}`);
    }
    
    if (result.candidates && result.candidates[0]) {
      const candidate = result.candidates[0];
      console.log('🔍 檢查候選回應結構');
      
      // 檢查 finishReason 以了解生成狀況
      if (candidate.finishReason) {
        console.log('🏁 完成原因:', candidate.finishReason);
        
        // 如果因為安全過濾被阻擋
        if (candidate.finishReason === 'SAFETY') {
          throw new Error('內容被安全過濾系統阻擋，請嘗試上傳不同的照片或商品圖片');
        }
        
        // 如果因為其他原因停止
        if (candidate.finishReason === 'OTHER' || candidate.finishReason === 'RECITATION') {
          throw new Error(`內容生成被系統停止: ${candidate.finishReason}`);
        }
        
        // 只有 STOP 才是正常完成
        if (candidate.finishReason !== 'STOP') {
          console.log(`⚠️ 非正常完成狀態: ${candidate.finishReason}`);
        }
      }
      
      const content = candidate.content;
      
      // 檢查是否有生成的圖片數據
      if (content && content.parts) {
        console.log('🔍 檢查內容部分，共', content.parts.length, '個部分');
        
        // 更簡潔但更穩定的圖片解析邏輯
        for (let i = 0; i < content.parts.length; i++) {
          const part = content.parts[i];
          console.log(`🔍 部分 ${i}: ${Object.keys(part).join(', ')}`);
          
          // 使用統一的圖片提取函數
          const imageData = extractImageFromPart(part);
          if (imageData) {
            console.log(`✅ 在部分 ${i} 找到圖片數據`);
            return imageData;
          }
        }
        
        console.log('❌ 在 content.parts 中未找到圖片數據');
      } else {
        console.log('❌ 沒有找到 content.parts');
      }
    } else {
      console.log('❌ 沒有找到 candidates');
    }
    
    // 沒有找到圖片數據
    console.log('❌ 未找到生成的圖片數據');
    console.log('📊 可能原因: 模型不支援、安全過濾、或 API 問題');
    
    throw new Error(`Gemini 未返回圖片數據。完成原因: ${result.candidates?.[0]?.finishReason || '未知'}`);
    
  } catch (error) {
    console.error('💥 Gemini API 錯誤:', error.message || error);
    throw error;
  }
}

/** 從 API 回應部分中提取圖片數據 */
function extractImageFromPart(part: any): string | null {
  try {
    // nano-banana 模型格式 (camelCase)
    if (part.inlineData?.data) {
      const { data, mimeType = 'image/png' } = part.inlineData;
      console.log(`✅ inlineData 圖片: ${data.length} chars, ${mimeType}`);
      return `data:${mimeType};base64,${data}`;
    }
    
    // 備用格式 (snake_case)
    if (part.inline_data?.data) {
      const { data, mime_type = 'image/png' } = part.inline_data;
      console.log(`✅ inline_data 圖片: ${data.length} chars`);
      return `data:${mime_type};base64,${data}`;
    }
    
    // 文字中的 base64 圖片
    if (part.text) {
      const base64Match = part.text.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (base64Match) {
        console.log(`✅ 文字中的圖片: ${base64Match[1].length} chars`);
        return base64Match[0];
      }
    }
    
    // 其他格式
    if (part.functionCall?.args?.image) {
      console.log('✅ functionCall 圖片');
      return part.functionCall.args.image;
    }
    
    if (part.fileData) {
      console.log('✅ fileData 圖片');
      return part.fileData;
    }
    
    return null;
  } catch (error) {
    console.error('❌ 圖片解析錯誤:', error);
    return null;
  }
}

/** 準備圖片給 Gemini API */
async function prepareImageForGemini(imageUrl: string): Promise<{base64Data: string, mimeType: string}> {
  try {
    if (imageUrl.startsWith('data:image/')) {
      // 解析 base64 圖片
      const [header, base64Data] = imageUrl.split(',');
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
      return { base64Data, mimeType };
    } else {
      // 從 URL 下載圖片
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');
      const mimeType = response.headers.get('content-type') || 'image/jpeg';
      
      return { base64Data, mimeType };
    }
  } catch (error) {
    console.error('準備 Gemini 圖片失敗:', error);
    throw error;
  }
}

/** Hugging Face Space via @gradio/client */
async function tryonViaHF(personUrl: string, clothUrl: string): Promise<string> {
  const { Client } = await import("@gradio/client");
  const client = await Client.connect(process.env.HF_SPACE_ID!, {
    hf_token: process.env.HF_TOKEN || undefined,
  });

  // 開發時可用這行查看 API 端點與參數：
  // console.log(await client.view_api());

  // 先探索 API 結構
  console.log('🔍 探索 Space API 結構...')
  const apiInfo = await client.view_api();
  console.log('📋 API 資訊:', JSON.stringify(apiInfo, null, 2));

  // 使用正確的端點和參數名稱
  console.log('🎯 使用正確端點 /tryon 和參數 person_img, cloth_img');
  console.log('📤 準備圖片數據...');
  
  // 準備正確格式的圖片數據
  let result;
  
  // 轉換 URL 為適合 Gradio 的格式
  async function prepareImageForSpace(url: string) {
    try {
      if (url.startsWith('data:image/')) {
        // 如果已經是 base64，直接返回
        return url;
      } else {
        // 如果是 URL，驗證並返回（Gradio 可以直接處理 URL）
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`URL 無法訪問: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error(`不是有效的圖片格式: ${contentType}`);
        }
        
        return url;
      }
    } catch (error) {
      console.error('圖片準備失敗:', error);
      throw error;
    }
  }

  try {
    console.log('🔄 準備圖片數據...');
    
    // 將圖片轉換為適合的格式
    const personBuffer = await urlToImage(personUrl);
    const clothBuffer = await urlToImage(clothUrl);
    
    console.log('📤 調用 Space...');
    
    // 使用 gradio client 的正確方式
    result = await client.predict("/tryon", {
      person_img: personBuffer,
      cloth_img: clothBuffer
    });
    
    console.log('🎊 Space 調用成功！完整結果:', JSON.stringify(result, null, 2));
    
  } catch (spaceError) {
    console.error('💥 Space 調用失敗，錯誤詳情:', JSON.stringify(spaceError, null, 2));
    
    // 如果 Space 調用失敗，嘗試使用簡化的格式
    console.log('🔄 嘗試簡化格式...');
    try {
      result = await client.predict("/tryon", {
        person_img: personUrl,
        cloth_img: clothUrl
      });
      console.log('🎊 簡化格式成功！結果:', result);
    } catch (fallbackError) {
      console.error('💥 所有格式都失敗:', fallbackError);
      throw new Error(`Space 調用完全失敗: ${JSON.stringify(spaceError)}`);
    }
  }

  // 正確解析你的 Space 返回的結果格式
  let url = null;
  
  if (result?.data && Array.isArray(result.data) && result.data[0]) {
    const resultData = result.data[0];
    // 你的 Space 返回的是包含 url 字段的對象
    if (resultData.url) {
      url = resultData.url;
      console.log('✅ 解析成功！圖片 URL:', url);
    } else if (typeof resultData === "string") {
      url = resultData;
      console.log('✅ 解析成功！直接字符串:', url);
    }
  }
  
  if (!url) {
    console.error('❌ 無法解析結果，完整數據:', JSON.stringify(result, null, 2));
    throw new Error("Cannot parse HF result");
  }
  
  return url;
}

/** 將 URL 轉換為適合 Gradio 的 Buffer 格式 */
async function urlToImage(url: string): Promise<Buffer> {
  try {
    if (url.startsWith('data:image/')) {
      // 處理 base64 格式
      const base64Data = url.split(',')[1];
      return Buffer.from(base64Data, 'base64');
    } else {
      // 處理 HTTP URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  } catch (error) {
    console.error('urlToImage 轉換失敗:', error);
    throw error;
  }
}

/** Canvas 合成備援 */
async function createCanvasFallback(personUrl: string, clothUrl: string): Promise<string> {
  const sharp = require('sharp')
  
  try {
    // 處理 base64 圖片
    const personBuffer = Buffer.from(personUrl.split(',')[1], 'base64')
    const clothBuffer = Buffer.from(clothUrl.split(',')[1], 'base64')
    
    const personImage = sharp(personBuffer)
    const { width, height } = await personImage.metadata()
    
    // 調整服裝大小
    const clothWidth = Math.round((width || 400) * 0.35)
    const clothHeight = Math.round((height || 600) * 0.25)
    
    const resizedCloth = await sharp(clothBuffer)
      .resize({
        width: clothWidth,
        height: clothHeight,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer()
    
    // 合成圖片 - 胸部位置
    const composite = await personImage
      .composite([{
        input: resizedCloth,
        left: Math.round((width || 400) * 0.32),
        top: Math.round((height || 600) * 0.25),
        blend: 'over'
      }])
      .png()
      .toBuffer()
    
    return `data:image/png;base64,${composite.toString('base64')}`
    
  } catch (error) {
    console.error('Canvas 合成失敗:', error)
    throw error
  }
}

