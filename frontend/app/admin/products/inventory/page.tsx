'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { 
  CubeIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Product } from '@/lib/products'

interface ProductStock {
  id: number
  name: string
  image: string
  category: string
  price: number
  variants: ProductVariant[]
  totalStock: number
  lowStockAlert: boolean
  outOfStock: boolean
}

interface ProductVariant {
  id: string
  size?: string
  color?: string
  sku: string
  stock: number
  reserved: number
  available: number
  lowStockThreshold: number
  price?: number
}

export default function InventoryManagementPage() {
  const [products, setProducts] = useState<ProductStock[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductStock[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'price'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<number[]>([])
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchQuery, stockFilter, categoryFilter, sortBy, sortDirection])

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      // 模擬庫存數據
      const { products: baseProducts } = await import('@/lib/products')
      
      const stockData: ProductStock[] = baseProducts.map(product => {
        // 為每個商品生成變體數據
        const variants: ProductVariant[] = []
        
        // 根據商品類型生成不同的變體
        if (product.category === 'dress' || product.category === 'top') {
          ['XS', 'S', 'M', 'L', 'XL'].forEach(size => {
            product.colors.forEach((color, colorIndex) => {
              variants.push({
                id: `${product.id}-${size}-${colorIndex}`,
                size,
                color,
                sku: `${product.category.toUpperCase()}-${product.id}-${size}-${colorIndex + 1}`,
                stock: Math.floor(Math.random() * 50) + 1,
                reserved: Math.floor(Math.random() * 5),
                available: 0, // 會在下面計算
                lowStockThreshold: 5,
                price: product.price
              })
            })
          })
        } else {
          // 只有顏色變體的商品
          product.colors.forEach((color, colorIndex) => {
            variants.push({
              id: `${product.id}-${colorIndex}`,
              color,
              sku: `${product.category.toUpperCase()}-${product.id}-${colorIndex + 1}`,
              stock: Math.floor(Math.random() * 30) + 1,
              reserved: Math.floor(Math.random() * 3),
              available: 0,
              lowStockThreshold: 3
            })
          })
        }

        // 計算可用庫存
        variants.forEach(variant => {
          variant.available = Math.max(0, variant.stock - variant.reserved)
        })

        const totalStock = variants.reduce((sum, variant) => sum + variant.available, 0)
        const lowStockAlert = variants.some(variant => 
          variant.available <= variant.lowStockThreshold && variant.available > 0
        )
        const outOfStock = variants.every(variant => variant.available === 0)

        return {
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          price: product.price,
          variants,
          totalStock,
          lowStockAlert,
          outOfStock
        }
      })

      setProducts(stockData)
    } catch (error) {
      console.error('獲取庫存數據失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // 搜尋篩選
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.variants.some(variant => variant.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // 庫存狀態篩選
    if (stockFilter === 'low') {
      filtered = filtered.filter(product => product.lowStockAlert)
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(product => product.outOfStock)
    }

    // 分類篩選
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter)
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'stock':
          aValue = a.totalStock
          bValue = b.totalStock
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        default:
          aValue = a.name
          bValue = b.name
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      } else {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
    })

    setFilteredProducts(filtered)
  }

  const handleSort = (field: 'name' | 'stock' | 'price') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  const getStockStatusBadge = (product: ProductStock) => {
    if (product.outOfStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="h-3 w-3 mr-1" />
          缺貨
        </span>
      )
    } else if (product.lowStockAlert) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
          庫存不足
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          庫存充足
        </span>
      )
    }
  }

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const selectAllProducts = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id))
    }
  }

  const categories = [...new Set(products.map(p => p.category))]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CubeIcon className="h-8 w-8 text-blue-600" />
            庫存管理
          </h1>
          <p className="text-gray-600 mt-2">管理商品庫存、變體和預警設置</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkUpdate(true)}
            disabled={selectedProducts.length === 0}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
            批量更新 ({selectedProducts.length})
          </button>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            + 新增商品
          </Link>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-blue-600">{products.length}</div>
          <div className="text-sm text-gray-600">總商品數</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-green-600">
            {products.reduce((sum, p) => sum + p.totalStock, 0)}
          </div>
          <div className="text-sm text-gray-600">總庫存數</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {products.filter(p => p.lowStockAlert).length}
          </div>
          <div className="text-sm text-gray-600">低庫存商品</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-red-600">
            {products.filter(p => p.outOfStock).length}
          </div>
          <div className="text-sm text-gray-600">缺貨商品</div>
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* 搜尋框 */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋商品名稱或SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* 篩選選項 */}
          <div className="flex gap-3">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部庫存</option>
              <option value="low">庫存不足</option>
              <option value="out">已缺貨</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部分類</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 商品庫存表格 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到商品</h3>
            <p className="mt-1 text-sm text-gray-500">請調整搜尋條件</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={selectAllProducts}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商品
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      名稱
                      {sortBy === 'name' && (
                        sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分類
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      價格
                      {sortBy === 'price' && (
                        sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center gap-1">
                      總庫存
                      {sortBy === 'stock' && (
                        sortDirection === 'asc' ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    庫存狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    變體數量
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 max-w-xs truncate">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {product.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-gray-900">
                        {product.totalStock}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.variants.reduce((sum, v) => sum + v.reserved, 0)} 已預定
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStockStatusBadge(product)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.variants.length} 個變體
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/products/${product.id}/inventory`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 批量更新模態框 */}
      {showBulkUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">批量更新庫存</h3>
            <p className="text-gray-600 mb-4">
              將對 {selectedProducts.length} 個商品進行批量操作
            </p>
            <div className="space-y-3">
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                批量調整庫存數量
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                批量設置低庫存警告
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 rounded hover:bg-gray-50">
                批量更新價格
              </button>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkUpdate(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('批量更新功能開發中...')
                  setShowBulkUpdate(false)
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}