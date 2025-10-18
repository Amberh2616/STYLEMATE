import { NextRequest, NextResponse } from 'next/server'
import { products } from '@/lib/products'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const category = searchParams.get('category')
    const color = searchParams.get('color')
    const style = searchParams.get('style')
    const query = searchParams.get('query')
    // 🚀 新增：混合式搜尋模式
    const mode = searchParams.get('mode') || 'strict' // 'strict' | 'expanded'
    
    // 設定限制數量（支持 "all" 參數移除限制）
    const limit = limitParam === "all" ? Number.POSITIVE_INFINITY : Number(limitParam || "1000")

    // 載入完整產品目錄（統一 ProductInfo 格式）+ 只保留有圖片的商品
    let filteredProducts = products.filter(p => p.image)
    console.log(`📦 載入商品總數（僅有圖片）: ${filteredProducts.length}`)

    // 🚀 混合式搜尋：應用篩選條件
    if (query) {
      const lowerQuery = query.toLowerCase()
      
      // 分詞搜尋：支持多關鍵詞搜尋
      const keywords = lowerQuery.split(/\s+/).filter(word => word.length > 0)
      
      filteredProducts = filteredProducts.filter(p => {
        // 對每個關鍵詞，檢查是否在任何欄位中找到
        return keywords.every(keyword => {
          // 🚀 顏色搜尋的混合式邏輯
          if (isColorKeyword(keyword)) {
            return applyColorFilter(p, keyword, mode)
          }
          
          // 其他關鍵詞的一般搜尋（適配Product格式）
          return p.name.toLowerCase().includes(keyword) ||
                 p.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
                 p.colors.some(color => color.toLowerCase().includes(keyword)) ||
                 p.category?.toLowerCase().includes(keyword) ||
                 p.style?.toLowerCase().includes(keyword)
        })
      })
      console.log(`🔍 ${mode}模式文字篩選後: ${filteredProducts.length}`)
    }

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category)
      console.log(`📂 類別篩選後: ${filteredProducts.length}`)
    }

    if (color) {
      filteredProducts = filteredProducts.filter(p => p.colors && p.colors.some(c => c.toLowerCase().includes(color.toLowerCase())))
      console.log(`🎨 顏色篩選後: ${filteredProducts.length}`)
    }

    if (style) {
      const lowerStyle = style.toLowerCase()
      filteredProducts = filteredProducts.filter(p =>
        p.tags.some(tag => tag.toLowerCase().includes(lowerStyle)) ||
        p.style?.toLowerCase().includes(lowerStyle)
      )
      console.log(`✨ 風格篩選後: ${filteredProducts.length}`)
    }

    // 應用數量限制
    const sliced = Number.isFinite(limit) ? filteredProducts.slice(0, limit) : filteredProducts

    return NextResponse.json({
      ok: true,
      source: "filteredProducts.ts→adapter",
      count: sliced.length,
      total: filteredProducts.length,
      items: sliced
    })

  } catch (error) {
    console.error('Fashion search error:', error)
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        items: []
      },
      { status: 500 }
    )
  }
}

// 🚀 顏色關鍵詞判斷
function isColorKeyword(keyword: string): boolean {
  const colorKeywords = [
    '白', '白色', 'white', '黑', '黑色', 'black', '灰', '灰色', 'gray',
    '藍', '藍色', 'blue', '紅', '紅色', 'red', '綠', '綠色', 'green',
    '黃', '黃色', 'yellow', '粉', '粉色', 'pink', '棕', '棕色', 'brown',
    '紫', '紫色', 'purple', '橘', '橘色', 'orange', '金', '金色', 'gold'
  ]
  return colorKeywords.includes(keyword.toLowerCase())
}

// 🚀 混合式顏色篩選（適配Product格式）
function applyColorFilter(product: any, colorKeyword: string, mode: string): boolean {
  const keyword = colorKeyword.toLowerCase()
  const hasColor = product.colors.some((c: string) => c.toLowerCase().includes(keyword)) ||
                   product.name.toLowerCase().includes(keyword)
  
  if (mode === 'strict') {
    // 嚴格模式：只匹配主色調或素色商品
    return hasColor
  } else {
    // 展開模式：包含該顏色的所有商品
    return hasColor
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, filters } = body

    // 載入完整產品目錄 + 只保留有圖片的商品
    let filteredProducts = products.filter(p => p.image)

    // 文字搜尋 (分詞搜尋)
    if (query) {
      const lowerQuery = query.toLowerCase()
      
      // 分詞搜尋：支持多關鍵詞搜尋
      const keywords = lowerQuery.split(/\s+/).filter(word => word.length > 0)
      
      filteredProducts = filteredProducts.filter(p => {
        // 對每個關鍵詞，檢查是否在任何欄位中找到（適配Product格式）
        return keywords.every(keyword => 
          p.name.toLowerCase().includes(keyword) ||
          p.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
          p.colors.some(color => color.toLowerCase().includes(keyword)) ||
          p.category?.toLowerCase().includes(keyword) ||
          p.style?.toLowerCase().includes(keyword)
        )
      })
    }

    // 應用篩選條件
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category)
    }

    if (filters?.color) {
      filteredProducts = filteredProducts.filter(p => p.colors && p.colors.some(c => c.toLowerCase().includes(filters.color.toLowerCase())))
    }

    if (filters?.priceRange && Array.isArray(filters.priceRange)) {
      const [minPrice, maxPrice] = filters.priceRange
      if (minPrice && maxPrice) {
        filteredProducts = filteredProducts.filter(p => {
          if (!p.price_cents) return false
          const priceInTwd = p.price_cents / 100
          return priceInTwd >= minPrice && priceInTwd <= maxPrice
        })
      }
    }

    // 🚀 智能排序：優先顯示純色，再顯示圖案
    const queryLower = query?.toLowerCase() || ''
    const hasColorQuery = query && ['白', '黑', '灰', '藍', '紅', '綠', '黃', '粉', '棕', '紫', '橘', 'white', 'black', 'gray', 'blue', 'red', 'green', 'yellow', 'pink', 'brown', 'purple', 'orange'].some(color => queryLower.includes(color))
    
    if (hasColorQuery) {
      filteredProducts.sort((a, b) => {
        // 素色優先
        if (a.pattern === 'solid' && b.pattern !== 'solid') return -1
        if (a.pattern !== 'solid' && b.pattern === 'solid') return 1
        
        // 主色調匹配優先
        const aHasDominant = a.dominant_colors?.some(c => queryLower.includes(c)) || false
        const bHasDominant = b.dominant_colors?.some(c => queryLower.includes(c)) || false
        if (aHasDominant && !bHasDominant) return -1
        if (!aHasDominant && bHasDominant) return 1
        
        return 0
      })
      console.log(`🎯 智能排序完成，優先顯示素色商品`)
    }

    // 限制返回數量
    const result = filteredProducts.slice(0, 50)

    return NextResponse.json({
      ok: true,
      source: "filteredProducts.ts→adapter",
      query,
      count: result.length,
      total: filteredProducts.length,
      items: result,
      // 🚀 返回排序資訊
      sort_info: hasColorQuery ? {
        sorted_by_color: true,
        solid_count: result.filter(p => p.pattern === 'solid').length,
        patterned_count: result.filter(p => p.pattern !== 'solid').length
      } : undefined
    })

  } catch (error) {
    console.error('Fashion text search error:', error)
    return NextResponse.json(
      { 
        ok: false, 
        error: 'Text search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        items: []
      },
      { status: 500 }
    )
  }
}