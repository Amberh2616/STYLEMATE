'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { TagIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Tag {
  id: string
  name: string
  category: string
  count: number
  color: string
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'style',
    color: '#3B82F6'
  })

  // 標籤分類
  const tagCategories = [
    { value: 'style', label: '風格', color: '#3B82F6' },
    { value: 'occasion', label: '場合', color: '#10B981' },
    { value: 'season', label: '季節', color: '#F59E0B' },
    { value: 'color', label: '顏色', color: '#EF4444' },
    { value: 'material', label: '材質', color: '#8B5CF6' },
    { value: 'feature', label: '特色', color: '#06B6D4' }
  ]

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/tags')
      const data = await response.json()
      
      if (data.success) {
        setTags(data.data)
      } else {
        console.error('獲取標籤失敗:', data.error)
      }
    } catch (error) {
      console.error('獲取標籤失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingTag) {
        // 更新標籤
        const response = await fetch('/api/admin/tags', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTag.id,
            name: formData.name,
            category: formData.category,
            color: formData.color
          })
        })
        
        const data = await response.json()
        if (data.success) {
          const updatedTag = {
            ...editingTag,
            name: formData.name,
            category: formData.category,
            color: formData.color
          }
          setTags(tags.map(tag => tag.id === editingTag.id ? updatedTag : tag))
          setEditingTag(null)
          alert('標籤更新成功！')
        }
      } else {
        // 新增標籤
        const response = await fetch('/api/admin/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            category: formData.category,
            color: formData.color
          })
        })
        
        const data = await response.json()
        if (data.success) {
          setTags([...tags, data.data])
          alert('標籤新增成功！')
        }
      }
      
      // 重置表單
      setFormData({ name: '', category: 'style', color: '#3B82F6' })
      setIsCreating(false)
    } catch (error) {
      console.error('保存標籤失敗:', error)
      alert('保存失敗，請稍後再試')
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      category: tag.category,
      color: tag.color
    })
    setIsCreating(true)
  }

  const handleDelete = async (tagId: string) => {
    if (confirm('確定要刪除這個標籤嗎？')) {
      try {
        const response = await fetch(`/api/admin/tags?id=${tagId}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        if (data.success) {
          setTags(tags.filter(tag => tag.id !== tagId))
          alert('標籤刪除成功！')
        }
      } catch (error) {
        console.error('刪除標籤失敗:', error)
        alert('刪除失敗，請稍後再試')
      }
    }
  }

  const getCategoryLabel = (category: string) => {
    return tagCategories.find(cat => cat.value === category)?.label || category
  }

  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = []
    }
    acc[tag.category].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

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
            <TagIcon className="h-8 w-8 text-blue-600" />
            標籤管理
          </h1>
          <p className="text-gray-600 mt-2">管理商品標籤，提升分類效率</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          新增標籤
        </button>
      </div>

      {/* 新增/編輯標籤表單 */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border">
          <h2 className="text-xl font-semibold mb-4">
            {editingTag ? '編輯標籤' : '新增標籤'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  標籤名稱
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="輸入標籤名稱"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分類
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {tagCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
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
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTag ? '更新' : '新增'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingTag(null)
                  setFormData({ name: '', category: 'style', color: '#3B82F6' })
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 標籤列表 */}
      <div className="space-y-6">
        {Object.entries(groupedTags).map(([category, categoryTags]) => (
          <div key={category} className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tagCategories.find(cat => cat.value === category)?.color }}
                ></span>
                {getCategoryLabel(category)}
                <span className="text-sm text-gray-500">({categoryTags.length})</span>
              </h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      ></span>
                      <div>
                        <span className="font-medium text-gray-900">{tag.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({tag.count})</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {tags.length === 0 && (
        <div className="text-center py-12">
          <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">沒有標籤</h3>
          <p className="mt-1 text-sm text-gray-500">開始建立第一個標籤吧！</p>
        </div>
      )}
    </div>
  )
}