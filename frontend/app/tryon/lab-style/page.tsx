'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  SparklesIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LightBulbIcon,
  CogIcon,
  BoltIcon,
  ArrowRightIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

interface GarmentData {
  productId: string
  productName: string
  filename: string
  imageUrl: string
}

const hairstyles = [
  { id: 'short', name: '短髮', icon: '💇‍♀️', shortcut: 'Shift+1', description: '清爽俐落的短髮造型' },
  { id: 'bun', name: '包頭', icon: '👸', shortcut: 'Shift+2', description: '優雅知性的包頭髮型' },
  { id: 'curls', name: '公主長捲髮', icon: '🎀', shortcut: 'Shift+3', description: '浪漫甜美的長捲髮' }
]

const backgrounds = [
  { id: 'studio', name: '專業攝影棚', icon: '🏢', shortcut: 'Shift+4', description: '專業攝影環境，最佳光線' },
  { id: 'street', name: '都市街景', icon: '🌆', shortcut: 'Shift+5', description: '現代都市背景' },
  { id: 'luxury', name: '奢華展廳', icon: '✨', shortcut: 'Shift+6', description: '高端精品店氛圍' }
]

const presets = [
  { id: 'sweet', name: '甜美風格', shortcut: 'F1', hair: 'curls', bg: 'luxury' },
  { id: 'street', name: '街頭潮流', shortcut: 'F2', hair: 'short', bg: 'street' },
  { id: 'business', name: '商務正裝', shortcut: 'F3', hair: 'bun', bg: 'studio' }
]

