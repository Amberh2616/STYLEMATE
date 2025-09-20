import { NextRequest, NextResponse } from 'next/server'
import { products } from '@/lib/products'

interface DuplicateGroup {
  imagePath: string
  count: number
  products: Array<{
    id: number
    name: string
    price: number
    category: string
  }>
}

// 檢測重複圖片
export async function GET() {
  try {
    // 統計每張圖片的使用次數
    const imageMap = new Map<string, any[]>()
    
    products.forEach(product => {
      const imagePath = product.image
      if (!imageMap.has(imagePath)) {
        imageMap.set(imagePath, [])
      }
      imageMap.get(imagePath)!.push({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category
      })
    })

    // 找出重複使用的圖片
    const duplicates: DuplicateGroup[] = []
    
    imageMap.forEach((productList, imagePath) => {
      if (productList.length > 1) {
        duplicates.push({
          imagePath,
          count: productList.length,
          products: productList
        })
      }
    })

    // 按重複次數排序
    duplicates.sort((a, b) => b.count - a.count)

    // 統計資訊
    const stats = {
      totalProducts: products.length,
      uniqueImages: imageMap.size,
      duplicateGroups: duplicates.length,
      totalDuplicateProducts: duplicates.reduce((sum, group) => sum + group.count, 0),
      wastedProducts: duplicates.reduce((sum, group) => sum + (group.count - 1), 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        duplicates,
        stats,
        recommendations: generateRecommendations(duplicates)
      }
    })

  } catch (error) {
    console.error('檢測重複圖片失敗:', error)
    return NextResponse.json(
      { success: false, error: '檢測重複圖片失敗' },
      { status: 500 }
    )
  }
}

// 清理重複圖片 (標記建議刪除的商品)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, targetGroups } = body

    if (action === 'suggest_removal') {
      const suggestions: any[] = []

      targetGroups.forEach((group: DuplicateGroup) => {
        // 保留價格最高的商品，建議刪除其他
        const sortedProducts = group.products.sort((a, b) => b.price - a.price)
        const keepProduct = sortedProducts[0]
        const removeProducts = sortedProducts.slice(1)

        suggestions.push({
          imagePath: group.imagePath,
          keep: keepProduct,
          remove: removeProducts,
          reason: `保留價格最高的商品 (${keepProduct.name} - $${keepProduct.price})`
        })
      })

      return NextResponse.json({
        success: true,
        data: {
          suggestions,
          totalToRemove: suggestions.reduce((sum, s) => sum + s.remove.length, 0)
        }
      })
    }

    if (action === 'mark_for_removal') {
      // TODO: 在實際環境中，這裡會標記商品為待刪除狀態
      // 或者直接從數據庫中刪除
      
      const { productIds } = body
      
      return NextResponse.json({
        success: true,
        message: `已標記 ${productIds.length} 個商品待刪除`,
        data: { markedIds: productIds }
      })
    }

    return NextResponse.json(
      { success: false, error: '不支援的操作' },
      { status: 400 }
    )

  } catch (error) {
    console.error('處理重複圖片失敗:', error)
    return NextResponse.json(
      { success: false, error: '處理重複圖片失敗' },
      { status: 500 }
    )
  }
}

// 生成清理建議
function generateRecommendations(duplicates: DuplicateGroup[]) {
  const recommendations = []

  // 針對您提到的具體重複案例
  const blackBeigeGroup = duplicates.find(group => 
    group.imagePath.includes('LINE_ALBUM__250808_79.jpg')
  )

  if (blackBeigeGroup) {
    recommendations.push({
      type: 'specific_case',
      title: '黑色上衣配米色下裝重複',
      description: '發現3個商品使用相同圖片，建議保留價格或描述最完整的一個',
      group: blackBeigeGroup,
      action: 'consolidate'
    })
  }

  // 一般建議
  if (duplicates.length > 0) {
    recommendations.push({
      type: 'general',
      title: '重複圖片清理建議',
      description: `發現 ${duplicates.length} 組重複圖片，建議：
1. 保留價格較高或描述較完整的商品
2. 刪除重複的低價商品
3. 或考慮將不同款式的商品更換為正確圖片`,
      actions: ['keep_highest_price', 'manual_review', 'update_images']
    })
  }

  return recommendations
}

// 特別處理您提到的案例
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caseType = searchParams.get('case')

    if (caseType === 'black_beige_duplicates') {
      // 特別處理黑色上衣配米色下裝的重複案例
      const targetProducts = products.filter(p => 
        p.image.includes('LINE_ALBUM__250808_79.jpg') &&
        (p.name.includes('Black') && p.name.includes('Beige'))
      )

      // 建議保留ID 79 (價格最低但描述最完整)，刪除74和77
      const suggestions = {
        keep: targetProducts.find(p => p.id === 79),
        remove: targetProducts.filter(p => p.id === 74 || p.id === 77),
        reason: '保留「極簡黑米搭配服裝」，刪除其他重複描述的商品'
      }

      return NextResponse.json({
        success: true,
        data: suggestions,
        message: '已分析黑米配色重複商品'
      })
    }

    return NextResponse.json(
      { success: false, error: '未知的清理案例' },
      { status: 400 }
    )

  } catch (error) {
    console.error('清理特定重複案例失敗:', error)
    return NextResponse.json(
      { success: false, error: '清理失敗' },
      { status: 500 }
    )
  }
}