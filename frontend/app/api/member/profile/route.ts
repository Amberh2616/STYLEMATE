import { NextRequest, NextResponse } from 'next/server'

interface MemberProfile {
  name: string
  gender: string
  age: number
  birthday: string
  occupation: string
  location: string
  phone: string
  emergencyContact: string
  
  height: number
  weight: number
  bust: number
  waist: number
  hip: number
  preferredSize: {
    top: string
    bottom: string
    dress: string
  }
  
  email: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    profilePublic: boolean
    showPurchaseHistory: boolean
  }
  
  fashionPreferences: {
    [key: string]: string | string[]
  }
}

// 模擬資料庫儲存 (實際環境應使用真正的資料庫)
const memberProfiles: { [key: string]: MemberProfile } = {}

export async function POST(request: NextRequest) {
  try {
    const profile: MemberProfile = await request.json()
    
    // 驗證必要欄位
    if (!profile.name || !profile.email) {
      return NextResponse.json(
        { error: '姓名和電子郵件為必填欄位' },
        { status: 400 }
      )
    }

    // 生成會員ID (實際環境應使用更安全的方法)
    const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 加入時間戳記
    const memberData = {
      ...profile,
      memberId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 儲存到模擬資料庫
    memberProfiles[profile.email] = memberData
    
    console.log('會員資料已儲存:', {
      memberId,
      name: profile.name,
      email: profile.email,
      preferencesCount: Object.keys(profile.fashionPreferences).length
    })

    return NextResponse.json({
      success: true,
      message: '會員資料已成功儲存',
      memberId,
      data: {
        name: profile.name,
        email: profile.email,
        createdAt: memberData.createdAt
      }
    })

  } catch (error) {
    console.error('儲存會員資料錯誤:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '儲存失敗，請稍後再試',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: '請提供電子郵件參數' },
        { status: 400 }
      )
    }

    const profile = memberProfiles[email]
    
    if (!profile) {
      return NextResponse.json(
        { error: '找不到會員資料' },
        { status: 404 }
      )
    }

    // 移除敏感資訊後回傳
    const { ...safeProfile } = profile
    
    return NextResponse.json({
      success: true,
      data: safeProfile
    })

  } catch (error) {
    console.error('取得會員資料錯誤:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '取得資料失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, ...updateData } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: '請提供電子郵件' },
        { status: 400 }
      )
    }

    if (!memberProfiles[email]) {
      return NextResponse.json(
        { error: '找不到會員資料' },
        { status: 404 }
      )
    }

    // 更新資料
    memberProfiles[email] = {
      ...memberProfiles[email],
      ...updateData,
      updatedAt: new Date().toISOString()
    }

    console.log('會員資料已更新:', email)

    return NextResponse.json({
      success: true,
      message: '會員資料已成功更新',
      updatedAt: memberProfiles[email].updatedAt
    })

  } catch (error) {
    console.error('更新會員資料錯誤:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '更新失敗，請稍後再試',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
}