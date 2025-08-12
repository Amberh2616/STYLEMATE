export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: 'dress' | 'top' | 'bottom' | 'outer' | 'set'
  style: 'sweet' | 'elegant' | 'street' | 'casual'
  description: string
  rating: number
  reviews: number
  isNew?: boolean
  isSale?: boolean
  colors?: string[]
  sizes?: string[]
  
  // 新增標籤系統
  tags: string[]
  aiMetadata: {
    occasion: string[]
    season: string[]
    features: string[]
    material?: string
    fit?: string
  }
}

export const products: Product[] = [
  {
    id: 'dress1',
    name: '韓式優雅連身裙',
    price: 1299,
    originalPrice: 1699,
    image: '/images/products/dress1.jpg',
    category: 'dress',
    style: 'elegant',
    description: '優雅時尚的韓式連身裙，展現女性魅力。採用優質面料，版型修身顯瘦，適合約會和正式場合穿搭。',
    rating: 4.8,
    reviews: 124,
    isNew: true,
    isSale: true,
    colors: ['黑色', '藏青色', '酒紅色'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['韓系', '優雅', '約會', '正式', '顯瘦'],
    aiMetadata: {
      occasion: ['date', 'formal', 'work'],
      season: ['spring', 'summer', 'autumn'],
      features: ['slim_fit', 'elegant', 'versatile'],
      material: '聚酯纖維',
      fit: '修身'
    }
  },
  {
    id: 'dress2',
    name: '清新花朵印花洋裝',
    price: 1199,
    image: '/images/products/dress2.jpg',
    category: 'dress',
    style: 'sweet',
    description: '甜美清新的花朵印花設計，春夏必備單品。輕薄透氣的面料，舒適好穿，展現青春活力。',
    rating: 4.6,
    reviews: 89,
    isNew: true,
    colors: ['粉色', '白色', '淺藍色'],
    sizes: ['S', 'M', 'L'],
    tags: ['甜美', '花朵', '春夏', '透氣', '青春'],
    aiMetadata: {
      occasion: ['casual', 'date', 'party'],
      season: ['spring', 'summer'],
      features: ['breathable', 'comfortable', 'sweet'],
      material: '雪紡',
      fit: '寬鬆'
    }
  },
  {
    id: 'dress3',
    name: '簡約韓風長裙',
    price: 1399,
    image: '/images/products/dress3.jpg',
    category: 'dress',
    style: 'elegant',
    description: '簡約大方的韓式長裙，優雅知性。經典版型設計，適合各種正式場合，展現專業女性魅力。',
    rating: 4.7,
    reviews: 156,
    colors: ['黑色', '灰色', '米色'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['韓系', '簡約', '知性', '正式', '專業'],
    aiMetadata: {
      occasion: ['work', 'formal', 'date'],
      season: ['autumn', 'winter', 'spring'],
      features: ['elegant', 'professional', 'versatile'],
      material: '混紡',
      fit: '直筒'
    }
  },
  {
    id: 'top1',
    name: '韓系休閒上衣',
    price: 799,
    originalPrice: 999,
    image: '/images/products/top1.jpg',
    category: 'top',
    style: 'casual',
    description: '舒適百搭的休閒上衣，日常穿搭首選。寬鬆版型設計，舒適自在，搭配各種下裝都很好看。',
    rating: 4.5,
    reviews: 67,
    isSale: true,
    colors: ['白色', '粉色', '淺灰色'],
    sizes: ['S', 'M', 'L'],
    tags: ['韓系', '休閒', '百搭', '舒適', '日常'],
    aiMetadata: {
      occasion: ['casual', 'daily'],
      season: ['spring', 'summer', 'autumn'],
      features: ['comfortable', 'versatile', 'relaxed'],
      material: '棉質',
      fit: '寬鬆'
    }
  },
  {
    id: 'top2',
    name: '時尚針織衫',
    price: 899,
    image: '/images/products/top2.jpg',
    category: 'top',
    style: 'elegant',
    description: '柔軟舒適的針織衫，溫暖又時尚。精選優質針織面料，手感柔滑，適合秋冬穿搭。',
    rating: 4.9,
    reviews: 203,
    colors: ['米白色', '淺灰色', '駝色'],
    sizes: ['S', 'M', 'L'],
    tags: ['針織', '時尚', '溫暖', '秋冬', '柔軟'],
    aiMetadata: {
      occasion: ['casual', 'work', 'date'],
      season: ['autumn', 'winter'],
      features: ['warm', 'soft', 'comfortable'],
      material: '針織',
      fit: '合身'
    }
  },
  {
    id: 'skirt1',
    name: '韓式A字裙',
    price: 699,
    originalPrice: 899,
    image: '/images/products/skirt1.jpg',
    category: 'bottom',
    style: 'sweet',
    description: '經典A字剪裁，修飾身形完美。高腰設計顯腿長，百搭又實用，是衣櫥必備單品。',
    rating: 4.6,
    reviews: 78,
    isSale: true,
    colors: ['黑色', '卡其色', '粉色'],
    sizes: ['S', 'M', 'L'],
    tags: ['A字裙', '顯瘦', '百搭', '高腰', '甜美'],
    aiMetadata: {
      occasion: ['casual', 'date', 'work'],
      season: ['spring', 'summer', 'autumn'],
      features: ['slim_fit', 'versatile', 'leg_lengthening'],
      material: '棉質混紡',
      fit: '高腰'
    }
  },
  {
    id: 'tshirt1',
    name: 'Sweet Heart 印花T恤',
    price: 599,
    image: '/images/products/tshirt1.jpg',
    category: 'top',
    style: 'sweet',
    description: '可愛Sweet Heart印花設計，青春活力的T恤。多色可選，舒適棉質面料，是夏日必備單品。',
    rating: 4.7,
    reviews: 145,
    isNew: true,
    colors: ['粉色', '白色', '黑色'],
    sizes: ['S', 'M', 'L'],
    tags: ['印花', '可愛', '青春', '夏日', '棉質'],
    aiMetadata: {
      occasion: ['casual', 'daily', 'street'],
      season: ['spring', 'summer'],
      features: ['cute', 'comfortable', 'trendy'],
      material: '純棉',
      fit: '寬鬆'
    }
  },
  {
    id: 'casual1',
    name: '韓系休閒套裝',
    price: 1299,
    image: '/images/products/casual1.jpg',
    category: 'set',
    style: 'casual',
    description: '簡約韓系休閒套裝，上衣+短褲的完美組合。舒適面料，輕鬆穿搭，展現自然休閒風格。',
    rating: 4.4,
    reviews: 92,
    colors: ['深藍色', '淺藍色'],
    sizes: ['S', 'M', 'L'],
    tags: ['套裝', '韓系', '休閒', '舒適', '簡約'],
    aiMetadata: {
      occasion: ['casual', 'daily', 'weekend'],
      season: ['summer', 'spring'],
      features: ['comfortable', 'set', 'easy_wear'],
      material: '棉質',
      fit: '寬鬆'
    }
  },
  {
    id: 'casual2',
    name: '文青風格套裝',
    price: 1199,
    originalPrice: 1399,
    image: '/images/products/casual2.jpg',
    category: 'set',
    style: 'casual',
    description: '清新文青風格套裝，白色上衣搭配卡其短褲。簡約舒適的設計，適合日常和輕鬆場合。',
    rating: 4.5,
    reviews: 86,
    isSale: true,
    colors: ['白+卡其', '白+黑', '米+棕'],
    sizes: ['S', 'M', 'L'],
    tags: ['文青', '清新', '套裝', '簡約', '日常'],
    aiMetadata: {
      occasion: ['casual', 'daily', 'cafe'],
      season: ['spring', 'summer', 'autumn'],
      features: ['fresh', 'comfortable', 'minimalist'],
      material: '棉麻混紡',
      fit: '寬鬆'
    }
  }
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id)
}

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products
  return products.filter(product => product.category === category)
}

export const getProductsByStyle = (style: string): Product[] => {
  if (style === 'all') return products
  return products.filter(product => product.style === style)
}

export const getRelatedProducts = (productId: string, limit: number = 4): Product[] => {
  const currentProduct = getProductById(productId)
  if (!currentProduct) return []
  
  return products
    .filter(p => p.id !== productId && (p.category === currentProduct.category || p.style === currentProduct.style))
    .slice(0, limit)
}