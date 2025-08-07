export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  images: ProductImage[]
  category: string
  subcategory: string
  brand: Brand
  colors: string[]
  sizes: ProductSize[]
  materials: string[]
  careInstructions?: string[]
  rating: number
  reviewCount: number
  reviews?: Review[]
  tags: string[]
  inStock: boolean
  stockCount: number
  isNew: boolean
  isBestseller: boolean
  relatedProducts?: string[]
  sizeChart?: SizeChart
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  url: string
  alt: string
  isPrimary: boolean
}

export interface ProductSize {
  value: string
  measurements: {
    chest?: number
    waist?: number
    hip?: number
    length?: number
  }
  inStock: boolean
}

export interface Brand {
  id: string
  name: string
  logo: string
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  images?: string[]
  createdAt: string
}

export interface SizeChart {
  imageUrl: string
  measurements: any[]
}

export interface ProductFilters {
  category?: string
  style?: string
  color?: string
  brand?: string
  priceMin?: number
  priceMax?: number
  size?: string
  page?: number
  limit?: number
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'newest' | 'rating'
}

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  size: string
  color: string
  subtotal: number
  addedAt: string
}

export interface TryOnResult {
  id: string
  resultUrl: string
  thumbnailUrl: string
  userPhotoUrl: string
  productId: string
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