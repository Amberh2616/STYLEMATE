'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  SparklesIcon,
  PhotoIcon,
  CommandLineIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

interface GarmentData {
  productId: string
  productName: string
  filename: string
  imageUrl: string
}

type TabType = 'photo' | 'hairstyle' | 'background' | 'shortcuts' | 'settings'

const hairstyles = [
  { id: 'short', name: '短髮', icon: '💇‍♀️', shortcut: 'Q', description: '清爽俐落的短髮造型' },
  { id: 'bun', name: '包頭', icon: '👸', shortcut: 'W', description: '優雅知性的包頭髮型' },
  { id: 'curls', name: '公主長捲髮', icon: '🎀', shortcut: 'E', description: '浪漫甜美的長捲髮' }
]

const backgrounds = [
  { id: 'studio', name: '時尚工作室', icon: '🏢', shortcut: 'R', description: '專業攝影棚環境' },
  { id: 'street', name: '街頭潮流', icon: '🌆', shortcut: 'T', description: '都市街頭風格場景' },
  { id: 'luxury', name: '奢華精品', icon: '✨', shortcut: 'Y', description: '高端精品店氛圍' }
]

export default function GamingStyleTryOn() {
  const router = useRouter()
  const [selectedGarment, setSelectedGarment] = useState<GarmentData | null>(null)
  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('photo')
  const [selectedHairstyle, setSelectedHairstyle] = useState(hairstyles[0])
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0])
  const [customRequest, setCustomRequest] = useState('')
  const [keepOtherItems, setKeepOtherItems] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // 快捷鍵處理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      
      switch (e.key.toUpperCase()) {
        case 'Q':
          setSelectedHairstyle(hairstyles[0])
          break
        case 'W':
          setSelectedHairstyle(hairstyles[1])
          break
        case 'E':
          setSelectedHairstyle(hairstyles[2])
          break
        case 'R':
          setSelectedBackground(backgrounds[0])
          break
        case 'T':
          setSelectedBackground(backgrounds[1])
          break
        case 'Y':
          setSelectedBackground(backgrounds[2])
          break
        case ' ':
          e.preventDefault()
          handleTryOn()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [userPhoto, selectedGarment])

  useEffect(() => {
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUserPhoto(file)
    }
  }

  const handleTryOn = async () => {
    if (!userPhoto || !selectedGarment) {
      alert('請先上傳您的照片')
      return
    }

    setIsProcessing(true)
    // 模擬處理過程
    setTimeout(() => {
      router.push('/tryon')
      setIsProcessing(false)
    }, 3000)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'photo':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">📷 上傳您的照片</h3>
            <div className="bg-gray-800/50 border-2 border-dashed border-cyan-400 rounded-xl p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <PhotoIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">拖拽圖片到此處或點擊選擇</p>
                <p className="text-gray-400 text-sm">支援 JPG, PNG 格式，最大 10MB</p>
              </label>
              {userPhoto && (
                <div className="mt-4 p-4 bg-green-900/50 rounded-lg">
                  <p className="text-green-300">✅ 已選擇：{userPhoto.name}</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'hairstyle':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">💇‍♀️ 髮型選擇</h3>
            <div className="grid grid-cols-1 gap-4">
              {hairstyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedHairstyle(style)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedHairstyle.id === style.id
                      ? 'border-cyan-400 bg-cyan-900/30 shadow-cyan-400/50 shadow-lg'
                      : 'border-gray-600 bg-gray-800/50 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{style.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{style.name}</span>
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded font-mono">
                          {style.shortcut}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{style.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 'background':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">🌄 背景場景</h3>
            <div className="grid grid-cols-1 gap-4">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedBackground.id === bg.id
                      ? 'border-purple-400 bg-purple-900/30 shadow-purple-400/50 shadow-lg'
                      : 'border-gray-600 bg-gray-800/50 hover:border-purple-400/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{bg.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">{bg.name}</span>
                        <span className="px-2 py-1 bg-cyan-600 text-white text-xs rounded font-mono">
                          {bg.shortcut}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{bg.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 'shortcuts':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">⌨️ 快捷鍵說明</h3>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-cyan-400 font-bold mb-3">髮型快捷鍵</h4>
                <div className="space-y-2">
                  {hairstyles.map((style) => (
                    <div key={style.id} className="flex items-center justify-between">
                      <span className="text-white">{style.icon} {style.name}</span>
                      <kbd className="px-2 py-1 bg-purple-600 text-white text-xs rounded font-mono">
                        {style.shortcut}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-purple-400 font-bold mb-3">背景快捷鍵</h4>
                <div className="space-y-2">
                  {backgrounds.map((bg) => (
                    <div key={bg.id} className="flex items-center justify-between">
                      <span className="text-white">{bg.icon} {bg.name}</span>
                      <kbd className="px-2 py-1 bg-cyan-600 text-white text-xs rounded font-mono">
                        {bg.shortcut}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-green-400 font-bold mb-3">控制快捷鍵</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">🎯 開始試穿</span>
                    <kbd className="px-3 py-1 bg-green-600 text-white text-xs rounded font-mono">
                      SPACE
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">🔄 重置選項</span>
                    <kbd className="px-2 py-1 bg-red-600 text-white text-xs rounded font-mono">
                      ESC
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white mb-4">⚙️ 試穿設定</h3>
            <div className="space-y-4">
              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-bold mb-3">試穿範圍</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-white">
                    <input type="radio" name="range" className="text-cyan-500" defaultChecked />
                    <span>完整服裝替換</span>
                  </label>
                  <label className="flex items-center space-x-2 text-white">
                    <input type="radio" name="range" className="text-cyan-500" />
                    <span>僅替換上衣</span>
                  </label>
                  <label className="flex items-center space-x-2 text-white">
                    <input type="radio" name="range" className="text-cyan-500" />
                    <span>僅替換下身</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl p-4">
                <h4 className="text-white font-bold mb-3">進階選項</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-white">
                    <input type="checkbox" className="text-cyan-500" defaultChecked />
                    <span>保留原有配件</span>
                  </label>
                  <label className="flex items-center space-x-2 text-white">
                    <input type="checkbox" className="text-cyan-500" defaultChecked />
                    <span>自動調整光線</span>
                  </label>
                  <label className="flex items-center space-x-2 text-white">
                    <input type="checkbox" className="text-cyan-500" />
                    <span>高解析度輸出</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-400 rounded-xl p-4">
                <h4 className="text-blue-300 font-bold mb-2">💡 最佳效果提示</h4>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• 正面直視鏡頭，姿勢自然</li>
                  <li>• 全身或上半身清楚可見</li>
                  <li>• 光線均勻，背景簡潔</li>
                  <li>• 避免過於寬鬆的服裝</li>
                </ul>
              </div>
            </div>
          </div>
        )
    }
  }

  if (!selectedGarment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Gaming header with neon effects */}
      <div className="bg-black/50 border-b border-cyan-500/30">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-center space-x-4">
            <CommandLineIcon className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              🎮 STYLEMATE GAMING ZONE 🎮
            </h1>
            <SparklesIcon className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-black/30 border-b border-gray-700">
        <div className="container mx-auto px-8">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'photo', label: '📷 照片', icon: PhotoIcon },
              { id: 'hairstyle', label: '💇‍♀️ 髮型', icon: SparklesIcon },
              { id: 'background', label: '🌄 背景', icon: SparklesIcon },
              { id: 'shortcuts', label: '⌨️ 快捷鍵', icon: CommandLineIcon },
              { id: 'settings', label: '⚙️ 設定', icon: Cog6ToothIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-b from-cyan-600 to-purple-600 text-white border-b-2 border-cyan-400'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Preview */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              ✨ LIVE PREVIEW ✨
            </h3>
            
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <div className="aspect-[4/5] bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg relative overflow-hidden">
                {selectedGarment && (
                  <img 
                    src={selectedGarment.imageUrl} 
                    alt={selectedGarment.productName}
                    className="w-full h-full object-cover opacity-80"
                  />
                )}
                
                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 space-y-2">
                  <div className="bg-black/70 text-cyan-400 px-2 py-1 rounded text-xs">
                    髮型: {selectedHairstyle.name}
                  </div>
                  <div className="bg-black/70 text-purple-400 px-2 py-1 rounded text-xs">
                    背景: {selectedBackground.name}
                  </div>
                  <div className="bg-black/70 text-green-400 px-2 py-1 rounded text-xs">
                    狀態: {userPhoto ? '準備就緒' : '待上傳照片'}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-white font-bold mb-2">{selectedGarment.productName}</h4>
              <div className="inline-flex items-center bg-green-900/50 text-green-300 px-3 py-1 rounded-full text-sm">
                <SparklesIcon className="w-4 h-4 mr-1" />
                已選擇
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Shortcuts Bar */}
        <div className="mt-8 bg-black/50 border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 font-semibold">快捷鍵:</span>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-purple-600 text-white text-xs rounded">Q</kbd>
                <kbd className="px-2 py-1 bg-purple-600 text-white text-xs rounded">W</kbd>
                <kbd className="px-2 py-1 bg-purple-600 text-white text-xs rounded">E</kbd>
                <span className="text-gray-400 text-sm">髮型</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 bg-cyan-600 text-white text-xs rounded">R</kbd>
                <kbd className="px-2 py-1 bg-cyan-600 text-white text-xs rounded">T</kbd>
                <kbd className="px-2 py-1 bg-cyan-600 text-white text-xs rounded">Y</kbd>
                <span className="text-gray-400 text-sm">背景</span>
              </div>
            </div>
            
            <button
              onClick={handleTryOn}
              disabled={!userPhoto || isProcessing}
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
                !userPhoto || isProcessing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600 shadow-lg shadow-purple-500/50'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI 處理中...</span>
                </div>
              ) : (
                <>🎯 開始試穿 [SPACE]</>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <Link 
            href="/chat" 
            className="inline-flex items-center space-x-2 bg-gray-800/50 border border-gray-600 text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-700/50 hover:border-cyan-400 transition-all"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回商品選擇</span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.6); }
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}