// 通用 API 響應格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  timestamp: string
  requestId: string
}

// 錯誤響應格式
export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: string
  }
  timestamp: string
  requestId: string
}

// 分頁響應
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 認證相關
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  preferences?: {
    styles: string[]
    notifications: boolean
  }
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    name: string
    createdAt: string
  }
  token: string
  refreshToken: string
}

// 推薦相關
export interface RecommendationRequest {
  photo: File
  styles: string[]
  height: number
  bodyType: string
  preferences?: {
    colors: string[]
    categories: string[]
    priceRange: {
      min: number
      max: number
    }
  }
}

export interface RecommendationResponse {
  recommendationId: string
  userPhotoUrl: string
  processedPhotoUrl: string
  recommendations: RecommendationItem[]
  totalCount: number
  processingTime: number
}

export interface RecommendationItem {
  productId: string
  score: number
  matchReason: string
  product: any // Product type
}

// 虛擬試穿相關
export interface VirtualTryOnRequest {
  userPhotoUrl: string
  productId: string
  options?: {
    quality: 'low' | 'medium' | 'high'
    outputFormat: 'jpeg' | 'png' | 'webp'
    adjustments?: {
      position: { x: number; y: number }
      scale: number
      rotation: number
    }
  }
}

export interface VirtualTryOnResponse {
  tryonId: string
  resultUrl: string
  thumbnailUrl: string
  processingTime: number
  quality: string
  dimensions: {
    width: number
    height: number
  }
  metadata: {
    userPhotoUrl: string
    productId: string
    createdAt: string
  }
}

// 訂單相關
export interface OrderData {
  shippingAddress: {
    name: string
    phone: string
    address: string
    postalCode: string
    city: string
    district: string
  }
  billingAddress?: {
    name: string
    phone: string
    address: string
    postalCode: string
    city: string
    district: string
  }
  paymentMethod: 'credit_card' | 'bank_transfer'
  paymentDetails: {
    cardToken?: string
  }
  notes?: string
  couponCode?: string
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending_payment' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  items: any[] // CartItem type
  customer: {
    id: string
    name: string
    email: string
  }
  shippingAddress: any
  billingAddress: any
  summary: {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    total: number
  }
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  shippingStatus: 'preparing' | 'shipped' | 'delivered'
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
}

// 文件上傳相關
export interface FileUploadRequest {
  file: File
  type: 'user_photo' | 'product_image' | 'review_image'
  resize?: {
    width: number
    height: number
    quality: number
  }
}

export interface FileUploadResponse {
  fileId: string
  originalUrl: string
  processedUrl: string
  thumbnailUrl: string
  metadata: {
    filename: string
    size: number
    mimeType: string
    dimensions: {
      width: number
      height: number
    }
  }
  uploadedAt: string
}