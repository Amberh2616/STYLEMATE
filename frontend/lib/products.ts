export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: 'dress' | 'top' | 'bottom' | 'outer'
  style: 'sweet' | 'elegant' | 'street'
  description: string
  rating: number
  reviews: number
  isNew?: boolean
  isSale?: boolean
  colors?: string[]
  sizes?: string[]
}

export const products: Product[] = [
  {
    id: '1',
    name: '韓式甜美花朵印花洋裝',
    price: 1299,
    originalPrice: 1699,
    image: '/images/dress-1.jpg',
    category: 'dress',
    style: 'sweet',
    description: '甜美可愛的花朵印花洋裝，輕薄透氣的面料，適合春夏穿搭。採用優質雪紡材質，版型修身顯瘦，是約會和日常穿搭的完美選擇。',
    rating: 4.8,
    reviews: 124,
    isNew: true,
    isSale: true,
    colors: ['粉色', '白色', '淺藍色'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '2',
    name: '優雅V領職場襯衫',
    price: 899,
    image: '/images/shirt-1.jpg',
    category: 'top',
    style: 'elegant',
    description: '簡約優雅的V領襯衫，職場必備單品。採用高品質棉質面料，透氣舒適，剪裁合身不緊繃，展現專業氣質。',
    rating: 4.6,
    reviews: 89,
    colors: ['白色', '淺灰色', '淡粉色'],
    sizes: ['S', 'M', 'L']
  },
  {
    id: '3',
    name: '街頭風格寬鬆牛仔外套',
    price: 1899,
    image: '/images/jacket-1.jpg',
    category: 'outer',
    style: 'street',
    description: '復古寬鬆版型牛仔外套，街頭風格首選。經典水洗工藝，質感十足，可內搭各種上衣，輕鬆打造時尚造型。',
    rating: 4.7,
    reviews: 156,
    isNew: true,
    colors: ['經典藍', '水洗藍', '淺藍色'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '4',
    name: '高腰A字短裙',
    price: 699,
    originalPrice: 899,
    image: '/images/skirt-1.jpg',
    category: 'bottom',
    style: 'sweet',
    description: '顯瘦高腰設計A字短裙，甜美可愛。採用彈性面料，穿著舒適，A字版型修飾腿型，是春夏必備單品。',
    rating: 4.5,
    reviews: 67,
    isSale: true,
    colors: ['黑色', '卡其色', '粉色'],
    sizes: ['S', 'M', 'L']
  },
  {
    id: '5',
    name: '韓系簡約針織上衣',
    price: 799,
    image: '/images/knit-1.jpg',
    category: 'top',
    style: 'elegant',
    description: '柔軟舒適的針織上衣，簡約百搭。精選優質針織面料，手感柔滑，版型寬鬆舒適，適合各種場合穿搭。',
    rating: 4.9,
    reviews: 203,
    colors: ['米白色', '淺灰色', '駝色'],
    sizes: ['S', 'M', 'L']
  },
  {
    id: '6',
    name: '個性破洞牛仔褲',
    price: 1299,
    image: '/images/jeans-1.jpg',
    category: 'bottom',
    style: 'street',
    description: '時尚破洞設計牛仔褲，展現個性風格。採用彈性牛仔布，修身版型，破洞設計增添時尚感，街頭風格必備。',
    rating: 4.4,
    reviews: 92,
    colors: ['深藍色', '淺藍色'],
    sizes: ['S', 'M', 'L', 'XL']
  },
  {
    id: '7',
    name: '溫柔系毛衣外套',
    price: 1599,
    image: '/images/cardigan-1.jpg',
    category: 'outer',
    style: 'elegant',
    description: '溫柔優雅的毛衣外套，柔軟親膚。精選高品質毛線編織，保暖性佳，開衫設計方便穿脱，是秋冬穿搭的完美選擇。',
    rating: 4.7,
    reviews: 134,
    isNew: true,
    colors: ['米白色', '淺粉色', '淺灰色'],
    sizes: ['S', 'M', 'L']
  },
  {
    id: '8',
    name: '復古格紋百褶裙',
    price: 899,
    originalPrice: 1199,
    image: '/images/plaid-skirt-1.jpg',
    category: 'bottom',
    style: 'sweet',
    description: '經典格紋百褶裙，復古甜美風格。採用優質面料，百褶設計增添靈動感，搭配各種上衣都很好看。',
    rating: 4.6,
    reviews: 78,
    isSale: true,
    colors: ['經典格紋', '棕色格紋'],
    sizes: ['S', 'M', 'L']
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