'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ArrowUpIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function TrendAnalysisChat() {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      // Call WebSearch service for trend analysis  
      const response = await fetch('http://localhost:3008/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          type: 'trend_analysis'
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Add assistant response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.analysis || '抱歉，目前無法獲取趨勢分析結果。請稍後再試。'
      }])

    } catch (error) {
      console.error('Trend analysis error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，趨勢分析服務暫時無法使用。請檢查網路連接或稍後再試。'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const trendSuggestions = [
    "2024秋冬韓系流行趨勢",
    "首爾街頭時尚分析", 
    "K-pop穿搭風格解析",
    "韓系色彩搭配趨勢",
    "韓國設計師品牌推薦"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-cream via-primary-50 to-secondary-50">
      {/* Header */}
      <header className="border-b border-white/20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <MagnifyingGlassIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-dark">時尚趨勢分析</span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link href="/chat" className="text-neutral-medium hover:text-primary-600 transition-colors">
              AI助理
            </Link>
            <Link href="/products" className="text-neutral-medium hover:text-primary-600 transition-colors">
              商品專區
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Message */}
        {messages.length === 0 && (
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-dark mb-4">韓式時尚趨勢分析</h1>
            <p className="text-neutral-medium mb-8 max-w-2xl mx-auto">
              獲取最新的K-fashion趨勢資訊，包括時裝周分析、街頭時尚、色彩趨勢和設計師品牌推薦
            </p>
            
            {/* Trend Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {trendSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className="p-4 bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl hover:bg-white/90 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <SparklesIcon className="w-5 h-5 text-secondary-500 group-hover:text-secondary-600" />
                    <span className="text-neutral-dark font-medium">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-6 mb-6">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl px-6 py-4 rounded-2xl ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                  : 'bg-white/70 backdrop-blur-sm border border-white/40 text-neutral-dark'
              }`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse delay-150"></div>
                  <span className="text-neutral-medium ml-2">分析趨勢中...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="詢問韓式時尚趨勢、流行分析或設計師品牌..."
                className="w-full px-6 py-4 pr-12 bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-white p-4 rounded-2xl hover:from-secondary-600 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ArrowUpIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}