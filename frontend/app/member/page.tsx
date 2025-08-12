'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  UserIcon, 
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline'

interface MemberProfile {
  name: string
  gender: string
  age: number
  email: string
  fashionPreferences: {
    [key: string]: string | string[]
  }
}

// 詳細的20題時尚問卷
const fashionQuestions = [
  {
    id: 'style_overall',
    category: '風格偏好',
    question: '你最喜歡的整體穿衣風格是？',
    type: 'single',
    options: ['甜美可愛', '優雅知性', '街頭潮流', '休閒舒適', '韓系時尚']
  },
  {
    id: 'color_preference',
    category: '顏色偏好',
    question: '你最愛的顏色系列？（可多選）',
    type: 'multiple',
    options: ['經典黑白', '溫暖粉色', '清新藍綠', '大地色系', '活力亮色']
  },
  {
    id: 'occasion_work',
    category: '場合需求',
    question: '你最常需要的穿搭場合？',
    type: 'single',
    options: ['日常休閒', '上班工作', '約會聚餐', '派對聚會', '旅遊度假']
  },
  {
    id: 'style_fit',
    category: '版型偏好',
    question: '你偏好的服裝版型是？',
    type: 'single',
    options: ['合身顯瘦', '寬鬆舒適', 'Oversize慵懶', '修身緊致']
  },
  {
    id: 'shopping_budget',
    category: '購物習慣',
    question: '單件服裝的價位接受度？',
    type: 'single',
    options: ['NT$ 500以下', 'NT$ 500-1500', 'NT$ 1500-3000', 'NT$ 3000以上', '看品質決定']
  },
  {
    id: 'body_confidence',
    category: '身材特色',
    question: '你最想突出展現的身材優點？',
    type: 'single',
    options: ['纤細腰線', '修長腿部', '優美肩線', '整體比例', '自然舒適']
  },
  {
    id: 'style_inspiration',
    category: '靈感來源',
    question: '你的穿搭靈感主要來自？（可多選）',
    type: 'multiple',
    options: ['韓劇女主角', 'Instagram博主', '時尚雜誌', '街拍攝影', '朋友推薦']
  },
  {
    id: 'season_preference',
    category: '季節偏好',
    question: '你最喜歡哪個季節的穿搭？',
    type: 'single',
    options: ['春季清新', '夏季涼爽', '秋季溫暖', '冬季溫暖', '四季皆宜']
  },
  {
    id: 'fabric_preference',
    category: '材質偏好',
    question: '你偏愛的服裝材質？（可多選）',
    type: 'multiple',
    options: ['棉質舒適', '雪紡飄逸', '針織溫暖', '絲質光滑', '麻質自然']
  },
  {
    id: 'pattern_preference',
    category: '圖案偏好',
    question: '你喜歡的服裝圖案類型？',
    type: 'single',
    options: ['純色簡約', '碎花甜美', '條紋經典', '格紋復古', '印花個性']
  },
  {
    id: 'accessory_style',
    category: '配件偏好',
    question: '你最常使用的配件類型？（可多選）',
    type: 'multiple',
    options: ['精緻項鍊', '時尚耳環', '個性手環', '經典手錶', '時髦包包']
  },
  {
    id: 'lifestyle_needs',
    category: '生活需求',
    question: '你的日常生活模式是？',
    type: 'single',
    options: ['學生族群', '上班族', '居家工作', '社交達人', '媽媽族群']
  },
  {
    id: 'comfort_priority',
    category: '舒適度',
    question: '穿搭中你最重視什麼？',
    type: 'single',
    options: ['絕對舒適', '修飾身材', '時尚美觀', '實用機能', '個性表達']
  },
  {
    id: 'shopping_frequency',
    category: '購物習慣',
    question: '你多久購買一次新衣服？',
    type: 'single',
    options: ['每週都買', '每月幾次', '季節更換', '需要時才買', '很少購買']
  },
  {
    id: 'brand_preference',
    category: '品牌偏好',
    question: '你偏愛的服裝品牌類型？',
    type: 'single',
    options: ['韓國品牌', '快時尚', '設計師品牌', '本土品牌', '沒有偏好']
  },
  {
    id: 'color_avoid',
    category: '顏色偏好',
    question: '你通常避免的顏色？（可多選）',
    type: 'multiple',
    options: ['鮮豔螢光色', '全身黑色', '過於花俏', '土色系', '沒有特別避免']
  },
  {
    id: 'style_challenge',
    category: '穿搭挑戰',
    question: '你在穿搭上最大的困擾是？',
    type: 'single',
    options: ['不知道怎麼搭配', '找不到合適尺寸', '預算有限', '缺乏靈感', '沒有時間挑選']
  },
  {
    id: 'trend_following',
    category: '流行趨勢',
    question: '你對流行趨勢的態度？',
    type: 'single',
    options: ['緊跟潮流', '選擇性跟隨', '有自己風格', '不太關注', '完全不在意']
  },
  {
    id: 'wardrobe_goals',
    category: '衣櫃目標',
    question: '你希望你的衣櫃是什麼樣的？',
    type: 'single',
    options: ['經典百搭', '個性鮮明', '簡約精緻', '豐富多樣', '實用主義']
  },
  {
    id: 'style_confidence',
    category: '自信表達',
    question: '穿上喜歡的衣服後，你希望展現什麼形象？',
    type: 'single',
    options: ['溫柔氣質', '活力自信', '專業幹練', '可愛甜美', '個性獨特']
  }
]

