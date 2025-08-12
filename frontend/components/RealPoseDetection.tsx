'use client'

import { useRef, useEffect, useState } from 'react'

interface PoseDetectionProps {
  imageData: string
  onPoseDetected: (poses: any) => void
}

export default function RealPoseDetection({ imageData, onPoseDetected }: PoseDetectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [poseResults, setPoseResults] = useState<any>(null)

  useEffect(() => {
    if (imageData) {
      detectPoseWithMediaPipe()
    }
  }, [imageData])

  const detectPoseWithMediaPipe = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // 動態導入 MediaPipe
      const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision')

      console.log('🤖 初始化 MediaPipe...')

      // 初始化 MediaPipe
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      )

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
        },
        runningMode: "IMAGE",
        numPoses: 1
      })

      console.log('✅ MediaPipe 初始化成功')

      // 創建圖片元素
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageData
      })

      console.log('📷 圖片載入成功，開始姿態檢測...')

      // 執行姿態檢測
      const startTime = performance.now()
      const detectionResult = await poseLandmarker.detect(img)
      const processingTime = performance.now() - startTime

      console.log('🎯 檢測完成:', detectionResult)

      if (detectionResult.landmarks && detectionResult.landmarks.length > 0) {
        const landmarks = detectionResult.landmarks[0]
        
        // 轉換為我們需要的格式
        const poseData = {
          landmarks: landmarks.map((landmark, index) => ({
            x: landmark.x * img.width,
            y: landmark.y * img.height,
            z: landmark.z,
            visibility: landmark.visibility || 1,
            name: getBodyPart(index)
          })),
          worldLandmarks: detectionResult.worldLandmarks?.[0] || [],
          processingTime: Math.round(processingTime),
          confidence: calculateAverageVisibility(landmarks),
          imageSize: {
            width: img.width,
            height: img.height
          }
        }

        setPoseResults(poseData)
        onPoseDetected(poseData)

        // 繪製結果
        drawPoseOnCanvas(img, poseData)

      } else {
        throw new Error('未檢測到人體姿態')
      }

    } catch (err: any) {
      console.error('❌ MediaPipe 錯誤:', err)
      setError(err.message || '姿態檢測失敗')
    } finally {
      setIsLoading(false)
    }
  }

  const drawPoseOnCanvas = (img: HTMLImageElement, poseData: any) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = img.width
    canvas.height = img.height

    // 繪製原圖
    ctx.drawImage(img, 0, 0)

    // 繪製關鍵點
    ctx.fillStyle = '#00ff00'
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 2

    poseData.landmarks.forEach((landmark: any, index: number) => {
      if (landmark.visibility > 0.5) {
        // 繪製關鍵點
        ctx.beginPath()
        ctx.arc(landmark.x, landmark.y, 8, 0, 2 * Math.PI)
        ctx.fill()

        // 繪製標籤
        ctx.fillStyle = '#ffffff'
        ctx.font = '12px Arial'
        ctx.fillText(landmark.name, landmark.x + 10, landmark.y - 10)
        ctx.fillStyle = '#00ff00'
      }
    })

    // 繪製骨架連線
    drawPoseConnections(ctx, poseData.landmarks)
  }

  const drawPoseConnections = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    const connections = [
      [11, 12], [11, 13], [12, 14], [13, 15], [14, 16], // 手臂
      [11, 23], [12, 24], [23, 24], // 身體
      [23, 25], [24, 26], [25, 27], [26, 28] // 腿部
    ]

    ctx.strokeStyle = '#ff0000'
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start]
      const endPoint = landmarks[end]
      
      if (startPoint?.visibility > 0.5 && endPoint?.visibility > 0.5) {
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()
      }
    })
  }

  const getBodyPart = (index: number): string => {
    const bodyParts = [
      'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
      'right_eye_inner', 'right_eye', 'right_eye_outer',
      'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
      'left_index', 'right_index', 'left_thumb', 'right_thumb',
      'left_hip', 'right_hip', 'left_knee', 'right_knee',
      'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
      'left_foot_index', 'right_foot_index'
    ]
    return bodyParts[index] || `landmark_${index}`
  }

  const calculateAverageVisibility = (landmarks: any[]): number => {
    const visibleLandmarks = landmarks.filter(l => l.visibility > 0.5)
    return visibleLandmarks.length / landmarks.length
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">🤖 真正的 MediaPipe 姿態檢測</h3>
      
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span>AI 姿態檢測中...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {poseResults && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✅ 檢測成功!</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>關鍵點數量: {poseResults.landmarks.length}</p>
            <p>平均可見度: {(poseResults.confidence * 100).toFixed(1)}%</p>
            <p>處理時間: {poseResults.processingTime}ms</p>
            <p>圖片尺寸: {poseResults.imageSize.width}×{poseResults.imageSize.height}</p>
          </div>
        </div>
      )}

      <canvas 
        ref={canvasRef}
        className="max-w-full h-auto border border-gray-300 rounded-lg"
        style={{ display: poseResults ? 'block' : 'none' }}
      />
    </div>
  )
}