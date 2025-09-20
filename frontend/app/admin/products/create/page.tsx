'use client'

import React from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const CATEGORIES = [
  { value: 'dress', label: '洋裝' },
  { value: 'top', label: '上衣' },
  { value: 'bottom', label: '下身' },
  { value: 'two-piece', label: '套裝' },
  { value: 'accessories', label: '配件' }
]

const STYLES = [
  'elegant', 'casual', 'korean', 'sweet', 'sexy', 'minimal', 'vintage', 'trendy'
]

const SEASONS = [
  '春', '夏', '秋', '冬'
]

const OCCASIONS = [
  'date', 'work', 'party', 'leisure', 'formal', 'travel'
]

interface ProductFormData {
  name: string
  category: string
  price: number
  description: string
  brand: string
  material: string
  style: string
  season: string[]
  occasion: string[]
  tags: string[]
  colors: string[]
  variants: {
    color_name: string
    color_code: string
    images: string[]
    stock: { [size: string]: number }
  }[]
}

export default function CreateProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: 'dress',
    price: 0,
    description: '',
    brand: 'STYLEMATE',
    material: '混紡材質',
    style: 'korean',
    season: [],
    occasion: [],
    tags: [],
    colors: [],
    variants: []
  })

  const [currentVariant, setCurrentVariant] = useState({
    color_name: '',
    color_code: '#000000',
    images: [],
    stock: { S: 10, M: 10, L: 10 }
  })

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field: 'season' | 'occasion' | 'tags' | 'colors', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const addVariant = () => {
    if (!currentVariant.color_name) {
      alert('請輸入顏色名稱')
      return
    }

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { ...currentVariant }],
      colors: prev.colors.includes(currentVariant.color_name) 
        ? prev.colors 
        : [...prev.colors, currentVariant.color_name]
    }))

    // 重置變體表單
    setCurrentVariant({
      color_name: '',
      color_code: '#000000',
      images: [],
      stock: { S: 10, M: 10, L: 10 }
    })
  }

  const removeVariant = (index: number) => {
    const variant = formData.variants[index]
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
      colors: prev.colors.filter(color => color !== variant.color_name)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 基本驗證
      if (!formData.name || !formData.category || formData.price <= 0) {
        throw new Error('請填寫所有必填欄位')
      }

      if (formData.variants.length === 0) {
        throw new Error('請至少新增一個商品變體')
      }

      // 發送 API 請求
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        alert('商品新增成功！')
        router.push('/admin/products')
      } else {
        throw new Error(data.error || '新增失敗')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '新增失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/products"
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          返回商品列表
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新增商品</h1>
          <p className="text-sm text-gray-600">填寫商品基本資訊與變體設定</p>
        </div>
      </div>

      {/* 錯誤提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資訊 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">基本資訊</h2>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                商品名稱 *
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例：Korean Style Dress"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                分類 *
              </label>
              <select
                required
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                價格 (NT$) *
              </label>
              <input
                type="number"
                required
                min="1"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                placeholder="3480"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                品牌
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="STYLEMATE"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                材質
              </label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.material}
                onChange={(e) => handleInputChange('material', e.target.value)}
                placeholder="棉質混紡"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                風格
              </label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={formData.style}
                onChange={(e) => handleInputChange('style', e.target.value)}
              >
                {STYLES.map(style => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              商品描述
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="商品特色與詳細描述..."
            />
          </div>
        </div>

        {/* 標籤與分類 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">標籤與分類</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                適用季節
              </label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map(season => (
                  <button
                    key={season}
                    type="button"
                    onClick={() => handleArrayToggle('season', season)}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      formData.season.includes(season)
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                適用場合
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map(occasion => (
                  <button
                    key={occasion}
                    type="button"
                    onClick={() => handleArrayToggle('occasion', occasion)}
                    className={`px-3 py-1 text-sm rounded-full border ${
                      formData.occasion.includes(occasion)
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {occasion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 商品變體 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">商品變體</h2>

          {/* 新增變體表單 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">新增變體</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <input
                  type="text"
                  placeholder="顏色名稱 (例：粉色)"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={currentVariant.color_name}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, color_name: e.target.value }))}
                />
              </div>
              <div>
                <input
                  type="color"
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={currentVariant.color_code}
                  onChange={(e) => setCurrentVariant(prev => ({ ...prev, color_code: e.target.value }))}
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="w-full px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                >
                  新增變體
                </button>
              </div>
            </div>
          </div>

          {/* 已新增的變體列表 */}
          {formData.variants.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">已新增變體</h3>
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: variant.color_code }}
                    ></div>
                    <span className="text-sm font-medium">{variant.color_name}</span>
                    <span className="text-xs text-gray-500">庫存: S({variant.stock.S}) M({variant.stock.M}) L({variant.stock.L})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    移除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提交按鈕 */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '新增中...' : '新增商品'}
          </button>
        </div>
      </form>
    </div>
  )
}