export default function UChicAITryOn() {
  const router = useRouter()
  const [selectedGarment, setSelectedGarment] = useState<GarmentData | null>(null)
  const [userPhoto, setUserPhoto] = useState<File | null>(null)
  const [selectedHairstyle, setSelectedHairstyle] = useState(hairstyles[0])
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0])
  const [customRequest, setCustomRequest] = useState('')
  const [keepOtherItems, setKeepOtherItems] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showModal, setShowModal] = useState<'none' | 'next' | 'ai-match'>('none')
  const [selectedRange, setSelectedRange] = useState<'full' | 'top' | 'bottom'>('full')
  
  // Panel states - 預設收起讓版面乾淨
  const [leftPanelExpanded, setLeftPanelExpanded] = useState({
    hairstyle: false,
    background: false,
    advanced: false
  })

  // 顯示快捷鍵提示
  const showShortcutHint = (text: string) => {
    const dialog = document.getElementById('shortcut-dialog')
    const textElement = document.getElementById('shortcut-text')
    if (dialog && textElement) {
      textElement.textContent = text
      dialog.style.opacity = '1'
      setTimeout(() => {
        dialog.style.opacity = '0'
      }, 2000)
    }
  }

  // 快捷鍵處理
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      
      if (e.shiftKey) {
        switch (e.key) {
          case '1':
            setSelectedHairstyle(hairstyles[0])
            showShortcutHint(`已選擇：${hairstyles[0].name}`)
            break
          case '2':
            setSelectedHairstyle(hairstyles[1])
            showShortcutHint(`已選擇：${hairstyles[1].name}`)
            break
          case '3':
            setSelectedHairstyle(hairstyles[2])
            showShortcutHint(`已選擇：${hairstyles[2].name}`)
            break
          case '4':
            setSelectedBackground(backgrounds[0])
            showShortcutHint(`已選擇：${backgrounds[0].name}`)
            break
          case '5':
            setSelectedBackground(backgrounds[1])
            showShortcutHint(`已選擇：${backgrounds[1].name}`)
            break
          case '6':
            setSelectedBackground(backgrounds[2])
            showShortcutHint(`已選擇：${backgrounds[2].name}`)
            break
        }
      } else {
        switch (e.key) {
          case 'F1':
            e.preventDefault()
            applyPreset(presets[0])
            showShortcutHint(`已套用：${presets[0].name}`)
            break
          case 'F2':
            e.preventDefault()
            applyPreset(presets[1])
            showShortcutHint(`已套用：${presets[1].name}`)
            break
          case 'F3':
            e.preventDefault()
            applyPreset(presets[2])
            showShortcutHint(`已套用：${presets[2].name}`)
            break
        }
      }

      if (e.code === 'Space') {
        e.preventDefault()
        handleTryOn()
        showShortcutHint('開始 AI 處理...')
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
      showShortcutHint(`照片上傳成功：${file.name}`)
    }
  }

  const applyPreset = (preset: any) => {
    const hair = hairstyles.find(h => h.id === preset.hair)
    const bg = backgrounds.find(b => b.id === preset.bg)
    if (hair) setSelectedHairstyle(hair)
    if (bg) setSelectedBackground(bg)
  }

  const handleTryOn = async () => {
    if (!userPhoto || !selectedGarment) {
      showShortcutHint('請先上傳您的照片')
      return
    }

    setIsProcessing(true)
    
    try {
      // 將用戶照片轉換為 base64
      const userPhotoBase64 = await fileToBase64(userPhoto)
      
      // 調用虛擬試穿 API，傳送所有選擇參數
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personImageUrl: userPhotoBase64,
          garmentImageUrl: selectedGarment.imageUrl,
          // 傳送 U CHIC AI 的選擇參數
          hairstyle: selectedHairstyle.id,
          background: selectedBackground.id,
          range: selectedRange,
          customRequest: `U CHIC AI 設定 - 髮型:${selectedHairstyle.name}, 背景:${selectedBackground.name}, 範圍:${
            selectedRange === 'full' ? '完整服裝' : selectedRange === 'top' ? '僅上衣' : '僅下身'
          }`,
          keepOtherItems: selectedRange !== 'full' // 如果不是全身替換，保留其他物品
        })
      })

      const result = await response.json()
      
      if (result.success !== false && result.url) {
        // 儲存結果並導向結果頁面
        const tryonResult = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          resultImage: result.url,
          productName: selectedGarment.productName,
          originalPhoto: 'user_photo_' + Date.now(),
          productId: selectedGarment.productId,
          // 保存 U CHIC AI 設定
          settings: {
            hairstyle: selectedHairstyle.name,
            background: selectedBackground.name,
            range: selectedRange === 'full' ? '完整服裝' : selectedRange === 'top' ? '僅上衣' : '僅下身'
          }
        }
        
        localStorage.setItem('tryonResult', JSON.stringify(tryonResult))
        router.push('/tryon')
        
      } else {
        throw new Error(result.error || '虛擬試穿處理失敗')
      }

    } catch (error) {
      console.error('虛擬試穿錯誤:', error)
      showShortcutHint(`試穿失敗: ${error.message || '未知錯誤'}`)
    } finally {
      setIsProcessing(false)
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

  const handleNext = () => {
    setShowModal('next')
    showShortcutHint('選擇試穿範圍...')
  }

  const handleAIMatch = () => {
    setShowModal('ai-match')
    showShortcutHint('AI 智能推薦...')
  }

  const executeNext = () => {
    setShowModal('none')
    if (!userPhoto) {
      showShortcutHint('請先上傳照片')
      return
    }
    handleTryOn()
  }

  const executeAIMatch = () => {
    setShowModal('none')
    setIsProcessing(true)
    showShortcutHint(`AI 推薦 ${selectedRange === 'full' ? '全身搭配' : selectedRange === 'top' ? '上衣搭配' : '下身搭配'} 商品中...`)
    setTimeout(() => {
      // 跳轉到商品推薦頁面，帶上推薦參數
      router.push(`/chat?ai_match=${selectedRange}&hair=${selectedHairstyle.id}&bg=${selectedBackground.id}`)
      setIsProcessing(false)
    }, 2000)
  }

  const togglePanel = (panel: string) => {
    setLeftPanelExpanded(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }))
  }

  if (!selectedGarment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-300 shadow-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              U CHIC AI
            </h1>
          </div>
        </div>
      </div>

      {/* 快捷鍵提示對話框 */}
      <div id="shortcut-dialog" className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-lg text-sm z-50 opacity-0 pointer-events-none transition-opacity duration-300 shadow-xl">
        <span id="shortcut-text">快捷鍵提示</span>
      </div>

      <div className="container mx-auto px-8 py-8 max-w-7xl">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel - All Controls and Features */}
          <div className="col-span-5 space-y-4">
            
            {/* Hairstyle Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => togglePanel('hairstyle')}
                className="w-full p-4 bg-pink-50 border-b border-pink-200 flex items-center justify-between text-pink-800 font-semibold"
              >
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>髮型選擇</span>
                </div>
                {leftPanelExpanded.hairstyle ? 
                  <ChevronDownIcon className="w-5 h-5" /> : 
                  <ChevronRightIcon className="w-5 h-5" />
                }
              </button>
              
              {leftPanelExpanded.hairstyle && (
                <div className="p-4 space-y-2">
                  {hairstyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setSelectedHairstyle(style)
                        showShortcutHint(`已選擇：${style.name}`)
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedHairstyle.id === style.id
                          ? 'bg-pink-100 border-2 border-pink-300'
                          : 'bg-slate-50 border border-slate-200 hover:bg-pink-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{style.icon}</span>
                          <div>
                            <div className="font-medium text-slate-800">{style.name}</div>
                            <div className="text-xs text-slate-500">{style.description}</div>
                          </div>
                        </div>
                        <kbd className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded">
                          {style.shortcut}
                        </kbd>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Background Section */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => togglePanel('background')}
                className="w-full p-4 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-amber-800 font-semibold"
              >
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>背景場景</span>
                </div>
                {leftPanelExpanded.background ? 
                  <ChevronDownIcon className="w-5 h-5" /> : 
                  <ChevronRightIcon className="w-5 h-5" />
                }
              </button>
              
              {leftPanelExpanded.background && (
                <div className="p-4 space-y-2">
                  {backgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setSelectedBackground(bg)
                        showShortcutHint(`已選擇：${bg.name}`)
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-all ${
                        selectedBackground.id === bg.id
                          ? 'bg-amber-100 border-2 border-amber-300'
                          : 'bg-slate-50 border border-slate-200 hover:bg-amber-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{bg.icon}</span>
                          <div>
                            <div className="font-medium text-slate-800">{bg.name}</div>
                            <div className="text-xs text-slate-500">{bg.description}</div>
                          </div>
                        </div>
                        <kbd className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded">
                          {bg.shortcut}
                        </kbd>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preset Combos */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
              <h4 className="font-bold text-slate-800 mb-4">
                預設組合
              </h4>
              <div className="space-y-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      applyPreset(preset)
                      showShortcutHint(`已套用：${preset.name}`)
                    }}
                    className="w-full p-3 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-blue-50 rounded-lg text-left border border-slate-200 hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{preset.name}</span>
                      <kbd className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded font-mono">
                        {preset.shortcut}
                      </kbd>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => togglePanel('advanced')}
                className="w-full p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-slate-800 font-semibold"
              >
                <div className="flex items-center space-x-2">
                  <CogIcon className="w-5 h-5" />
                  <span>進階設定</span>
                </div>
                {leftPanelExpanded.advanced ? 
                  <ChevronDownIcon className="w-5 h-5" /> : 
                  <ChevronRightIcon className="w-5 h-5" />
                }
              </button>
              
              {leftPanelExpanded.advanced && (
                <div className="p-4 space-y-4">
                  <div>
                    <h5 className="font-semibold text-slate-800 mb-2">替換範圍</h5>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="range" className="text-indigo-500" defaultChecked />
                        <span className="text-slate-700">完整服裝替換</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="range" className="text-indigo-500" />
                        <span className="text-slate-700">僅替換上衣</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="radio" name="range" className="text-indigo-500" />
                        <span className="text-slate-700">僅替換下身</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-800 mb-2">品質選項</h5>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-indigo-500" defaultChecked />
                        <span className="text-slate-700">保持原有配件</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-indigo-500" defaultChecked />
                        <span className="text-slate-700">自動光線調整</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="text-indigo-500" />
                        <span className="text-slate-700">高解析度輸出</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h6 className="font-semibold text-blue-800 mb-1">💡 最佳效果提示</h6>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>• 正面拍攝，姿勢自然</li>
                          <li>• 光線均勻，背景簡潔</li>
                          <li>• 避免過於寬鬆的服裝</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 當前選擇顯示對話框 */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
              <h4 className="font-bold text-slate-800 mb-4">當前選擇</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <span className="text-slate-600">髮型：</span>
                  <span className="font-medium text-slate-800">{selectedHairstyle.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-slate-600">背景：</span>
                  <span className="font-medium text-slate-800">{selectedBackground.name}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-slate-600">替換範圍：</span>
                  <span className="font-medium text-slate-800">
                    {selectedRange === 'full' ? '完整服裝' : selectedRange === 'top' ? '僅上衣' : '僅下身'}
                  </span>
                </div>
                {userPhoto && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-slate-600">照片：</span>
                    <span className="font-medium text-slate-800">✅ 已上傳</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Preview and Photo Upload */}
          <div className="col-span-7 space-y-6">
            {/* Main Preview */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                預覽區
              </h3>
              
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6">
                <div className="aspect-[3/4] bg-white rounded-lg shadow-inner relative overflow-hidden group">
                  {selectedGarment && (
                    <>
                      <img 
                        src={selectedGarment.imageUrl} 
                        alt={selectedGarment.productName}
                        className="w-full h-full object-cover cursor-pointer transition-all group-hover:brightness-75"
                        onClick={() => {
                          // 點擊商品照直接套用
                          fetch(selectedGarment.imageUrl)
                            .then(res => res.blob())
                            .then(blob => {
                              const file = new File([blob], `${selectedGarment.productName}.jpg`, { type: 'image/jpeg' })
                              setUserPhoto(file)
                              showShortcutHint('商品照已套用為示範照片')
                            })
                            .catch(error => {
                              console.error('套用商品照失敗:', error)
                              showShortcutHint('套用失敗，請手動上傳照片')
                            })
                        }}
                      />
                      
                      {/* 懸停提示 */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 px-4 py-2 rounded-lg text-slate-800 font-medium text-sm">
                          <PhotoIcon className="w-5 h-5 inline mr-2" />
                          點擊套用為示範照片
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* Info Overlay */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-white/90 text-slate-800 px-3 py-1 rounded-lg text-sm font-medium shadow">
                      💇‍♀️ {selectedHairstyle.name}
                    </div>
                    <div className="bg-white/90 text-slate-800 px-3 py-1 rounded-lg text-sm font-medium shadow">
                      🌄 {selectedBackground.name}
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4">
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium shadow ${
                      userPhoto 
                        ? 'bg-green-500 text-white' 
                        : 'bg-orange-500 text-white'
                    }`}>
                      {userPhoto ? '✅ 照片已上傳' : '⚠️ 請上傳照片'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <h4 className="text-lg font-bold text-slate-800 mb-2">{selectedGarment.productName}</h4>
                <div className="flex items-center justify-center space-x-3">
                  <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full">
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    商品已載入
                  </div>
                  <button
                    onClick={() => {
                      // 直接使用商品照作為人物照片
                      const imageResponse = fetch(selectedGarment.imageUrl)
                        .then(res => res.blob())
                        .then(blob => {
                          const file = new File([blob], `${selectedGarment.productName}.jpg`, { type: 'image/jpeg' })
                          setUserPhoto(file)
                          showShortcutHint('商品照已套用為示範照片')
                        })
                        .catch(error => {
                          console.error('套用商品照失敗:', error)
                          showShortcutHint('套用失敗，請手動上傳照片')
                        })
                    }}
                    className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm hover:bg-blue-200 transition-all"
                  >
                    <PhotoIcon className="w-4 h-4 mr-1" />
                    套用示範
                  </button>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">
                上傳您的照片
              </h3>
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-indigo-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload-right"
                />
                <label htmlFor="photo-upload-right" className="cursor-pointer">
                  <PhotoIcon className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <p className="text-indigo-600 font-medium mb-2">拖拽圖片到此處或點擊選擇</p>
                  <p className="text-slate-500 text-sm">支援 JPG, PNG 格式，最大 10MB</p>
                </label>
                {userPhoto && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-green-700 font-medium">✅ 已選擇：{userPhoto.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 選項彈窗 */}
        {showModal !== 'none' && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 max-w-md w-full mx-4">
              {showModal === 'next' ? (
                <>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">選擇試穿範圍</h3>
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                      <input 
                        type="radio" 
                        name="range" 
                        value="full"
                        checked={selectedRange === 'full'}
                        onChange={(e) => setSelectedRange(e.target.value as 'full' | 'top' | 'bottom')}
                        className="text-indigo-500" 
                      />
                      <div>
                        <div className="font-semibold text-slate-800">完整服裝替換</div>
                        <div className="text-sm text-slate-500">替換全身服裝</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                      <input 
                        type="radio" 
                        name="range" 
                        value="top"
                        checked={selectedRange === 'top'}
                        onChange={(e) => setSelectedRange(e.target.value as 'full' | 'top' | 'bottom')}
                        className="text-indigo-500" 
                      />
                      <div>
                        <div className="font-semibold text-slate-800">僅替換上衣</div>
                        <div className="text-sm text-slate-500">只更換上半身服裝</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                      <input 
                        type="radio" 
                        name="range" 
                        value="bottom"
                        checked={selectedRange === 'bottom'}
                        onChange={(e) => setSelectedRange(e.target.value as 'full' | 'top' | 'bottom')}
                        className="text-indigo-500" 
                      />
                      <div>
                        <div className="font-semibold text-slate-800">僅替換下身</div>
                        <div className="text-sm text-slate-500">只更換下半身服裝</div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setShowModal('none')}
                      className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                    >
                      取消
                    </button>
                    <button 
                      onClick={executeNext}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg font-bold hover:from-indigo-600 hover:to-blue-700 transition-all"
                    >
                      開始試穿
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">AI 智能推薦</h3>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <WrenchScrewdriverIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-600">選擇推薦範圍，AI 將為您推薦搭配商品</p>
                  </div>
                  <div className="space-y-4 mb-6">
                    <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                      <input 
                        type="radio" 
                        name="ai-range" 
                        value="full"
                        checked={selectedRange === 'full'}
                        onChange={(e) => setSelectedRange(e.target.value as 'full' | 'top' | 'bottom')}
                        className="text-purple-500" 
                      />
                      <div>
                        <div className="font-semibold text-slate-800">全身搭配推薦</div>
                        <div className="text-sm text-slate-500">推薦完整搭配商品</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                      <input 
                        type="radio" 
                        name="ai-range" 
                        value="top"
                        checked={selectedRange === 'top'}
                        onChange={(e) => setSelectedRange(e.target.value as 'full' | 'top' | 'bottom')}
                        className="text-purple-500" 
                      />
                      <div>
                        <div className="font-semibold text-slate-800">上衣搭配推薦</div>
                        <div className="text-sm text-slate-500">推薦搭配的上衣</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all">
                      <input 
                        type="radio" 
                        name="ai-range" 
                        value="bottom"
                        checked={selectedRange === 'bottom'}
                        onChange={(e) => setSelectedRange(e.target.value as 'full' | 'top' | 'bottom')}
                        className="text-purple-500" 
                      />
                      <div>
                        <div className="font-semibold text-slate-800">下身搭配推薦</div>
                        <div className="text-sm text-slate-500">推薦搭配的下身</div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setShowModal('none')}
                      className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all"
                    >
                      取消
                    </button>
                    <button 
                      onClick={executeAIMatch}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      開始推薦
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Bottom Control Bar */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h4 className="font-bold text-slate-800">
                控制台
              </h4>
              
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleAIMatch}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all flex items-center space-x-2 shadow-lg"
                >
                  <WrenchScrewdriverIcon className="w-5 h-5" />
                  <span>AI MATCH</span>
                </button>
                <button 
                  onClick={handleNext}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-lg font-bold transition-all flex items-center space-x-2 shadow-lg"
                >
                  <span>NEXT</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleTryOn}
              disabled={!userPhoto || isProcessing}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center space-x-3 ${
                !userPhoto || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:from-indigo-600 hover:to-blue-700 shadow-lg'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI 處理中...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  <span>🎯 開始試穿</span>
                  <kbd className="px-2 py-1 bg-white/20 text-white text-sm rounded">SPACE</kbd>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-8">
          <Link 
            href="/chat" 
            className="inline-flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回商品選擇</span>
          </Link>
        </div>
      </div>
    </div>
  )
}