import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { personImageUrl, garmentImageUrl } = await req.json();

  const backend = process.env.TRYON_BACKEND || "hf_space";
  try {
    if (backend === "hf_space") {
      const url = await tryonViaHF(personImageUrl, garmentImageUrl);
      return NextResponse.json({ url });
    }
    // 停用所有疊圖功能
    return NextResponse.json({ 
      success: false,
      error: "AI 虛擬試穿服務暫時不可用",
      message: "需要真正的 AI 模型，不提供疊圖功能"
    }, { status: 503 });
  } catch (e) {
    // 不做任何 fallback，直接返回錯誤
    return NextResponse.json({ 
      success: false,
      error: "AI 虛擬試穿失敗: " + String(e),
      message: "真正的 AI 服務不可用，不提供替代方案"
    }, { status: 503 });
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

