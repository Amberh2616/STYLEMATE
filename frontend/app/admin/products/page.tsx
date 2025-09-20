'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: number
  name: string
  sku: string
  category: string
  price: number
  status: string
  variants: {
    id: number
    color_name: string
    thumbnail: string
  }[]
  total_stock: number
  created_at: string
}

interface ProductFilters {
  search: string
  category: string
  status: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const CATEGORIES = [
  { value: '', label: '所有分類' },
  { value: 'dress', label: '洋裝' },
  { value: 'top', label: '上衣' },
  { value: 'bottom', label: '下身' },
  { value: 'two-piece', label: '套裝' },
  { value: 'accessories', label: '配件' }
]

const STATUS_OPTIONS = [
  { value: '', label: '所有狀態' },
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '下架' },
  { value: 'draft', label: '草稿' },
  { value: 'sold_out', label: '售完' }
]

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
  sold_out: 'bg-red-100 text-red-800'
}

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    status: 'active'
  })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])

  useEffect(() => {
    fetchProducts()
  }, [filters, pagination.page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.status && { status: filters.status })
      })

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.data || [])
        setPagination(data.pagination || pagination)
      } else {
        setError(data.error || '無法載入商品數據')
        // 使用現有的靜態數據作為備援
        await loadFallbackData()
      }
    } catch (err) {
      setError('網路連接失敗')
      await loadFallbackData()
    } finally {
      setLoading(false)
    }
  }

  const loadFallbackData = async () => {
    try {
      // 使用現有的商品數據
      const { products: staticProducts } = await import('@/lib/products')
      
      // 應用篩選邏輯
      let filteredProducts = staticProducts.filter(product => {
        if (filters.category && product.category !== filters.category) return false
        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          return product.name.toLowerCase().includes(searchLower)
        }
        return true
      })
      
      // 計算分頁
      const startIndex = (pagination.page - 1) * pagination.limit
      const endIndex = startIndex + pagination.limit
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
      
      // 轉換格式以匹配 API 結構
      const transformedProducts: Product[] = paginatedProducts.map(product => ({
        id: product.id,
        name: product.name,
        sku: `STM-${product.category.toUpperCase()}-${String(product.id).padStart(3, '0')}`,
        category: product.category,
        price: product.price,
        status: 'active',
        variants: [{
          id: product.id,
          color_name: product.colors?.[0] || '預設',
          thumbnail: product.image
        }],
        total_stock: Math.floor(Math.random() * 100) + 10,
        created_at: new Date().toISOString()
      }))

      setProducts(transformedProducts)
      setPagination(prev => ({
        ...prev,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / prev.limit),
        hasNext: pagination.page * pagination.limit < filteredProducts.length,
        hasPrev: pagination.page > 1
      }))
    } catch (fallbackError) {
      console.error('載入備援數據失敗:', fallbackError)
    }
  }

  const handleFilterChange = (key: keyof ProductFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // 重置到第一頁
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleSelectAll = () => {
    setSelectedProducts(
      selectedProducts.length === products.length 
        ? [] 
        : products.map(p => p.id)
    )
  }

  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkAction, setBulkAction] = useState<string>('')
  const [bulkData, setBulkData] = useState<any>({})
  const [bulkActions, setBulkActions] = useState<any[]>([])

  // 獲取批量操作選項
  useEffect(() => {
    fetchBulkActions()
  }, [])

  const fetchBulkActions = async () => {
    try {
      const response = await fetch('/api/admin/products/bulk')
      const data = await response.json()
      if (data.success) {
        setBulkActions(data.data)
      }
    } catch (error) {
      console.error('獲取批量操作選項失敗:', error)
    }
  }

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedProducts.length === 0) {
      alert('請先選擇要操作的商品')
      return
    }

    const confirmMessage = `確定要對 ${selectedProducts.length} 個商品執行「${action}」操作嗎？`
    
    if (action === '批量刪除' && !confirm(confirmMessage + '\n\n注意：此操作無法復原！')) {
      return
    } else if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      
      // 將中文操作名轉換為API格式
      const actionMap = {
        '批量啟用': 'activate',
        '批量停用': 'deactivate', 
        '批量刪除': 'delete',
        '批量更新分類': 'update_category',
        '批量更新標籤': 'update_tags'
      }

      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: actionMap[action as keyof typeof actionMap],
          productIds: selectedProducts.map(id => id.toString()),
          data
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`批量操作完成！成功處理 ${result.data.successCount} 個商品`)
        setSelectedProducts([])
        fetchProducts() // 重新加載商品列表
        setShowBulkModal(false)
      } else {
        alert(`操作失敗：${result.error}`)
      }
    } catch (error) {
      console.error('批量操作失敗:', error)
      alert('批量操作失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const openBulkModal = (action: string) => {
    setBulkAction(action)
    setBulkData({})
    setShowBulkModal(true)
  }

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題與操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="mt-1 text-sm text-gray-600">
            管理您的商品庫存、價格和資訊
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            href="/admin/products/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            新增商品
          </Link>
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 搜尋框 */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜尋商品名稱或 SKU..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* 分類篩選 */}
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* 狀態篩選 */}
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* 批量操作 */}
          <div className="flex space-x-2">
            {selectedProducts.length > 0 && (
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                <span className="text-sm text-blue-700 font-medium">
                  已選擇 {selectedProducts.length} 個商品
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleBulkAction('批量啟用')}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    title="批量啟用"
                  >
                    ✅ 啟用
                  </button>
                  <button
                    onClick={() => handleBulkAction('批量停用')}
                    className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                    title="批量停用"
                  >
                    ❌ 停用
                  </button>
                  <button
                    onClick={() => openBulkModal('批量更新分類')}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    title="批量更新分類"
                  >
                    📂 分類
                  </button>
                  <button
                    onClick={() => openBulkModal('批量更新標籤')}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    title="批量更新標籤"
                  >
                    🏷️ 標籤
                  </button>
                  <button
                    onClick={() => handleBulkAction('批量刪除')}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="批量刪除"
                  >
                    🗑️ 刪除
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {error} - 顯示備援資料
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 商品列表 */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === products.length && products.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分類
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  價格
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  庫存
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.variants[0]?.thumbnail ? (
                          <Image
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.variants[0].thumbnail}
                            alt={product.name}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">無圖</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.variants.length} 個變體
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    NT$ {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${product.total_stock <= 10 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {product.total_stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_STYLES[product.status as keyof typeof STATUS_STYLES] || STATUS_STYLES.active
                    }`}>
                      {STATUS_OPTIONS.find(s => s.value === product.status)?.label || '上架中'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-purple-600 hover:text-purple-900"
                        title="查看詳細"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="編輯"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm('確定要刪除這個商品嗎？')) {
                            // TODO: 實現刪除功能
                            alert('刪除功能開發中')
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="刪除"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分頁控制 */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一頁
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一頁
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    顯示第 <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> 到{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    項，共 <span className="font-medium">{pagination.total}</span> 項
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    
                    {/* 頁碼按鈕 */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, pagination.page - 2) + i
                      if (pageNum > pagination.totalPages) return null
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.page
                              ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 批量操作模態框 */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {bulkAction}
              </h3>
              
              {bulkAction === '批量更新分類' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選擇新分類
                  </label>
                  <select
                    value={bulkData.category || ''}
                    onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">請選擇分類</option>
                    {CATEGORIES.slice(1).map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {bulkAction === '批量更新標籤' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    輸入新標籤（用逗號分隔）
                  </label>
                  <input
                    type="text"
                    value={bulkData.tagsInput || ''}
                    onChange={(e) => setBulkData({ 
                      ...bulkData, 
                      tagsInput: e.target.value,
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="例：韓系, 甜美, 約會"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    將會替換現有標籤
                  </p>
                </div>
              )}

              <div className="text-sm text-gray-600 mb-4">
                即將對 <span className="font-medium">{selectedProducts.length}</span> 個商品執行此操作
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (bulkAction === '批量更新分類' && !bulkData.category) {
                      alert('請選擇分類')
                      return
                    }
                    if (bulkAction === '批量更新標籤' && (!bulkData.tags || bulkData.tags.length === 0)) {
                      alert('請輸入標籤')
                      return
                    }
                    handleBulkAction(bulkAction, bulkData)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                >
                  確認執行
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}