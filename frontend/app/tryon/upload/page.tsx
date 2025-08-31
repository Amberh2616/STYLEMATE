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
          garmentImageUrl: selectedGarment.imageUrl
        })
      })

      const result = await response.json()

      setProcessStep('生成試穿效果中...')

      if (result.success !== false && result.url) {
        // 3. 成功：儲存結果並導向結果頁面
        const tryonResult = {
          resultImage: result.url,
          productName: selectedGarment.productName,
          originalPhoto: userPhotoBase64
        }
        
        localStorage.setItem('tryonResult', JSON.stringify(tryonResult))
        router.push('/tryon')
        
      } else {
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

            {/* 提示說明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">📋 拍照建議</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 請站立並面向鏡頭</li>
                <li>• 確保全身或上半身清晰可見</li>
                <li>• 光線充足，背景簡潔</li>
                <li>• 避免穿著過於寬鬆的衣物</li>
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