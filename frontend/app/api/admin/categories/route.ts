import { NextRequest, NextResponse } from 'next/server'
import { products } from '@/lib/products'

interface Category {
  id: string
  name: string
  nameEn: string
  description: string
  count: number
  color: string
  icon: string
  parentId?: string
  isActive: boolean
  sortOrder: number
}

// 從商品數據提取所有分類並統計使用次數
function extractCategoriesFromProducts() {
  const categoryCounts = new Map<string, number>()
  
  // 統計每個分類的使用次數
  products.forEach(product => {
    const category = product.category
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
  })

  // 分類中文名映射
  const categoryMapping = {
    'dress': { name: '連身裙', icon: '👗', color: '#EC4899', description: '優雅連身裙系列' },
    'top': { name: '上衣', icon: '👚', color: '#3B82F6', description: '百搭上衣系列' },
    'pants': { name: '長褲', icon: '👖', color: '#10B981', description: '舒適長褲系列' },
    'jacket': { name: '外套', icon: '🧥', color: '#F59E0B', description: '時尚外套系列' },
    'two-piece': { name: '兩件式', icon: '👙', color: '#EF4444', description: '套裝兩件式' },
    'shorts': { name: '短褲', icon: '🩳', color: '#8B5CF6', description: '清爽短褲系列' },
    'skirt': { name: '短裙', icon: '🩱', color: '#06B6D4', description: '甜美短裙系列' },
  }

  // 轉換為分類對象
  const categories: Category[] = Array.from(categoryCounts.entries()).map(([categoryEn, count], index) => {
    const mapping = categoryMapping[categoryEn as keyof typeof categoryMapping]
    return {
      id: (index + 1).toString(),
      name: mapping?.name || categoryEn,
      nameEn: categoryEn,
      description: mapping?.description || '',
      count,
      color: mapping?.color || '#6B7280',
      icon: mapping?.icon || '📁',
      isActive: true,
      sortOrder: index
    }
  })

  return categories.sort((a, b) => b.count - a.count) // 按商品數量排序
}

// GET: 獲取所有分類
export async function GET() {
  try {
    const categories = extractCategoriesFromProducts()
    
    return NextResponse.json({
      success: true,
      data: categories,
      total: categories.length,
      totalProducts: categories.reduce((sum, cat) => sum + cat.count, 0)
    })
  } catch (error) {
    console.error('獲取分類失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取分類失敗' },
      { status: 500 }
    )
  }
}

// POST: 新增分類
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, nameEn, description, color, icon, isActive, sortOrder } = body

    if (!name || !nameEn) {
      return NextResponse.json(
        { success: false, error: '分類名稱（中英文）為必填' },
        { status: 400 }
      )
    }

    // 檢查英文名稱是否已存在
    const existingCategories = extractCategoriesFromProducts()
    const exists = existingCategories.some(cat => cat.nameEn.toLowerCase() === nameEn.toLowerCase())
    
    if (exists) {
      return NextResponse.json(
        { success: false, error: '此英文名稱已存在' },
        { status: 400 }
      )
    }

    // TODO: 實際環境中應該保存到數據庫
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      nameEn: nameEn.toLowerCase(),
      description: description || '',
      count: 0,
      color: color || '#3B82F6',
      icon: icon || '📁',
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0
    }

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: '分類新增成功'
    })
  } catch (error) {
    console.error('新增分類失敗:', error)
    return NextResponse.json(
      { success: false, error: '新增分類失敗' },
      { status: 500 }
    )
  }
}

// PUT: 更新分類
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, nameEn, description, color, icon, isActive, sortOrder } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: '分類ID為必填' },
        { status: 400 }
      )
    }

    // TODO: 實際環境中應該更新數據庫
    const updatedCategory: Partial<Category> = {}
    
    if (name !== undefined) updatedCategory.name = name
    if (nameEn !== undefined) updatedCategory.nameEn = nameEn.toLowerCase()
    if (description !== undefined) updatedCategory.description = description
    if (color !== undefined) updatedCategory.color = color
    if (icon !== undefined) updatedCategory.icon = icon
    if (isActive !== undefined) updatedCategory.isActive = isActive
    if (sortOrder !== undefined) updatedCategory.sortOrder = sortOrder

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: '分類更新成功'
    })
  } catch (error) {
    console.error('更新分類失敗:', error)
    return NextResponse.json(
      { success: false, error: '更新分類失敗' },
      { status: 500 }
    )
  }
}

// DELETE: 刪除分類
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: '分類ID為必填' },
        { status: 400 }
      )
    }

    // 檢查是否有商品使用此分類
    const categories = extractCategoriesFromProducts()
    const category = categories.find(cat => cat.id === id)
    
    if (category && category.count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `無法刪除此分類，因為還有 ${category.count} 個商品使用此分類` 
        },
        { status: 400 }
      )
    }

    // TODO: 實際環境中應該從數據庫刪除
    return NextResponse.json({
      success: true,
      message: '分類刪除成功'
    })
  } catch (error) {
    console.error('刪除分類失敗:', error)
    return NextResponse.json(
      { success: false, error: '刪除分類失敗' },
      { status: 500 }
    )
  }
}

// 額外的端點：獲取分類統計
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      const categories = extractCategoriesFromProducts()
      const stats = {
        totalCategories: categories.length,
        activeCategories: categories.filter(cat => cat.isActive).length,
        totalProducts: categories.reduce((sum, cat) => sum + cat.count, 0),
        averageProductsPerCategory: Math.round(
          categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length
        ),
        topCategory: categories.sort((a, b) => b.count - a.count)[0]
      }

      return NextResponse.json({
        success: true,
        data: stats
      })
    }

    return NextResponse.json(
      { success: false, error: '未知的操作' },
      { status: 400 }
    )
  } catch (error) {
    console.error('獲取統計失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取統計失敗' },
      { status: 500 }
    )
  }
}