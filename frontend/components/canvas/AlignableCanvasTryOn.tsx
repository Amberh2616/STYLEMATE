'use client'

import React from 'react'

import { useRef, useEffect, useState } from 'react'

interface TryOnPoint {
  x: number
  y: number
  label: string
}

interface AlignableCanvasTryOnProps {
  userPhoto: string
  clothingImage: string
  shoulderPx: number
  onComplete: (resultImage: string) => void
}

export default function AlignableCanvasTryOn({ 
  userPhoto, 
  clothingImage, 
  shoulderPx, 
  onComplete 
}: AlignableCanvasTryOnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [alignmentPoints, setAlignmentPoints] = useState<TryOnPoint[]>([])
  const [currentStep, setCurrentStep] = useState<'user' | 'clothing' | 'processing'>('user')
  
  // 三點鎖定：左肩、右肩、領口中心
  const requiredPoints = [
    { label: '左肩點', key: 'leftShoulder' },
    { label: '右肩點', key: 'rightShoulder' }, 
    { label: '領口中心', key: 'neckCenter' }
  ]

  useEffect(() => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 載入用戶照片
    const userImg = new Image()
    userImg.crossOrigin = 'anonymous'
    userImg.onload = () => {
      canvas.width = userImg.width
      canvas.height = userImg.height
      ctx.drawImage(userImg, 0, 0)
      
      // 繪製已標記的點
      drawAlignmentPoints(ctx)
    }
    userImg.src = userPhoto
  }, [userPhoto, alignmentPoints])

  const drawAlignmentPoints = (ctx: CanvasRenderingContext2D) => {
    alignmentPoints.forEach((point, index) => {
      // 繪製標記點
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI)
      ctx.fill()
      
      // 繪製標籤
      ctx.fillStyle = '#ffffff'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(`${index + 1}`, point.x, point.y + 5)
      
      // 繪製說明文字
      ctx.fillStyle = '#1f2937'
      ctx.fillText(point.label, point.x, point.y - 15)
    })
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentStep !== 'user' || alignmentPoints.length >= 3) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY
    
    const newPoint: TryOnPoint = {
      x,
      y,
      label: requiredPoints[alignmentPoints.length].label
    }
    
    setAlignmentPoints(prev => [...prev, newPoint])
  }

  const startTryOn = async () => {
    if (alignmentPoints.length !== 3) {
      alert('請先標記三個對齊點！')
      return
    }
    
    setIsLoading(true)
    setCurrentStep('processing')
    
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    
    try {
      // 載入服裝圖片
      const clothingImg = new Image()
      clothingImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        clothingImg.onload = resolve
        clothingImg.onerror = reject
        clothingImg.src = clothingImage
      })
      
      // 計算服裝放置位置和縮放
      const leftShoulder = alignmentPoints[0]
      const rightShoulder = alignmentPoints[1] 
      const neckCenter = alignmentPoints[2]
      
      // 計算肩寬
      const shoulderWidth = Math.sqrt(
        Math.pow(rightShoulder.x - leftShoulder.x, 2) + 
        Math.pow(rightShoulder.y - leftShoulder.y, 2)
      )
      
      // 根據shoulderPx參數計算縮放比例
      const scale = shoulderWidth / shoulderPx
      
      // 計算服裝中心位置
      const clothingCenterX = (leftShoulder.x + rightShoulder.x) / 2
      const clothingCenterY = neckCenter.y
      
      // 計算旋轉角度（根據肩膀傾斜度）
      const shoulderAngle = Math.atan2(
        rightShoulder.y - leftShoulder.y,
        rightShoulder.x - leftShoulder.x
      )
      
      // 清除畫布重新繪製
      const userImg = new Image()
      userImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve) => {
        userImg.onload = resolve
        userImg.src = userPhoto
      })
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(userImg, 0, 0)
      
      // 應用變換並繪製服裝
      ctx.save()
      ctx.translate(clothingCenterX, clothingCenterY)
      ctx.rotate(shoulderAngle)
      ctx.scale(scale, scale)
      
      // 以服裝中心為原點繪製
      ctx.drawImage(
        clothingImg,
        -clothingImg.width / 2,
        -clothingImg.height / 4 // 稍微向上偏移，讓領口對齊
      )
      
      ctx.restore()
      
      // 輸出結果
      const resultDataURL = canvas.toDataURL('image/png', 0.9)
      onComplete(resultDataURL)
      
    } catch (error) {
      console.error('合成錯誤:', error)
      alert('合成失敗，請重試')
    } finally {
      setIsLoading(false)
    }
  }
  
  const resetPoints = () => {
    setAlignmentPoints([])
    setCurrentStep('user')
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-center">
        🎯 三點鎖定試穿系統
      </h3>
      
      {/* 步驟指示 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        {currentStep === 'user' && (
          <div>
            <p className="text-sm text-blue-800 mb-2">
              <strong>步驟 {alignmentPoints.length + 1}/3:</strong> 
              點擊照片標記 {requiredPoints[alignmentPoints.length]?.label}
            </p>
            <div className="text-xs text-blue-600">
              {alignmentPoints.length < 3 ? 
                `剩餘 ${3 - alignmentPoints.length} 個標記點` : 
                '標記完成！點擊開始合成'
              }
            </div>
          </div>
        )}
        
        {currentStep === 'processing' && (
          <p className="text-sm text-blue-800">
            🔄 正在進行智能合成...
          </p>
        )}
      </div>
      
      {/* Canvas 區域 */}
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="max-w-full h-auto cursor-crosshair"
          style={{ display: 'block', margin: '0 auto' }}
        />
        
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-700">AI 智能合成中...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* 控制按鈕 */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={resetPoints}
          disabled={isLoading}
          className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          重新標記
        </button>
        
        <button
          onClick={startTryOn}
          disabled={alignmentPoints.length !== 3 || isLoading}
          className="flex-1 py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '合成中...' : '開始合成'}
        </button>
      </div>
      
      {/* 說明文字 */}
      <div className="mt-3 text-xs text-gray-500 text-center">
        💡 準確標記三個點可以獲得最佳的試穿效果
      </div>
    </div>
  )
}