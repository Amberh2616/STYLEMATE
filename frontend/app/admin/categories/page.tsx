'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { Squares2X2Icon, PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    color: '#3B82F6',
    icon: '👗',
    isActive: true,
    sortOrder: 0
  })

  // 分類圖標選項
  const iconOptions = [
    { value: '👗', label: '連身裙' },
    { value: '👚', label: '上衣' },
    { value: '👖', label: '褲子' },
    { value: '🧥', label: '外套' },
    { value: '👙', label: '兩件式' },
    { value: '👜', label: '配件' },
    { value: '👠', label: '鞋子' },
    { value: '🩳', label: '短褲' },
    { value: '👔', label: '正式' },
    { value: '🎽', label: '運動' }
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/categories')
      const data = await response.json()
      
      if (data.success) {
        setCategories(data.data)
      } else {
        console.error('獲取分類失敗:', data.error)
      }
    } catch (error) {
      console.error('獲取分類失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        // 更新分類
        const response = await fetch('/api/admin/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingCategory.id,
            ...formData
          })
        })
        
        const data = await response.json()
        if (data.success) {
          setCategories(categories.map(cat => 
            cat.id === editingCategory.id ? { ...editingCategory, ...formData } : cat
          ))
          setEditingCategory(null)
          alert('分類更新成功！')
        }
      } else {
        // 新增分類
        const response = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        const data = await response.json()
        if (data.success) {
          setCategories([...categories, data.data])
          alert('分類新增成功！')
        }
      }
      
      // 重置表單
      setFormData({
        name: '',
        nameEn: '',
        description: '',
        color: '#3B82F6',
        icon: '👗',
        isActive: true,
        sortOrder: 0
      })
      setIsCreating(false)
    } catch (error) {
      console.error('保存分類失敗:', error)
      alert('保存失敗，請稍後再試')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      nameEn: category.nameEn,
      description: category.description,
      color: category.color,
      icon: category.icon,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    })
    setIsCreating(true)
  }

  const handleDelete = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category && category.count > 0) {
      alert(`無法刪除此分類，因為還有 ${category.count} 個商品使用此分類`)
      return
    }

    if (confirm('確定要刪除這個分類嗎？')) {
      try {
        const response = await fetch(`/api/admin/categories?id=${categoryId}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        if (data.success) {
          setCategories(categories.filter(cat => cat.id !== categoryId))
          alert('分類刪除成功！')
        }
      } catch (error) {
        console.error('刪除分類失敗:', error)
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  const toggleActiveStatus = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (!category) return

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: categoryId,
          isActive: !category.isActive
        })
      })

      const data = await response.json()
      if (data.success) {
        setCategories(categories.map(cat => 
          cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
        ))
      }
    } catch (error) {
      console.error('切換狀態失敗:', error)
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
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Squares2X2Icon className="h-8 w-8 text-blue-600" />
            分類管理
          </h1>
          <p className="text-gray-600 mt-2">管理商品分類，建立清晰的產品結構</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          新增分類
        </button>
      </div>

      {/* 新增/編輯分類表單 */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? '編輯分類' : '新增分類'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  中文名稱 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例：連身裙"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  英文名稱 *
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例：dress"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="描述此分類的商品特色..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  圖標
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.value} {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  顏色
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  排序順序
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                啟用此分類
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCategory ? '更新' : '新增'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingCategory(null)
                  setFormData({
                    name: '',
                    nameEn: '',
                    description: '',
                    color: '#3B82F6',
                    icon: '👗',
                    isActive: true,
                    sortOrder: 0
                  })
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 分類列表 */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">所有分類 ({categories.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分類
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  英文名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  商品數量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  排序
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-500">
                            {category.description}
                          </div>
                        )}
                      </div>
                      <span 
                        className="w-3 h-3 rounded-full ml-2"
                        style={{ backgroundColor: category.color }}
                      ></span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {category.nameEn}
                    </code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {category.count} 個商品
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActiveStatus(category.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.isActive ? '已啟用' : '已停用'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="編輯"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Squares2X2Icon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有分類</h3>
          <p className="mt-1 text-sm text-gray-500">開始建立第一個分類吧！</p>
        </div>
      )}
    </div>
  )
}