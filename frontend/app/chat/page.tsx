'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PaperAirplaneIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  SparklesIcon,
  XMarkIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'
import { useRecommendStore } from '@/store/recommendStore'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { analyzeIntent } from '@/lib/core/intentParser'
import { products, Product } from '@/lib/products'
import {
  useOutfitStore,
  getLookTotalPrice,
  isLookDress,
  getLookTop,
  getLookBottom
} from '@/store/outfitStore'
import { parseOutfitCommand, executeOutfitCommand } from '@/lib/core/outfitCommandParser'
import PhotoUpload from '@/components/forms/PhotoUpload'
import { useCartStore } from '@/store/cartStore'

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

// 拖拽類型定義
const ItemTypes = {
  TOP: 'top',
  BOTTOM: 'bottom'
}

// 可拖拽的商品圖片組件
function DraggableProductImage({
  product,
  lookId,
  type,
  onDrop
}: {
  product: Product
  lookId: number
  type: 'top' | 'bottom'
  onDrop: (fromLookId: number, toLookId: number, itemType: 'top' | 'bottom') => void
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: type === 'top' ? ItemTypes.TOP : ItemTypes.BOTTOM,
    item: { lookId, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const [{ isOver }, drop] = useDrop(() => ({
    accept: type === 'top' ? ItemTypes.TOP : ItemTypes.BOTTOM,
    drop: (item: { lookId: number; type: 'top' | 'bottom' }) => {
      if (item.lookId !== lookId) {
        onDrop(item.lookId, lookId, type)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`cursor-move transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      } ${isOver ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
    >
      <img
        src={product.image}
        alt={product.name}
        className="w-full object-contain"
        style={{ maxHeight: '300px' }}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/images/placeholder.jpg'
        }}
      />
    </div>
  )
}

function ChatPageContent() {
  // === Router ===
  const router = useRouter()

  // === Zustand Store ===
  const {
    currentMode,
    setMode,
    selectedProducts: storeSelectedProducts,
    looks,
    visibleLookCount,
    setSelectedProducts: setStoreSelectedProducts,
    setLooks,
    setVisibleLookCount,
    selectedLookForTryon,
    selectLookForTryon,
    swapItems
  } = useOutfitStore()

  // === Recommend Store (for Studio navigation) ===
  const { setRecommendedProducts: setStoreRecommendedProducts, setSourcePrompt } = useRecommendStore()

  // === 拖拽交換處理 ===
  const handleDragDrop = (fromLookId: number, toLookId: number, itemType: 'top' | 'bottom') => {
    console.log(`🔄 拖拽交換: LOOK ${fromLookId} 和 LOOK ${toLookId} 的${itemType === 'top' ? '上衣' : '下身'}`)
    swapItems(fromLookId, toLookId, itemType)
  }

  // === Local State ===
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('default')
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false) // 初始不顯示商品
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]) // 用戶選擇的商品（local chat mode）
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false) // 側邊欄折疊狀態

  // === 試穿模式專用狀態 ===
  const [selectedLooksForTryon, setSelectedLooksForTryon] = useState<number[]>([]) // 多選 LOOK IDs
  const [userPhoto, setUserPhoto] = useState<File | null>(null) // 用戶照片
  const [isTryonProcessing, setIsTryonProcessing] = useState(false) // 試穿處理中
  const [tryonResults, setTryonResults] = useState<Array<{
    lookId: number
    resultImage: string
    products: Product[]
  }>>([]) // 試穿結果

  // === 購物車 Store ===
  const { addSingleProduct, addOutfit, getTotalItems } = useCartStore()

  // === 初始化 ===
  useEffect(() => {
    const welcomeMessage = {
      type: 'ai' as const,
      content:
        '👋 您好！我是 BE 27 的時尚顧問助理。我可以幫您：\n\n• 分析最新的韓式時尚趨勢\n• 提供個人化穿搭建議\n• 分析您的照片並推薦適合的服飾\n• 智能穿搭組合規劃\n\n請告訴我您的需求，或者問我任何關於時尚的問題！'
    }
    setMessages([welcomeMessage])

    // 載入示例對話記錄
    const sampleSessions: ChatSession[] = [
      {
        id: 'default',
        title: '新對話',
        lastMessage: '您好！我是 BE 27 的時尚顧問助理...',
        timestamp: new Date()
      },
      {
        id: '1',
        title: '韓系流行趨勢分析',
        lastMessage: '2025年春夏韓系時尚的主要趨勢是...',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        title: '海邊婚禮穿搭建議',
        lastMessage: '對於海邊婚禮，我建議選擇...',
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: '3',
        title: '日本旅行穿搭',
        lastMessage: '春季去日本旅行的穿搭要點是...',
        timestamp: new Date(Date.now() - 86400000)
      }
    ]
    setChatSessions(sampleSessions)

    // 載入示例推薦商品
    const sampleRecommendations = products.slice(0, 9) // 9 個商品
    setRecommendedProducts(sampleRecommendations)
  }, [])

  // === 對話相關函數 ===
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新對話',
      lastMessage: '',
      timestamp: new Date()
    }
    setChatSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setMessages([
      {
        type: 'ai',
        content: '👋 您好！我是 BE 27 的時尚顧問助理。請告訴我您的需求！'
      }
    ])
    setMode('chat') // 重置為聊天模式
  }

  const switchChat = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    if (sessionId === 'default') {
      setMessages([
        {
          type: 'ai',
          content:
            '👋 您好！我是 BE 27 的時尚顧問助理。我可以幫您：\n\n• 分析最新的韓式時尚趨勢\n• 提供個人化穿搭建議\n• 分析您的照片並推薦適合的服飾\n• 智能穿搭組合規劃\n\n請告訴我您的需求，或者問我任何關於時尚的問題！'
        }
      ])
    }
  }

  // === 發送訊息 ===
  const sendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return

    const userMessage = inputValue.trim()
    setMessages((prev) => [...prev, { type: 'user', content: userMessage }])
    setInputValue('')
    setIsLoading(true)

    try {
      // 🎯 如果在 outfit 模式，先檢查是否為穿搭指令
      if (currentMode === 'outfit') {
        const command = parseOutfitCommand(userMessage)
        if (command.confidence >= 0.5) {
          const result = executeOutfitCommand(command)
          setMessages((prev) => [
            ...prev,
            {
              type: 'ai',
              content: result.success
                ? `✅ ${result.message}`
                : `❌ ${result.message}`
            }
          ])
          setIsLoading(false)
          return
        } else {
          // 🔄 如果不是穿搭指令，切換回聊天模式
          console.log('🔄 用戶在穿搭模式下發送一般請求，切換回聊天模式')
          setMode('chat')
          setShowRecommendations(false)
          setRecommendedProducts([])
        }
      }

      // 一般對話流程（調用 OpenAI API）
      const intentAnalysis = analyzeIntent({ text: userMessage })

      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        })
      })

      const result = await response.json()

      if (result.success) {
        const safeContent =
          typeof result.response === 'string'
            ? result.response
            : JSON.stringify(result.response) || '回應格式錯誤'
        setMessages((prev) => [...prev, { type: 'ai', content: safeContent }])

        // 顯示推薦商品 - 使用 API 回傳的真實推薦
        if (result.items && result.items.length > 0) {
          setShowRecommendations(true)
          setRecommendedProducts(result.items)
          console.log('✅ 顯示 API 推薦的商品:', result.items.length, '件')
        } else {
          // 如果 API 沒有回傳商品，隱藏推薦區
          setShowRecommendations(false)
          setRecommendedProducts([])
          console.log('⚠️ API 未回傳商品推薦')
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: 'ai',
            content: '抱歉，我現在遇到一些技術問題，請稍後再試。'
          }
        ])
      }
    } catch (error) {
      console.error('發送訊息錯誤:', error)
      setMessages((prev) => [
        ...prev,
        {
          type: 'ai',
          content: '抱歉，處理您的請求時遇到問題，請重新嘗試。'
        }
      ])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // === 🎯 試穿功能處理 ===

  // 切換 LOOK 選擇
  const toggleLookSelection = (lookId: number) => {
    setSelectedLooksForTryon(prev =>
      prev.includes(lookId)
        ? prev.filter(id => id !== lookId)
        : [...prev, lookId]
    )
  }

  // 處理照片上傳
  const handlePhotoUpload = (file: File) => {
    setUserPhoto(file)
  }

  // 批次試穿
  const handleBatchTryon = async () => {
    if (selectedLooksForTryon.length === 0) {
      alert('請至少選擇一套 LOOK')
      return
    }
    if (!userPhoto) {
      alert('請上傳您的照片')
      return
    }

    setIsTryonProcessing(true)
    const results: Array<{ lookId: number; resultImage: string; products: Product[] }> = []

    try {
      // 將用戶照片轉為 base64
      const userPhotoBase64 = await fileToBase64(userPhoto)

      // Helper: 將相對路徑轉為完整 URL
      const toAbsoluteUrl = (path: string) => {
        if (path.startsWith('http')) return path
        const origin = window.location.origin
        return `${origin}${path.startsWith('/') ? path : '/' + path}`
      }

      // 逐一處理每個選中的 LOOK
      for (const lookId of selectedLooksForTryon) {
        const look = looks.find(l => l.id === lookId)
        if (!look) continue

        console.log(`🎨 開始試穿 LOOK ${lookId}...`)

        // 調用試穿 API（這裡需要根據實際 API 調整）
        // 目前的試穿 API 只支援單件商品，需要處理上下身組合
        const isDress = isLookDress(look)

        if (isDress) {
          // 洋裝：單件試穿
          const response = await fetch('/api/tryon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              personImageUrl: userPhotoBase64,
              garmentImageUrl: toAbsoluteUrl(look.items[0].image),
              customRequest: 'Complete outfit',
              keepOtherItems: true
            })
          })
          const result = await response.json()
          console.log(`🔍 LOOK ${lookId} API 回應:`, result)

          // API 成功時返回 { url, backend, message }，失敗時返回 { success: false, error }
          if (result.url && result.success !== false) {
            results.push({
              lookId,
              resultImage: result.url,
              products: look.items
            })
            console.log(`✅ LOOK ${lookId} 試穿成功`)
          } else {
            console.error(`❌ LOOK ${lookId} 試穿失敗:`, result.error || result.message)
          }
        } else {
          // 上下身組合：分兩步試穿
          console.log(`📦 LOOK ${lookId} 是上下身組合，開始兩步試穿...`)

          try {
            // Step 1: 試穿上衣
            console.log(`👕 Step 1: 試穿上衣 (${look.items[0].name})`)
            const topResponse = await fetch('/api/tryon', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                personImageUrl: userPhotoBase64,
                garmentImageUrl: toAbsoluteUrl(look.items[0].image),
                customRequest: 'only top',  // 只替換上衣
                keepOtherItems: true
              })
            })
            const topResult = await topResponse.json()
            console.log(`🔍 上衣試穿結果:`, topResult)

            if (!topResult.url || topResult.success === false) {
              console.error(`❌ 上衣試穿失敗:`, topResult.error || topResult.message)
              continue
            }

            // Step 2: 在上衣試穿結果基礎上試穿下身
            console.log(`👖 Step 2: 試穿下身 (${look.items[1].name})`)
            const bottomResponse = await fetch('/api/tryon', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                personImageUrl: topResult.url,  // 使用上一步的結果圖片
                garmentImageUrl: toAbsoluteUrl(look.items[1].image),
                customRequest: 'only bottom',  // 只替換下身
                keepOtherItems: true
              })
            })
            const bottomResult = await bottomResponse.json()
            console.log(`🔍 下身試穿結果:`, bottomResult)

            if (bottomResult.url && bottomResult.success !== false) {
              results.push({
                lookId,
                resultImage: bottomResult.url,  // 最終結果是兩步合成的圖片
                products: look.items
              })
              console.log(`✅ LOOK ${lookId} 試穿成功（上衣+下身兩步完成）`)
            } else {
              console.error(`❌ LOOK ${lookId} 下身試穿失敗:`, bottomResult.error || bottomResult.message)
            }
          } catch (stepError) {
            console.error(`❌ LOOK ${lookId} 分步試穿失敗:`, stepError)
          }
        }
      }

      setTryonResults(results)
      console.log(`✅ 完成 ${results.length} 套試穿`)

    } catch (error) {
      console.error('❌ 批次試穿錯誤:', error)
      alert('試穿處理失敗，請稍後再試')
    } finally {
      setIsTryonProcessing(false)
    }
  }

  // File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 加入購物車（整套）
  const handleAddOutfitToCart = (lookId: number, tryonImage?: string) => {
    const look = looks.find(l => l.id === lookId)
    if (look) {
      addOutfit(look, tryonImage, 'tryon')
      alert('已加入購物車！')
    }
  }

  // 加入購物車（單品）
  const handleAddProductToCart = (product: Product) => {
    addSingleProduct(product, 1, 'tryon')
    alert(`已將 ${product.name} 加入購物車！`)
  }

  // === 🎯 BE 27 核心功能：進入穿搭工作室 ===
  const startOutfitSelection = async () => {
    // 驗證選擇的商品數量
    if (selectedProducts.length < 1 || selectedProducts.length > 12) {
      alert('請選擇 1-12 件商品！')
      return
    }

    setIsLoading(true)

    // 顯示載入訊息
    setMessages((prev) => [
      ...prev,
      {
        type: 'ai',
        content: '✨ 正在為您生成 6 套專屬穿搭組合，請稍候...'
      }
    ])

    try {
      // 調用 AI 穿搭生成 API
      const response = await fetch('/api/outfit/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          products: selectedProducts
        })
      })

      const result = await response.json()

      if (!result.success || !result.looks) {
        throw new Error(result.error || '生成穿搭失敗')
      }

      console.log('✅ 收到 AI 生成的穿搭:', result.looks)

      // 更新 Zustand store
      setStoreSelectedProducts(selectedProducts)
      setLooks(result.looks)
      setMode('outfit')

      // AI 成功訊息
      setMessages((prev) => [
        ...prev.slice(0, -1), // 移除載入訊息
        {
          type: 'ai',
          content: `✨ 太棒了！我已經為您生成 ${result.looks.length} 套精選穿搭組合。\n\n您可以：\n• 查看不同風格的搭配方案\n• 使用指令調整穿搭（例如："交換 LOOK 1 和 LOOK 3 的上衣"）\n• 調整顯示數量（"只顯示前 3 套"）\n• 選擇一套進行虛擬試穿\n\n開始探索吧！`
        }
      ])
    } catch (error: any) {
      console.error('❌ 生成穿搭失敗:', error)
      setMessages((prev) => [
        ...prev.slice(0, -1), // 移除載入訊息
        {
          type: 'ai',
          content: `❌ 抱歉，生成穿搭時遇到問題：${error.message || '未知錯誤'}\n\n請重新嘗試。`
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // === 商品選擇邏輯 ===
  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id)
    if (isSelected) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id))
    } else {
      if (selectedProducts.length >= 12) {
        alert('最多只能選擇 12 件商品')
        return
      }
      setSelectedProducts((prev) => [...prev, product])
    }
  }

  // === 🎨 前往穿搭工作室 ===
  const goToStudio = () => {
    // 將推薦商品存入 recommendStore（使用 API 回傳的完整 URL）
    const productsForStudio = recommendedProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: String(p.price),
      category: p.category,
      style: p.style || '',
      image: p.image, // Django 原圖 URL
      image_nobg: (p as any).image_nobg || p.image, // Django 去背圖 URL
      tags: p.tags || [],
      colors: p.colors || []
    }))
    console.log('🎨 前往工作室，帶入商品:', productsForStudio.length, '件')
    console.log('🔍 商品範例:', productsForStudio[0])
    setStoreRecommendedProducts(productsForStudio)
    setSourcePrompt(messages[messages.length - 2]?.content || '') // 記錄用戶的原始 prompt
    router.push('/studio')
  }

  // === 🎯 Render Stage 1: Chat Mode ===
  if (currentMode === 'chat') {
    return (
      <div className="h-screen bg-white flex">
        {/* 左側邊欄 - 對話記錄 */}
        <div className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-1/4'
        }`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <button
                onClick={createNewChat}
                className="flex-1 flex items-center gap-3 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                新對話
              </button>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors ${
                isSidebarCollapsed ? 'w-full' : 'ml-2'
              }`}
              title={isSidebarCollapsed ? '展開側邊欄' : '折疊側邊欄'}
            >
              {isSidebarCollapsed ? '»' : '«'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!isSidebarCollapsed && chatSessions.map((session) => (
              <button
                key={session.id}
                onClick={() => switchChat(session.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  currentSessionId === session.id
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  <ChatBubbleLeftIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{session.title}</h3>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {session.lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {session.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </button>
            ))}
            {isSidebarCollapsed && (
              <div className="flex flex-col gap-2 items-center mt-4">
                {chatSessions.slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => switchChat(session.id)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      currentSessionId === session.id
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={session.title}
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {!isSidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">BE 27 AI 助理</div>
            </div>
          )}
        </div>

        {/* 右側主要聊天區域 */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h1 className="text-lg font-semibold text-gray-900">BE 27</h1>
            <p className="text-sm text-gray-500">AI 時尚顧問助理</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.type === 'ai' && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 text-xs">AI</span>
                        </div>
                        <span className="text-xs text-gray-500">BE 27</span>
                      </div>
                    )}
                    <div
                      className="text-sm leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  </div>
                </div>
              ))}

              {/* 推薦商品區塊 - 整合在對話流中 */}
              {showRecommendations && recommendedProducts.length > 0 && (
                <div className="flex justify-start">
                  <div className="max-w-[95%] p-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-xs">AI</span>
                      </div>
                      <span className="text-xs text-gray-500">BE 27</span>
                      <ShoppingBagIcon className="w-4 h-4 text-purple-600 ml-2" />
                      <span className="text-xs font-medium text-purple-600">
                        已選擇 {selectedProducts.length}/12 件
                      </span>
                    </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendedProducts.map((product) => {
                      const isSelected = selectedProducts.some((p) => p.id === product.id)
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleProductSelection(product)}
                          className={`bg-white rounded-xl p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'shadow-lg ring-1 ring-purple-500'
                              : 'shadow-sm hover:shadow-md'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/placeholder.jpg'
                              }}
                            />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            <span className="block truncate">{product.name}</span>
                          </h4>
                          <p className="text-xs text-gray-500 mb-2 truncate">
                            {product.category} • {product.style}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-purple-600">
                              NT$ {product.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                    <div className="text-center mt-6">
                      <div className="flex gap-3 justify-center flex-wrap">
                        <button
                          onClick={startOutfitSelection}
                          disabled={selectedProducts.length < 1 || selectedProducts.length > 12}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <SparklesIcon className="w-5 h-5" />
                          生成 6 套穿搭
                        </button>
                        <button
                          onClick={goToStudio}
                          disabled={recommendedProducts.length === 0}
                          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <PaintBrushIcon className="w-5 h-5" />
                          前往穿搭工作室
                        </button>
                      </div>
                      {selectedProducts.length === 0 && (
                        <p className="text-sm text-gray-500 mt-2">
                          選擇商品後可生成穿搭，或直接前往工作室自由搭配
                        </p>
                      )}
                      {selectedProducts.length > 0 && selectedProducts.length <= 12 && (
                        <p className="text-sm text-purple-600 mt-2">
                          已選擇 {selectedProducts.length} 件，可生成 6 套穿搭組合
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-xs">AI</span>
                      </div>
                      <span className="text-xs text-gray-500">BE 27</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 輸入區域 */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end gap-3">
                <div className="flex-1 min-h-[44px] max-h-[120px]">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="請輸入您的問題..."
                    className="w-full resize-none border border-gray-200 rounded-lg px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={1}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                    }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="h-11 w-11 bg-gray-900 text-white rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>

              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {['2025年韓系流行趨勢', '海邊婚禮穿搭建議', '日本旅行穿搭'].map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInputValue(suggestion)}
                        className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === 🎯 Render Stage 2: Outfit Studio Mode ===
  if (currentMode === 'outfit') {
    const visibleLooks = looks.slice(0, visibleLookCount)

    return (
      <div className="h-screen bg-white flex">
        {/* 左側 Chat 欄位（1/5 寬度） */}
        <div className="w-1/5 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center gap-2">
            <button
              onClick={() => setMode('chat')}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">穿搭工作室</h2>
              <p className="text-xs text-gray-500">BE 27 AI</p>
            </div>
          </div>

          {/* 聊天訊息 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.slice(-5).map((message, index) => (
              <div
                key={index}
                className={`text-xs ${message.type === 'user' ? 'text-right' : 'text-left'}`}
              >
                <div
                  className={`inline-block max-w-full rounded-lg px-3 py-2 ${
                    message.type === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-purple-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* 輸入區域 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="輸入指令..."
                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-gray-900 text-white rounded-lg disabled:opacity-50"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 右側 LOOK 展示區域（4/5 寬度） */}
        <div className="flex-1 bg-white p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                穿搭組合工作室 ✨
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisibleLookCount(3)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    visibleLookCount === 3
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  顯示 3 套
                </button>
                <button
                  onClick={() => setVisibleLookCount(6)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    visibleLookCount === 6
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  顯示 6 套
                </button>
              </div>
            </div>

            {/* LOOK 卡片網格 */}
            <div className="grid grid-cols-3 gap-8">
              {visibleLooks.map((look) => {
                const isDress = isLookDress(look)
                const top = getLookTop(look)
                const bottom = getLookBottom(look)
                const totalPrice = getLookTotalPrice(look)

                return (
                  <div
                    key={look.id}
                    className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">LOOK {look.id}</h3>
                        {look.style && (
                          <p className="text-xs text-gray-500 mt-1">{look.style}</p>
                        )}
                        {look.occasion && (
                          <p className="text-xs text-purple-600 mt-0.5">📍 {look.occasion}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          selectLookForTryon(look.id)
                          setMode('tryon')
                        }}
                        className="px-3 py-1 text-xs bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                      >
                        試穿
                      </button>
                    </div>

                    {/* 洋裝單件顯示 */}
                    {isDress && look.items[0] && (
                      <div className="mb-4">
                        <img
                          src={look.items[0].image}
                          alt={look.items[0].name}
                          className="w-full object-contain mb-3"
                          style={{ maxHeight: '400px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/images/placeholder.jpg'
                          }}
                        />
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {look.items[0].name}
                        </p>
                        <p className="text-xs text-gray-500">{look.items[0].category}</p>
                        <p className="text-xs text-purple-600 mt-1">
                          NT$ {look.items[0].price.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {/* 上下身組合顯示 - 可拖拽交換 */}
                    {!isDress && top && bottom && (
                      <div className="mb-4">
                        {/* 上下疊加的穿搭效果 */}
                        <div className="relative mb-3">
                          {/* 上衣 - 可拖拽 */}
                          <div className="mb-2 relative group">
                            <DraggableProductImage
                              product={top}
                              lookId={look.id}
                              type="top"
                              onDrop={handleDragDrop}
                            />
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              拖動交換上衣
                            </div>
                          </div>
                          {/* 下身 - 可拖拽 */}
                          <div className="relative group">
                            <DraggableProductImage
                              product={bottom}
                              lookId={look.id}
                              type="bottom"
                              onDrop={handleDragDrop}
                            />
                            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              拖動交換下身
                            </div>
                          </div>
                        </div>

                        {/* 商品資訊 */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">上衣</span>
                            <span className="font-medium text-gray-900 truncate ml-2">{top.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">下身</span>
                            <span className="font-medium text-gray-900 truncate ml-2">{bottom.name}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 總價 */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">總價</span>
                        <span className="text-lg font-bold text-purple-600">
                          NT$ {totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 提示訊息 */}
            <div className="mt-8 bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                💡 試試這些指令：
                <br />
                • "交換 LOOK 1 和 LOOK 3 的褲子"
                <br />
                • "只顯示前 3 套"
                <br />• "重新組合全部"
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // === 🎯 Render Stage 3: Try-On Mode ===
  if (currentMode === 'tryon') {
    return (
      <div className="h-screen bg-white overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* 頂部導航 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setMode('outfit')
                // 重置試穿狀態
                setSelectedLooksForTryon([])
                setUserPhoto(null)
                setTryonResults([])
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              返回穿搭工作室
            </button>

            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                購物車 ({getTotalItems()})
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✨ AI 虛擬試穿體驗
          </h1>
          <p className="text-gray-600 mb-8">選擇 LOOK，上傳照片，立即查看穿搭效果</p>

          {/* Step 1: 選擇 LOOK（可複選） */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Step 1: 選擇要試穿的 LOOK
              </h2>
              <span className="text-sm text-purple-600 font-medium">
                已選 {selectedLooksForTryon.length}/{looks.length} 套
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {looks.map((look) => {
                const isSelected = selectedLooksForTryon.includes(look.id)
                const isDress = isLookDress(look)
                const top = isDress ? null : getLookTop(look)
                const bottom = isDress ? null : getLookBottom(look)

                return (
                  <div
                    key={look.id}
                    onClick={() => toggleLookSelection(look.id)}
                    className={`
                      relative rounded-xl p-4 cursor-pointer transition-all
                      ${isSelected
                        ? 'bg-purple-50 shadow-lg ring-1 ring-purple-500'
                        : 'bg-white shadow-sm hover:shadow-md'
                      }
                    `}
                  >
                    {/* 勾選標記 */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                        ✓
                      </div>
                    )}

                    {/* LOOK 標題 */}
                    <div className="mb-2">
                      <span className="text-sm font-semibold text-gray-900">LOOK {look.id}</span>
                      {look.style && (
                        <span className="ml-2 text-xs text-purple-600">{look.style}</span>
                      )}
                    </div>

                    {/* 商品預覽圖 */}
                    <div className="mb-3">
                      {isDress && look.items[0] ? (
                        <img
                          src={look.items[0].image}
                          alt={look.items[0].name}
                          className="w-full h-32 object-contain"
                        />
                      ) : (
                        <div className="space-y-1">
                          {top && (
                            <img
                              src={top.image}
                              alt={top.name}
                              className="w-full h-16 object-contain"
                            />
                          )}
                          {bottom && (
                            <img
                              src={bottom.image}
                              alt={bottom.name}
                              className="w-full h-16 object-contain"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* 價格 */}
                    <div className="text-sm font-medium text-purple-600">
                      NT$ {getLookTotalPrice(look).toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step 2: 上傳照片 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Step 2: 上傳您的照片
            </h2>
            <PhotoUpload
              onUpload={handlePhotoUpload}
              currentFile={userPhoto}
              maxSize={10}
            />
          </div>

          {/* 生成按鈕 */}
          <div className="mb-8 text-center">
            <button
              onClick={handleBatchTryon}
              disabled={selectedLooksForTryon.length === 0 || !userPhoto || isTryonProcessing}
              className={`
                px-8 py-4 rounded-lg text-lg font-semibold transition-all
                ${selectedLooksForTryon.length === 0 || !userPhoto || isTryonProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                }
              `}
            >
              {isTryonProcessing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI 生成試穿效果中...</span>
                </div>
              ) : (
                `🎨 開始生成試穿效果 (${selectedLooksForTryon.length} 套)`
              )}
            </button>
          </div>

          {/* Step 3: 試穿結果展示 */}
          {tryonResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                ✅ 試穿結果
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tryonResults.map((result) => {
                  const look = looks.find(l => l.id === result.lookId)
                  if (!look) return null

                  return (
                    <div key={result.lookId} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all">
                      {/* 試穿照片 */}
                      <div className="mb-4">
                        <img
                          src={result.resultImage}
                          alt={`LOOK ${result.lookId} 試穿效果`}
                          className="w-full h-96 object-contain bg-white rounded-xl"
                        />
                      </div>

                      {/* LOOK 資訊 */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-semibold text-gray-900">
                            LOOK {result.lookId}
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            NT$ {getLookTotalPrice(look).toLocaleString()}
                          </span>
                        </div>
                        {look.style && (
                          <p className="text-sm text-gray-600 mb-1">{look.style}</p>
                        )}
                        {look.occasion && (
                          <p className="text-xs text-gray-500">{look.occasion}</p>
                        )}
                      </div>

                      {/* 商品列表 */}
                      <div className="mb-4 space-y-2">
                        {result.products.map((product, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{product.name}</span>
                            <button
                              onClick={() => handleAddProductToCart(product)}
                              className="text-purple-600 hover:text-purple-700 text-xs"
                            >
                              單獨加入
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* 操作按鈕 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = result.resultImage
                            link.download = `tryon_look_${result.lookId}.jpg`
                            link.click()
                          }}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          💾 下載照片
                        </button>
                        <button
                          onClick={() => handleAddOutfitToCart(result.lookId, result.resultImage)}
                          className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                        >
                          🛒 整套加入購物車
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 底部按鈕 */}
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={() => setMode('outfit')}
                  className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  🔙 繼續挑選其他穿搭
                </button>
                <button
                  onClick={() => {
                    // TODO: 導航到購物車頁面
                    alert('購物車功能開發中...')
                  }}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  📋 查看購物車 ({getTotalItems()})
                </button>
              </div>
            </div>
          )}

          {/* 提示訊息 */}
          {tryonResults.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-medium mb-2">💡 使用提示</p>
              <ul className="space-y-1 text-xs">
                <li>• 可以同時選擇多套 LOOK 進行試穿</li>
                <li>• 照片建議：正面全身照或半身照，光線充足，背景簡單</li>
                <li>• 試穿結果可以下載保存或直接加入購物車</li>
                <li>• 支援整套購買（享有套裝優惠）或單品加入購物車</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}

// 導出包裝了 DndProvider 的組件
export default function ChatPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ChatPageContent />
    </DndProvider>
  )
}
