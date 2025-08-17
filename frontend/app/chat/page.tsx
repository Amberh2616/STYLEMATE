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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)
  const [pendingMessage, setPendingMessage] = useState<string>('')
  const [pendingTimeout, setPendingTimeout] = useState<NodeJS.Timeout | null>(null)

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

  // 快速本地回應函數
  const getQuickResponse = (message: string, hasImage: boolean = false) => {
    const lowerMsg = message.toLowerCase()
    
    if (hasImage) {
      return `🖼️ **圖片風格分析**\n\n根據您上傳的圖片，我分析出以下風格特點：\n\n• **風格分類**：清新韓系 - 溫柔色調、層次穿搭\n• **適合場合**：休閒約會\n• **推薦搭配**：\n  1. 搭配高腰牛仔褲營造輕鬆感\n  2. 加上薄針織外套增加層次\n  3. 配白色小白鞋完成清新造型\n\n這種風格很適合日常穿搭，既舒適又有時尚感！ ✨`
    }
    
    if (lowerMsg.includes('推薦') || lowerMsg.includes('搭配') || lowerMsg.includes('穿搭')) {
      return `👗 **個人化穿搭推薦**\n\n根據您的需求，我為您推薦以下風格：\n\n• **法式優雅**風格：簡約高級、知性氣質\n  - 建議：白色襯衫 + 黑色西裝褲 + 經典包款\n\n• **清新韓系**風格：溫柔色調、層次穿搭\n  - 建議：米色毛衣 + 牛仔裙 + 帆布鞋\n\n需要更具體的建議嗎？請告訴我您的身形或想要的場合！ 💫`
    }
    
    if (lowerMsg.includes('身形') || lowerMsg.includes('160') || lowerMsg.includes('80kg')) {
      return `📏 **身形修飾建議**\n\n針對您的身形特徵，我推薦：\n\n• **顯瘦策略**：\n  - 選擇深色系：黑、深藍、酒紅\n  - 強調腰線設計，創造沙漏曲線\n  - V領設計拉長頸部線條\n\n• **推薦單品**：\n  - A字裙型修飾下半身\n  - 膝上長度顯腿長\n  - 垂直線條拉長身形\n\n這些搭配能完美展現您的優點！ 🌟`
    }
    
    return `👋 **您好！**

我是 STYLEMATE 的專業韓式時尚顧問助理，擁有 Fashion-CLIP AI 語義理解能力和身形分析專業知識。

## 我的專業能力

• **🖼️ GPT-4o 多模態圖片風格分析**  
  深度分析服裝圖片，識別風格特徵與搭配潛力

• **👗 個人化韓式穿搭建議**  
  基於 10 種標準風格分類提供專業建議

• **📏 身形修飾與比例優化**  
  針對不同體型提供量身定制的穿搭方案

• **🔍 Fashion-CLIP AI 語義商品搜尋**  
  智能理解需求，精準匹配商品

## 分析流程

1. **A. 視覺分析** → 身形特徵、風格傾向識別
2. **B. 穿搭建議** → 3套具體搭配方案
3. **C. 商品檢索** → 結構化商品查詢條件
4. **D. 智能重排** → 版型優先的推薦排序

---

請告訴我您的穿搭需求，或上傳服裝圖片讓我進行專業分析！ ✨`
  }

  // 純文字處理函數 - 使用完整的後端AI聊天推薦
  const handleTextOnlyInput = async (message: string) => {
    console.log('💬 處理純文字輸入:', message)
    
    // 添加用戶消息
    setMessages(prev => [...prev, { type: 'user', content: message }])
    setBubbleText('AI 分析中...')
    
    try {
      // 調用後端聊天推薦API
      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversationHistory: messages,
          userEmail: null // 可選：如果有用戶登入可傳入email
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBubbleText('分析完成！')
        setMessages(prev => [...prev, { type: 'ai', content: result.response }])
        
        // 如果有推薦商品，設置推薦項目
        if (result.recommendedProducts && result.recommendedProducts.length > 0) {
          const recommended = fashionItems.filter(item => 
            result.recommendedProducts.includes(item.id.toString())
          )
          setRecommendedItems(recommended)
          setTimeout(() => setShowProducts(true), 500)
        }
        
        setConversationStep(prev => prev + 1)
      } else {
        // 失敗時使用本地快速回應作為備用
        const fallbackResponse = getQuickResponse(message)
        setBubbleText('已為您提供基本建議')
        setMessages(prev => [...prev, { type: 'ai', content: fallbackResponse }])
        setRecommendedItems(fashionItems.slice(0, 3))
        setTimeout(() => setShowProducts(true), 500)
      }
    } catch (error) {
      console.error('聊天API調用失敗:', error)
      // 錯誤時使用本地快速回應作為備用
      const fallbackResponse = getQuickResponse(message)
      setBubbleText('已為您提供基本建議')
      setMessages(prev => [...prev, { type: 'ai', content: fallbackResponse }])
      setRecommendedItems(fashionItems.slice(0, 3))
      setTimeout(() => setShowProducts(true), 500)
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return
    
    // 保存當前輸入值
    const currentInput = inputValue
    setInputValue('')
    
    // 情況3: 純文字輸入（沒有圖片）
    if (!uploadedPhoto) {
      await handleTextOnlyInput(currentInput)
    } else {
      // 情況1或2: 有圖片的情況，保存文字等待「分析照片」按鈕
      setPendingMessage(currentInput)
      
      const newMessage = { 
        type: 'user' as const, 
        content: currentInput 
      }
      setMessages(prev => [...prev, newMessage])
      
      setBubbleText('已收到您的需求！現在點擊「🎯 開始圖片風格分析」按鈕進行分析')
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
      // 檢查檔案類型
      if (!file.type.startsWith('image/')) {
        alert('請選擇圖片檔案！')
        return
      }
      
      // 檢查檔案大小 (5MB 限制)
      if (file.size > 5 * 1024 * 1024) {
        alert('圖片檔案太大！請選擇小於 5MB 的檔案。')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string
          if (result) {
            setUploadedPhoto(result)
            setAssistantEmoji('👩‍💼')
            setBubbleText('照片上傳成功！')
            
            // 顯示上傳成功訊息
            const newMessage = { 
              type: 'ai' as const, 
              content: '照片上傳成功！照片看起來很不錯呢 ✨<br/><br/>現在您可以：<br/>1. 先輸入您的需求（如：推薦約會洋裝）<br/>2. 點擊右側的「🎯 開始圖片風格分析」按鈕進行分析' 
            }
            setMessages(prev => [...prev, newMessage])
          } else {
            throw new Error('無法讀取圖片內容')
          }
        } catch (error) {
          console.error('圖片讀取錯誤:', error)
          setBubbleText('圖片讀取失敗！')
          const errorMessage = { 
            type: 'ai' as const, 
            content: '抱歉，圖片讀取失敗 😅<br/><br/>請嘗試：<br/>• 選擇其他圖片<br/>• 確保圖片格式為 JPG/PNG<br/>• 確保圖片檔案小於 5MB' 
          }
          setMessages(prev => [...prev, errorMessage])
        }
      }
      
      reader.onerror = () => {
        console.error('FileReader 錯誤')
        setBubbleText('圖片讀取失敗！')
        const errorMessage = { 
          type: 'ai' as const, 
          content: '圖片讀取過程出現錯誤 😅<br/><br/>請重新選擇圖片或嘗試其他圖片檔案。' 
        }
        setMessages(prev => [...prev, errorMessage])
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

  // 🤖 GPT-4V AI 圖片+文字分析函數
  const analyzeImageWithText = async (userMessage: string) => {
    if (!uploadedPhoto) {
      alert('請先上傳圖片！')
      return
    }
    
    setIsAnalyzing(true)
    setBubbleText('AI 深度分析中...')
    
    const analysisMessage = { 
      type: 'ai' as const, 
      content: `🤖 **GPT-4o 正在分析您的圖片與需求...**<br/><br/>正在結合您的圖片與「${userMessage}」進行專業分析，請稍等 ⏳` 
    }
    setMessages(prev => [...prev, analysisMessage])
    
    try {
      // 真正調用 GPT-4o API
      const base64Image = uploadedPhoto.split(',')[1] // 移除 data:image/jpeg;base64, 前綴
      
      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          image: base64Image,
          conversationHistory: messages
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBubbleText('AI 分析完成！')
        
        // 顯示分析結果
        const aiAnalysisMessage = { 
          type: 'ai' as const, 
          content: result.response
        }
        setMessages(prev => [...prev, aiAnalysisMessage])
        
        // 顯示推薦商品
        if (result.recommendedProducts?.length > 0) {
          const recommendedItems = fashionItems.filter(item => 
            result.recommendedProducts.includes(item.id.toString())
          )
          setRecommendedItems(recommendedItems.length > 0 ? recommendedItems : fashionItems.slice(0, 3))
        } else {
          setRecommendedItems(fashionItems.slice(0, 3))
        }
        setTimeout(() => setShowProducts(true), 1000)
        
      } else {
        setBubbleText('分析遇到問題')
        const errorMessage = { 
          type: 'ai' as const, 
          content: `圖片分析遇到問題：${result.error || '請重新嘗試'}<br/><br/>請確保圖片清晰且為服裝相關內容。` 
        }
        setMessages(prev => [...prev, errorMessage])
      }
      
    } catch (error) {
      console.error('GPT-4o 圖片分析錯誤:', error)
      setBubbleText('分析失敗')
      const errorMessage = { 
        type: 'ai' as const, 
        content: `抱歉，圖片分析遇到技術問題。<br/><br/>請檢查網路連接或稍後再試。` 
      }
      setMessages(prev => [...prev, errorMessage])
    }
    
    // 清空狀態
    setInputValue('')
    setPendingMessage('')
    setUploadedPhoto(null)
    setIsAnalyzing(false)
    setConversationStep(prev => prev + 1)
  }

  // 🤖 GPT-4V AI 圖片分析函數（純圖片）
  const analyzeImage = async () => {
    if (!uploadedPhoto) {
      alert('請先上傳圖片！')
      return
    }
    
    setIsAnalyzing(true)
    setBubbleText('AI 深度分析中...')
    
    const userMessage = pendingMessage.trim() || '請分析我的身形並提供韓式時尚穿搭建議'
    
    const analysisMessage = { 
      type: 'ai' as const, 
      content: `🤖 **GPT-4o 正在分析您的圖片...**<br/><br/>結合您的需求「${userMessage}」進行專業分析，請稍等 ⏳` 
    }
    setMessages(prev => [...prev, analysisMessage])
    
    try {
      // 真正調用 GPT-4o API
      const base64Image = uploadedPhoto.split(',')[1] // 移除 data:image/jpeg;base64, 前綴
      
      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          image: base64Image,
          conversationHistory: messages
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setBubbleText('AI 分析完成！')
        
        // 顯示分析結果
        const aiAnalysisMessage = { 
          type: 'ai' as const, 
          content: result.response
        }
        setMessages(prev => [...prev, aiAnalysisMessage])
        
        // 顯示推薦商品
        if (result.recommendedProducts?.length > 0) {
          const recommendedItems = fashionItems.filter(item => 
            result.recommendedProducts.includes(item.id.toString())
          )
          setRecommendedItems(recommendedItems.length > 0 ? recommendedItems : fashionItems.slice(0, 3))
        } else {
          setRecommendedItems(fashionItems.slice(0, 3))
        }
        setTimeout(() => setShowProducts(true), 1000)
        
      } else {
        setBubbleText('分析遇到問題')
        const errorMessage = { 
          type: 'ai' as const, 
          content: `圖片分析遇到問題：${result.error || '請重新嘗試'}<br/><br/>請確保圖片清晰且為服裝相關內容。` 
        }
        setMessages(prev => [...prev, errorMessage])
      }
      
    } catch (error) {
      console.error('GPT-4o 圖片分析錯誤:', error)
      setBubbleText('分析失敗')
      const errorMessage = { 
        type: 'ai' as const, 
        content: `抱歉，圖片分析遇到技術問題。<br/><br/>請檢查網路連接或稍後再試。` 
      }
      setMessages(prev => [...prev, errorMessage])
    }
    
    // 清空狀態
    setInputValue('')
    setPendingMessage('')
    setUploadedPhoto(null)
    setIsAnalyzing(false)
    setConversationStep(prev => prev + 1)
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
          <div className="text-center">
            <p className="text-slate-600 mb-2">讓我來幫你找到最完美的韓式穿搭！</p>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              <span>🤖</span>
              <span>Fashion-CLIP AI 語義理解</span>
              <span>🎯</span>
            </div>
          </div>
        </div>

        {/* 主要內容區 - 左右分欄 */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
          {/* 左側：聊天區域 - 加寬對話框 */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6">
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
                    哈囉！我是STYLEMATE的專業韓式時尚顧問助理，擁有Fashion-CLIP AI語義理解能力。上傳照片或描述需求，開始你的時尚之旅~
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
                placeholder={uploadedPhoto ? '🖼️ 已上傳圖片，請輸入您的需求或直接點擊 AI 分析' : '🤖 試試："韓系甜美約會風格"或上傳圖片進行 AI 分析'}
                className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all"
              />
              
              <button onClick={sendMessage} className="p-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl hover:from-indigo-600 hover:to-violet-700 shadow-md transition-all">
                <span className="text-xl">✨</span>
              </button>
            </div>
          </div>
          
          {/* 右側：照片上傳區域 - 給足夠寬度 */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6">
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
                      onClick={analyzeImage}
                      disabled={isAnalyzing}
                      className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-2 px-4 rounded-lg text-sm hover:from-indigo-600 hover:to-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? '🤖 AI 分析中...' : '🎯 開始圖片風格分析 →'}
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