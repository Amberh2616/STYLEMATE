'use client'

import React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { 
  PhotoIcon, 
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface UploadedImage {
  originalName: string
  fileName: string
  path: string
  size: number
  type: string
  category: string
}

interface Category {
  id: string
  name: string
  description: string
}

export default function ImageUploadPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [categories, setCategories] = useState<Category[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<UploadedImage[]>([])
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/images/upload')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data.categories)
      }
    } catch (error) {
      console.error('獲取分類失敗:', error)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      )
      setSelectedFiles(prev => [...prev, ...files])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('請選擇要上傳的圖片')
      return
    }

    setIsUploading(true)
    setUploadResults([])
    setUploadErrors([])

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('files', file)
      })
      formData.append('category', selectedCategory)

      const response = await fetch('/api/admin/images/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setUploadResults(data.data.uploaded)
        setUploadErrors(data.data.errors)
        setSelectedFiles([]) // 清空選中的檔案
      } else {
        alert('上傳失敗: ' + data.error)
      }
    } catch (error) {
      console.error('上傳失敗:', error)
      alert('上傳失敗，請稍後再試')
    } finally {
      setIsUploading(false)
    }
  }

  const copyImagePath = (path: string) => {
    navigator.clipboard.writeText(path)
    alert('圖片路徑已複製到剪貼簿')
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
            批量圖片上傳
          </h1>
          <p className="text-gray-600 mt-2">上傳商品圖片並管理圖片庫</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 上傳區域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 分類選擇 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">選擇圖片分類</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategory === category.id}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="hidden"
                  />
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {category.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 拖拽上傳區域 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-lg font-medium text-blue-600 hover:text-blue-500">
                    點擊上傳檔案
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="text-gray-500">或拖拽圖片檔案到這裡</p>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                支援 JPG, PNG, WebP 格式，單檔最大 5MB
              </p>
            </div>
          </div>

          {/* 選中的檔案列表 */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  已選擇 {selectedFiles.length} 個檔案
                </h3>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? '上傳中...' : '開始上傳'}
                </button>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                      <div>
                        <div className="font-medium text-sm">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 上傳結果 */}
        <div className="space-y-6">
          {/* 成功上傳 */}
          {uploadResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                上傳成功 ({uploadResults.length})
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uploadResults.map((result, index) => (
                  <div key={index} className="border border-green-200 rounded-lg p-3 bg-green-50">
                    <img
                      src={result.path}
                      alt={result.originalName}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <div className="text-sm">
                      <div className="font-medium truncate">{result.originalName}</div>
                      <div className="text-gray-600 text-xs mt-1">
                        {formatFileSize(result.size)} • {result.category}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => copyImagePath(result.path)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          複製路徑
                        </button>
                        <button className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                          <EyeIcon className="h-3 w-3 inline mr-1" />
                          預覽
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 上傳錯誤 */}
          {uploadErrors.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                上傳失敗 ({uploadErrors.length})
              </h3>
              <div className="space-y-2">
                {uploadErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 p-2 bg-red-50 border border-red-200 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 上傳提示 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">上傳提示</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 支援 JPG、PNG、WebP 格式</li>
              <li>• 單檔大小不超過 5MB</li>
              <li>• 建議圖片尺寸: 800x800 以上</li>
              <li>• 檔案名稱會自動重命名</li>
              <li>• 上傳後可在商品管理中使用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}