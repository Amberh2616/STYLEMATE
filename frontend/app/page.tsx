'use client'

import Link from 'next/link'
import { 
  HeartIcon, 
  SparklesIcon, 
  PhotoIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  UserGroupIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const steps = [
    {
      number: '01',
      title: 'AI 風格諮詢',
      description: '與專屬時尚顧問對話，分析您的風格偏好、身材特色和預算需求',
      icon: <SparklesIcon className="w-8 h-8" />,
      color: 'from-primary-400 to-primary-600'
    },
    {
      number: '02',
      title: '商品智能推薦',
      description: '基於 AI 分析結果，為您精選最適合的韓式服裝單品組合',
      icon: <PaintBrushIcon className="w-8 h-8" />,
      color: 'from-secondary-400 to-secondary-600'
    },
    {
      number: '03',
      title: '虛擬試穿體驗',
      description: '上傳全身照片，使用 2D 技術即時預覽穿搭效果，完美購物',
      icon: <PhotoIcon className="w-8 h-8" />,
      color: 'from-accent to-accent/80'
    }
  ]

  const features = [
    {
      title: '韓式美學',
      description: '專注 K-fashion 流行趨勢',
      emoji: '🌸'
    },
    {
      title: '智能推薦',
      description: 'AI 分析個人風格偏好',
      emoji: '🧠'
    },
    {
      title: '即時試穿',
      description: '2D 虛擬試穿技術',
      emoji: '👗'
    },
    {
      title: '個性化',
      description: '量身訂做的穿搭建議',
      emoji: '✨'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-cream via-primary-50 to-secondary-50">
      {/* Header */}
      <header className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
              <HeartIcon className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-dark">STYLEMATE</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-neutral-dark hover:text-primary-600 transition-colors font-medium">
              商品專區
            </Link>
            <Link href="/member" className="text-neutral-dark hover:text-primary-600 transition-colors font-medium">
              會員中心
            </Link>
            <Link href="/admin/rag" className="text-neutral-dark hover:text-primary-600 transition-colors font-medium text-sm">
              RAG 管理
            </Link>
            <Link href="/auth" className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all font-medium">
              登入/註冊
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Title */}
          <div className="mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-neutral-dark mb-6 leading-tight">
              找到最適合你的
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-secondary-500 to-accent bg-clip-text text-transparent">
                韓式穿搭風格
              </span>
            </h1>
            <p className="text-xl text-neutral-medium mb-8 max-w-2xl mx-auto">
              透過 AI 智能推薦與虛擬試穿技術，讓你在家就能體驗最新的 K-fashion 穿搭風格
            </p>
            
            {/* CTA Button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link href="/chat">
                <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-full font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center justify-center space-x-3">
                  <span>🔥</span>
                  <span>進入 AI 時尚助理</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/products">
                <button className="w-full bg-white/70 backdrop-blur-sm border border-white/60 text-neutral-dark px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 flex items-center justify-center space-x-3">
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>瀏覽商品專區</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-neutral-dark mb-4">三步驟找到完美穿搭</h2>
            <p className="text-neutral-medium mb-12">簡單幾步驟，AI 為您量身打造專屬韓式風格</p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-primary-300 to-secondary-300 transform -translate-x-4"></div>
                  )}
                  
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/40 hover:bg-white/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-2">
                    {/* Step Number */}
                    <div className="text-4xl font-bold text-primary-300 mb-4">{step.number}</div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-6`}>
                      {step.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-semibold text-neutral-dark mb-3">{step.title}</h3>
                    <p className="text-neutral-medium text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-neutral-dark mb-12">為什麼選擇 STYLEMATE？</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 text-center border border-white/40 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">{feature.emoji}</div>
                  <h3 className="font-semibold text-neutral-dark mb-2">{feature.title}</h3>
                  <p className="text-sm text-neutral-medium">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-accent/10 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/30 mb-16">
            <div className="flex items-center justify-center mb-6">
              <UserGroupIcon className="w-8 h-8 text-primary-600 mr-3" />
              <span className="text-primary-600 font-medium">已有 10,000+ 用戶體驗</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-dark mb-4">
              準備好找到屬於你的韓式風格了嗎？
            </h2>
            <p className="text-neutral-medium mb-8 max-w-2xl mx-auto">
              加入 STYLEMATE，讓 AI 時尚顧問為你推薦最適合的穿搭，開啟你的韓式時尚之旅
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/chat">
                <button className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>立即開始</span>
                </button>
              </Link>
              <Link href="/products">
                <button className="bg-white/70 backdrop-blur-sm border border-white/60 text-neutral-dark px-8 py-3 rounded-full font-medium hover:bg-white/90 transition-all duration-300 flex items-center space-x-2">
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>瀏覽商品</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-primary-300/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-secondary-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent/20 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-20 px-6 py-8 border-t border-white/20">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <HeartIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-dark">STYLEMATE</span>
          </div>
          <p className="text-sm text-neutral-medium">
            © 2024 STYLEMATE. 讓每個人都能找到屬於自己的韓式風格 ✨
          </p>
        </div>
      </footer>
    </div>
  )
}