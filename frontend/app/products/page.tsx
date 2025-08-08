'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, FunnelIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import Link from 'next/link'
import { products, Product } from '@/lib/products'

export default function ProductsPage() {
  const [productList, setProductList] = useState<Product[]>(products)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStyle, setSelectedStyle] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, selectedStyle, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 500))
      setProductList(products)
    } catch (error) {
      console.error('Fetch products error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const filteredProducts = productList.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false
    if (selectedStyle !== 'all' && product.style !== selectedStyle) return false
    return true
  })

  const categories = [
    { value: 'all', label: '全部商品', count: productList.length },
    { value: 'dress', label: '洋裝', count: productList.filter(p => p.category === 'dress').length },
    { value: 'top', label: '上衣', count: productList.filter(p => p.category === 'top').length },
    { value: 'bottom', label: '下身', count: productList.filter(p => p.category === 'bottom').length },
    { value: 'outer', label: '外套', count: productList.filter(p => p.category === 'outer').length }
  ]

  const styles = [
    { value: 'all', label: '全部風格' },
    { value: 'sweet', label: '甜美可愛' },
    { value: 'elegant', label: '優雅女神' },
    { value: 'street', label: '街頭潮流' }
  ]

  return (
    <div className="min-h-screen bg-neutral-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              韓式風格商品
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              精選韓國最新流行服飾，從甜美可愛到街頭潮流，找到最適合你的風格
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 shadow-morandi mb-6">
              <h3 className="text-lg font-semibold text-neutral-dark mb-4 flex items-center">
                <FunnelIcon className="w-5 h-5 mr-2" />
                篩選條件
              </h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-neutral-dark mb-3">商品分類</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center
                        ${selectedCategory === category.value 
                          ? 'bg-primary-500 text-white' 
                          : 'hover:bg-primary-50 text-neutral-dark'}`}
                    >
                      <span>{category.label}</span>
                      <span className={`text-xs ${selectedCategory === category.value ? 'text-white/70' : 'text-neutral-medium'}`}>
                        ({category.count})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-neutral-dark mb-3">穿搭風格</h4>
                <div className="space-y-2">
                  {styles.map(style => (
                    <button
                      key={style.value}
                      onClick={() => setSelectedStyle(style.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                        ${selectedStyle === style.value 
                          ? 'bg-primary-500 text-white' 
                          : 'hover:bg-primary-50 text-neutral-dark'}`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="text-neutral-dark">
                找到 <span className="font-semibold">{filteredProducts.length}</span> 個商品
              </div>
              
              <div className="flex items-center gap-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-neutral-light rounded-lg bg-white text-neutral-dark focus:border-primary-500 focus:outline-none"
                >
                  <option value="popular">人氣推薦</option>
                  <option value="price-low">價格：低到高</option>
                  <option value="price-high">價格：高到低</option>
                  <option value="newest">最新上架</option>
                  <option value="rating">評分最高</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-neutral-medium">載入商品中...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-morandi hover:shadow-morandi-lg transition-all duration-300 hover:-translate-y-2 group">
                    <div className="relative">
                      <div className="aspect-square bg-neutral-light relative overflow-hidden">
                        {/* Placeholder image */}
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <span className="text-4xl opacity-50">👗</span>
                        </div>
                        
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.isNew && (
                            <span className="bg-info text-white text-xs px-2 py-1 rounded-full font-medium">
                              NEW
                            </span>
                          )}
                          {product.isSale && (
                            <span className="bg-error text-white text-xs px-2 py-1 rounded-full font-medium">
                              SALE
                            </span>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={() => toggleFavorite(product.id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
                        >
                          {favorites.includes(product.id) ? (
                            <HeartSolidIcon className="w-5 h-5 text-error" />
                          ) : (
                            <HeartIcon className="w-5 h-5 text-neutral-medium" />
                          )}
                        </button>

                        {/* Try On Button */}
                        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Link href={`/tryon?product=${product.id}`}>
                            <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2.5 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2">
                              <span>👗</span>
                              <span>立即試穿</span>
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-neutral-dark mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <p className="text-sm text-neutral-medium mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }, (_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-warning fill-current' : 'text-neutral-light'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-neutral-medium">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary-600">
                            NT$ {product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-neutral-medium line-through">
                              NT$ {product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link href={`/tryon?product=${product.id}`} className="flex-1">
                          <button className="w-full bg-primary-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-1">
                            <span>👗</span>
                            <span>試穿</span>
                          </button>
                        </Link>
                        <button 
                          onClick={() => toggleFavorite(product.id)}
                          className="px-3 py-2 rounded-lg border border-neutral-light hover:border-primary-300 hover:bg-primary-50 transition-colors"
                        >
                          {favorites.includes(product.id) ? (
                            <HeartSolidIcon className="w-4 h-4 text-error" />
                          ) : (
                            <HeartIcon className="w-4 h-4 text-neutral-medium" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-50">🔍</div>
                <h3 className="text-xl font-semibold text-neutral-dark mb-2">
                  沒有找到相關商品
                </h3>
                <p className="text-neutral-medium mb-6">
                  試試調整篩選條件或瀏覽其他分類
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedStyle('all')
                  }}
                  className="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  重設篩選條件
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}