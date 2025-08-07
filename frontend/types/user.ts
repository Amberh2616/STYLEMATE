export interface StylePreference {
  styles: string[]           // ['kpop', 'casual', 'formal', 'school']
  photo: File               // 用戶全身照片
  height: number            // 身高 (cm)
  bodyType: string          // 體型偏好
}

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  phone?: string
  birthDate?: string
  gender?: 'male' | 'female' | 'other'
  preferences?: UserPreferences
  addresses?: Address[]
  stats?: UserStats
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  styles: string[]
  colors: string[]
  priceRange: {
    min: number
    max: number
  }
  sizes: string[]
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface Address {
  id: string
  name: string
  isDefault: boolean
  recipient: string
  phone: string
  address: string
  postalCode: string
  city: string
  district: string
}

export interface UserStats {
  totalOrders: number
  totalSpent: number
  favoriteProducts: number
  tryonCount: number
}