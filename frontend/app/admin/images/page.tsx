'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { 
  PhotoIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ImageItem {
  id: string
  path: string
  filename: string
  category: string
  size: number
  uploadDate: string
  isUsed: boolean
  usedInProducts?: string[]
}

interface Category {
  id: string
  name: string
  count: number
}

export default function ImageLibraryPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [showUnusedOnly, setShowUnusedOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchImages()
    fetchCategories()
  }, [])

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      // 模擬從產品數據中提取圖片信息
      const { products } = await import('@/lib/products')
      
      const imageMap = new Map<string, ImageItem>()
      
      products.forEach((product, index) => {
        if (!imageMap.has(product.image)) {
          const filename = product.image.split('/').pop() || ''
          const category = product.image.includes('/dress/') ? 'dress' :
                          product.image.includes('/top/') ? 'top' :
                          product.image.includes('/bottom/') ? 'bottom' :
                          product.image.includes('/two-piece/') ? 'two-piece' : 'general'
          
          imageMap.set(product.image, {
            id: `img_${index}`,
            path: product.image,
            filename,
            category,
            size: Math.floor(Math.random() * 500000) + 100000, // 模擬檔案大小
            uploadDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            isUsed: true,
            usedInProducts: [product.name]
          })
        } else {
          // 如果圖片已存在，添加使用它的產品
          const existing = imageMap.get(product.image)!
          existing.usedInProducts?.push(product.name)
        }
      })

      setImages(Array.from(imageMap.values()))
    } catch (error) {
      console.error('獲取圖片失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/images/upload')
      const data = await response.json()
      if (data.success) {
        // 計算每個分類的圖片數量
        const categoriesWithCount = data.data.categories.map((cat: any) => ({
          ...cat,
          count: images.filter(img => img.category === cat.id).length
        }))
        setCategories([
          { id: 'all', name: '全部', count: images.length },
          ...categoriesWithCount
        ])
      }
    } catch (error) {
      console.error('獲取分類失敗:', error)
    }
  }

  const filteredImages = images.filter(image => {
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory
    const matchesSearch = image.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         image.usedInProducts?.some(product => 
                           product.toLowerCase().includes(searchQuery.toLowerCase())
                         )
    const matchesUsage = !showUnusedOnly || !image.isUsed
    
    return matchesCategory && matchesSearch && matchesUsage
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    )
  }

  const selectAllImages = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([])
    } else {
      setSelectedImages(filteredImages.map(img => img.id))
    }
  }

  const copyImagePath = (path: string) => {
    navigator.clipboard.writeText(path)
    alert('圖片路徑已複製到剪貼簿')
  }

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) {
      alert('請先選擇要刪除的圖片')
      return
    }

    const hasUsedImages = selectedImages.some(id => {
      const image = images.find(img => img.id === id)
      return image?.isUsed
    })

    if (hasUsedImages) {
      alert('選中的圖片中有正在被商品使用的圖片，無法刪除')
      return
    }

    if (confirm(`確定要刪除 ${selectedImages.length} 張圖片嗎？此操作無法撤銷。`)) {
      // TODO: 實際刪除邏輯
      alert('批量刪除功能開發中...')
    }
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
            <PhotoIcon className="h-8 w-8 text-purple-600" />
            圖片庫管理
          </h1>
          <p className="text-gray-600 mt-2">瀏覽和管理所有商品圖片</p>
        </div>
        <Link
          href="/admin/images/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          上傳圖片
        </Link>
      </div>

      {/* 統計數據 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-blue-600">{images.length}</div>
          <div className="text-sm text-gray-600">總圖片數</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-green-600">
            {images.filter(img => img.isUsed).length}
          </div>
          <div className="text-sm text-gray-600">已使用</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-orange-600">
            {images.filter(img => !img.isUsed).length}
          </div>
          <div className="text-sm text-gray-600">未使用</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(images.reduce((sum, img) => sum + img.size, 0) / 1024 / 1024)}MB
          </div>
          <div className="text-sm text-gray-600">總大小</div>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-1 flex gap-4 items-center">
            {/* 搜尋框 */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋圖片名稱或商品..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* 分類篩選 */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>

            {/* 使用狀態篩選 */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showUnusedOnly}
                onChange={(e) => setShowUnusedOnly(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">僅顯示未使用</span>
            </label>
          </div>

          <div className="flex gap-2">
            {/* 視圖模式切換 */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>

            {/* 批量操作 */}
            {selectedImages.length > 0 && (
              <div className="flex gap-2">
                <span className="text-sm text-gray-600 self-center">
                  已選擇 {selectedImages.length} 項
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  批量刪除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 圖片列表 */}
      <div className="bg-white rounded-lg shadow-md">
        {filteredImages.length === 0 ? (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到圖片</h3>
            <p className="mt-1 text-sm text-gray-500">
              {images.length === 0 ? '還沒有上傳任何圖片' : '請調整搜尋條件'}
            </p>
          </div>
        ) : (
          <>
            {/* 全選控制 */}
            <div className="p-4 border-b border-gray-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedImages.length === filteredImages.length && filteredImages.length > 0}
                  onChange={selectAllImages}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">
                  全選 ({filteredImages.length} 項)
                </span>
              </label>
            </div>

            {viewMode === 'grid' ? (
              /* 網格視圖 */
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImages.includes(image.id)
                        ? 'border-purple-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="absolute top-2 left-2 z-10 rounded text-purple-600 focus:ring-purple-500"
                    />
                    
                    <img
                      src={image.path}
                      alt={image.filename}
                      className="w-full h-32 object-cover"
                    />
                    
                    <div className="p-2">
                      <div className="text-xs font-medium truncate">{image.filename}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatFileSize(image.size)}
                      </div>
                      {image.isUsed && (
                        <div className="text-xs text-green-600 mt-1">
                          {image.usedInProducts?.length} 個商品使用
                        </div>
                      )}
                    </div>

                    {/* 懸停操作 */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreviewImage(image.path)}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => copyImagePath(image.path)}
                        className="p-2 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      {!image.isUsed && (
                        <button className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 列表視圖 */
              <div className="divide-y divide-gray-200">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className={`flex items-center gap-4 p-4 hover:bg-gray-50 ${
                      selectedImages.includes(image.id) ? 'bg-purple-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    
                    <img
                      src={image.path}
                      alt={image.filename}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{image.filename}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(image.size)} • {formatDate(image.uploadDate)}
                      </div>
                      {image.isUsed && image.usedInProducts && (
                        <div className="text-sm text-green-600 mt-1">
                          用於: {image.usedInProducts.slice(0, 2).join(', ')}
                          {image.usedInProducts.length > 2 && ` +${image.usedInProducts.length - 2} 個`}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewImage(image.path)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => copyImagePath(image.path)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                      </button>
                      {!image.isUsed && (
                        <button className="p-2 text-red-400 hover:text-red-600">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 圖片預覽模態框 */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <img
              src={previewImage}
              alt="預覽"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}