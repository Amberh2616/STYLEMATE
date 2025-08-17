'use client'

import React, { useState, useEffect } from 'react'
import { ChevronRightIcon, MagnifyingGlassIcon, CpuChipIcon, ChartBarIcon, PhotoIcon } from '@heroicons/react/24/outline'

interface VectorStatus {
  total: number
  vectorized: number
  pending: number
  progress: number
  lastUpdate: string | null
}

interface SearchResult {
  id: number
  name_zh: string
  category_zh: string
  similarity: number
  price_twd: number
}

export default function FashionClipAdmin() {
  const [vectorStatus, setVectorStatus] = useState<VectorStatus | null>(null)
  const [isVectorizing, setIsVectorizing] = useState(false)
  const [vectorizeResult, setVectorizeResult] = useState<any>(null)
  
  // 搜尋相關狀態
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'text' | 'image'>('text')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    loadVectorStatus()
  }, [])

  // 📊 載入向量化狀態
  const loadVectorStatus = async () => {
    try {
      const response = await fetch('/api/fashion-clip/vectorize')
      const data = await response.json()
      
      if (data.success) {
        setVectorStatus(data.status)
      }
    } catch (error) {
      console.error('載入狀態失敗:', error)
    }
  }

  // 🗄️ 設置資料庫
  const setupDatabase = async () => {
    setIsVectorizing(true)
    try {
      const response = await fetch('/api/fashion-clip/vectorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'setup_database'
        }),
      })

      const result = await response.json()
      setVectorizeResult(result)
      
      if (result.success) {
        await loadVectorStatus()
      }
    } catch (error) {
      console.error('資料庫設置失敗:', error)
      setVectorizeResult({
        success: false,
        error: error.message
      })
    }
    setIsVectorizing(false)
  }

  // 🚀 開始向量化
  const startVectorization = async () => {
    setIsVectorizing(true)
    setVectorizeResult(null)
    
    try {
      const response = await fetch('/api/fashion-clip/vectorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'vectorize_all',
          batchSize: 3
        }),
      })

      const result = await response.json()
      setVectorizeResult(result)
      
      // 更新狀態
      await loadVectorStatus()
    } catch (error) {
      console.error('向量化失敗:', error)
      setVectorizeResult({
        success: false,
        error: error.message
      })
    }
    setIsVectorizing(false)
  }

  // 🔍 執行搜尋
  const performSearch = async () => {
    if (!searchQuery.trim() && !selectedImage) return

    setIsSearching(true)
    try {
      const queryData = searchType === 'text' 
        ? { query: searchQuery, type: 'text' }
        : { query: selectedImage, type: 'image' }

      const response = await fetch('/api/fashion-clip/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...queryData,
          limit: 8,
          minSimilarity: 0.3
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        setSearchResults(result.results)
      } else {
        console.error('搜尋失敗:', result.error)
        setSearchResults([])
      }
    } catch (error) {
      console.error('搜尋錯誤:', error)
      setSearchResults([])
    }
    setIsSearching(false)
  }

  // 📷 處理圖片上傳
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        setSelectedImage(base64)
        setSearchQuery('')
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <CpuChipIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Fashion-CLIP 管理</h1>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>AI 語義搜尋與向量管理</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左側：狀態與控制 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 向量化狀態 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">向量化狀態</h2>
                <ChartBarIcon className="w-5 h-5 text-gray-400" />
              </div>
              
              {vectorStatus && (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-900">進度</span>
                      <span className="text-sm font-bold text-blue-900">{vectorStatus.progress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${vectorStatus.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{vectorStatus.vectorized}</div>
                      <div className="text-green-700">已向量化</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{vectorStatus.pending}</div>
                      <div className="text-orange-700">待處理</div>
                    </div>
                  </div>
                  
                  {vectorStatus.lastUpdate && (
                    <div className="text-xs text-gray-500 text-center">
                      最後更新：{new Date(vectorStatus.lastUpdate).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 控制按鈕 */}
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold mb-4">管理操作</h3>
              
              <button
                onClick={setupDatabase}
                disabled={isVectorizing}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVectorizing ? '設置中...' : '🗄️ 設置向量資料庫'}
              </button>
              
              <button
                onClick={startVectorization}
                disabled={isVectorizing || vectorStatus?.pending === 0}
                className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVectorizing ? '向量化中...' : `🚀 開始向量化 (${vectorStatus?.pending || 0} 待處理)`}
              </button>
              
              <button
                onClick={loadVectorStatus}
                className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 刷新狀態
              </button>
            </div>

            {/* 處理結果 */}
            {vectorizeResult && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">處理結果</h3>
                <div className={`p-4 rounded-lg ${vectorizeResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className={`font-medium ${vectorizeResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {vectorizeResult.success ? '✅ 成功' : '❌ 失敗'}
                  </div>
                  <div className={`text-sm mt-1 ${vectorizeResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {vectorizeResult.message || vectorizeResult.error}
                  </div>
                  {vectorizeResult.actions && (
                    <ul className="text-sm text-green-700 mt-2 space-y-1">
                      {vectorizeResult.actions.map((action: string, index: number) => (
                        <li key={index}>• {action}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右側：搜尋測試 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Fashion-CLIP 語義搜尋測試</h2>
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>

              {/* 搜尋類型切換 */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setSearchType('text')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchType === 'text' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📝 文字搜尋
                </button>
                <button
                  onClick={() => setSearchType('image')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchType === 'image' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🖼️ 圖像搜尋
                </button>
              </div>

              {/* 搜尋輸入 */}
              <div className="space-y-4 mb-6">
                {searchType === 'text' ? (
                  <div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="輸入服裝描述，例如：韓系優雅洋裝、休閒上衣、黑色褲子..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <PhotoIcon className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">點擊上傳圖片</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF (最大 10MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                    {selectedImage && (
                      <div className="mt-4">
                        <img 
                          src={selectedImage} 
                          alt="上傳的圖片" 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={performSearch}
                  disabled={isSearching || (!searchQuery.trim() && !selectedImage)}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <MagnifyingGlassIcon className="w-5 h-5" />
                      <span>搜尋相似商品</span>
                    </>
                  )}
                </button>
              </div>

              {/* 搜尋結果 */}
              {searchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">搜尋結果 ({searchResults.length} 個商品)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{product.name_zh}</h4>
                          <span className="text-sm font-medium text-blue-600">
                            {(product.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{product.category_zh}</div>
                        <div className="text-lg font-bold text-purple-600">NT$ {product.price_twd}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.length === 0 && (searchQuery || selectedImage) && !isSearching && (
                <div className="text-center py-8 text-gray-500">
                  沒有找到相關商品，請嘗試其他搜尋詞彙
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}