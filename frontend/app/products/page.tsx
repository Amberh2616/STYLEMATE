'use client'

import { useState, useEffect } from 'react'
import { ChevronDownIcon, FunnelIcon, HeartIcon, StarIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  style: string
  description: string
  rating: number
  reviews: number
  isNew?: boolean
  isSale?: boolean
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
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
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockProducts: Product[] = [
        {
          id: '1',
          name: '韓式甜美花朵印花洋裝',
          price: 1299,
          originalPrice: 1699,
          image: '/images/dress-1.jpg',
          category: 'dress',
          style: 'sweet',
          description: '甜美可愛的花朵印花洋裝，輕薄透氣的面料，適合春夏穿搭',
          rating: 4.8,
          reviews: 124,
          isNew: true,
          isSale: true
        },
        {
          id: '2',
          name: '優雅V領職場襯衫',
          price: 899,
          image: '/images/shirt-1.jpg',
          category: 'top',
          style: 'elegant',
          description: '簡約優雅的V領襯衫，職場必備單品',
          rating: 4.6,
          reviews: 89
        },
        {
          id: '3',
          name: '街頭風格寬鬆牛仔外套',
          price: 1899,
          image: '/images/jacket-1.jpg',
          category: 'outer',
          style: 'street',
          description: '復古寬鬆版型牛仔外套，街頭風格首選',
          rating: 4.7,
          reviews: 156,
          isNew: true
        },
        {
          id: '4',
          name: '高腰A字短裙',
          price: 699,
          originalPrice: 899,
          image: '/images/skirt-1.jpg',
          category: 'bottom',
          style: 'sweet',
          description: '顯瘦高腰設計A字短裙，甜美可愛',
          rating: 4.5,
          reviews: 67,
          isSale: true
        },
        {
          id: '5',
          name: '韓系簡約針織上衣',
          price: 799,
          image: '/images/knit-1.jpg',
          category: 'top',
          style: 'elegant',
          description: '柔軟舒適的針織上衣，簡約百搭',
          rating: 4.9,
          reviews: 203
        },
        {
          id: '6',
          name: '個性破洞牛仔褲',
          price: 1299,
          image: '/images/jeans-1.jpg',
          category: 'bottom',
          style: 'street',
          description: '時尚破洞設計牛仔褲，展現個性風格',
          rating: 4.4,
          reviews: 92
        }
      ]
      
      setProducts(mockProducts)
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

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false
    if (selectedStyle !== 'all' && product.style !== selectedStyle) return false
    return true
  })

  const categories = [
    { value: 'all', label: '全部商品', count: products.length },
    { value: 'dress', label: '洋裝', count: products.filter(p => p.category === 'dress').length },
    { value: 'top', label: '上衣', count: products.filter(p => p.category === 'top').length },
    { value: 'bottom', label: '下身', count: products.filter(p => p.category === 'bottom').length },
    { value: 'outer', label: '外套', count: products.filter(p => p.category === 'outer').length }
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

                        {/* Quick View Button */}
                        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Link href={`/tryon?product=${product.id}`}>
                            <button className="w-full bg-primary-500 text-white py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                              虛擬試穿
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
                      <div className="flex items-center justify-between">
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