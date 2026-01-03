/**
 * Django Backend API Service
 * 連接 BE27 Django 後端
 */

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/v1'

export interface DjangoProduct {
  id: number
  name: string
  sku: string | null
  price: string
  original_price: string | null
  category: string
  description: string
  composition: string
  care_instructions: string
  size_info: string
  stock: number
  is_active: boolean
  image: string | null
  image_nobg: string | null
  tags: string[]
  colors: string[]
  occasion: string[]
  season: string[]
  style: string
  material: string
  sleeve: string
  length: string
  neckline: string
  fit: string
  color_temperature: string
  created_at: string
  updated_at: string
}

export interface ProductListResponse {
  count: number
  next: string | null
  previous: string | null
  results: DjangoProduct[]
}

/**
 * 取得所有商品
 */
export async function fetchProducts(params?: {
  category?: string
  style?: string
  is_active?: boolean
  page?: number
  page_size?: number
}): Promise<ProductListResponse> {
  // 如果有分類參數，使用 by_category 端點
  if (params?.category) {
    const response = await fetch(
      `${DJANGO_API_URL}/products/by_category/?category=${params.category}`,
      { cache: 'no-store' }
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }
    const results: DjangoProduct[] = await response.json()
    return {
      count: results.length,
      next: null,
      previous: null,
      results,
    }
  }

  // 無分類時取得所有商品
  const searchParams = new URLSearchParams()
  if (params?.style) searchParams.set('style', params.style)
  if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active))
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.page_size) searchParams.set('page_size', String(params.page_size))

  const url = `${DJANGO_API_URL}/products/?${searchParams.toString()}`

  const response = await fetch(url, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`)
  }

  return response.json()
}

/**
 * 取得單一商品
 */
export async function fetchProduct(id: number): Promise<DjangoProduct> {
  const response = await fetch(`${DJANGO_API_URL}/products/${id}/`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch product ${id}: ${response.status}`)
  }

  return response.json()
}

/**
 * 取得商品圖片完整 URL
 */
export function getImageUrl(imagePath: string | null): string {
  if (!imagePath) return '/images/placeholder.jpg'

  // 如果已經是完整 URL，直接返回
  if (imagePath.startsWith('http')) return imagePath

  // 組合 Django media URL
  const baseUrl = process.env.NEXT_PUBLIC_DJANGO_MEDIA_URL || 'http://localhost:8000/media/'
  return `${baseUrl}${imagePath}`
}

/**
 * 按分類取得商品
 */
export async function fetchProductsByCategory(category: string): Promise<DjangoProduct[]> {
  const response = await fetchProducts({ category, page_size: 100 })
  return response.results
}

/**
 * 取得所有分類的商品數量統計
 */
export async function fetchProductStats(): Promise<{
  total: number
  by_category: Record<string, number>
  with_nobg: number
  without_nobg: number
}> {
  const response = await fetch(`${DJANGO_API_URL}/products/stats/`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status}`)
  }

  return response.json()
}
