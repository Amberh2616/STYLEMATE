'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import PhotoUpload from './PhotoUpload'
import { StylePreference } from '@/types/user'

// Zod 驗證 schema
const styleFormSchema = z.object({
  styles: z.array(z.string()).min(1, '請至少選擇一種風格'),
  photo: z.instanceof(File, { message: '請上傳照片' }),
  height: z.number().min(100, '身高應該在 100-220 cm 之間').max(220),
  bodyType: z.string().min(1, '請選擇體型'),
})

const STYLE_OPTIONS = [
  { value: 'kpop', label: 'K-pop 風格', emoji: '🎤', description: '時尚前衛，充滿個性' },
  { value: 'casual', label: '日常韓系', emoji: '👕', description: '舒適自然，輕鬆穿搭' },
  { value: 'formal', label: '正式場合', emoji: '👔', description: '優雅大方，職場必備' },
  { value: 'school', label: '清新學院風', emoji: '🎓', description: '青春活潑，學生風格' },
]

const BODY_TYPES = [
  { value: 'slim', label: '纖細型' },
  { value: 'average', label: '標準型' },
  { value: 'curvy', label: '豐滿型' },
  { value: 'athletic', label: '運動型' },
]

interface StyleFormProps {
  onSubmit: (data: StylePreference) => void
  isLoading?: boolean
}

export default function StyleForm({ onSubmit, isLoading = false }: StyleFormProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StylePreference>({
    resolver: zodResolver(styleFormSchema),
    defaultValues: {
      styles: [],
      height: 165,
      bodyType: '',
    },
  })

  const selectedStyles = watch('styles') || []

  const handleStyleToggle = (styleValue: string) => {
    const newStyles = selectedStyles.includes(styleValue)
      ? selectedStyles.filter(s => s !== styleValue)
      : [...selectedStyles, styleValue]
    setValue('styles', newStyles)
  }

  const handlePhotoUpload = (file: File) => {
    setSelectedPhoto(file)
    setValue('photo', file)
  }

  const onFormSubmit = (data: StylePreference) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
      {/* 風格偏好選擇 */}
      <div>
        <h3 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center">
          🎯 選擇你的風格偏好
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STYLE_OPTIONS.map((option) => (
            <div
              key={option.value}
              className={`
                border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                ${
                  selectedStyles.includes(option.value)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-light bg-white hover:border-primary-300'
                }
              `}
              onClick={() => handleStyleToggle(option.value)}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-dark">{option.label}</h4>
                  <p className="text-sm text-secondary-600 mt-1">{option.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={`
                      w-5 h-5 rounded border-2 transition-all duration-200
                      ${
                        selectedStyles.includes(option.value)
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-neutral-medium bg-white'
                      }
                    `}
                  >
                    {selectedStyles.includes(option.value) && (
                      <svg
                        className="w-full h-full text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.styles && (
          <p className="text-error text-sm mt-2">{errors.styles.message}</p>
        )}
      </div>

      {/* 照片上傳 */}
      <div>
        <h3 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center">
          📸 上傳你的全身照片
        </h3>
        <PhotoUpload
          onUpload={handlePhotoUpload}
          currentFile={selectedPhoto}
        />
        {errors.photo && (
          <p className="text-error text-sm mt-2">{errors.photo.message}</p>
        )}
        <p className="text-sm text-secondary-600 mt-3">
          💡 建議：請上傳正面、良好光線、清晰背景的全身照片，以獲得最佳試穿效果
        </p>
      </div>

      {/* 基本資訊 */}
      <div>
        <h3 className="text-xl font-semibold text-neutral-dark mb-4 flex items-center">
          👤 基本資訊
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 身高 */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-neutral-dark mb-2">
              身高 (cm)
            </label>
            <input
              type="number"
              id="height"
              {...register('height', { valueAsNumber: true })}
              className="input"
              placeholder="165"
              min="100"
              max="220"
            />
            {errors.height && (
              <p className="text-error text-sm mt-1">{errors.height.message}</p>
            )}
          </div>

          {/* 體型 */}
          <div>
            <label htmlFor="bodyType" className="block text-sm font-medium text-neutral-dark mb-2">
              體型偏好
            </label>
            <select
              id="bodyType"
              {...register('bodyType')}
              className="input"
            >
              <option value="">請選擇體型</option>
              {BODY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.bodyType && (
              <p className="text-error text-sm mt-1">{errors.bodyType.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 提交按鈕 */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full btn-primary text-lg py-4 relative
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="loading-heart mr-3"></div>
              <span>分析中...</span>
            </div>
          ) : (
            <span>🚀 開始虛擬試穿</span>
          )}
        </button>
      </div>
    </form>
  )
}