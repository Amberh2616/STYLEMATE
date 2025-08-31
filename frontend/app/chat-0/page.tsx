/*
 * CHAT-0 頁面 - 原始小對話框版本 (禁用/備份版)
 * 此頁面僅用於保存原始設計，請勿與其他版本混用
 * 這是來自 git commit 5349747 的原始版本
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

export default function ChatPage() {
  const [conversationStep, setConversationStep] = useState(0)
  const [showProducts, setShowProducts] = useState(false)
  const [assistantEmoji, setAssistantEmoji] = useState('👩‍💼')
  const [bubbleText, setBubbleText] = useState('哈囉！我是你的時尚助理！')
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([])
  const [inputValue, setInputValue] = useState('')
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const products = [
    {
      id: 'dress1',
      name: '韓式甜美花朵印花洋裝',
      price: '1,299',
      emoji: '👗',
      description: '甜美可愛的花朵印花洋裝，輕薄透氣的面料'
    },
    {
      id: 'shirt1',
      name: '優雅V領職場襯衫',
      price: '899',
      emoji: '👚',
      description: '簡約優雅的V領襯衫，職場必備單品'
    },
    {
      id: 'knit1',
      name: '韓系簡約針織上衣',
      price: '799',
      emoji: '👕',
      description: '柔軟舒適的針織上衣，簡約百搭'
    }
  ]

  const sendMessage = () => {
    if (!inputValue.trim()) return
    
    const newMessages = [...messages, { type: 'user' as const, content: inputValue }]
    setMessages(newMessages)
    setInputValue('')
    
    // 模擬AI回應
    setTimeout(() => {
      const aiResponse = conversationStep === 0 
        ? `我了解你的喜好了！讓我為你推薦一些精選的商品 ✨`
        : '謝謝你的回饋！我會根據你的喜好繼續為你推薦更合適的商品 💕'
      
      setMessages([...newMessages, { type: 'ai', content: aiResponse }])
      setConversationStep(prev => prev + 1)
      
      if (conversationStep === 0) {
        setTimeout(() => setShowProducts(true), 1000)
      }
    }, 1500)
  }

  const likeProduct = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setSelectedProduct(product)
      const newMessage = { 
        type: 'ai' as const, 
        content: `太棒了！你選擇了「${product.name}」✨<br/><br/>現在請在右邊上傳你的全身照片，我就可以為你生成試穿效果圖了！📸` 
      }
      setMessages(prev => [...prev, newMessage])
      setBubbleText('需要你的照片！')
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedPhoto(result)
        setAssistantEmoji('👩‍💼')
        setBubbleText('照片很棒！')
        
        const newMessage = { 
          type: 'ai' as const, 
          content: '照片上傳成功！照片看起來很不錯呢 ✨<br/><br/>現在點擊「開始生成試穿圖」按鈕，我就可以幫你合成試穿效果了！' 
        }
        setMessages(prev => [...prev, newMessage])
      }
      reader.readAsDataURL(file)
    }
  }

  const startTryOn = () => {
    if (!selectedProduct || !uploadedPhoto) {
      alert('請先選擇商品和上傳照片！')
      return
    }
    
    setAssistantEmoji('👩‍💼')
    setBubbleText('生成中...')
    
    const newMessage = { 
      type: 'ai' as const, 
      content: `正在生成你穿著「${selectedProduct.name}」的試穿效果圖...<br/><br/>請稍等一下，馬上就好了！ ⏳` 
    }
    setMessages(prev => [...prev, newMessage])
    
    // 模擬處理時間後顯示完成訊息
    setTimeout(() => {
      setBubbleText('完成了！')
      const completeMessage = { 
        type: 'ai' as const, 
        content: `試穿圖生成完成！你穿這件${selectedProduct.name}真的超美的 ✨<br/><br/>即將為你展示結果...` 
      }
      setMessages(prev => [...prev, completeMessage])
      
      // 跳轉到結果頁面
      setTimeout(() => {
        window.location.href = '/tryon'
      }, 1500)
    }, 3000)
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

      {/* 小人頭助理 */}
      <div className="fixed top-12 right-12 z-50">
        <div className="relative">
          {/* 助理頭像 */}
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-200 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-2xl text-white">{assistantEmoji}</span>
          </div>
          
          {/* 說話氣泡 */}
          <div className="absolute -left-32 top-1/2 transform -translate-y-1/2 bg-white rounded-lg px-3 py-2 shadow-lg border-2 border-slate-200">
            <div className="text-sm text-gray-600">{bubbleText}</div>
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="container mx-auto px-8 py-12 max-w-4xl relative z-10">
        {/* 標題區域 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              STYLEMATE
            </h1>
            <SparklesIcon className="w-8 h-8 text-violet-600 animate-pulse" />
          </div>
          <p className="text-slate-600">讓我來幫你找到最完美的韓式穿搭！</p>
        </div>

        {/* 主要內容區 - 左右分欄 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* 左側：聊天區域 */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6">
            {/* 聊天訊息區域 */}
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {/* 歡迎訊息 */}
              <div className="flex justify-start">
                <div className="max-w-md bg-gradient-to-r from-slate-100 to-gray-200 text-gray-800 rounded-br-2xl rounded-tr-2xl rounded-tl-sm border-2 border-slate-200 px-4 py-3 shadow-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">👩‍💼</span>
                    <span className="text-xs font-semibold text-indigo-600">STYLEMATE 助理</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    哈囉！我是 STYLEMATE 的時尚助理 ✨<br/>
                    告訴我你喜歡什麼樣的風格？或是有什麼特別的穿搭需求嗎？
                  </p>
                </div>
              </div>
              
              {/* 動態訊息 */}
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md px-4 py-3 rounded-2xl shadow-md ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-bl-2xl rounded-tl-2xl rounded-tr-sm' 
                      : 'bg-gradient-to-r from-slate-100 to-gray-200 text-gray-800 rounded-br-2xl rounded-tr-2xl rounded-tl-sm border-2 border-slate-200'
                  }`}>
                    {message.type === 'ai' && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">👩‍💼</span>
                        <span className="text-xs font-semibold text-indigo-600">STYLEMATE 助理</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: message.content }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 輸入區域 */}
            <div className="flex space-x-3">            
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                type="text"
                placeholder="例如：我喜歡甜美風格、想要上班穿的衣服..."
                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
              />
              
              <button onClick={sendMessage} className="p-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl hover:from-indigo-600 hover:to-violet-700 shadow-md transition-all">
                <span className="text-xl">✨</span>
              </button>
            </div>
          </div>
          
          {/* 右側：照片上傳區域 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">📷 照片上傳</h3>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center transition-all hover:border-indigo-400">
              {!uploadedPhoto ? (
                <>
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">上傳你的全身照片</p>
                  <p className="text-xs text-gray-400">支援 JPG, PNG 格式</p>
                  <input type="file" id="photoInput" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <button 
                    onClick={() => document.getElementById('photoInput')?.click()}
                    className="mt-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:from-indigo-600 hover:to-violet-700 transition-all"
                  >
                    選擇照片
                  </button>
                </>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">照片預覽</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <img src={uploadedPhoto} alt="預覽圖片" className="w-full h-48 object-cover rounded-lg mb-4" />
                    <button 
                      onClick={startTryOn}
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2 px-4 rounded-lg text-sm hover:from-indigo-600 hover:to-violet-700 transition-all"
                    >
                      開始生成試穿圖 →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 商品推薦區域 */}
        {showProducts && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6 mb-6">
            <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">✨ AI 為你精選的商品 ✨</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-2">
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">{product.emoji}</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{product.name}</h4>
                    <p className="text-xs text-gray-600 mb-3">{product.description}</p>
                    <div className="text-lg font-bold text-indigo-600 mb-4">NT$ {product.price}</div>
                  </div>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => likeProduct(product.id)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-violet-700 transition-all flex items-center justify-center space-x-2"
                    >
                      <HeartIcon className="w-4 h-4" />
                      <span>我喜歡！生成試穿圖</span>
                    </button>
                    <button className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all">
                      了解更多詳情
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-4">選擇你喜歡的商品，我可以為你生成試穿效果哦！ 📸</p>
            </div>
          </div>
        )}

        {/* 返回按鈕 */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <span>←</span>
            <span>返回首頁</span>
          </Link>
        </div>
      </div>
    </div>
  )
}