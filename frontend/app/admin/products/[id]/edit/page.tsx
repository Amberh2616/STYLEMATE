'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const CATEGORIES = [
  { value: 'dress', label: '洋裝' },
  { value: 'top', label: '上衣' },
  { value: 'bottom', label: '下身' },
  { value: 'two-piece', label: '套裝' },
  { value: 'accessories', label: '配件' }
]

const STATUS_OPTIONS = [
  { value: 'active', label: '上架中' },
  { value: 'inactive', label: '下架' },
  { value: 'draft', label: '草稿' },
  { value: 'sold_out', label: '售完' }
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      setLoading(true)
      // 首先嘗試使用API
      const response = await fetch(`/api/products/${productId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setProduct({
          id: data.data.id,
          name: data.data.name,
          category: data.data.category,
          price: data.data.price,
          description: data.data.description,
          brand: data.data.brand || 'STYLEMATE',
          material: data.data.material || '混紡材質',
          style: data.data.style || 'korean',
          status: data.data.status || 'active'
        })
      } else {
        setError('找不到指定的商品')
      }
    } catch (err) {
      setError('無法載入商品資料')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // 呼叫 PUT API
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          category: product.category,
          price: product.price,
          description: product.description,
          brand: product.brand,
          material: product.material,
          style: product.style,
          status: product.status
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('商品更新成功！')
        router.push('/admin/products')
      } else {
        setError(data.error || '更新失敗')
      }
    } catch (err) {
      setError('網路連接失敗')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg mb-4">商品不存在</div>
        <Link href="/admin/products" className="text-purple-600 hover:text-purple-800">
          返回商品列表
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/products" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          返回商品列表
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">編輯商品</h1>
          <p className="text-sm text-gray-600">ID: {productId}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">商品名稱</label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={product.name}
              onChange={(e) => setProduct(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">分類</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={product.category}
              onChange={(e) => setProduct(prev => ({ ...prev, category: e.target.value }))}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">價格</label>
            <input
              type="number"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={product.price}
              onChange={(e) => setProduct(prev => ({ ...prev, price: parseInt(e.target.value) }))}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">狀態</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={product.status}
              onChange={(e) => setProduct(prev => ({ ...prev, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">描述</label>
          <textarea
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
            value={product.description}
            onChange={(e) => setProduct(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="flex items-center justify-end space-x-4 pt-4">
          <Link href="/admin/products" className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
            取消
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? '更新中...' : '更新商品'}
          </button>
        </div>
      </form>
    </div>
  )
}