'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { analyzeIntent } from '@/lib/core/intentParser'

export default function Chat3Page() {
  const router = useRouter()
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([])
  const [inputValue, setInputValue] = useState('')
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [photoNaturalSize, setPhotoNaturalSize] = useState({ w: 0, h: 0 })
  const [fashionItems, setFashionItems] = useState<any[]>([])
  const [recommendedItems, setRecommendedItems] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showProducts, setShowProducts] = useState(false)
  const [bubbleText, setBubbleText] = useState('AI 助理準備中...')
  const [hasLoadedWelcome, setHasLoadedWelcome] = useState(false)

  // 動態計算容器比例
  const isPhotoReady = photoNaturalSize.w > 0 && photoNaturalSize.h > 0
  const photoAspectRatio = useMemo(() => 
    isPhotoReady ? `${photoNaturalSize.w} / ${photoNaturalSize.h}` : "4 / 5", 
    [isPhotoReady, photoNaturalSize]
  )

  // 載入商品數據
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

    const loadAIWelcome = async () => {
      if (hasLoadedWelcome) return // 防止重複載入
      
      try {
        const response = await fetch('/api/chat/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: '你好！請簡短介紹你的專業能力。',
            conversationHistory: []
          }),
        })
        
        const result = await response.json()
        
        if (result.success) {
          const aiMessage = { type: 'ai' as const, content: result.response }
          setMessages([aiMessage])
          setBubbleText('AI 助理已就緒！')
          setHasLoadedWelcome(true)
        } else {
          const fallbackMessage = { 
            type: 'ai' as const, 
            content: '👋 您好！我是 STYLEMATE 的專業韓式時尚顧問助理。請輸入您的需求或上傳照片開始諮詢！ ✨'
          }
          setMessages([fallbackMessage])
          setBubbleText('AI 助理已就緒！')
          setHasLoadedWelcome(true)
        }
      } catch (error) {
        console.error('載入 AI 歡迎訊息失敗:', error)
        const fallbackMessage = { 
          type: 'ai' as const, 
          content: '👋 您好！我是 STYLEMATE 的專業韓式時尚顧問助理。請輸入您的需求或上傳照片開始諮詢！ ✨'
        }
        setMessages([fallbackMessage])
        setBubbleText('AI 助理已就緒！')
        setHasLoadedWelcome(true)
      }
    }

    loadFashionItems()
    loadAIWelcome()
  }, [hasLoadedWelcome])

  // 處理照片上傳
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('請上傳 JPG、PNG 或 WebP 格式的圖片')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('圖片大小不能超過 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setUploadedPhoto(result)
      setBubbleText('照片上傳成功！')
      
      const uploadMessage = { 
        type: 'ai' as const, 
        content: '照片上傳成功！點擊下方「開始圖片分析」按鈕進行 GPT-4o AI 分析 ✨' 
      }
      setMessages(prev => [...prev, uploadMessage])
    }
    reader.readAsDataURL(file)
  }

  // 🎯 方案A：統一對話流程，避免分段回復混亂
  const sendMessage = async () => {
    if (inputValue.trim() === '') return
    
    const userMessage = inputValue.trim()
    setMessages(prev => [...prev, { type: 'user', content: userMessage }])

    try {
      setBubbleText('🤖 AI 分析中...')
      
      // 🧠 Step 1: 使用新的 Intent Parser
      const intentAnalysis = analyzeIntent({ text: userMessage })
      console.log('🧠 Intent 分析結果:', intentAnalysis)

      // Step 2: 根據 Intent 類型處理
      if (intentAnalysis.mode === 'trend_summary') {
        console.log('🔥 檢測到流行趨勢查詢，直接調用 API...')
        setBubbleText('🔥 獲取最新時尚趨勢中...')
        
        // 直接調用 API，讓後端處理 WebSearch
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
          setMessages(prev => [...prev, { type: 'ai', content: result.response }])
          
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
          setMessages(prev => [...prev, { 
            type: 'ai', 
            content: '抱歉，趨勢查詢遇到問題，請稍後再試。' 
          }])
        }
        
        setBubbleText('AI 助理已就緒！')
        setInputValue('')
        return
      }

      // Step 3: 其他類型查詢（一般穿搭建議）
      setBubbleText('🤖 生成穿搭建議中...')

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
        setMessages(prev => [...prev, { type: 'ai', content: result.response }])
        
        // 處理商品推薦
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
    
    setBubbleText('AI 助理已就緒！')
    setInputValue('')
  }


  // GPT-4o 圖片分析
  const analyzeImageWithText = async () => {
    if (!uploadedPhoto) {
      alert('請先上傳圖片！')
      return
    }
    
    setIsAnalyzing(true)
    setBubbleText('GPT-4o 分析中...')
    
    const userMessage = inputValue.trim() || '請分析我的照片並提供韓式時尚穿搭建議'
    
    const analysisMessage = { 
      type: 'ai' as const, 
      content: `🤖 **GPT-4o 正在分析您的圖片...**<br/><br/>結合您的需求「${userMessage}」進行專業分析，請稍等 ⏳` 
    }
    setMessages(prev => [...prev, analysisMessage])
    
    try {
      const base64Image = uploadedPhoto.split(',')[1]
      
      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8'
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
        
        const aiAnalysisMessage = { 
          type: 'ai' as const, 
          content: result.response
        }
        setMessages(prev => [...prev, aiAnalysisMessage])
        
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
    
    setInputValue('')
    // 不清空照片，讓用戶可以繼續使用
    // setUploadedPhoto(null)  
    setIsAnalyzing(false)
  }

  return (
    <div style={{
      width: '100%',
      height: 'auto',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f8fafc, #e2e8f0, #f1f5f9)',
      paddingBottom: '8rem',
      overflow: 'visible',
      position: 'relative'
    }}>
      {/* AI 助理頭像 */}
      <div style={{
        position: 'fixed',
        top: '3rem',
        right: '3rem',
        zIndex: 50
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(to bottom right, #475569, #334155)',
            border: '2px solid #e2e8f0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            animation: 'bounce 1s infinite'
          }}>
            <span style={{ fontSize: '1.5rem', color: 'white' }}>👩‍💼</span>
          </div>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '-10rem',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#374151',
            fontSize: '0.75rem',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap'
          }}>
            {bubbleText}
            <div style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0',
              width: '0',
              height: '0',
              borderLeft: '4px solid rgba(255, 255, 255, 0.9)',
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              transform: 'translateX(1px)'
            }} />
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '2rem 1rem'
      }}>
        {/* 標題 */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <ChatBubbleLeftRightIcon style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} />
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              STYLEMATE ✨
            </h1>
          </div>
          <p style={{
            fontSize: '1.125rem',
            color: '#4b5563',
            fontWeight: '500'
          }}>
            讓我來幫你找到最完美的韓式穿搭！
          </p>
        </div>

        {/* 聊天區域 */}
        <div style={{
          width: '100%',
          maxWidth: '7xl',
          margin: '0 auto 2rem auto'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '4px solid #e5e7eb',
            padding: '2rem'
          }}>
            {/* 聊天訊息 */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              {messages.map((message, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    maxWidth: '4xl',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    background: message.type === 'user' 
                      ? 'linear-gradient(to right, #4f46e5, #7c3aed)'
                      : 'linear-gradient(to right, #f1f5f9, #e2e8f0)',
                    color: message.type === 'user' ? 'white' : '#374151',
                    borderTopLeftRadius: message.type === 'ai' ? '0.25rem' : '1rem',
                    borderTopRightRadius: message.type === 'user' ? '0.25rem' : '1rem'
                  }}>
                    {message.type === 'ai' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.125rem' }}>👩‍💼</span>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#4f46e5'
                        }}>
                          STYLEMATE 助理
                        </span>
                      </div>
                    )}
                    <div style={{
                      fontSize: '0.875rem',
                      lineHeight: '1.5'
                    }} dangerouslySetInnerHTML={{ __html: message.content }} />
                  </div>
                </div>
              ))}
            </div>

            {/* 輸入區域 */}
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                type="text"
                placeholder="🤖 試試：「海邊婚禮穿搭」「去日本5天旅行天氣穿搭」「今年韓國流行趨勢」或上傳全身照分析"
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  background: '#f8fafc',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button 
                onClick={sendMessage}
                style={{
                  padding: '1rem 1.5rem',
                  background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #4338ca, #6d28d9)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(to right, #4f46e5, #7c3aed)'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>✨</span>
              </button>
            </div>
          </div>
        </div>

        {/* 照片上傳區域 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '4px solid #e5e7eb',
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '1rem',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <PhotoIcon style={{ width: '1.25rem', height: '1.25rem', color: '#4f46e5' }} />
              📷 上傳你的照片
            </h3>
            
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            >
              {!uploadedPhoto ? (
                <>
                  <div style={{
                    color: '#9ca3af',
                    marginBottom: '1rem'
                  }}>
                    <svg style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>上傳你的全身照片</p>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>支援 JPG, PNG 格式</p>
                  <label htmlFor="photoInput" style={{ cursor: 'pointer' }}>
                    <input 
                      type="file" 
                      id="photoInput" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={handlePhotoUpload}
                    />
                    <div style={{
                      marginTop: '1rem',
                      background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      display: 'inline-block',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}>
                      選擇照片
                    </div>
                  </label>
                </>
              ) : (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>照片預覽</h4>
                  <div style={{
                    background: '#f8fafc',
                    borderRadius: '0.5rem',
                    padding: '1rem'
                  }}>
                    <div style={{
                      width: '100%',
                      aspectRatio: photoAspectRatio,
                      minHeight: 360,
                      maxHeight: '70vh',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      background: 'linear-gradient(to bottom right, #f1f5f9, #e0e7ff)',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      overflow: 'hidden'
                    }}>
                      <img src={uploadedPhoto} alt="預覽圖片" style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        transition: 'transform 0.3s'
                      }}
                      onLoad={(e) => {
                        const { naturalWidth: w, naturalHeight: h } = e.currentTarget
                        setPhotoNaturalSize({ w, h })
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      onError={(e) => {
                        e.currentTarget.src = '/images/products/dress1.jpg'
                      }}
                      />
                    </div>
                    
                    {/* 上傳新照片按鈕 */}
                    <label htmlFor="photoInputReplace" style={{ cursor: 'pointer', marginBottom: '0.5rem', display: 'block' }}>
                      <input 
                        type="file" 
                        id="photoInputReplace" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={handlePhotoUpload}
                      />
                      <div style={{
                        width: '100%',
                        background: 'linear-gradient(to right, #6b7280, #4b5563)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}>
                        📷 重新上傳照片
                      </div>
                    </label>
                    
                    {/* 分析照片按鈕 */}
                    <button 
                      onClick={analyzeImageWithText}
                      disabled={isAnalyzing}
                      style={{
                        width: '100%',
                        background: isAnalyzing 
                          ? 'linear-gradient(to right, #9ca3af, #6b7280)'
                          : 'linear-gradient(to right, #4f46e5, #7c3aed)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        border: 'none',
                        cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
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
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '4px solid #e5e7eb',
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: '1.5rem',
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ✨ AI 為你精選的商品 ✨
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              {recommendedItems.length > 0 ? recommendedItems.map((product) => (
                <div key={product.id} style={{
                  background: 'white',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #f3f4f6',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-0.5rem)'
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <div style={{
                      width: '100%',
                      aspectRatio: '4 / 5',
                      background: 'linear-gradient(to bottom right, #f1f5f9, #e0e7ff)',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <img 
                        src={`/images/korean-fashion/${encodeURIComponent(product.filename)}`}
                        alt={product.name.zh}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          transition: 'transform 0.3s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onError={(e) => {
                          console.log('Image load error for:', product.filename)
                          e.currentTarget.src = '/images/products/dress1.jpg'
                        }}
                        onLoad={() => console.log('Image loaded successfully:', product.filename)}
                      />
                    </div>
                    <h4 style={{
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      {product.name.zh}
                    </h4>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      marginBottom: '0.5rem'
                    }}>
                      {product.category.zh}
                    </p>
                    <div style={{
                      color: '#4f46e5',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      marginBottom: '0.5rem'
                    }}>
                      NT$ {typeof product.price === 'object' ? product.price?.twd : product.price}
                    </div>
                    
                    {/* 標籤顯示 */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.25rem',
                      justifyContent: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      {(product.styleTags?.zh || []).slice(0, 3).map((tag: string, index: number) => (
                        <span key={index} style={{
                          padding: '0.25rem 0.5rem',
                          background: '#e0e7ff',
                          color: '#4f46e5',
                          borderRadius: '9999px',
                          fontSize: '0.75rem'
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* 動作按鈕 */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <button 
                        onClick={() => {
                          router.push(`/tryon?productId=${product.id}&productImage=${encodeURIComponent(`/images/korean-fashion/${product.filename}`)}`)
                        }}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(to right, #7c3aed, #a855f7)',
                          color: 'white',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🔄 虛擬試穿
                      </button>
                      <button 
                        onClick={() => router.push(`/checkout?productId=${product.id}`)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
                          color: 'white',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🛒 立即購買
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  color: '#6b7280',
                  padding: '2rem'
                }}>
                  <SparklesIcon style={{ width: '4rem', height: '4rem', margin: '0 auto 1rem', color: '#d1d5db' }} />
                  <p>正在為您搜尋最適合的商品...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 導航按鈕 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '400px',
          margin: '0 auto',
          gap: '2rem'
        }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            color: '#6b7280',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: '2px solid #e5e7eb',
            textDecoration: 'none',
            transition: 'all 0.3s',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.color = '#374151'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
            e.currentTarget.style.color = '#6b7280'
          }}
          >
            <span>←</span>
            <span>上一頁：首頁</span>
          </Link>

          <Link href="/checkout" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            border: 'none',
            textDecoration: 'none',
            transition: 'all 0.3s',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #4338ca, #6d28d9)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(to right, #4f46e5, #7c3aed)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          >
            <span>下一頁</span>
            <span>→</span>
          </Link>
        </div>

      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-10px,0);
          }
          70% {
            transform: translate3d(0,-5px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
      `}</style>
    </div>
  )
}