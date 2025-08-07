'use client'

import { useState, useRef } from 'react'
import { ChevronRightIcon, CameraIcon, SparklesIcon, HeartIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HomePage() {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (file: File) => {
    // Handle file upload logic
    console.log('Uploading file:', file.name)
  }

  const styles = [
    { id: 'elegant', name: '優雅女神風', emoji: '👗', desc: '知性優雅的職場風格' },
    { id: 'sweet', name: '甜美可愛風', emoji: '🌸', desc: '青春活力的少女風格' },
    { id: 'street', name: '街頭潮流風', emoji: '⚡', desc: '個性十足的街頭風格' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-secondary-400 to-primary-300">
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
              <HeartIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">STYLEMATE</span>
          </div>
          <nav className="hidden md:flex space-x-8 text-white/90">
            <Link href="/tryon" className="hover:text-white transition-colors">虛擬試穿</Link>
            <Link href="/products" className="hover:text-white transition-colors">商品專區</Link>
            <a href="#features" className="hover:text-white transition-colors">特色介紹</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              找到最適合你的
              <br />
              <span className="bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
                韓式穿搭風格
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              透過 AI 智能推薦與 2D 虛擬試穿技術，讓你在家就能體驗最新的 K-fashion 穿搭風格
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20 shadow-morandi-lg mb-12 animate-slide-up">
            <div className="text-center mb-8">
              <SparklesIcon className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                開始你的風格探索之旅
              </h2>
              <p className="text-white/70">
                上傳你的全身照片，我們將為你推薦最適合的韓式穿搭
              </p>
            </div>

            {/* Photo Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer mb-8
                ${isDragging 
                  ? 'border-white bg-white/10 scale-105 shadow-morandi-lg' 
                  : 'border-white/40 hover:border-white/60 hover:bg-white/5'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileSelect}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file)
                }}
              />
              
              <CameraIcon className="w-16 h-16 text-white/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                點擊或拖拽上傳照片
              </h3>
              <p className="text-white/60 text-sm">
                建議上傳正面、光線良好的全身照片，JPG 或 PNG 格式
              </p>
            </div>

            {/* Style Preferences */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4 text-center">選擇你喜歡的風格</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {styles.map((style) => (
                  <div
                    key={style.id}
                    className={`bg-white/10 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:scale-105
                      ${selectedStyle === style.id ? 'bg-white/20 ring-2 ring-white/50' : 'hover:bg-white/15'}`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    <div className="text-2xl mb-2">{style.emoji}</div>
                    <h4 className="font-medium text-white text-sm mb-1">{style.name}</h4>
                    <p className="text-white/60 text-xs">{style.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link href="/tryon">
                <button className="bg-gradient-to-r from-primary-600 to-primary-800 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-morandi-lg transition-all duration-300 hover:-translate-y-1 flex items-center mx-auto space-x-2">
                  <span>開始虛擬試穿</span>
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI 智能推薦</h3>
              <p className="text-white/70 text-sm">
                根據你的體型、膚色和喜好，推薦最適合的韓式穿搭風格
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-info to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CameraIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">2D 虛擬試穿</h3>
              <p className="text-white/70 text-sm">
                即時預覽穿搭效果，不用實際購買就能看到整體造型
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center border border-white/20 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">韓式風格庫</h3>
              <p className="text-white/70 text-sm">
                精選最新韓國時尚單品，跟上 K-pop 偶像的流行腳步
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-300/20 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full blur-lg animate-pulse delay-500" />
      </div>
    </div>
  )
}