export default function MemberPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1) // 1: 基本資料, 2: 風格問卷, 3: 完成
  const [isLoading, setIsLoading] = useState(false)
  
  const [profile, setProfile] = useState<MemberProfile>({
    name: '',
    gender: '',
    age: 25,
    email: '',
    fashionPreferences: {}
  })

  const handleInputChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQuestionAnswer = (questionId: string, answer: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      fashionPreferences: {
        ...prev.fashionPreferences,
        [questionId]: answer
      }
    }))
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // 儲存會員資料
      const profileResponse = await fetch('/api/member/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      const profileResult = await profileResponse.json()
      
      if (profileResult.success) {
        // 儲存問卷偏好
        const preferencesResponse = await fetch('/api/member/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            memberId: profileResult.memberId,
            email: profile.email,
            preferences: profile.fashionPreferences
          })
        })
        
        const preferencesResult = await preferencesResponse.json()
        
        if (preferencesResult.success) {
          // 儲存到 localStorage
          localStorage.setItem('memberProfile', JSON.stringify({
            ...profile,
            memberId: profileResult.memberId,
            analysisResults: preferencesResult.data.analysisResults
          }))
          
          alert('🎉 會員資料建立成功！開始享受個人化推薦吧！')
          router.push('/chat')
        }
      }
    } catch (error) {
      console.error('儲存失敗:', error)
      alert('儲存失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-8">
      {/* 優雅的標題區域 */}
      <div className="text-center mb-12">
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-100 via-secondary-50 to-neutral-100 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <UserIcon className="w-12 h-12 text-primary-600" />
          </div>
        </div>
        <h2 className="text-3xl font-light text-neutral-dark mb-3">讓我們認識你</h2>
        <p className="text-neutral-medium leading-relaxed max-w-md mx-auto">
          分享你的基本資訊，讓STYLEMATE為你量身打造專屬的韓式時尚體驗
        </p>
      </div>

      {/* 精緻的輸入表單 */}
      <div className="bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-3xl p-8 shadow-sm border border-neutral-200/50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-dark tracking-wide">姓名 *</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-5 py-4 bg-white/80 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all placeholder:text-neutral-medium text-neutral-dark"
              placeholder="請輸入您的姓名"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-dark tracking-wide">性別</label>
            <select
              value={profile.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className="w-full px-5 py-4 bg-white/80 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-neutral-dark"
            >
              <option value="">請選擇</option>
              <option value="female">女性</option>
              <option value="male">男性</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-stone-700 tracking-wide">年齡</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
              className="w-full px-5 py-4 bg-white/80 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-neutral-dark"
              min="16" max="80"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-stone-700 tracking-wide">電子郵件 *</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-5 py-4 bg-white/80 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-primary-300 focus:border-primary-300 transition-all text-neutral-dark"
              placeholder="example@email.com"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-10">
      {/* 情境化標題 */}
      <div className="text-center mb-12">
        <div className="relative mb-8">
          <div className="w-28 h-28 bg-gradient-to-br from-primary-100 via-secondary-50 to-neutral-100 rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-white/50">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-light text-stone-800 tracking-wide">風格探索之旅</h2>
          <p className="text-lg text-stone-500 font-light italic">想像你正在首爾的弘大街頭</p>
          <p className="text-stone-600 leading-relaxed">告訴我們你的時尚偏好，我們將為你打造專屬風格</p>
        </div>
      </div>

      {/* 情境化問卷卡片 */}
      <div className="grid gap-8">
        {fashionQuestions.map((question, index) => (
          <div key={question.id} className="bg-gradient-to-br from-white via-stone-50/30 to-amber-50/20 rounded-3xl border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="p-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center shadow-sm border border-white/80">
                      <span className="text-primary-600 text-lg font-light">{index + 1}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-gradient-to-r from-stone-200/60 to-amber-200/60 rounded-full">
                      <span className="text-stone-600 text-sm font-medium tracking-wide">{question.category}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-light text-stone-800 leading-relaxed">{question.question}</h3>

                  <div className="space-y-4">
                    {question.type === 'single' ? (
                      <div className="grid gap-3">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="group cursor-pointer">
                            <div className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                              profile.fashionPreferences[question.id] === option
                                ? 'border-primary-300 bg-gradient-to-r from-primary-50 to-secondary-50 shadow-sm'
                                : 'border-stone-200 bg-white/60 hover:border-stone-300 hover:bg-stone-50/50'
                            }`}>
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={option}
                                    checked={profile.fashionPreferences[question.id] === option}
                                    onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
                                    className="w-5 h-5 text-primary-500 border-neutral-300 focus:ring-primary-300"
                                  />
                                </div>
                                <span className={`font-light text-lg transition-colors ${
                                  profile.fashionPreferences[question.id] === option
                                    ? 'text-stone-800'
                                    : 'text-stone-600 group-hover:text-stone-800'
                                }`}>
                                  {option}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {question.options.map((option, optionIndex) => (
                          <label key={optionIndex} className="group cursor-pointer">
                            <div className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                              Array.isArray(profile.fashionPreferences[question.id]) && 
                              (profile.fashionPreferences[question.id] as string[]).includes(option)
                                ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm'
                                : 'border-stone-200 bg-white/60 hover:border-stone-300 hover:bg-stone-50/50'
                            }`}>
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  <input
                                    type="checkbox"
                                    value={option}
                                    checked={Array.isArray(profile.fashionPreferences[question.id]) && 
                                             (profile.fashionPreferences[question.id] as string[]).includes(option)}
                                    onChange={(e) => {
                                      const currentAnswers = Array.isArray(profile.fashionPreferences[question.id]) 
                                        ? profile.fashionPreferences[question.id] as string[] 
                                        : []
                                      
                                      if (e.target.checked) {
                                        handleQuestionAnswer(question.id, [...currentAnswers, option])
                                      } else {
                                        handleQuestionAnswer(question.id, currentAnswers.filter(a => a !== option))
                                      }
                                    }}
                                    className="w-5 h-5 text-amber-500 border-stone-300 rounded focus:ring-amber-300"
                                  />
                                </div>
                                <span className={`font-light text-lg transition-colors ${
                                  Array.isArray(profile.fashionPreferences[question.id]) && 
                                  (profile.fashionPreferences[question.id] as string[]).includes(option)
                                    ? 'text-stone-800'
                                    : 'text-stone-600 group-hover:text-stone-800'
                                }`}>
                                  {option}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="text-center space-y-8">
      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
        <CheckCircleIcon className="w-12 h-12 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-3xl font-light text-stone-800 mb-4">歡迎加入STYLEMATE！</h2>
        <p className="text-stone-600 leading-relaxed">
          你的專屬時尚檔案已建立完成，現在可以開始享受個人化的韓式時尚推薦了！
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20">
      {/* 優雅的進度條 */}
      <div className="bg-gradient-to-r from-white/95 to-stone-50/95 backdrop-blur-sm shadow-sm border-b border-stone-200/50">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-light text-stone-800 tracking-wide">會員檔案建立</h1>
              <p className="text-stone-500 text-sm mt-1">為你量身打造專屬的時尚體驗</p>
            </div>
            <div className="text-right">
              <span className="text-stone-600 text-sm font-light">步驟 {currentStep} / 3</span>
            </div>
          </div>
          <div className="w-full bg-stone-200/50 rounded-full h-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-400 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 精緻的表單內容區 */}
          <div className="bg-gradient-to-br from-white/90 via-stone-50/50 to-amber-50/30 backdrop-blur-sm rounded-3xl shadow-2xl border border-stone-200/30 p-10">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* 優雅的按鈕區域 */}
            {currentStep < 3 && (
              <div className="flex justify-between items-center mt-16 pt-8 border-t border-stone-200/50">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-medium rounded-2xl hover:from-neutral-200 hover:to-neutral-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-light">上一步</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="group flex items-center space-x-3 px-10 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="font-light">處理中...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-light">{currentStep === 2 ? '完成建立' : '繼續'}</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 返回連結 */}
          <div className="text-center mt-8">
            <Link 
              href="/chat"
              className="inline-flex items-center space-x-2 text-stone-600 hover:text-stone-700 font-light"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>返回聊天頁面</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}