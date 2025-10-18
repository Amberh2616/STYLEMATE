'use client'

import { useState, useEffect } from 'react'
import {
  PaperAirplaneIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { analyzeIntent } from '@/lib/core/intentParser'
import { products, Product } from '@/lib/products'
import { useOutfitStore, getFullLook } from '@/store/outfitStore'
import { parseOutfitCommand, executeOutfitCommand } from '@/lib/core/outfitCommandParser'

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

export default function ChatPage() {
  // === Zustand Store ===
  const {
    currentMode,
    setMode,
    selectedTops,
    selectedBottoms,
    looks,
    visibleLookCount,
    setSelectedItems,
    setVisibleLookCount,
    selectedLookForTryon,
    selectLookForTryon
  } = useOutfitStore()

  // === Local State ===
  const [messages, setMessages] = useState<Array<{ type: 'user' | 'ai'; content: string }>>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('default')
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]) // 用戶選擇的商品

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

        // 顯示推薦商品
        if (currentMode === 'chat') {
          setShowRecommendations(true)
          const newRecommendations = products.slice(
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10) + 9
          )
          setRecommendedProducts(newRecommendations)
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

  // === 🎯 BE 27 核心功能：進入穿搭工作室 ===
  const startOutfitSelection = () => {
    // 驗證選擇的商品數量
    const tops = selectedProducts.filter(
      (p) => p.category === 'top' || p.category === 'dress'
    )
    const bottoms = selectedProducts.filter((p) => p.category === 'bottom')

    if (tops.length !== 3 || bottoms.length !== 3) {
      alert('請選擇 3 件上衣和 3 件下身！')
      return
    }

    setSelectedItems(tops, bottoms)
    setMode('outfit')

    // AI 提示訊息
    setMessages((prev) => [
      ...prev,
      {
        type: 'ai',
        content:
          '✨ 太棒了！我已經為您準備好 6 套穿搭組合。\n\n您可以：\n• 拖拽商品來調整搭配\n• 使用指令交換商品（例如："交換 LOOK 1 和 LOOK 3 的褲子"）\n• 調整顯示數量（"只顯示前 3 套"）\n• 選擇一套進行虛擬試穿\n\n試試看吧！'
      }
    ])
  }

  // === 商品選擇邏輯 ===
  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.some((p) => p.id === product.id)
    if (isSelected) {
      setSelectedProducts((prev) => prev.filter((p) => p.id !== product.id))
    } else {
      if (selectedProducts.length >= 6) {
        alert('最多只能選擇 6 件商品（3 上衣 + 3 下身）')
        return
      }
      setSelectedProducts((prev) => [...prev, product])
    }
  }

  // === 🎯 Render Stage 1: Chat Mode ===
  if (currentMode === 'chat') {
    return (
      <div className="h-screen bg-white flex">
        {/* 左側邊欄 - 對話記錄 */}
        <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={createNewChat}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              新對話
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {chatSessions.map((session) => (
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
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">BE 27 AI 助理</div>
          </div>
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
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* 推薦商品區塊 */}
              {showRecommendations && recommendedProducts.length > 0 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ShoppingBagIcon className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">為您推薦</h3>
                    </div>
                    <div className="text-sm text-gray-500">
                      已選擇 {selectedProducts.length}/6 件
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedProducts.map((product) => {
                      const isSelected = selectedProducts.some((p) => p.id === product.id)
                      return (
                        <div
                          key={product.id}
                          onClick={() => toggleProductSelection(product)}
                          className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-purple-500 shadow-lg'
                              : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
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
                    <button
                      onClick={startOutfitSelection}
                      disabled={selectedProducts.length !== 6}
                      className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      開始挑選穿搭
                    </button>
                    {selectedProducts.length !== 6 && (
                      <p className="text-sm text-gray-500 mt-2">
                        請選擇 3 件上衣和 3 件下身（目前：{selectedProducts.length}/6）
                      </p>
                    )}
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
        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
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
            <div className="grid grid-cols-3 gap-6">
              {visibleLooks.map((look) => {
                const fullLook = getFullLook(look, selectedTops, selectedBottoms)
                if (!fullLook) return null

                return (
                  <div
                    key={look.id}
                    className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-purple-400 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">LOOK {look.id}</h3>
                      <button
                        onClick={() => {
                          selectLookForTryon(look.id)
                          setMode('tryon')
                        }}
                        className="px-3 py-1 text-xs bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
                      >
                        試穿這套
                      </button>
                    </div>

                    {/* 上衣 */}
                    <div className="mb-4">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                        <img
                          src={fullLook.top.image}
                          alt={fullLook.top.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fullLook.top.name}
                      </p>
                      <p className="text-xs text-purple-600">
                        NT$ {fullLook.top.price.toLocaleString()}
                      </p>
                    </div>

                    {/* 下身 */}
                    <div className="mb-4">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                        <img
                          src={fullLook.bottom.image}
                          alt={fullLook.bottom.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fullLook.bottom.name}
                      </p>
                      <p className="text-xs text-purple-600">
                        NT$ {fullLook.bottom.price.toLocaleString()}
                      </p>
                    </div>

                    {/* 總價 */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">總價</span>
                        <span className="text-lg font-bold text-purple-600">
                          NT$ {fullLook.totalPrice.toLocaleString()}
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
    const selectedLook = looks.find((l) => l.id === selectedLookForTryon)
    const fullLook = selectedLook
      ? getFullLook(selectedLook, selectedTops, selectedBottoms)
      : null

    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="max-w-4xl w-full p-6">
          <button
            onClick={() => setMode('outfit')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            返回穿搭工作室
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            虛擬試穿 - LOOK {selectedLookForTryon}
          </h1>

          {fullLook && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">您選擇的穿搭：</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">上衣</p>
                  <p className="font-medium">{fullLook.top.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">下身</p>
                  <p className="font-medium">{fullLook.bottom.name}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500 mb-4">上傳您的照片以查看試穿效果</p>
            <button className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
              上傳照片
            </button>
            <p className="text-xs text-gray-400 mt-4">
              此功能將整合 Nano Banana API
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
