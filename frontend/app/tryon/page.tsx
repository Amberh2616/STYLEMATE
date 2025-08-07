'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  PhotoIcon, 
  ArrowUturnLeftIcon, 
  ArrowDownTrayIcon, 
  HeartIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ClothingItem {
  id: string
  name: string
  category: 'top' | 'bottom' | 'dress' | 'outer'
  style: 'sweet' | 'elegant' | 'street'
  image: string
  price: number
}

export default function TryOnPage() {
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([])
  const [canvasScale, setCanvasScale] = useState(1)
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const clothingItems: ClothingItem[] = [
    {
      id: '1',
      name: '甜美花朵洋裝',
      category: 'dress',
      style: 'sweet',
      image: '/images/dress-1.jpg',
      price: 1299
    },
    {
      id: '2',
      name: '優雅職場襯衫',
      category: 'top',
      style: 'elegant',
      image: '/images/shirt-1.jpg',
      price: 899
    },
    {
      id: '3',
      name: '高腰A字短裙',
      category: 'bottom',
      style: 'sweet',
      image: '/images/skirt-1.jpg',
      price: 699
    },
    {
      id: '4',
      name: '牛仔外套',
      category: 'outer',
      style: 'street',
      image: '/images/jacket-1.jpg',
      price: 1899
    },
    {
      id: '5',
      name: '針織上衣',
      category: 'top',
      style: 'elegant',
      image: '/images/knit-1.jpg',
      price: 799
    },
    {
      id: '6',
      name: '破洞牛仔褲',
      category: 'bottom',
      style: 'street',
      image: '/images/jeans-1.jpg',
      price: 1299
    }
  ]

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setUserPhoto(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const addClothingItem = (item: ClothingItem) => {
    setSelectedItems(prev => {
      // Remove existing item of same category (except outer)
      if (item.category !== 'outer') {
        const filtered = prev.filter(i => i.category !== item.category)
        return [...filtered, item]
      }
      return [...prev, item]
    })
  }

  const removeClothingItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId))
  }

  const resetCanvas = () => {
    setSelectedItems([])
    setCanvasScale(1)
    setCanvasPosition({ x: 0, y: 0 })
  }

  const saveOutfit = () => {
    setIsLoading(true)
    // Simulate save process
    setTimeout(() => {
      setIsLoading(false)
      alert('穿搭已儲存到我的最愛!')
    }, 1500)
  }

  const downloadImage = () => {
    // Canvas to image download logic
    alert('下載功能開發中...')
  }

  const zoomIn = () => {
    setCanvasScale(prev => Math.min(prev + 0.1, 2))
  }

  const zoomOut = () => {
    setCanvasScale(prev => Math.max(prev - 0.1, 0.5))
  }

  const filteredItems = selectedCategory === 'all' 
    ? clothingItems 
    : clothingItems.filter(item => item.category === selectedCategory)

  const categories = [
    { value: 'all', label: '全部', icon: '👗' },
    { value: 'top', label: '上衣', icon: '👕' },
    { value: 'bottom', label: '下身', icon: '👖' },
    { value: 'dress', label: '洋裝', icon: '👗' },
    { value: 'outer', label: '外套', icon: '🧥' }
  ]

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="min-h-screen bg-neutral-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-light">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
                ← 返回首頁
              </Link>
              <div className="w-px h-6 bg-neutral-light"></div>
              <h1 className="text-xl font-semibold text-neutral-dark">虛擬試穿室</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedItems.length > 0 && (
                <div className="text-sm text-neutral-medium">
                  總價: <span className="font-semibold text-primary-600">NT$ {totalPrice.toLocaleString()}</span>
                </div>
              )}
              <button
                onClick={saveOutfit}
                disabled={selectedItems.length === 0 || isLoading}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <HeartIcon className="w-4 h-4" />
                <span>{isLoading ? '儲存中...' : '儲存穿搭'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Clothing Selection Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-xl p-4 shadow-morandi">
              <h3 className="font-semibold text-neutral-dark mb-3">服裝分類</h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {categories.map(category => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors
                      ${selectedCategory === category.value 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-neutral-cream hover:bg-primary-50 text-neutral-dark'}`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clothing Items */}
            <div className="bg-white rounded-xl p-4 shadow-morandi">
              <h3 className="font-semibold text-neutral-dark mb-3">選擇服裝</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => addClothingItem(item)}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-neutral-light hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">👗</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-neutral-dark text-sm group-hover:text-primary-600 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-neutral-medium">
                        NT$ {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Items */}
            {selectedItems.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-morandi">
                <h3 className="font-semibold text-neutral-dark mb-3">已選擇的服裝</h3>
                <div className="space-y-2">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-neutral-cream rounded-lg">
                      <span className="text-sm text-neutral-dark">{item.name}</span>
                      <button
                        onClick={() => removeClothingItem(item.id)}
                        className="text-error hover:text-error/80 text-sm"
                      >
                        移除
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-light">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-neutral-dark">總計</span>
                    <span className="font-bold text-primary-600">NT$ {totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-morandi overflow-hidden">
              {/* Canvas Controls */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-light">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={zoomOut}
                    className="w-8 h-8 bg-neutral-cream hover:bg-neutral-light rounded-lg flex items-center justify-center transition-colors"
                  >
                    <MagnifyingGlassMinusIcon className="w-4 h-4 text-neutral-dark" />
                  </button>
                  <span className="text-sm text-neutral-medium px-2">
                    {Math.round(canvasScale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="w-8 h-8 bg-neutral-cream hover:bg-neutral-light rounded-lg flex items-center justify-center transition-colors"
                  >
                    <MagnifyingGlassPlusIcon className="w-4 h-4 text-neutral-dark" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={resetCanvas}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-neutral-cream hover:bg-neutral-light rounded-lg text-sm text-neutral-dark transition-colors"
                  >
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                    <span>重設</span>
                  </button>
                  <button
                    onClick={downloadImage}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm transition-colors"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>下載</span>
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div 
                ref={canvasRef}
                className="relative h-96 lg:h-[600px] bg-gradient-to-b from-neutral-cream to-neutral-light overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!userPhoto ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <PhotoIcon className="w-16 h-16 text-neutral-medium mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-dark mb-2">
                        上傳你的照片開始試穿
                      </h3>
                      <p className="text-neutral-medium mb-4">
                        拖拽照片到此處或點擊下方按鈕
                      </p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                      >
                        選擇照片
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    className="relative w-full h-full flex items-center justify-center"
                    style={{ 
                      transform: `scale(${canvasScale}) translate(${canvasPosition.x}px, ${canvasPosition.y}px)` 
                    }}
                  >
                    {/* User Photo */}
                    <div className="relative">
                      <img
                        src={userPhoto}
                        alt="User photo"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        draggable={false}
                      />
                      
                      {/* Clothing Overlays */}
                      {selectedItems.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="absolute inset-0 pointer-events-none"
                        >
                          <div className="relative w-full h-full">
                            {/* Clothing item overlay placeholder */}
                            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary-300/30 rounded-lg border-2 border-primary-500/50 flex items-center justify-center">
                              <span className="text-xs text-primary-600 font-medium">
                                {item.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Change Photo Button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white text-neutral-dark px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all"
                    >
                      更換照片
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Try-on Tips */}
            {userPhoto && (
              <div className="mt-6 bg-white rounded-xl p-6 shadow-morandi">
                <h3 className="font-semibold text-neutral-dark mb-3 flex items-center">
                  <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                  試穿小技巧
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary-500">•</span>
                    <span className="text-neutral-dark">點擊左側服裝項目來添加到穿搭中</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary-500">•</span>
                    <span className="text-neutral-dark">使用縮放控制項調整預覽大小</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary-500">•</span>
                    <span className="text-neutral-dark">同類型服裝會自動替換（外套除外）</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-primary-500">•</span>
                    <span className="text-neutral-dark">滿意的搭配可以儲存到我的最愛</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}