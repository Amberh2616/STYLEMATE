'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  SparklesIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import PhotoUpload from '@/components/forms/PhotoUpload'

interface GarmentData {
  productId: string
  productName: string
  filename: string
  imageUrl: string
}

export default function TryOnUploadPage() {
  const router = useRouter()
  const [selectedGarment, setSelectedGarment] = useState<GarmentData | null>(null)
  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processStep, setProcessStep] = useState('')
  const [customRequest, setCustomRequest] = useState('')
  const [keepOtherItems, setKeepOtherItems] = useState(true)

  useEffect(() => {
    // 從 localStorage 讀取選中的衣服
    const garmentData = localStorage.getItem('selectedGarment')
    if (garmentData) {
      try {
        setSelectedGarment(JSON.parse(garmentData))
      } catch (error) {
        console.error('解析衣服資料錯誤:', error)
        router.push('/chat')
      }
    } else {
      router.push('/chat')
    }
  }, [router])

  const handlePhotoUpload = (file: File) => {
    setUserPhoto(file)
  }

  const handleTryOn = async () => {
    if (!userPhoto || !selectedGarment) {
      alert('請先上傳您的照片')
      return
    }

    setIsProcessing(true)
    setProcessStep('準備圖片中...')

    try {
      // 1. 將用戶照片轉換為 base64
      const userPhotoBase64 = await fileToBase64(userPhoto)
      
      setProcessStep('連接 AI 模型中...')

      // 2. 調用虛擬試穿 API
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personImageUrl: userPhotoBase64,
          garmentImageUrl: selectedGarment.imageUrl,
          customRequest: customRequest.trim(),
          keepOtherItems: keepOtherItems
        })
      })

      const result = await response.json()
      
      console.log('🔍 前端收到API回應:', JSON.stringify(result, null, 2))
      console.log('🔍 回應狀態碼:', response.status)
      console.log('🔍 result.success:', result.success)
      console.log('🔍 result.url存在:', !!result.url)
      console.log('🔍 result.url長度:', result.url ? result.url.length : 0)

      setProcessStep('生成試穿效果中...')

      if (result.success !== false && result.url) {
        // 3. 成功：儲存結果並導向結果頁面
        const tryonResult = {
          id: Date.now(), // 添加唯一ID
          timestamp: new Date().toISOString(),
          resultImage: result.url,
          productName: selectedGarment.productName,
          // 不存儲原始照片的 base64，避免 localStorage 超限
          originalPhoto: 'user_photo_' + Date.now(), // 只存儲標識符
          productId: selectedGarment.productId
        }
        
        // 保存到試穿歷史記錄（極簡存儲）
        try {
          // 直接清空舊歷史，只保留最新結果
          localStorage.removeItem('tryonHistory')
          const newHistory = [tryonResult] // 只保存1次最新記錄
          
          const historyString = JSON.stringify(newHistory)
          console.log('📊 存儲大小:', Math.round(historyString.length / 1024), 'KB')
          
          if (historyString.length > 500000) { // 如果超過500KB
            console.log('⚠️ 單次記錄過大，僅保存基本資訊')
            const minimalResult = {
              id: tryonResult.id,
              timestamp: tryonResult.timestamp,
              resultImage: 'large_image_' + tryonResult.id, // 不保存實際圖片URL
              productName: tryonResult.productName,
              productId: tryonResult.productId
            }
            localStorage.setItem('tryonHistory', JSON.stringify([minimalResult]))
          } else {
            localStorage.setItem('tryonHistory', historyString)
          }
        } catch (storageError) {
          console.warn('⚠️ 存儲失敗，跳過歷史記錄:', storageError)
          // 完全跳過歷史記錄存儲
        }
        localStorage.setItem('tryonResult', JSON.stringify(tryonResult)) // 當前結果
        
        console.log(`✅ 試穿成功！結果已保存 (ID: ${tryonResult.id})`)
        router.push('/tryon')
        
      } else {
        console.log('❌ 虛擬試穿處理失敗')
        console.log('💥 失敗原因:', result.error || '未知錯誤')
        console.log('💥 後端訊息:', result.message)
        console.log('💥 使用的後端:', result.backend)
        throw new Error(result.error || '虛擬試穿處理失敗')
      }

    } catch (error) {
      console.error('虛擬試穿錯誤:', error)
      alert(`試穿失敗: ${error.message || '未知錯誤'}`)
    } finally {
      setIsProcessing(false)
      setProcessStep('')
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  if (!selectedGarment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200">
      {/* 裝飾性邊框 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-indigo-400 via-purple-500 to-violet-600 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-400 opacity-30"></div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-8 py-12 max-w-4xl relative z-10">
        {/* 標題區域 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <SparklesIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              STYLEMATE
            </h1>
            <SparklesIcon className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">虛擬試穿體驗</h2>
          <p className="text-slate-600">上傳您的照片，體驗 AI 虛擬試穿效果</p>
        </div>

        {/* 主要內容區 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：選中的衣服 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">✨ 選中的商品 ✨</h3>
            
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="aspect-[4/5] bg-white rounded-lg overflow-hidden mb-4">
                <img 
                  src={selectedGarment.imageUrl} 
                  alt={selectedGarment.productName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-slate-800 mb-2">{selectedGarment.productName}</h4>
                <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  <SparklesIcon className="w-4 h-4 mr-1" />
                  已選擇
                </div>
              </div>
            </div>
          </div>

          {/* 右側：用戶照片上傳 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">📷 上傳您的照片 📷</h3>
            
            <div className="mb-6">
              <PhotoUpload 
                onUpload={handlePhotoUpload}
                currentFile={userPhoto}
                maxSize={10}
              />
            </div>

            {/* 自訂試穿需求 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3">Customize Your Try-On</h4>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to try on?
                </label>
                <textarea
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  placeholder="e.g., Only the top shirt, Just the bottom skirt, Everything except accessories..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="keepOtherItems"
                  checked={keepOtherItems}
                  onChange={(e) => setKeepOtherItems(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="keepOtherItems" className="text-sm text-gray-700">
                  Keep my current clothing for unlisted items
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCustomRequest('Only the top shirt')}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Top only
                </button>
                <button
                  type="button"
                  onClick={() => setCustomRequest('Only the bottom piece')}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Bottom only
                </button>
                <button
                  type="button"
                  onClick={() => setCustomRequest('Complete outfit')}
                  className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Full outfit
                </button>
              </div>
            </div>

            {/* 拍照建議 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Photo Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Stand facing the camera</li>
                <li>• Full body or upper body clearly visible</li>
                <li>• Good lighting, clean background</li>
                <li>• Avoid overly loose clothing</li>
              </ul>
            </div>

            {/* 開始試穿按鈕 */}
            <button
              onClick={handleTryOn}
              disabled={!userPhoto || isProcessing}
              className={`
                w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all
                ${!userPhoto || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700'
                }
              `}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{processStep}</span>
                </div>
              ) : (
                <>
                  <PhotoIcon className="inline w-6 h-6 mr-2" />
                  開始 AI 虛擬試穿
                </>
              )}
            </button>
          </div>
        </div>

        {/* 新設計預覽按鈕 */}
        <div className="text-center mt-6">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 mb-8">
            <div className="text-center text-white mb-4">
              <SparklesIcon className="w-8 h-8 mx-auto mb-2" />
              <h3 className="text-xl font-bold">🎮 全新試穿遊戲場體驗！</h3>
              <p className="text-purple-100 mt-2">體驗兩種全新設計的試穿介面</p>
            </div>
            <Link 
              href="/tryon/design-preview" 
              className="inline-flex items-center space-x-2 bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition-all shadow-lg"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>查看新設計方案</span>
              <SparklesIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* 底部導航 */}
        <div className="text-center mt-8">
          <Link 
            href="/chat" 
            className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-white hover:border-indigo-300 transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回商品選擇</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
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
      `}</style>
    </div>
  )
}