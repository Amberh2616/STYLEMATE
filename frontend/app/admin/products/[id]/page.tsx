'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  SwatchIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { Product } from '@/lib/products'

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      const { products } = await import('@/lib/products')
      const foundProduct = products.find(p => p.id === parseInt(id as string))
      setProduct(foundProduct || null)
    } catch (error) {
      console.error('獲取商品失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  const getStatusBadge = (product: Product) => {
    // 假設商品默認為上架狀態
    const isActive = true
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircleIcon className="h-3 w-3 mr-1" />
        上架中
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircleIcon className="h-3 w-3 mr-1" />
        下架
      </span>
    )
  }

  const copyProductInfo = () => {
    if (!product) return
    const info = `商品名稱: ${product.name}
價格: ${formatPrice(product.price)}
分類: ${product.category}
標籤: ${product.tags.join(', ')}
顏色: ${product.colors.join(', ')}
風格: ${product.style}
場合: ${product.occasion.join(', ')}
季節: ${product.season.join(', ')}
材質: ${product.material}
袖型: ${product.sleeve}
長度: ${product.length}`
    
    navigator.clipboard.writeText(info)
    alert('商品信息已複製到剪貼簿')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">找不到商品</h3>
          <p className="mt-1 text-sm text-gray-500">該商品可能已被刪除或ID不正確</p>
          <div className="mt-6">
            <Link
              href="/admin/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              返回商品列表
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            返回商品列表
          </Link>
          <div className="text-sm text-gray-500">
            ID: {product.id}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={copyProductInfo}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            複製信息
          </button>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            編輯商品
          </Link>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
            <TrashIcon className="h-4 w-4 mr-2" />
            刪除商品
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 商品圖片 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowImageModal(true)}
              />
              <button
                onClick={() => setShowImageModal(true)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">點擊圖片放大查看</p>
            </div>
          </div>
        </div>

        {/* 商品信息 */}
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {getStatusBadge(product)}
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-4">
              {formatPrice(product.price)}
            </div>
            <div className="text-sm text-gray-600">
              商品ID: {product.id}
            </div>
          </div>

          {/* 分類與標籤 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-gray-600" />
              分類與標籤
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  商品分類
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.category}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品標籤
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 外觀屬性 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SwatchIcon className="h-5 w-5 text-gray-600" />
              外觀屬性
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 mb-1">顏色</label>
                <div className="flex flex-wrap gap-1">
                  {product.colors.map((color, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">風格</label>
                <span className="text-gray-900">{product.style}</span>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">材質</label>
                <span className="text-gray-900">{product.material}</span>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">袖型</label>
                <span className="text-gray-900">{product.sleeve}</span>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">長度</label>
                <span className="text-gray-900">{product.length}</span>
              </div>
              {product.neckline && (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">領型</label>
                  <span className="text-gray-900">{product.neckline}</span>
                </div>
              )}
              {product.fit && (
                <div>
                  <label className="block font-medium text-gray-700 mb-1">版型</label>
                  <span className="text-gray-900">{product.fit}</span>
                </div>
              )}
            </div>
          </div>

          {/* 使用場合與季節 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              使用場合與季節
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  適用場合
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.occasion.map((occ, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {occ}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  適用季節
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.season.map((season, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                    >
                      {season}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 其他信息 */}
          {(product.color_temperature || (product as any).saturation) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">色彩分析</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {product.color_temperature && (
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">色溫</label>
                    <span className="text-gray-900">{product.color_temperature}</span>
                  </div>
                )}
                {(product as any).saturation && (
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">飽和度</label>
                    <span className="text-gray-900">{(product as any).saturation}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 圖片預覽模態框 */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XCircleIcon className="h-8 w-8" />
            </button>
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <h4 className="font-medium">{product.name}</h4>
              <p className="text-sm text-gray-300">ID: {product.id}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}