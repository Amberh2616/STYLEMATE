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
  // === DRESS 洋裝類 ===
  {
    id: 'set_sweet_pink_ruffle',
    name: 'Sweet Pink Ruffle Set 粉色荷葉邊套裝',
    price: 3480,
    originalPrice: 3980,
    image: '/picture/DRESS/01fffba5-6a65-4c1b-af4f-67d47667a05d.jpg',
    category: 'set',
    style: 'sweet',
    description: '甜美粉色荷葉邊兩件套裝，無袖荷葉邊上衣搭配修身開叉中長裙，完美展現女性優雅魅力，適合約會與聚會場合。',
    rating: 4.7,
    reviews: 89,
    isNew: true,
    colors: ['粉色', '淡粉色'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['甜美', '套裝', '荷葉邊', '粉色', '約會', '兩件式'],
    aiMetadata: {
      occasion: ['date', 'party', 'dinner'],
      season: ['spring', 'summer'],
      features: ['ruffle_detail', 'two_piece', 'slit_detail', 'sleeveless'],
      material: '雪紡混紡',
      fit: '修身'
    }
  },
  {
    id: 'dress_sweet_pink_midi',
    name: 'Asymmetric White Lace Dress 白色蕾絲洋裝',
    price: 3280,
    image: '/picture/DRESS/12eec23d-8257-4134-a6b6-5fadb037a87e.jpg',
    category: 'dress',
    style: 'elegant',
    description: '不對稱設計白色蕾絲洋裝，單肩造型，搭配蕾絲細節，優雅時尚。',
    rating: 4.6,
    reviews: 76,
    colors: ['白色', '純白'],
    sizes: ['S', 'M', 'L'],
    tags: ['優雅', '蕾絲', '不對稱', '單肩', '時尚'],
    aiMetadata: {
      occasion: ['party', 'date', 'formal'],
      season: ['spring', 'summer'],
      features: ['asymmetric', 'lace_detail', 'one_shoulder'],
      material: '蕾絲',
      fit: '修身',
      sleeve: '單肩',
      length: '膝上長度'
    }
  },
  {
    id: 'dress_minimalist_white_maxi',
    name: 'Off Shoulder Plaid Dress 格紋露肩洋裝',
    price: 4280,
    image: '/picture/DRESS/2171d7e6-cbdf-4bde-9551-a8272b668075.jpeg',
    category: 'dress',
    style: 'elegant',
    description: '灰色格紋露肩洋裝，荷葉邊袖設計，修身剪裁，都會優雅風格。',
    rating: 4.8,
    reviews: 132,
    isNew: true,
    isSale: true,
    colors: ['灰色', '格紋', '深灰'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['格紋', '露肩', '荷葉邊', '優雅', '都會'],
    aiMetadata: {
      occasion: ['work', 'date', 'formal'],
      season: ['spring', 'autumn'],
      features: ['off_shoulder', 'plaid_pattern', 'ruffle_sleeve'],
      material: '混紡',
      fit: '修身',
      sleeve: '露肩荷葉袖',
      length: '膝上長度'
    }
  },
  {
    id: 'top_basic_white_tee',
    name: 'Damascus Print Tee Collection T恤組合',
    price: 1480,
    image: '/picture/TOP/LINE_ALBUM__250808_78.jpg',
    category: 'top',
    style: 'casual',
    description: 'DAMASCUSY印花T恤，白色、淺灰、深灰三色選擇，休閒百搭款。',
    rating: 4.4,
    reviews: 256,
    colors: ['白色', '淺灰色', '深灰色'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['印花', '休閒', 'T恤', '圖案', '百搭'],
    aiMetadata: {
      occasion: ['daily', 'casual', 'trendy'],
      season: ['spring', 'summer', 'autumn'],
      features: ['printed', 'graphic', 'versatile'],
      material: '純棉',
      fit: '標準',
      sleeve: '短袖',
      length: '標準版'
    }
  },
  {
    id: 'top_casual_striped',
    name: 'Colorful Striped Knit Top 彩色條紋針織上衣',
    price: 1680,
    image: '/picture/TOP/條紋1.jpg',
    category: 'top',
    style: 'casual',
    description: '多色條紋針織上衣，藍黃、粉綠撞色設計，韓系甜美風格，春秋必備。',
    rating: 4.3,
    reviews: 189,
    colors: ['藍黃條紋', '粉綠條紋', '彩色條紋'],
    sizes: ['S', 'M', 'L'],
    tags: ['條紋', '針織', '撞色', '韓系', '甜美'],
    aiMetadata: {
      occasion: ['casual', 'sweet', 'daily'],
      season: ['spring', 'autumn'],
      features: ['striped', 'knit', 'colorful'],
      material: '針織',
      fit: '寬鬆',
      sleeve: '長袖',
      length: '標準版'
    }
  },
  {
    id: 'shorts_high_waisted_denim',
    name: 'Casual Two-Piece Set 休閒套裝組合',
    price: 1690,
    image: '/picture/PANTS/shorts/LINE_ALBUM_🪸七月 · 各種上衣🪸_250808_100.jpg',
    category: 'set',
    style: 'casual',
    description: '粉色字母上衣搭配白色休閒短褲，舒適寬鬆版型，日常居家首選。',
    rating: 4.5,
    reviews: 203,
    colors: ['粉色', '白色'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['套裝', '休閒', '字母', '舒適', '居家'],
    aiMetadata: {
      occasion: ['casual', 'home', 'daily'],
      season: ['spring', 'summer'],
      features: ['two_piece', 'letter_print', 'comfortable'],
      material: '純棉',
      fit: '寬鬆',
      sleeve: '短袖',
      length: '短版'
    }
  },
  {
    id: 'top_puff_sleeve',
    name: 'Off Shoulder Summer Set 夏日露肩套裝',
    price: 2380,
    image: '/images/products/top/puff_sleeve_top.jpeg',
    category: 'set',
    style: 'sweet',
    description: '橘色露肩泡泡袖上衣搭配白色短褲，度假風情，夏日清新搭配。',
    rating: 4.7,
    reviews: 145,
    isNew: true,
    colors: ['橘色', '白色'],
    sizes: ['S', 'M', 'L'],
    tags: ['露肩', '泡泡袖', '套裝', '度假', '清新'],
    aiMetadata: {
      occasion: ['vacation', 'summer', 'casual'],
      season: ['summer'],
      features: ['off_shoulder', 'puff_sleeve', 'two_piece'],
      material: '棉麻',
      fit: '寬鬆',
      sleeve: '泡泡短袖',
      length: '套裝'
    }
  },
  {
    id: 'top_french_romantic',
    name: 'Elegant Bow Tie Knit Top 蝴蝶結針織上衣',
    price: 2680,
    image: '/picture/TOP/法式03.jpg',
    category: 'top',
    style: 'elegant',
    description: '米白色蝴蝶結針織上衣，頸部綁帶設計，優雅知性，適合通勤約會。',
    rating: 4.8,
    reviews: 87,
    isNew: true,
    colors: ['米白色', '奶白色'],
    sizes: ['S', 'M', 'L'],
    tags: ['蝴蝶結', '針織', '綁帶', '優雅', '通勤'],
    aiMetadata: {
      occasion: ['work', 'date', 'elegant'],
      season: ['spring', 'autumn'],
      features: ['bow_tie', 'knit', 'elegant'],
      material: '針織',
      fit: '修身',
      sleeve: '短袖',
      length: '標準版'
    }
  },
  {
    id: 'dress_french_elegant',
    name: 'Black & White Maxi Dress 黑白長洋裝',
    price: 4480,
    image: '/images/products/dress/french_01.jpg',
    category: 'dress',
    style: 'elegant',
    description: '黑色吊帶背心搭配白色長裙，經典黑白配色，優雅大方的正式場合首選。',
    rating: 4.9,
    reviews: 98,
    isNew: true,
    colors: ['黑色', '白色'],
    sizes: ['S', 'M', 'L'],
    tags: ['黑白配', '吊帶', '長裙', '優雅', '正式'],
    aiMetadata: {
      occasion: ['formal', 'evening', 'elegant'],
      season: ['spring', 'summer'],
      features: ['maxi_length', 'color_block', 'camisole'],
      material: '雪紡',
      fit: '修身',
      sleeve: '吊帶',
      length: '長版'
    }
  }
]

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id)
}

export const getProductByName = (name: string): Product | undefined => {
  return products.find(product => product.name === name)
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