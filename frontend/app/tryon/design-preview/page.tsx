'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  SparklesIcon,
  BeakerIcon,
  CommandLineIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function DesignPreviewPage() {
  const [hoveredDesign, setHoveredDesign] = useState<string | null>(null)

  const designs = [
    {
      id: 'gaming',
      name: 'Gaming Command Center',
      description: '遊戲風格指揮中心',
      theme: '暗色霓虹風格',
      features: [
        '標籤式導航系統',
        '即時HUD狀態顯示', 
        '霓虹特效動畫',
        '遊戲化快捷鍵',
        'Q/W/E + R/T/Y 控制'
      ],
      colors: ['從黑色到紫色漸層', '青色/紫色強調'],
      icon: CommandLineIcon,
      gradient: 'from-gray-900 via-purple-900 to-gray-900',
      borderColor: 'border-cyan-500',
      buttonClass: 'from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600',
      href: '/tryon/gaming-style'
    },
    {
      id: 'lab', 
      name: 'Style Laboratory',
      description: '專業實驗室風格',
      theme: '明亮專業風格',
      features: [
        '可折疊面板系統',
        '三欄式專業佈局',
        '預設風格組合',
        '實驗室主題設計',
        'Shift+數字 + F功能鍵'
      ],
      colors: ['白色/藍色基調', '靛色/藍色強調'],
      icon: BeakerIcon,
      gradient: 'from-slate-50 via-blue-50 to-indigo-100',
      borderColor: 'border-indigo-500',
      buttonClass: 'from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700',
      href: '/tryon/lab-style'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <EyeIcon className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                試穿遊戲場設計預覽
              </h1>
              <SparklesIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-slate-600 text-lg">選擇你喜歡的介面風格來體驗全新的虛擬試穿功能</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-12 max-w-7xl">
        {/* Design Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {designs.map((design) => (
            <div
              key={design.id}
              className={`relative group cursor-pointer transition-all duration-500 ${
                hoveredDesign === design.id ? 'scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredDesign(design.id)}
              onMouseLeave={() => setHoveredDesign(null)}
            >
              {/* Design Card */}
              <div className={`bg-gradient-to-br ${design.gradient} rounded-3xl border-4 ${design.borderColor} p-8 shadow-2xl`}>
                {/* Header */}
                <div className="text-center mb-8">
                  <design.icon className={`w-16 h-16 mx-auto mb-4 ${
                    design.id === 'gaming' ? 'text-cyan-400' : 'text-indigo-600'
                  }`} />
                  <h2 className={`text-2xl font-bold mb-2 ${
                    design.id === 'gaming' ? 'text-white' : 'text-slate-800'
                  }`}>
                    {design.name}
                  </h2>
                  <p className={`text-lg ${
                    design.id === 'gaming' ? 'text-gray-300' : 'text-slate-600'
                  }`}>
                    {design.description}
                  </p>
                </div>

                {/* Preview Area */}
                <div className={`rounded-2xl p-6 mb-8 ${
                  design.id === 'gaming' 
                    ? 'bg-black/30 border border-cyan-500/30' 
                    : 'bg-white/60 border border-indigo-200'
                }`}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="text-6xl opacity-20">
                      {design.id === 'gaming' ? '🎮' : '🧪'}
                    </div>
                    <div className="absolute inset-4 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center">
                      <span className={`font-bold text-lg ${
                        design.id === 'gaming' ? 'text-cyan-400' : 'text-indigo-600'
                      }`}>
                        {design.name} 介面預覽
                      </span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h3 className={`font-bold text-lg mb-4 ${
                    design.id === 'gaming' ? 'text-cyan-400' : 'text-indigo-600'
                  }`}>
                    ✨ 主要特色
                  </h3>
                  <ul className="space-y-2">
                    {design.features.map((feature, index) => (
                      <li key={index} className={`flex items-center space-x-2 ${
                        design.id === 'gaming' ? 'text-white' : 'text-slate-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          design.id === 'gaming' ? 'bg-purple-400' : 'bg-blue-400'
                        }`}></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Color Scheme */}
                <div className="mb-8">
                  <h3 className={`font-bold text-lg mb-3 ${
                    design.id === 'gaming' ? 'text-purple-400' : 'text-blue-600'
                  }`}>
                    🎨 色彩主題
                  </h3>
                  <div className="space-y-1">
                    {design.colors.map((color, index) => (
                      <p key={index} className={`text-sm ${
                        design.id === 'gaming' ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        • {color}
                      </p>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={design.href}
                  className={`w-full bg-gradient-to-r ${design.buttonClass} text-white py-4 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-3 shadow-lg group-hover:shadow-xl`}
                >
                  <EyeIcon className="w-6 h-6" />
                  <span>體驗 {design.name}</span>
                  <SparklesIcon className="w-6 h-6" />
                </Link>
              </div>

              {/* Hover Effect */}
              {hoveredDesign === design.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse rounded-3xl"></div>
              )}
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 p-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">
            📊 設計對比
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left p-4 font-bold text-slate-700">比較項目</th>
                  <th className="text-center p-4 font-bold text-cyan-600">Gaming Center</th>
                  <th className="text-center p-4 font-bold text-indigo-600">Style Laboratory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 font-semibold text-slate-700">視覺風格</td>
                  <td className="p-4 text-center">🎮 遊戲/霓虹風格</td>
                  <td className="p-4 text-center">🧪 專業/工作室風格</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700">色彩主題</td>
                  <td className="p-4 text-center">暗色 + 青紫霓虹</td>
                  <td className="p-4 text-center">亮色 + 藍靛專業</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700">導航方式</td>
                  <td className="p-4 text-center">標籤式切換</td>
                  <td className="p-4 text-center">折疊面板</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700">快捷鍵</td>
                  <td className="p-4 text-center">Q/W/E, R/T/Y</td>
                  <td className="p-4 text-center">Shift+數字, F1-F3</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700">適合用戶</td>
                  <td className="p-4 text-center">年輕/遊戲愛好者</td>
                  <td className="p-4 text-center">專業/商務用戶</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-slate-700">特色功能</td>
                  <td className="p-4 text-center">HUD 顯示/動畫特效</td>
                  <td className="p-4 text-center">預設組合/批次操作</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-12">
          <Link 
            href="/tryon/upload" 
            className="inline-flex items-center space-x-2 bg-white/80 border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>返回原始試穿頁面</span>
          </Link>
        </div>
      </div>
    </div>
  )
}