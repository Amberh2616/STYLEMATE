'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  TruckIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [itemQuantity, setItemQuantity] = useState(1)
  const [checkoutProduct, setCheckoutProduct] = useState<any>(null)

  const changeQuantity = (delta: number) => {
    setItemQuantity(Math.max(1, itemQuantity + delta))
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeOrder = () => {
    setCurrentStep(4) // 完成狀態
  }

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed'
    if (step === currentStep) return 'active'
    return 'pending'
  }

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      case 'active':
        return 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white'
      default:
        return 'bg-slate-200 text-slate-600'
    }
  }

  // 載入結帳商品資訊
  useEffect(() => {
    const productData = localStorage.getItem('checkoutProduct')
    if (productData) {
      try {
        setCheckoutProduct(JSON.parse(productData))
      } catch (error) {
        console.error('解析商品資料錯誤:', error)
        // 使用預設商品資料
        setCheckoutProduct({
          name: '韓式甜美花朵印花洋裝',
          price: 1299,
          image: '👗'
        })
      }
    } else {
      // 使用預設商品資料
      setCheckoutProduct({
        name: '韓式甜美花朵印花洋裝',
        price: 1299,
        image: '👗'
      })
    }
  }, [])

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

      {/* 主要內容區域 */}
      <div className="container mx-auto px-8 py-12 max-w-6xl relative z-10">
        {/* 標題區域 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <ShoppingCartIcon className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">STYLEMATE</h1>
            <CurrencyDollarIcon className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">結帳</h2>
          <p className="text-slate-600">完成您的訂單</p>
        </div>

        {/* 步驟指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getStepClasses(getStepStatus(1))}`}>
                1
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 1 ? 'text-slate-700' : 'text-slate-500'}`}>購物車</span>
            </div>
            <div className="w-8 h-1 bg-slate-300"></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getStepClasses(getStepStatus(2))}`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 2 ? 'text-slate-700' : 'text-slate-500'}`}>配送資訊</span>
            </div>
            <div className="w-8 h-1 bg-slate-300"></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getStepClasses(getStepStatus(3))}`}>
                3
              </div>
              <span className={`ml-2 text-sm font-medium ${currentStep >= 3 ? 'text-slate-700' : 'text-slate-500'}`}>付款</span>
            </div>
          </div>
        </div>

        {/* 主要內容區 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：結帳表單 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 步驟1：購物車檢視 */}
            {currentStep === 1 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6 animate-slide-in">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">🛒 購物車</h3>
                
                {/* 商品項目 */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {checkoutProduct?.image?.startsWith('http') ? (
                        <img 
                          src={checkoutProduct.image} 
                          alt={checkoutProduct.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling.style.display = 'flex'
                          }}
                        />
                      ) : (
                        <span className="text-2xl">{checkoutProduct?.image || '👗'}</span>
                      )}
                      <span className="text-2xl" style={{display: 'none'}}>👗</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">{checkoutProduct?.name || '韓式甜美花朵印花洋裝'}</h4>
                      <p className="text-sm text-slate-600">尺寸：M</p>
                      <p className="text-sm text-slate-600">顏色：粉色</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <button 
                          onClick={() => changeQuantity(-1)} 
                          className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs hover:bg-slate-300"
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold min-w-[1.5rem] text-center">{itemQuantity}</span>
                        <button 
                          onClick={() => changeQuantity(1)} 
                          className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs hover:bg-slate-300"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-lg font-bold text-indigo-600">NT$ {((checkoutProduct?.price || 1299) * itemQuantity).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={nextStep} 
                  className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all"
                >
                  下一步：配送資訊
                </button>
              </div>
            )}

            {/* 步驟2：配送資訊 */}
            {currentStep === 2 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6 animate-slide-in">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">🚚 配送資訊</h3>
                
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">姓名</label>
                      <input type="text" className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all" placeholder="請輸入收件人姓名" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">電話</label>
                      <input type="tel" className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all" placeholder="請輸入聯絡電話" required />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">電子郵件</label>
                    <input type="email" className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all" placeholder="請輸入電子郵件" required />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">配送地址</label>
                    <textarea className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all h-24" placeholder="請輸入完整地址" required></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">配送方式</label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border-2 border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                        <input type="radio" name="shipping" value="standard" className="text-indigo-600" defaultChecked />
                        <span className="ml-3 flex-1">
                          <span className="font-medium">標準配送</span>
                          <span className="text-sm text-slate-600 block">3-5個工作天 - 免運費</span>
                        </span>
                        <span className="font-semibold text-slate-800">免費</span>
                      </label>
                      <label className="flex items-center p-3 border-2 border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                        <input type="radio" name="shipping" value="express" className="text-indigo-600" />
                        <span className="ml-3 flex-1">
                          <span className="font-medium">快速配送</span>
                          <span className="text-sm text-slate-600 block">1-2個工作天</span>
                        </span>
                        <span className="font-semibold text-slate-800">NT$ 100</span>
                      </label>
                    </div>
                  </div>
                </form>
                
                <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={prevStep} 
                    className="flex-1 bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-300 transition-all"
                  >
                    上一步
                  </button>
                  <button 
                    onClick={nextStep} 
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-600 hover:to-violet-700 transition-all"
                  >
                    下一步：付款
                  </button>
                </div>
              </div>
            )}

            {/* 步驟3：付款資訊 */}
            {currentStep === 3 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6 animate-slide-in">
                <h3 className="text-xl font-semibold text-slate-800 mb-6">💳 付款方式</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                    <input type="radio" name="payment" value="credit" className="text-indigo-600" defaultChecked />
                    <span className="ml-3 flex-1">
                      <span className="font-medium flex items-center">
                        信用卡付款
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">推薦</span>
                      </span>
                      <span className="text-sm text-slate-600 block">支援 Visa、MasterCard、JCB</span>
                    </span>
                  </label>
                  
                  <label className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                    <input type="radio" name="payment" value="transfer" className="text-indigo-600" />
                    <span className="ml-3 flex-1">
                      <span className="font-medium">銀行轉帳</span>
                      <span className="text-sm text-slate-600 block">轉帳後請提供轉帳資訊</span>
                    </span>
                  </label>
                  
                  <label className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-indigo-300 cursor-pointer">
                    <input type="radio" name="payment" value="cod" className="text-indigo-600" />
                    <span className="ml-3 flex-1">
                      <span className="font-medium">貨到付款</span>
                      <span className="text-sm text-slate-600 block">收到商品後付款 (+NT$ 30手續費)</span>
                    </span>
                  </label>
                </div>
                
                {/* 信用卡資訊 */}
                <div className="mt-6 space-y-4 p-4 bg-slate-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">卡號</label>
                    <input type="text" className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all" placeholder="1234 5678 9012 3456" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">到期日</label>
                      <input type="text" className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all" placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">安全碼</label>
                      <input type="text" className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all" placeholder="123" maxLength={3} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">持卡人姓名</label>
                    <input type="text" className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all" placeholder="請輸入持卡人姓名" />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={prevStep} 
                    className="flex-1 bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-300 transition-all"
                  >
                    上一步
                  </button>
                  <button 
                    onClick={completeOrder} 
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                  >
                    完成訂單
                  </button>
                </div>
              </div>
            )}

            {/* 訂單完成 */}
            {currentStep === 4 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-green-200 p-6 animate-slide-in text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">訂單成功！</h3>
                <p className="text-slate-600 mb-6">感謝您的購買！我們將盡快為您處理訂單。</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-700">
                    <strong>訂單編號：</strong> #STYLE2024001<br/>
                    <strong>預計送達：</strong> 3-5個工作天
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/chat" className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-600 hover:to-violet-700 transition-all">
                    繼續購物
                  </Link>
                  <Link href="/" className="bg-slate-200 text-slate-700 py-3 px-6 rounded-lg font-medium hover:bg-slate-300 transition-all">
                    返回首頁
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* 右側：訂單摘要 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-slate-200 p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6">📋 訂單摘要</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-600">商品小計</span>
                <span className="font-semibold">NT$ {((checkoutProduct?.price || 1299) * itemQuantity).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">運費</span>
                <span className="font-semibold text-green-600">免費</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">總計</span>
                  <span className="font-bold text-indigo-600">NT$ {((checkoutProduct?.price || 1299) * itemQuantity).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-indigo-800 mb-2">🎁 優惠活動</h4>
              <p className="text-sm text-indigo-700">首次購買享免運費優惠！</p>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                30天免費退換貨
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                安全加密付款
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                品質保證
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}