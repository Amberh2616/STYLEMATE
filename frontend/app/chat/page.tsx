'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
// import { productFilter } from '@/lib/productFilter'
// import AlignableCanvasTryOn from '@/components/canvas/AlignableCanvasTryOn'
// import { products } from '@/lib/products'

export default function ChatPage() {
  const router = useRouter()
  const [conversationStep, setConversationStep] = useState(0)
  const [showProducts, setShowProducts] = useState(false)
  const [assistantEmoji, setAssistantEmoji] = useState('👩‍💼')
  const [bubbleText, setBubbleText] = useState('哈囉！我是你的時尚助理！')
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([])
  const [inputValue, setInputValue] = useState('')
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [fashionItems, setFashionItems] = useState<any[]>([])
  const [recommendedItems, setRecommendedItems] = useState<any[]>([])

  // 載入資料庫中的韓國服裝
  useEffect(() => {
    const loadFashionItems = async () => {
      try {
        const response = await fetch('/api/fashion/search?limit=20')
        const data = await response.json()
        if (data.success) {
          setFashionItems(data.data)
        }
      } catch (error) {
        console.error('載入服裝資料失敗:', error)
      }
    }
    loadFashionItems()
  }, [])

  const sendMessage = async () => {
    if (!inputValue.trim()) return
    
    // 保存當前輸入值
    const currentInput = inputValue
    setInputValue('')
    
    // 添加用戶消息
    setMessages(prev => [...prev, { type: 'user', content: currentInput }])
    
    // 顯示 AI 思考中
    setBubbleText('AI 思考中...')
    
    try {
      // 調用 OpenAI 推薦 API
      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBubbleText('推薦完成！')
        setMessages(prev => [...prev, { type: 'ai', content: result.response }])
        
        // 如果有推薦商品，篩選並顯示推薦的商品
        if (result.recommendedProducts && result.recommendedProducts.length > 0) {
          const recommended = fashionItems.filter(item => 
            result.recommendedProducts.includes(item.id.toString())
          )
          setRecommendedItems(recommended)
          setTimeout(() => setShowProducts(true), 1000)
        }
      } else {
        setBubbleText('完成回應！')
        setMessages(prev => [...prev, { type: 'ai', content: result.response }])
      }
      
      setConversationStep(prev => prev + 1)
      
    } catch (error) {
      console.error('AI 推薦錯誤:', error)
      setBubbleText('回應完成！')
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: '抱歉，我現在遇到一些技術問題。不過我還是可以為你展示一些精選商品！' 
      }])
      setTimeout(() => setShowProducts(true), 1000)
    }
  }

  const likeProduct = async (productId: string) => {
    const product = recommendedItems.find(p => p.id.toString() === productId) || 
                   fashionItems.find(p => p.id.toString() === productId)
    if (product) {
      setSelectedProduct(product)
      
      // 開始 AI 分析
      setBubbleText('AI 分析中...')
      const analysisMessage = { 
        type: 'ai' as const, 
        content: `太棒了！你選擇了「${product.name.zh}」✨<br/><br/>讓我用 AI 來分析這件商品適合你的程度...` 
      }
      setMessages(prev => [...prev, analysisMessage])
      
      try {
        // 調用 AI 分析 API（加入錯誤處理）
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超時
        
        const response = await fetch('/api/ai/analyze-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: productId,
            userPreferences: {
              preferred_styles: ['韓系', '甜美', '優雅'],
              occasions: ['casual', 'date'],
              measurements: { bust: 85, waist: 68, height: 165 }
            },
            context: 'casual'
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        const aiResult = await response.json()
        
        if (aiResult.success) {
          const { analysis } = aiResult.data
          setBubbleText('AI 分析完成！')
          
          const aiAnalysisMessage = { 
            type: 'ai' as const, 
            content: `🤖 <strong>AI 分析結果</strong><br/><br/>
            
            <strong>🎯 適配度：${analysis.compatibility}%</strong><br/><br/>
            
            <strong>💡 推薦理由：</strong><br/>
            ${analysis.recommendations.map((reason: string) => `• ${reason}`).join('<br/>')}<br/><br/>
            
            <strong>👗 穿搭建議：</strong><br/>
            ${analysis.styling_tips.map((tip: string) => `• ${tip}`).join('<br/>')}<br/><br/>
            
            <strong>📏 尺寸建議：${analysis.size_recommendation.size}</strong><br/>
            ${analysis.size_recommendation.reason}<br/><br/>
            
            ${analysis.ai_insights ? `<strong>🎯 AI 專業洞察：</strong><br/>
            ${analysis.ai_insights}<br/><br/>` : ''}
            
            現在請上傳你的全身照片，我就可以為你生成試穿效果圖了！📸` 
          }
          setMessages(prev => [...prev, aiAnalysisMessage])
          
        } else {
          setBubbleText('分析完成！')
          const fallbackMessage = { 
            type: 'ai' as const, 
            content: `根據商品標籤分析：<br/>
            • 分類：${product.category.zh}<br/>
            • 風格：${product.styleTags.zh.join('、')}<br/>
            • 適合場合：${product.occasion.zh.join('、')}<br/>
            • 顏色：${product.colors.zh.join('、')}<br/><br/>
            現在請上傳你的全身照片，我就可以為你生成試穿效果圖了！📸` 
          }
          setMessages(prev => [...prev, fallbackMessage])
        }
        
      } catch (error) {
        console.error('AI 分析錯誤:', error)
        setBubbleText('分析完成！')
        const errorMessage = { 
          type: 'ai' as const, 
          content: `商品分析：「${product.name.zh}」<br/>
          價格：${product.price.twd ? `NT$ ${product.price.twd}` : '價格洽詢'}<br/>
          特色：${product.styleTags.zh.join('、')}<br/><br/>
          現在請上傳你的全身照片，我就可以為你生成試穿效果圖了！📸` 
        }
        setMessages(prev => [...prev, errorMessage])
      }
    }
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target && e.target.result as string
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

  const startTryOn = async () => {
    if (!selectedProduct || !uploadedPhoto) {
      alert('請先選擇商品和上傳照片！')
      return
    }
    
    setAssistantEmoji('👩‍💼')
    setBubbleText('AI 合成中...')
    
    const processingMessage = { 
      type: 'ai' as const, 
      content: `正在生成你穿著「${selectedProduct.name}」的試穿效果圖...<br/><br/>AI 正在進行智能合成，請稍等 ⏳` 
    }
    setMessages(prev => [...prev, processingMessage])
    
    try {
      // 調用照片合成 API
      const response = await fetch('/api/tryon/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPhotoBase64: uploadedPhoto,
          productId: selectedProduct.id,
          category: selectedProduct.category
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBubbleText('合成完成！')
        const successMessage = { 
          type: 'ai' as const, 
          content: `✨ 試穿圖生成成功！<br/><br/>你穿這件 ${selectedProduct.name} 真的很美！<br/>正在為你展示結果...` 
        }
        setMessages(prev => [...prev, successMessage])
        
        // 儲存結果到 localStorage，讓 tryon 頁面可以顯示
        localStorage.setItem('tryonResult', JSON.stringify({
          resultImage: result.resultImage,
          productName: selectedProduct.name,
          originalPhoto: uploadedPhoto
        }))
        
        // 跳轉到結果頁面
        setTimeout(() => {
          router.push('/tryon')
        }, 2000)
        
      } else {
        setBubbleText('處理完成')
        const errorMessage = { 
          type: 'ai' as const, 
          content: `抱歉，圖片合成遇到問題：${result.message}<br/><br/>請嘗試上傳清晰的全身照片，我會為你重新處理！` 
        }
        setMessages(prev => [...prev, errorMessage])
      }
      
    } catch (error) {
      console.error('試穿合成錯誤:', error)
      setBubbleText('處理完成')
      const errorMessage = { 
        type: 'ai' as const, 
        content: `合成過程遇到技術問題，請稍後再試。<br/><br/>或者先瀏覽其他商品，我隨時為你服務！ 💕` 
      }
      setMessages(prev => [...prev, errorMessage])
    }
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
                  <label htmlFor="photoInput" className="cursor-pointer">
                    <input 
                      type="file" 
                      id="photoInput" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload} 
                    />
                    <div className="mt-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-lg text-sm hover:from-indigo-600 hover:to-violet-700 transition-all inline-block">
                      選擇照片
                    </div>
                  </label>
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
              {recommendedItems.length > 0 ? recommendedItems.map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-4 shadow-md border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-2">
                  <div className="text-center mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-indigo-200 rounded-lg overflow-hidden mb-4 relative">
                      <img 
                        src={`/images/korean-fashion/${product.filename}`}
                        alt={product.name.zh}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+' + btoa(product.category.zh === '洋裝' ? '👗' : '👚') + 'PC90ZXh0Pjwvc3ZnPg=='
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        韓國代購
                      </div>
                      {product.price.discount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          特價
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">{product.name.zh}</h4>
                    
                    {/* 標籤顯示 */}
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {product.styleTags.zh.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">{product.description.zh}</p>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {product.price.discount && (
                        <span className="text-sm text-gray-400 line-through">NT$ {product.price.twd}</span>
                      )}
                      <span className="text-lg font-bold text-indigo-600">
                        {product.price.twd ? `NT$ ${product.price.discount || product.price.twd}` : '價格洽詢'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => likeProduct(product.id.toString())}
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
              )) : fashionItems.slice(0, 6).map((product) => (
                <div key={product.id} className="bg-white rounded-xl p-4 shadow-md border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-2">
                  <div className="text-center mb-4">
                    <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-indigo-200 rounded-lg overflow-hidden mb-4 relative">
                      <img 
                        src={`/images/korean-fashion/${product.filename}`}
                        alt={product.name.zh}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOWNhM2FmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+' + btoa(product.category.zh === '洋裝' ? '👗' : '👚') + 'PC90ZXh0Pjwvc3ZnPg=='
                        }}
                      />
                      <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                        韓國代購
                      </div>
                      {product.price.discount && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          特價
                        </div>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-2">{product.name.zh}</h4>
                    
                    {/* 標籤顯示 */}
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {product.styleTags.zh.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">{product.description.zh}</p>
                    
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {product.price.discount && (
                        <span className="text-sm text-gray-400 line-through">NT$ {product.price.twd}</span>
                      )}
                      <span className="text-lg font-bold text-indigo-600">
                        {product.price.twd ? `NT$ ${product.price.discount || product.price.twd}` : '價格洽詢'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => likeProduct(product.id.toString())}
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

        {/* 底部導航 */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-8">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <span>←</span>
              <span>返回首頁</span>
            </Link>
            <Link 
              href="/member"
              className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-stone-100 to-amber-100 text-stone-700 hover:from-stone-200 hover:to-amber-200 rounded-2xl font-medium transition-all hover:shadow-md transform hover:-translate-y-0.5"
            >
              <span>✨</span>
              <span>完善會員檔案</span>
              <span>→</span>
            </Link>
          </div>
          <p className="text-sm text-gray-500">建立專屬風格檔案，享受個人化韓式時尚推薦</p>
        </div>
      </div>
    </div>
  )
}