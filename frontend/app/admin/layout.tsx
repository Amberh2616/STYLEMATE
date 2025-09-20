import React from 'react'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  TagIcon,
  PhotoIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'

const inter = Inter({ subsets: ['latin'] })

const navigation = [
  { 
    name: '總覽', 
    href: '/admin', 
    icon: HomeIcon,
    description: '系統概況與統計' 
  },
  { 
    name: '商品管理', 
    href: '/admin/products', 
    icon: ShoppingBagIcon,
    description: '商品新增、編輯、庫存管理',
    children: [
      { name: '商品列表', href: '/admin/products' },
      { name: '新增商品', href: '/admin/products/create' },
      { name: '分類管理', href: '/admin/categories' },
      { name: '庫存管理', href: '/admin/products/inventory' }
    ]
  },
  { 
    name: '標籤管理', 
    href: '/admin/tags', 
    icon: TagIcon,
    description: '商品標籤與分類' 
  },
  { 
    name: '圖片管理', 
    href: '/admin/images', 
    icon: PhotoIcon,
    description: '商品圖片與媒體檔案',
    children: [
      { name: '圖片庫', href: '/admin/images' },
      { name: '重複檢測', href: '/admin/images/duplicates' },
      { name: '批量上傳', href: '/admin/images/upload' }
    ]
  },
  { 
    name: '數據分析', 
    href: '/admin/analytics', 
    icon: ChartBarIcon,
    description: '銷售報表與分析' 
  },
  { 
    name: '用戶管理', 
    href: '/admin/users', 
    icon: UserGroupIcon,
    description: '用戶資料與權限' 
  },
  { 
    name: '系統設定', 
    href: '/admin/settings', 
    icon: CogIcon,
    description: '系統配置與偏好設定' 
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-50`}>
      {/* 側邊導航 */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50">
        {/* Logo 區域 */}
        <div className="flex items-center justify-center h-16 bg-purple-600 text-white">
          <h1 className="text-xl font-bold">STYLEMATE Admin</h1>
        </div>
        
        {/* 導航選單 */}
        <nav className="mt-8 px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200"
                >
                  <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                  {item.name}
                </Link>
                
                {/* 子選單 */}
                {item.children && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-3 py-1 text-xs text-gray-500 hover:text-purple-600 hover:bg-gray-50 rounded transition-colors duration-200"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        
        {/* 底部資訊 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p>STYLEMATE v1.0</p>
            <p>商品管理系統</p>
          </div>
        </div>
      </div>
      
      {/* 主要內容區域 */}
      <div className="ml-64">
        {/* 頂部工具列 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100">
                <Bars3Icon className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                管理後台
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 快速操作按鈕 */}
              <Link
                href="/admin/products/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                + 新增商品
              </Link>
              
              {/* 用戶資訊 */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">A</span>
                </div>
                <span className="text-sm text-gray-700">管理員</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* 頁面內容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}