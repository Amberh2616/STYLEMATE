'use client'

import { useCallback, useState } from 'react'

interface PhotoUploadProps {
  onUpload: (file: File) => void
  currentFile?: File | null
  maxSize?: number // MB
  acceptedTypes?: string[]
}

export default function PhotoUpload({
  onUpload,
  currentFile,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const validateFile = (file: File): boolean => {
    setError(null)

    // 檢查檔案類型
    if (!acceptedTypes.includes(file.type)) {
      setError('請上傳 JPEG、PNG 或 WebP 格式的圖片')
      return false
    }

    // 檢查檔案大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`檔案大小不能超過 ${maxSize}MB`)
      return false
    }

    return true
  }

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onUpload(file)
      
      // 生成預覽圖
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [onUpload, maxSize, acceptedTypes])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const removeFile = () => {
    setPreview(null)
    setError(null)
    // 清空 input
    const input = document.getElementById('photo-upload') as HTMLInputElement
    if (input) {
      input.value = ''
    }
  }

  return (
    <div className="w-full">
      {/* 上傳區域 */}
      <div
        className={`
          upload-zone
          ${dragOver ? 'dragover' : ''}
          ${error ? 'border-error bg-error/5' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          id="photo-upload"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          /* 預覽圖片 */
          <div className="relative">
            <img
              src={preview}
              alt="Upload preview"
              className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
            />
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 bg-error text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-error/80 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          /* 上傳提示 */
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="w-12 h-12 text-secondary-400 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            
            <h4 className="text-lg font-medium text-neutral-dark mb-2">
              拖拽照片到此處或點擊上傳
            </h4>
            
            <p className="text-secondary-600 mb-4">
              支援 JPEG、PNG、WebP 格式，最大 {maxSize}MB
            </p>
            
            <button
              type="button"
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="btn-primary inline-flex items-center px-6 py-3"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              選擇檔案
            </button>
          </div>
        )}
      </div>

      {/* 錯誤訊息 */}
      {error && (
        <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* 檔案資訊 */}
      {currentFile && !error && (
        <div className="mt-3 p-3 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-dark">{currentFile.name}</p>
              <p className="text-xs text-secondary-600">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="text-success">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}