'use client'

import { useState, useEffect, useRef } from 'react'
import { HeartIcon, ShoppingCartIcon, EyeIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

export interface WaterfallItem {
  id: string
  image: string
  title: string
  description?: string
  price?: number
  rating?: number
  isFavorite?: boolean
  aspectRatio?: number // 寬高比，用於計算高度
  metadata?: {
    style?: string
    occasion?: string
    season?: string
    tags?: string[]
  }
}

interface WaterfallLayoutProps {
  items: WaterfallItem[]
  columns?: number // 指定列數，不指定則自動響應式
  gap?: number
  onItemClick?: (item: WaterfallItem) => void
  onToggleFavorite?: (itemId: string) => void
  onTryOn?: (item: WaterfallItem) => void
  loading?: boolean
  className?: string
}

export default function WaterfallLayout({
  items,
  columns,
  gap = 16,
  onItemClick,
  onToggleFavorite,
  onTryOn,
  loading = false,
  className = ''
}: WaterfallLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columnHeights, setColumnHeights] = useState<number[]>([])
  const [actualColumns, setActualColumns] = useState(3)
  const [itemPositions, setItemPositions] = useState<{[key: string]: {x: number, y: number, width: number, height: number}}>({})

  // 響應式列數計算
  useEffect(() => {
    const updateColumns = () => {
      if (columns) {
        setActualColumns(columns)
        return
      }

      const width = window.innerWidth
      if (width < 640) {
        setActualColumns(2) // 手機: 2列
      } else if (width < 1024) {
        setActualColumns(3) // 平板: 3列
      } else if (width < 1400) {
        setActualColumns(4) // 桌面: 4列
      } else {
        setActualColumns(5) // 大螢幕: 5列
      }
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [columns])

  // 計算瀑布流佈局
  useEffect(() => {
    if (!containerRef.current || items.length === 0) return

    const container = containerRef.current
    const containerWidth = container.offsetWidth
    const columnWidth = (containerWidth - gap * (actualColumns - 1)) / actualColumns

    // 初始化列高度
    const heights = new Array(actualColumns).fill(0)
    const positions: {[key: string]: {x: number, y: number, width: number, height: number}} = {}

    items.forEach((item, index) => {
      // 找到最短的列
      const shortestColumnIndex = heights.indexOf(Math.min(...heights))

      // 計算位置
      const x = shortestColumnIndex * (columnWidth + gap)
      const y = heights[shortestColumnIndex]

      // 計算高度（基於寬高比或預設值）
      const aspectRatio = item.aspectRatio || 1.2 // 預設寬高比
      let itemHeight = columnWidth / aspectRatio

      // 為搭配圖加上額外的描述區域高度
      const extraHeight = 120 // 標題、描述、按鈕等的高度
      itemHeight += extraHeight

      positions[item.id] = {
        x,
        y,
        width: columnWidth,
        height: itemHeight
      }

      // 更新該列的高度
      heights[shortestColumnIndex] += itemHeight + gap
    })

    setColumnHeights(heights)
    setItemPositions(positions)
  }, [items, actualColumns, gap])

  const containerHeight = Math.max(...columnHeights)

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-morandi animate-pulse"
              style={{ height: `${200 + Math.random() * 200}px` }}
            >
              <div className="w-full h-3/4 bg-neutral-light"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-neutral-light rounded w-3/4"></div>
                <div className="h-3 bg-neutral-light rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${containerHeight}px` }}
    >
      {items.map((item) => {
        const position = itemPositions[item.id]
        if (!position) return null

        return (
          <div
            key={item.id}
            className="absolute bg-white rounded-xl overflow-hidden shadow-morandi hover:shadow-morandi-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              width: `${position.width}px`,
            }}
            onClick={() => onItemClick?.(item)}
          >
            {/* 搭配圖片區域 */}
            <div className="relative overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                style={{
                  aspectRatio: item.aspectRatio || 1.2
                }}
                onError={(e) => {
                  e.currentTarget.src = '/images/products/dress1.jpg'
                }}
              />

              {/* 懸浮操作按鈕 */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite?.(item.id)
                    }}
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg"
                  >
                    {item.isFavorite ? (
                      <HeartSolidIcon className="w-4 h-4 text-error" />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-neutral-medium" />
                    )}
                  </button>
                </div>

                {/* 試穿按鈕 */}
                <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTryOn?.(item)
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-3 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center space-x-1"
                  >
                    <SparklesIcon className="w-4 h-4" />
                    <span>AI 試穿</span>
                  </button>
                </div>
              </div>

              {/* 風格標籤 */}
              {item.metadata?.style && (
                <div className="absolute top-3 left-3">
                  <span className="bg-primary-500/90 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                    {item.metadata.style}
                  </span>
                </div>
              )}
            </div>

            {/* 商品資訊區域 */}
            <div className="p-4">
              <h3 className="font-semibold text-neutral-dark mb-2 line-clamp-2 text-sm">
                {item.title}
              </h3>

              {item.description && (
                <p className="text-xs text-neutral-medium mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* 評分和價格 */}
              <div className="flex items-center justify-between mb-3">
                {item.rating && (
                  <div className="flex items-center space-x-1">
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(item.rating!) ? 'text-warning fill-current' : 'text-neutral-light'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-neutral-medium">{item.rating}</span>
                  </div>
                )}

                {item.price && (
                  <span className="text-sm font-bold text-primary-600">
                    NT$ {item.price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* 標籤 */}
              {item.metadata?.tags && item.metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.metadata.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 底部按鈕 */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemClick?.(item)
                  }}
                  className="flex-1 bg-neutral-100 text-neutral-dark py-2 px-3 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <EyeIcon className="w-3 h-3" />
                  <span>查看</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // 加入購物車邏輯
                  }}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 px-3 rounded-lg text-xs font-medium hover:from-primary-600 hover:to-primary-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <ShoppingCartIcon className="w-3 h-3" />
                  <span>購買</span>
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 工具函數：生成隨機寬高比（用於模擬不同高度的搭配圖）
export function generateRandomAspectRatio(min = 0.8, max = 1.5): number {
  return Math.random() * (max - min) + min
}

// 工具函數：按類別排序瀑布流項目
export function sortWaterfallItems(items: WaterfallItem[], sortBy: 'rating' | 'price' | 'newest' | 'popular' = 'popular'): WaterfallItem[] {
  const sorted = [...items]

  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'price':
      return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
    case 'newest':
      return sorted.reverse() // 假設 ID 按時間順序
    case 'popular':
    default:
      return sorted // 保持原順序作為人氣排序
  }
}