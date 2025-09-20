import { NextRequest, NextResponse } from 'next/server'
import { products } from '@/lib/products'

interface Tag {
  id: string
  name: string
  category: string
  count: number
  color: string
}

// 從商品數據提取所有標籤並統計使用次數
function extractTagsFromProducts() {
  const tagCounts = new Map<string, number>()
  
  // 統計每個標籤的使用次數
  products.forEach(product => {
    if (product.tags) {
      product.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    }
  })

  // 標籤分類映射 (可以根據實際需求調整)
  const categoryMapping = {
    '韓系': 'style',
    '甜美': 'style', 
    '休閒': 'style',
    '優雅': 'style',
    '性感': 'style',
    '約會': 'occasion',
    '上班': 'occasion',
    '度假': 'occasion',
    '派對': 'occasion',
    '日常': 'occasion',
    '春夏': 'season',
    '秋冬': 'season',
    '春季': 'season',
    '夏季': 'season',
    '秋季': 'season',
    '冬季': 'season',
    '黑色': 'color',
    '白色': 'color',
    '紅色': 'color',
    '藍色': 'color',
    '粉色': 'color',
    '棉質': 'material',
    '雪紡': 'material',
    '針織': 'material',
    '蕾絲': 'material'
  }

  const categoryColors = {
    style: '#3B82F6',
    occasion: '#10B981', 
    season: '#F59E0B',
    color: '#EF4444',
    material: '#8B5CF6',
    feature: '#06B6D4'
  }

  // 轉換為標籤對象
  const tags: Tag[] = Array.from(tagCounts.entries()).map(([tagName, count], index) => {
    const category = categoryMapping[tagName as keyof typeof categoryMapping] || 'feature'
    return {
      id: (index + 1).toString(),
      name: tagName,
      category,
      count,
      color: categoryColors[category as keyof typeof categoryColors]
    }
  })

  return tags
}

// GET: 獲取所有標籤
export async function GET() {
  try {
    const tags = extractTagsFromProducts()
    
    return NextResponse.json({
      success: true,
      data: tags,
      total: tags.length
    })
  } catch (error) {
    console.error('獲取標籤失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取標籤失敗' },
      { status: 500 }
    )
  }
}

// POST: 新增標籤
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, category, color } = body

    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: '標籤名稱和分類為必填' },
        { status: 400 }
      )
    }

    // TODO: 實際環境中應該保存到數據庫
    // 這裡暫時只返回成功響應
    const newTag: Tag = {
      id: Date.now().toString(),
      name,
      category,
      count: 0,
      color: color || '#3B82F6'
    }

    return NextResponse.json({
      success: true,
      data: newTag,
      message: '標籤新增成功'
    })
  } catch (error) {
    console.error('新增標籤失敗:', error)
    return NextResponse.json(
      { success: false, error: '新增標籤失敗' },
      { status: 500 }
    )
  }
}

// PUT: 更新標籤
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, category, color } = body

    if (!id || !name || !category) {
      return NextResponse.json(
        { success: false, error: '標籤ID、名稱和分類為必填' },
        { status: 400 }
      )
    }

    // TODO: 實際環境中應該更新數據庫
    const updatedTag: Tag = {
      id,
      name,
      category,
      count: 0, // 實際中應該保持原有的count
      color: color || '#3B82F6'
    }

    return NextResponse.json({
      success: true,
      data: updatedTag,
      message: '標籤更新成功'
    })
  } catch (error) {
    console.error('更新標籤失敗:', error)
    return NextResponse.json(
      { success: false, error: '更新標籤失敗' },
      { status: 500 }
    )
  }
}

// DELETE: 刪除標籤
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '標籤ID為必填' },
        { status: 400 }
      )
    }

    // TODO: 實際環境中應該從數據庫刪除
    // 同時需要考慮是否有商品正在使用此標籤

    return NextResponse.json({
      success: true,
      message: '標籤刪除成功'
    })
  } catch (error) {
    console.error('刪除標籤失敗:', error)
    return NextResponse.json(
      { success: false, error: '刪除標籤失敗' },
      { status: 500 }
    )
  }
}