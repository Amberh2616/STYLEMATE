// 商品標籤系統類型定義

export interface ProductTag {
  id: string
  name: string
  category: 'occasion' | 'season' | 'style' | 'feature' | 'color' | 'size'
  color: string // Tailwind CSS 顏色類名
  description?: string
}

export interface TaggedProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: 'dress' | 'top' | 'bottom' | 'outer' | 'set'
  description: string
  rating: number
  reviews: number
  isNew?: boolean
  isSale?: boolean
  
  // AI 可讀取的標籤資料
  tags: ProductTag[]
  aiMetadata: {
    style: string[]
    occasion: string[]
    season: string[]
    features: string[]
    colors: string[]
    sizes: string[]
    material?: string
    fit?: string
    target_age?: string
    price_range?: string
  }
}

// 預定義標籤庫
export const TAG_LIBRARY: Record<string, ProductTag[]> = {
  occasion: [
    { id: 'casual', name: '日常', category: 'occasion', color: 'bg-blue-100 text-blue-800', description: '適合日常穿搭' },
    { id: 'date', name: '約會', category: 'occasion', color: 'bg-pink-100 text-pink-800', description: '浪漫約會場合' },
    { id: 'work', name: '上班', category: 'occasion', color: 'bg-gray-100 text-gray-800', description: '職場專業形象' },
    { id: 'party', name: '派對', category: 'occasion', color: 'bg-purple-100 text-purple-800', description: '聚會派對' },
    { id: 'formal', name: '正式', category: 'occasion', color: 'bg-indigo-100 text-indigo-800', description: '正式場合' },
  ],
  
  season: [
    { id: 'spring', name: '春', category: 'season', color: 'bg-green-100 text-green-800' },
    { id: 'summer', name: '夏', category: 'season', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'autumn', name: '秋', category: 'season', color: 'bg-orange-100 text-orange-800' },
    { id: 'winter', name: '冬', category: 'season', color: 'bg-cyan-100 text-cyan-800' },
  ],
  
  style: [
    { id: 'korean', name: '韓系', category: 'style', color: 'bg-red-100 text-red-800' },
    { id: 'sweet', name: '甜美', category: 'style', color: 'bg-pink-100 text-pink-800' },
    { id: 'elegant', name: '優雅', category: 'style', color: 'bg-violet-100 text-violet-800' },
    { id: 'casual', name: '休閒', category: 'style', color: 'bg-blue-100 text-blue-800' },
    { id: 'street', name: '街頭', category: 'style', color: 'bg-gray-100 text-gray-800' },
    { id: 'vintage', name: '復古', category: 'style', color: 'bg-amber-100 text-amber-800' },
  ],
  
  features: [
    { id: 'slim_fit', name: '顯瘦', category: 'feature', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'versatile', name: '百搭', category: 'feature', color: 'bg-teal-100 text-teal-800' },
    { id: 'comfortable', name: '舒適', category: 'feature', color: 'bg-green-100 text-green-800' },
    { id: 'trendy', name: '時尚', category: 'feature', color: 'bg-purple-100 text-purple-800' },
    { id: 'breathable', name: '透氣', category: 'feature', color: 'bg-sky-100 text-sky-800' },
    { id: 'warm', name: '保暖', category: 'feature', color: 'bg-orange-100 text-orange-800' },
  ],
}

// AI 標籤生成提示詞
export const AI_TAGGING_PROMPT = `
請根據以下商品資訊自動生成適合的標籤：

商品名稱：{productName}
商品描述：{productDescription}
商品類別：{productCategory}
商品圖片：{productImage}

請從以下標籤庫中選擇最適合的標籤，並說明選擇理由：

場合標籤：日常、約會、上班、派對、正式
季節標籤：春、夏、秋、冬
風格標籤：韓系、甜美、優雅、休閒、街頭、復古
特色標籤：顯瘦、百搭、舒適、時尚、透氣、保暖

輸出格式：
{
  "tags": ["標籤1", "標籤2", ...],
  "reasoning": "選擇理由",
  "target_customer": "目標客群",
  "styling_tips": "穿搭建議"
}
`