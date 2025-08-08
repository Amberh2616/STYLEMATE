'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  HeartIcon,
  SparklesIcon,
  UserCircleIcon,
  ScaleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  email: string
  password: string
  name: string
  height: number
  weight: number
  bust: number
  waist: number
  hip: number
  stylePreferences: string[]
  occasions: string[]
  budgetRange: [number, number]
}

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [step, setStep] = useState(1) // 1: 基本資料, 2: 身材資料, 3: 偏好設定
  const [isLoading, setIsLoading] = useState(false)
  
  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    password: '',
    name: '',
    height: 160,
    weight: 50,
    bust: 85,
    waist: 65,
    hip: 90,
    stylePreferences: [],
    occasions: [],
    budgetRange: [1000, 5000]
  })

  const styleOptions = [
    { id: 'sweet', label: '甜美可愛', icon: '🌸', color: 'bg-pink-100 text-pink-600 border-pink-200' },
    { id: 'elegant', label: '優雅女神', icon: '👑', color: 'bg-purple-100 text-purple-600 border-purple-200' },
    { id: 'street', label: '街頭潮流', icon: '⚡', color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { id: 'casual', label: '休閒日常', icon: '🌿', color: 'bg-green-100 text-green-600 border-green-200' },
    { id: 'office', label: '職場專業', icon: '💼', color: 'bg-gray-100 text-gray-600 border-gray-200' },
    { id: 'party', label: '派對華麗', icon: '✨', color: 'bg-yellow-100 text-yellow-600 border-yellow-200' }
  ]

  const occasionOptions = [
    { id: 'work', label: '上班工作', icon: '💻' },
    { id: 'date', label: '約會聚餐', icon: '💕' },
    { id: 'daily', label: '日常生活', icon: '☕' },
    { id: 'party', label: '派對聚會', icon: '🎉' },
    { id: 'travel', label: '旅遊度假', icon: '🏖️' },
    { id: 'exercise', label: '運動休閒', icon: '🏃‍♀️' }
  ]

  const handleStyleToggle = (styleId: string) => {
    setProfile(prev => ({
      ...prev,
      stylePreferences: prev.stylePreferences.includes(styleId)
        ? prev.stylePreferences.filter(s => s !== styleId)
        : [...prev.stylePreferences, styleId]
    }))
  }

  const handleOccasionToggle = (occasionId: string) => {
    setProfile(prev => ({
      ...prev,
      occasions: prev.occasions.includes(occasionId)
        ? prev.occasions.filter(o => o !== occasionId)
        : [...prev.occasions, occasionId]
    }))
  }

  const handleBudgetChange = (index: number, value: number) => {
    setProfile(prev => ({
      ...prev,
      budgetRange: [
        index === 0 ? value : prev.budgetRange[0],
        index === 1 ? value : prev.budgetRange[1]
      ] as [number, number]
    }))
  }

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true)
    // 模擬社交登入
    setTimeout(() => {
      console.log(`登入使用 ${provider}`)
      setIsLoading(false)
      if (!isLogin) {
        setStep(2)
      } else {
        router.push('/')
      }
    }, 1500)
  }

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      // 模擬註冊/登入API呼叫
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 儲存用戶資料到localStorage
      localStorage.setItem('userProfile', JSON.stringify(profile))
      
      // 跳轉到首頁
      router.push('/')
    } catch (error) {
      console.error('Authentication error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCircleIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-dark mb-2">
          {isLogin ? '歡迎回來！' : '加入 STYLEMATE'}
        </h2>
        <p className="text-neutral-medium">
          {isLogin ? '登入您的帳號開始時尚之旅' : '創建帳號，開始您的韓式時尚體驗'}
        </p>
      </div>

      {/* 社交登入 */}
      <div className="space-y-3">
        <button
          onClick={() => handleSocialLogin('Google')}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 bg-white/70 backdrop-blur-sm border border-white/40 rounded-lg py-3 px-4 hover:bg-white/90 hover:border-white/60 transition-all disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          <span className="text-neutral-dark font-medium">使用 Google 登入</span>
        </button>

        <button
          onClick={() => handleSocialLogin('Facebook')}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 bg-white/70 backdrop-blur-sm border border-white/40 rounded-lg py-3 px-4 hover:bg-white/90 hover:border-white/60 transition-all disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">f</span>
          </div>
          <span className="text-neutral-dark font-medium">使用 Facebook 登入</span>
        </button>

        <button
          onClick={() => handleSocialLogin('LINE')}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-3 bg-white/70 backdrop-blur-sm border border-white/40 rounded-lg py-3 px-4 hover:bg-white/90 hover:border-white/60 transition-all disabled:opacity-50"
        >
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <span className="text-neutral-dark font-medium">使用 LINE 登入</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/30"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gradient-to-r from-primary-100/80 to-secondary-100/80 px-4 py-1 rounded-full text-neutral-medium backdrop-blur-sm">或使用電子郵件</span>
        </div>
      </div>

      {/* 表單輸入 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-2">電子郵件</label>
          <div className="relative">
            <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-medium" />
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="請輸入您的電子郵件"
              className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-primary-500 focus:outline-none transition-all focus:bg-white/80"
            />
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-2">姓名</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-medium" />
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="請輸入您的姓名"
                className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-primary-500 focus:outline-none transition-all focus:bg-white/80"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-2">密碼</label>
          <div className="relative">
            <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-medium" />
            <input
              type="password"
              value={profile.password}
              onChange={(e) => setProfile(prev => ({ ...prev, password: e.target.value }))}
              placeholder="請輸入您的密碼"
              className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-primary-500 focus:outline-none transition-all focus:bg-white/80"
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => isLogin ? handleComplete() : handleNextStep()}
        disabled={!profile.email || !profile.password || isLoading}
        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>{isLogin ? '登入中...' : '處理中...'}</span>
          </div>
        ) : (
          isLogin ? '登入' : '下一步'
        )}
      </button>

      <p className="text-center text-sm text-neutral-medium">
        {isLogin ? '還沒有帳號？' : '已經有帳號了？'}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary-600 hover:text-primary-700 font-medium ml-1"
        >
          {isLogin ? '立即註冊' : '馬上登入'}
        </button>
      </p>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ScaleIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-dark mb-2">身材資料</h2>
        <p className="text-neutral-medium">幫助我們為您推薦最合適的尺寸</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-2">身高 (cm)</label>
          <input
            type="number"
            value={profile.height}
            onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
            min="140"
            max="200"
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-primary-500 focus:outline-none transition-all focus:bg-white/80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-2">體重 (kg)</label>
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => setProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
            min="35"
            max="150"
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-primary-500 focus:outline-none transition-all focus:bg-white/80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-2">胸圍 (cm)</label>
          <input
            type="number"
            value={profile.bust}
            onChange={(e) => setProfile(prev => ({ ...prev, bust: parseInt(e.target.value) || 0 }))}
            min="60"
            max="120"
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-primary-500 focus:outline-none transition-all focus:bg-white/80"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-dark mb-2">腰圍 (cm)</label>
          <input
            type="number"
            value={profile.waist}
            onChange={(e) => setProfile(prev => ({ ...prev, waist: parseInt(e.target.value) || 0 }))}
            min="50"
            max="100"
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-primary-500 focus:outline-none transition-all focus:bg-white/80"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-neutral-dark mb-2">臀圍 (cm)</label>
          <input
            type="number"
            value={profile.hip}
            onChange={(e) => setProfile(prev => ({ ...prev, hip: parseInt(e.target.value) || 0 }))}
            min="70"
            max="130"
            className="w-full px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg focus:border-primary-500 focus:outline-none transition-all focus:bg-white/80"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary-100/60 to-secondary-100/60 backdrop-blur-sm rounded-lg p-4 border border-white/30">
        <p className="text-sm text-primary-700">
          💡 這些資料將協助 AI 為您推薦最適合的尺寸，所有資料都會安全加密保存
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-neutral-cream text-neutral-dark py-3 px-4 rounded-lg font-medium hover:bg-neutral-light transition-colors"
        >
          上一步
        </button>
        <button
          onClick={handleNextStep}
          className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all"
        >
          下一步
        </button>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeartIcon className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-dark mb-2">風格偏好</h2>
        <p className="text-neutral-medium">選擇您喜歡的風格，讓 AI 更懂您的品味</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-dark mb-4">喜歡的風格（可多選）</h3>
        <div className="grid grid-cols-2 gap-3">
          {styleOptions.map(style => (
            <button
              key={style.id}
              onClick={() => handleStyleToggle(style.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                profile.stylePreferences.includes(style.id)
                  ? `${style.color} border-current`
                  : 'bg-white border-neutral-light hover:border-neutral-medium'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{style.icon}</span>
                <span className="font-medium">{style.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-dark mb-4">穿著場合（可多選）</h3>
        <div className="grid grid-cols-2 gap-3">
          {occasionOptions.map(occasion => (
            <button
              key={occasion.id}
              onClick={() => handleOccasionToggle(occasion.id)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                profile.occasions.includes(occasion.id)
                  ? 'bg-secondary-100 text-secondary-700 border-secondary-300'
                  : 'bg-white border-neutral-light hover:border-neutral-medium'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{occasion.icon}</span>
                <span className="text-sm font-medium">{occasion.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-dark mb-4">預算範圍</h3>
        <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-neutral-medium">NT$ {profile.budgetRange[0].toLocaleString()}</span>
            <span className="text-sm text-neutral-medium">NT$ {profile.budgetRange[1].toLocaleString()}</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-neutral-medium mb-2">最低預算</label>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={profile.budgetRange[0]}
                onChange={(e) => handleBudgetChange(0, parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-light rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <div>
              <label className="block text-xs text-neutral-medium mb-2">最高預算</label>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={profile.budgetRange[1]}
                onChange={(e) => handleBudgetChange(1, parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-light rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep(2)}
          className="flex-1 bg-neutral-cream text-neutral-dark py-3 px-4 rounded-lg font-medium hover:bg-neutral-light transition-colors"
        >
          上一步
        </button>
        <button
          onClick={handleComplete}
          disabled={profile.stylePreferences.length === 0 || isLoading}
          className="flex-1 bg-gradient-to-r from-success to-success/90 text-white py-3 px-4 rounded-lg font-medium hover:from-success/90 hover:to-success transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>完成設定中...</span>
            </div>
          ) : (
            '完成註冊'
          )}
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-cream via-primary-50 to-secondary-50">
      <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full">
          {/* 進度指示器 */}
          {!isLogin && (
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map(stepNum => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      step >= stepNum 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-neutral-light text-neutral-medium'
                    }`}>
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div className={`w-8 h-1 mx-2 ${
                        step > stepNum ? 'bg-primary-500' : 'bg-neutral-light'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 表單內容 */}
          <div className="bg-gradient-to-b from-white/90 to-neutral-50/95 backdrop-blur-sm rounded-2xl shadow-morandi-lg border border-white/20 p-8">
            {isLogin || step === 1 ? renderStep1() : null}
            {!isLogin && step === 2 ? renderStep2() : null}
            {!isLogin && step === 3 ? renderStep3() : null}
          </div>

          {/* 返回首頁 */}
          <div className="text-center mt-6">
            <Link 
              href="/"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              ← 返回首頁
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8B7CF6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8B7CF6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}