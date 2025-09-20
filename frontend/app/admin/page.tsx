'use client'

import { useState, useEffect } from 'react'
import { 
  ShoppingBagIcon,
  CubeIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalStock: number
  lowStockProducts: number
  categories: { name: string; count: number }[]
  recentActivity: { action: string; item: string; time: string }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    categories: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 同時獲取多個統計數據
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?limit=1'),
        fetch('/api/products/categories?stats=true')
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      if (productsData.success && categoriesData.success) {
        setStats({
          totalProducts: productsData.pagination?.total || 0,
          activeProducts: productsData.pagination?.total || 0,
          totalStock: 1250, // 模擬數據
          lowStockProducts: 8, // 模擬數據
          categories: categoriesData.data || [],
          recentActivity: [
            { action: '新增商品', item: 'Pink Ruffle Two-Piece Set', time: '2小時前' },
            { action: '更新庫存', item: 'White Lace Dress', time: '4小時前' },
            { action: '修改價格', item: 'Korean Style Top', time: '1天前' },
          ]
        })
      } else {
        // 使用模擬數據
        setStats({
          totalProducts: 79,
          activeProducts: 75,
          totalStock: 1250,
          lowStockProducts: 8,
          categories: [
            { name: '洋裝', count: 35 },
            { name: '上衣', count: 20 },
            { name: '套裝', count: 15 },
            { name: '下身', count: 9 }
          ],
          recentActivity: [
            { action: '新增商品', item: 'Pink Ruffle Two-Piece Set', time: '2小時前' },
            { action: '更新庫存', item: 'White Lace Dress', time: '4小時前' },
            { action: '修改價格', item: 'Korean Style Top', time: '1天前' },
          ]
        })
      }
    } catch (err) {
      setError('無法載入數據')
      // 使用模擬數據作為備援
      setStats({
        totalProducts: 79,
        activeProducts: 75,
        totalStock: 1250,
        lowStockProducts: 8,
        categories: [
          { name: '洋裝', count: 35 },
          { name: '上衣', count: 20 },
          { name: '套裝', count: 15 },
          { name: '下身', count: 9 }
        ],
        recentActivity: [
          { action: '新增商品', item: 'Pink Ruffle Two-Piece Set', time: '2小時前' },
          { action: '更新庫存', item: 'White Lace Dress', time: '4小時前' },
          { action: '修改價格', item: 'Korean Style Top', time: '1天前' },
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: '總商品數',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      change: '+12',
      changeType: 'increase'
    },
    {
      title: '上架商品',
      value: stats.activeProducts,
      icon: EyeIcon,
      color: 'bg-green-500',
      change: '+5',
      changeType: 'increase'
    },
    {
      title: '總庫存',
      value: stats.totalStock,
      icon: CubeIcon,
      color: 'bg-purple-500',
      change: '-23',
      changeType: 'decrease'
    },
    {
      title: '低庫存警報',
      value: stats.lowStockProducts,
      icon: ChartBarIcon,
      color: 'bg-red-500',
      change: '+2',
      changeType: 'increase'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理後台總覽</h1>
        <p className="mt-1 text-sm text-gray-600">
          歡迎回來！以下是您的商品管理系統概況。
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${card.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {card.value.toLocaleString()}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {card.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 主要內容區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 分類統計 */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">商品分類統計</h3>
            <p className="mt-1 text-sm text-gray-600">各分類的商品數量分布</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.categories.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {category.product_count || category.count} 個商品
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ 
                          width: `${((category.product_count || category.count) / stats.totalProducts * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近活動 */}
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近活動</h3>
            <p className="mt-1 text-sm text-gray-600">系統最新操作記錄</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {activity.item}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">快速操作</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <ShoppingBagIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium">新增商品</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <CubeIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium">庫存管理</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <ChartBarIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium">查看報表</span>
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <EyeIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-sm font-medium">前台預覽</span>
            </button>
          </div>
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error} - 使用模擬數據顯示
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}