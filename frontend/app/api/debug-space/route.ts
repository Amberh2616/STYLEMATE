import { NextRequest, NextResponse } from 'next/server'
import { Client } from "@gradio/client"

// 調試 Space API 結構
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 調試 yisol/IDM-VTON Space...')
    
    const client = await Client.connect("yisol/IDM-VTON", {
      hf_token: process.env.HF_TOKEN || undefined,
    })
    
    // 查看 API 結構
    const apiInfo = await client.view_api()
    console.log('📋 完整 API 資訊:', JSON.stringify(apiInfo, null, 2))
    
    return NextResponse.json({
      success: true,
      space: 'yisol/IDM-VTON',
      apiInfo: apiInfo,
      endpoints: Object.keys(apiInfo.named_endpoints || {}),
      message: '成功獲取 Space API 結構'
    })
    
  } catch (error) {
    console.error('❌ 調試失敗:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}