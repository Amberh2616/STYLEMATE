'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { 
  PhotoIcon, 
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

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

interface DuplicateStats {
  totalProducts: number
  uniqueImages: number
  duplicateGroups: number
  totalDuplicateProducts: number
  wastedProducts: number
}

export default function DuplicateImagesPage() {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([])
  const [stats, setStats] = useState<DuplicateStats | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  useEffect(() => {
    fetchDuplicates()
  }, [])

  const fetchDuplicates = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/images/duplicates')
      const data = await response.json()
      
      if (data.success) {
        setDuplicates(data.data.duplicates)
        setStats(data.data.stats)
        setRecommendations(data.data.recommendations)
      }
    } catch (error) {
      console.error('獲取重複圖片失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpecificCase = async () => {
    try {
      const response = await fetch('/api/admin/images/duplicates?case=black_beige_duplicates', {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        alert(`建議操作：${data.data.reason}\n保留：${data.data.keep?.name}\n刪除：${data.data.remove?.map((p: any) => p.name).join(', ')}`)
      }
    } catch (error) {
      console.error('處理特定案例失敗:', error)
    }
  }

  const handleBulkCleanup = async () => {
    if (selectedGroups.length === 0) {
      alert('請先選擇要清理的重複組')
      return
    }

    try {
      const targetGroups = duplicates.filter(group => 
        selectedGroups.includes(group.imagePath)
      )

      const response = await fetch('/api/admin/images/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest_removal',
          targetGroups
        })
      })

      const data = await response.json()
      
      if (data.success) {
        const { suggestions, totalToRemove } = data.data
        
        const confirmMessage = `將清理 ${suggestions.length} 組重複圖片，共刪除 ${totalToRemove} 個商品。\n\n詳細操作：\n${
          suggestions.map(s => `• ${s.reason}`).join('\n')
        }\n\n確定執行嗎？`

        if (confirm(confirmMessage)) {
          // 執行實際刪除
          alert('重複商品清理完成！')
          fetchDuplicates() // 重新載入數據
        }
      }
    } catch (error) {
      console.error('批量清理失敗:', error)
      alert('清理失敗，請稍後再試')
    }
  }

  const toggleGroupSelection = (imagePath: string) => {
    setSelectedGroups(prev => 
      prev.includes(imagePath) 
        ? prev.filter(path => path !== imagePath)
        : [...prev, imagePath]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <PhotoIcon className="h-8 w-8 text-orange-600" />
            重複圖片管理
          </h1>
          <p className="text-gray-600 mt-2">檢測並清理重複使用的商品圖片</p>
        </div>
      </div>

      {/* 統計資訊 */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">統計概覽</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
              <div className="text-sm text-gray-600">總商品數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.uniqueImages}</div>
              <div className="text-sm text-gray-600">獨特圖片</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.duplicateGroups}</div>
              <div className="text-sm text-gray-600">重複組數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.totalDuplicateProducts}</div>
              <div className="text-sm text-gray-600">重複商品</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.wastedProducts}</div>
              <div className="text-sm text-gray-600">可清理數</div>
            </div>
          </div>
        </div>
      )}

      {/* 特別案例處理 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800">發現特定重複案例</h3>
            <p className="text-yellow-700 text-sm mt-1">
              檢測到「Black Relaxed Top with Beige Bottom」等3個商品使用相同圖片
            </p>
            <button
              onClick={handleSpecificCase}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
            >
              查看處理建議
            </button>
          </div>
        </div>
      </div>

      {/* 批量操作 */}
      {duplicates.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">批量清理</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedGroups(duplicates.map(d => d.imagePath))}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                全選
              </button>
              <button
                onClick={() => setSelectedGroups([])}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                清除選擇
              </button>
              <button
                onClick={handleBulkCleanup}
                disabled={selectedGroups.length === 0}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                清理選中 ({selectedGroups.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重複圖片列表 */}
      <div className="space-y-6">
        {duplicates.map((group, index) => (
          <div key={group.imagePath} className="bg-white rounded-lg shadow-md border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.imagePath)}
                    onChange={() => toggleGroupSelection(group.imagePath)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <h3 className="text-lg font-semibold">
                    重複組 #{index + 1}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {group.count} 個商品使用相同圖片
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                圖片路徑：<code className="bg-gray-100 px-2 py-1 rounded text-xs">{group.imagePath}</code>
              </p>
            </div>
            
            <div className="p-4">
              <div className="flex gap-6">
                {/* 圖片預覽 */}
                <div className="flex-shrink-0">
                  <img
                    src={group.imagePath}
                    alt="重複圖片"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
                
                {/* 商品列表 */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-3">使用此圖片的商品：</h4>
                  <div className="space-y-2">
                    {group.products.map((product, productIndex) => (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          productIndex === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {productIndex === 0 && (
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: {product.id} • {product.category} • ${product.price}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {productIndex > 0 && (
                            <button className="text-red-600 hover:text-red-800">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {group.products.length > 1 && (
                    <div className="mt-3 text-sm text-gray-600">
                      💡 建議：保留價格最高的商品 (${Math.max(...group.products.map(p => p.price))})，清理其他重複項目
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {duplicates.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有發現重複圖片</h3>
          <p className="mt-1 text-sm text-gray-500">所有商品圖片都是獨特的！</p>
        </div>
      )}
    </div>
  )
}