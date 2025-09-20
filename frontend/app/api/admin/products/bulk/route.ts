import { NextRequest, NextResponse } from 'next/server'
import { products } from '@/lib/products'

interface BulkActionRequest {
  action: 'activate' | 'deactivate' | 'delete' | 'update_category' | 'update_tags'
  productIds: string[]
  data?: {
    category?: string
    tags?: string[]
    status?: string
  }
}

// POST: 批量操作商品
export async function POST(request: NextRequest) {
  try {
    const body: BulkActionRequest = await request.json()
    const { action, productIds, data } = body

    if (!action || !productIds || productIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '操作類型和商品ID為必填' },
        { status: 400 }
      )
    }

    // 驗證商品ID是否存在
    const existingProductIds = products.map(p => p.id.toString())
    const validProductIds = productIds.filter(id => existingProductIds.includes(id))
    const invalidProductIds = productIds.filter(id => !existingProductIds.includes(id))

    if (validProductIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '沒有找到有效的商品ID' },
        { status: 400 }
      )
    }

    let successCount = 0
    let errorCount = 0
    let results: any[] = []

    // 根據操作類型執行不同的邏輯
    switch (action) {
      case 'activate':
      case 'deactivate':
        // 批量啟用/停用商品
        for (const productId of validProductIds) {
          try {
            // TODO: 實際環境中應該更新數據庫
            // 這裡模擬更新狀態
            const newStatus = action === 'activate' ? 'active' : 'inactive'
            results.push({
              id: productId,
              status: newStatus,
              success: true
            })
            successCount++
          } catch (error) {
            results.push({
              id: productId,
              error: '更新失敗',
              success: false
            })
            errorCount++
          }
        }
        break

      case 'delete':
        // 批量刪除商品
        for (const productId of validProductIds) {
          try {
            // TODO: 實際環境中應該從數據庫刪除
            // 這裡模擬刪除操作
            results.push({
              id: productId,
              deleted: true,
              success: true
            })
            successCount++
          } catch (error) {
            results.push({
              id: productId,
              error: '刪除失敗',
              success: false
            })
            errorCount++
          }
        }
        break

      case 'update_category':
        // 批量更新分類
        if (!data?.category) {
          return NextResponse.json(
            { success: false, error: '更新分類時必須提供新分類' },
            { status: 400 }
          )
        }

        for (const productId of validProductIds) {
          try {
            // TODO: 實際環境中應該更新數據庫
            results.push({
              id: productId,
              category: data.category,
              success: true
            })
            successCount++
          } catch (error) {
            results.push({
              id: productId,
              error: '更新分類失敗',
              success: false
            })
            errorCount++
          }
        }
        break

      case 'update_tags':
        // 批量更新標籤
        if (!data?.tags) {
          return NextResponse.json(
            { success: false, error: '更新標籤時必須提供新標籤' },
            { status: 400 }
          )
        }

        for (const productId of validProductIds) {
          try {
            // TODO: 實際環境中應該更新數據庫
            results.push({
              id: productId,
              tags: data.tags,
              success: true
            })
            successCount++
          } catch (error) {
            results.push({
              id: productId,
              error: '更新標籤失敗',
              success: false
            })
            errorCount++
          }
        }
        break

      default:
        return NextResponse.json(
          { success: false, error: '不支援的操作類型' },
          { status: 400 }
        )
    }

    // 返回操作結果
    return NextResponse.json({
      success: true,
      message: `批量操作完成`,
      data: {
        action,
        totalRequested: productIds.length,
        validIds: validProductIds.length,
        invalidIds: invalidProductIds.length,
        successCount,
        errorCount,
        results,
        invalidProductIds: invalidProductIds.length > 0 ? invalidProductIds : undefined
      }
    })

  } catch (error) {
    console.error('批量操作失敗:', error)
    return NextResponse.json(
      { success: false, error: '批量操作失敗' },
      { status: 500 }
    )
  }
}

// GET: 獲取可用的批量操作選項
export async function GET() {
  try {
    const bulkActions = [
      {
        id: 'activate',
        name: '批量啟用',
        description: '將選中的商品設為上架狀態',
        icon: '✅',
        color: 'green',
        requiresData: false
      },
      {
        id: 'deactivate',
        name: '批量停用',
        description: '將選中的商品設為下架狀態',
        icon: '❌',
        color: 'yellow',
        requiresData: false
      },
      {
        id: 'delete',
        name: '批量刪除',
        description: '永久刪除選中的商品（慎用）',
        icon: '🗑️',
        color: 'red',
        requiresData: false,
        dangerous: true
      },
      {
        id: 'update_category',
        name: '批量更新分類',
        description: '將選中的商品更改為指定分類',
        icon: '📂',
        color: 'blue',
        requiresData: true,
        dataType: 'category'
      },
      {
        id: 'update_tags',
        name: '批量更新標籤',
        description: '為選中的商品設置新的標籤',
        icon: '🏷️',
        color: 'purple',
        requiresData: true,
        dataType: 'tags'
      }
    ]

    return NextResponse.json({
      success: true,
      data: bulkActions
    })
  } catch (error) {
    console.error('獲取批量操作選項失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取批量操作選項失敗' },
      { status: 500 }
    )
  }
}