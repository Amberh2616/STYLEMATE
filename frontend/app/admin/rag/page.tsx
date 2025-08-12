'use client'

import { useState } from 'react'
import { DocumentArrowUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function RAGAdminPage() {
  const [uploadStatus, setUploadStatus] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setUploadStatus('請選擇 PDF 文件')
      return
    }

    setIsUploading(true)
    setUploadStatus('正在處理 PDF 文件...')

    try {
      const formData = new FormData()
      formData.append('pdf', file)

      const response = await fetch('/api/rag/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadStatus(`✅ ${result.message} - 共處理 ${result.chunks} 個文本片段`)
      } else {
        setUploadStatus(`❌ ${result.message}`)
      }
    } catch (error) {
      setUploadStatus('❌ 上傳失敗，請稍後再試')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch('/api/rag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 5
        }),
      })

      const result = await response.json()
      setSearchResults(result.results || [])
    } catch (error) {
      console.error('搜尋錯誤:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
          RAG 知識庫管理
        </h1>

        {/* PDF 上傳區 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <DocumentArrowUpIcon className="w-6 h-6 mr-2 text-indigo-600" />
            上傳 PDF 文件
          </h2>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdfInput"
              disabled={isUploading}
            />
            <label 
              htmlFor="pdfInput" 
              className={`cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-gray-400 mb-4">
                <DocumentArrowUpIcon className="w-16 h-16 mx-auto mb-4" />
              </div>
              <p className="text-lg text-gray-600 mb-2">
                {isUploading ? '正在處理中...' : '選擇 PDF 文件上傳'}
              </p>
              <p className="text-sm text-gray-400">
                支援 PDF 格式，AI 會自動分析並建立向量索引
              </p>
              {!isUploading && (
                <div className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-all inline-block">
                  選擇文件
                </div>
              )}
            </label>
          </div>
          
          {uploadStatus && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className={`text-sm ${uploadStatus.includes('✅') ? 'text-green-600' : uploadStatus.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
                {uploadStatus}
              </p>
            </div>
          )}
        </div>

        {/* 搜尋測試區 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MagnifyingGlassIcon className="w-6 h-6 mr-2 text-indigo-600" />
            測試知識庫搜尋
          </h2>
          
          <div className="flex space-x-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="輸入搜尋關鍵字..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '搜尋中...' : '搜尋'}
            </button>
          </div>

          {/* 搜尋結果 */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">搜尋結果：</h3>
              {searchResults.map((result: any, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-indigo-600">
                      來源：{result.source}
                    </span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                      相似度：{(result.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isSearching && (
            <div className="text-center py-8 text-gray-500">
              沒有找到相關內容，請嘗試不同的搜尋詞
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <a 
            href="/chat" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← 返回聊天頁面
          </a>
        </div>
      </div>
    </div>
  )
}