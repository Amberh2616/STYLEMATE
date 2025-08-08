'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  CheckCircleIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ShoppingCartIcon,
  HeartIcon,
  ArrowLeftIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function TryOnResultPage() {
  const [currentQuantity, setCurrentQuantity] = useState(1)

  const changeQuantity = (delta: number) => {
    setCurrentQuantity(Math.max(1, currentQuantity + delta))
  }

  // 模擬商品資訊 (實際應該從 URL 參數或狀態管理獲取)
  const productInfo = {
    emoji: '👗',
    name: '韓式甜美花朵印花洋裝',
    description: '甜美可愛的花朵印花洋裝，輕薄透氣的面料',
    price: '1,299'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200">
      {/* 裝飾性邊框 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-indigo-400 via-purple-500 to-violet-600 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-400 opacity-30"></div>
        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-b from-indigo-400 via-purple-500 to-violet-600 opacity-30"></div>
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-b from-violet-600 via-purple-500 to-indigo-400 opacity-30"></div>
        
        {/* 角落裝飾 */}
        <div className="absolute top-2 left-2 w-6 h-6 bg-slate-300 rounded-full opacity-80"></div>
        <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-300 rounded-full opacity-80"></div>
        <div className="absolute bottom-2 left-2 w-6 h-6 bg-violet-300 rounded-full opacity-80"></div>
        <div className="absolute bottom-2 right-2 w-6 h-6 bg-slate-300 rounded-full opacity-80"></div>
      </div>

      {/* 主要內容區域 */}
      <div className="container mx-auto px-8 py-12 max-w-6xl relative z-10">
        {/* 標題區域 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <CheckCircleIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              STYLEMATE
            </h1>
            <SparklesIcon className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">試穿效果完成！</h2>
          <p className="text-slate-600">你的專屬試穿效果圖已經生成完成</p>
        </div>

        {/* 主要內容區 - 左右分欄 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 左側：試穿結果圖 */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6 animate-zoom-in">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">✨ 你的試穿效果 ✨</h3>
            
            {/* 試穿圖片區域 */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* 模擬試穿合成圖 */}
                <div className="absolute inset-4 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-lg flex flex-col items-center justify-center">
                  <div className="text-6xl mb-4">👤</div>
                  <div className="text-4xl mb-2">{productInfo.emoji}</div>
                  <p className="text-sm text-slate-600 text-center">試穿合成圖<br/>(用戶照片 + 選中商品)</p>
                </div>
                
                {/* 裝飾邊框 */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-indigo-400"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-indigo-400"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-indigo-400"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-indigo-400"></div>
              </div>
            </div>

            {/* 圖片操作按鈕 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center justify-center space-x-2">
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>下載圖片</span>
              </button>
              
              <button className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white py-3 px-4 rounded-lg font-medium hover:from-slate-600 hover:to-slate-700 transition-all flex items-center justify-center space-x-2">
                <ShareIcon className="w-5 h-5" />
                <span>分享</span>
              </button>
            </div>
          </div>
          
          {/* 右側：商品資訊 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6 animate-slide-in">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">📦 商品詳情</h3>
            
            {/* 商品資訊 */}
            <div className="space-y-4 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{productInfo.emoji}</span>
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">{productInfo.name}</h4>
                <p className="text-sm text-slate-600 mb-3">{productInfo.description}</p>
                <div className="text-2xl font-bold text-indigo-600 mb-4">NT$ {productInfo.price}</div>
              </div>
              
              {/* 尺寸選擇 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">尺寸</label>
                <div className="flex space-x-2">
                  <button className="flex-1 py-2 px-3 border-2 border-slate-200 rounded-lg text-sm hover:border-indigo-400 hover:bg-indigo-50 transition-all focus:border-indigo-500 focus:bg-indigo-100">S</button>
                  <button className="flex-1 py-2 px-3 border-2 border-indigo-500 bg-indigo-100 rounded-lg text-sm text-indigo-700 font-semibold">M</button>
                  <button className="flex-1 py-2 px-3 border-2 border-slate-200 rounded-lg text-sm hover:border-indigo-400 hover:bg-indigo-50 transition-all focus:border-indigo-500 focus:bg-indigo-100">L</button>
                  <button className="flex-1 py-2 px-3 border-2 border-slate-200 rounded-lg text-sm hover:border-indigo-400 hover:bg-indigo-50 transition-all focus:border-indigo-500 focus:bg-indigo-100">XL</button>
                </div>
              </div>
              
              {/* 數量選擇 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">數量</label>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => changeQuantity(-1)}
                    className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-all"
                  >
                    <span className="text-slate-600">-</span>
                  </button>
                  <span className="text-lg font-semibold text-slate-800 min-w-[2rem] text-center">{currentQuantity}</span>
                  <button 
                    onClick={() => changeQuantity(1)}
                    className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-all"
                  >
                    <span className="text-slate-600">+</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 購買按鈕 */}
            <div className="space-y-3">
              <Link href="/checkout" className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center justify-center space-x-2">
                <ShoppingCartIcon className="w-5 h-5" />
                <span>加入購物車</span>
              </Link>
              
              <button className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center justify-center space-x-2">
                <HeartIcon className="w-5 h-5" />
                <span>加入收藏</span>
              </button>
            </div>
          </div>
        </div>

        {/* 底部導航 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in">
          <Link href="/chat" className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-white hover:border-indigo-300 transition-all">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回對話</span>
          </Link>
          
          <Link href="/chat" className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-violet-700 transition-all">
            <ArrowPathIcon className="w-5 h-5" />
            <span>繼續試穿其他商品</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slide-in {
          animation: slideIn 0.8s ease-out;
        }

        .animate-zoom-in {
          animation: zoomIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}