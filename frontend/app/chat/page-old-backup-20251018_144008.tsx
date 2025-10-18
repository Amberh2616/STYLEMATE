'use client'

import { useState, useEffect } from 'react'
import { PaperAirplaneIcon, PlusIcon, ChatBubbleLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'
import { analyzeIntent } from '@/lib/core/intentParser'
import { products, Product } from '@/lib/products'

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>('default')
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [showRecommendations, setShowRecommendations] = useState(true)
  const [weeklyOutfits, setWeeklyOutfits] = useState<Array<{
    day: string
    dayZh: string
    top: Product
    bottom: Product
    style: string
    occasion: string
  }>>([])
  const [showWeeklyOutfits, setShowWeeklyOutfits] = useState(false)

  // 載入初始歡迎訊息和對話記錄
  useEffect(() => {
    const welcomeMessage = {
      type: 'ai' as const,
      content: '👋 您好！我是 BE 27 的時尚顧問助理。我可以幫您：\n\n• 分析最新的韓式時尚趨勢\n• 提供個人化穿搭建議\n• 分析您的照片並推薦適合的服飾\n\n請告訴我您的需求，或者問我任何關於時尚的問題！'
    }
    setMessages([welcomeMessage])

    // 載入示例對話記錄
    const sampleSessions: ChatSession[] = [
      {
        id: 'default',
        title: '新對話',
        lastMessage: '您好！我是 STYLEMATE 的時尚顧問助理...',
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
    const sampleRecommendations = products.slice(0, 6) // 取前6個商品作為示例
    setRecommendedProducts(sampleRecommendations)
  }, [])

  // 新增對話
  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新對話',
      lastMessage: '',
      timestamp: new Date()
    }
    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setMessages([{
      type: 'ai',
      content: '👋 您好！我是 STYLEMATE 的時尚顧問助理。請告訴我您的需求，或者問我任何關於時尚的問題！'
    }])
  }

  // 切換對話
  const switchChat = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    // 這裡可以加載對應的對話記錄
    if (sessionId === 'default') {
      setMessages([{
        type: 'ai',
        content: '👋 您好！我是 STYLEMATE 的時尚顧問助理。我可以幫您：\n\n• 分析最新的韓式時尚趨勢\n• 提供個人化穿搭建議\n• 分析您的照片並推薦適合的服飾\n\n請告訴我您的需求，或者問我任何關於時尚的問題！'
      }])
    }
  }

  // 發送訊息
  const sendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return

    const userMessage = inputValue.trim()
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])
    setInputValue('')
    setIsLoading(true)

    try {
      // 分析用戶意圖
      const intentAnalysis = analyzeIntent({ text: userMessage })

      // 調用 API
      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages
        }),
      })

      const result = await response.json()

      if (result.success) {
        const safeContent = typeof result.response === 'string'
          ? result.response
          : JSON.stringify(result.response) || '回應格式錯誤'
        setMessages(prev => [...prev, { type: 'ai', content: safeContent }])

        // 顯示推薦商品
        setShowRecommendations(true)
        // 可以根據對話內容來動態選擇推薦商品，這裡先用示例數據
        const newRecommendations = products.slice(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10) + 6)
        setRecommendedProducts(newRecommendations)
      } else {
        setMessages(prev => [...prev, {
          type: 'ai',
          content: '抱歉，我現在遇到一些技術問題，請稍後再試。'
        }])
      }
    } catch (error) {
      console.error('發送訊息錯誤:', error)
      setMessages(prev => [...prev, {
        type: 'ai',
        content: '抱歉，處理您的請求時遇到問題，請重新嘗試。'
      }])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-screen bg-white flex">
      {/* 左側邊欄 - 對話記錄 (1/4 寬度) */}
      <div className="w-1/4 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* 側邊欄 Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            新對話
          </button>
        </div>

        {/* 對話記錄列表 */}
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
                  <p className="text-xs text-gray-500 truncate mt-1">{session.lastMessage}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {session.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 側邊欄底部 */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            BE 27 AI 助理
          </div>
        </div>
      </div>

      {/* 右側主要聊天區域 (3/4 寬度) */}
      <div className="flex-1 flex flex-col">
        {/* 聊天區域 Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-lg font-semibold text-gray-900">BE 27</h1>
          <p className="text-sm text-gray-500">AI 時尚顧問助理</p>
        </div>

        {/* 聊天訊息區域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
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
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBagIcon className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">為您推薦</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/placeholder.jpg'
                          }}
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1 overflow-hidden">
                        <span className="block truncate">
                          {product.name}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500 mb-2 truncate">
                        {product.category} • {product.style}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-purple-600">
                          NT$ {product.price.toLocaleString()}
                        </span>
                        <button className="px-3 py-1 text-xs bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors">
                          查看詳情
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-4">
                  <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                    開始挑選穿搭
                  </button>
                </div>
              </div>
            )}

            {/* 載入中指示器 */}
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
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 輸入區域 - 固定在底部 */}
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
                  style={{
                    minHeight: '44px',
                    height: 'auto',
                    overflowY: inputValue.split('\n').length > 3 ? 'scroll' : 'hidden'
                  }}
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

            {/* 快速建議按鈕 */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  "2025年韓系流行趨勢",
                  "海邊婚禮穿搭建議",
                  "日本旅行穿搭"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInputValue(suggestion)}
                    className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}