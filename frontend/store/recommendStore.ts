// frontend/store/recommendStore.ts
// Chat → Studio 跨頁面共享推薦商品

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Django 商品結構
export interface RecommendedProduct {
  id: number
  name: string
  price: string
  category: string
  style: string
  image: string        // 原圖
  image_nobg: string   // 去背圖
  tags: string[]
  colors: string[]
}

interface RecommendStore {
  // 推薦商品列表
  recommendedProducts: RecommendedProduct[]
  setRecommendedProducts: (products: RecommendedProduct[]) => void
  clearRecommendedProducts: () => void

  // 來源 prompt
  sourcePrompt: string
  setSourcePrompt: (prompt: string) => void
}

export const useRecommendStore = create<RecommendStore>()(
  persist(
    (set) => ({
      recommendedProducts: [],
      sourcePrompt: '',

      setRecommendedProducts: (products) => set({ recommendedProducts: products }),
      clearRecommendedProducts: () => set({ recommendedProducts: [], sourcePrompt: '' }),
      setSourcePrompt: (prompt) => set({ sourcePrompt: prompt }),
    }),
    {
      name: 'be27-recommend-storage',
    }
  )
)
