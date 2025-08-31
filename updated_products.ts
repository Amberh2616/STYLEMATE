export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: 'dress' | 'top' | 'bottom' | 'outer' | 'set' | 'shorts' | 'skirt'
  style: 'sweet' | 'elegant' | 'street' | 'casual' | 'minimalist' | 'vintage' | 'romantic' | 'chic' | 'korean' | 'french' | 'glamorous'
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
    sleeve?: string
    length?: string
  }
}

export const products: Product[] = [
  // === DRESS 洋裝類 ===
  {
    id: 'dress_elegant_floral',
    name: 'Elegant Floral Print 洋裝',
    price: 3480,
    originalPrice: 3980,
    image: '/picture/DRESS/01fffba5-6a65-4c1b-af4f-67d47667a05d.jpg',
    category: 'dress',
    style: 'elegant',
    description: '優雅花卉印花洋裝，採用輕薄雪紡材質，適合春夏約會場合。',
    rating: 4.7,
    reviews: 89,
    isNew: true,
    colors: ['粉色', '白色', '花卉印花'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['韓系', '優雅', '碎花', '春夏', '約會'],
    aiMetadata: {
      occasion: ['date', 'casual', 'spring_summer'],
      season: ['spring', 'summer'],
      features: ['floral_print', 'feminine', 'midi_length'],
      material: '雪紡',
      fit: '修身',
      sleeve: '短袖',
      length: '中長版'
    }
  },
  {
    id: 'dress_sweet_pink_midi',
    name: 'Sweet Pink Midi 洋裝',
    price: 3280,
    image: '/picture/DRESS/12eec23d-8257-4134-a6b6-5fadb037a87e.jpg',
    category: 'dress',
    style: 'sweet',
    description: '甜美粉色中長洋裝，韓系風格，日常約會首選。',
    rating: 4.6,
    reviews: 76,
    colors: ['粉色', '淡粉色'],
    sizes: ['S', 'M', 'L'],
    tags: ['甜美', '粉色', '韓系', '可愛', '日常'],
    aiMetadata: {
      occasion: ['casual', 'date', 'daily'],
      season: ['spring', 'summer'],
      features: ['midi_length', 'sweet', 'pink'],
      material: '棉質',
      fit: '寬鬆',
      sleeve: '短袖',
      length: '中長版'
    }
  },
  {
    id: 'dress_minimalist_white_maxi',
    name: 'Minimalist White Maxi 洋裝',
    price: 4280,
    image: '/picture/DRESS/2171d7e6-cbdf-4bde-9551-a8272b668075.jpeg',
    category: 'dress',
    style: 'minimalist',
    description: '極簡白色長洋裝，度假風格，適合夏季正式場合。',
    rating: 4.8,
    reviews: 132,
    isNew: true,
    isSale: true,
    colors: ['白色', '純白'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['極簡', '白色', '長裙', '優雅', '度假'],
    aiMetadata: {
      occasion: ['vacation', 'formal', 'summer'],
      season: ['summer'],
      features: ['maxi_length', 'minimalist', 'white'],
      material: '棉麻',
      fit: '寬鬆',
      sleeve: '無袖',
      length: '長版'
    }
  },
  {
    id: 'dress_french_elegant',
    name: 'French Elegant 洋裝',
    price: 4480,
    image: '/picture/DRESS/法式01.jpg',
    category: 'dress',
    style: 'french',
    description: '法式優雅洋裝，精緻真絲材質，適合正式約會場合。',
    rating: 4.9,
    reviews: 98,
    isNew: true,
    colors: ['藏青色', '深藍色'],
    sizes: ['S', 'M', 'L'],
    tags: ['法式', '優雅', '精緻', '浪漫', '高級'],
    aiMetadata: {
      occasion: ['formal', 'date', 'elegant'],
      season: ['spring', 'autumn'],
      features: ['french_style', 'elegant', 'sophisticated'],
      material: '真絲',
      fit: '修身',
      sleeve: '七分袖',
      length: '中長版'
    }
  },
  {
    id: 'dress_sweet_girly',
    name: 'Sweet Girly 洋裝',
    price: 3280,
    image: '/picture/DRESS/甜美01.jpg',
    category: 'dress',
    style: 'sweet',
    description: '甜美少女洋裝，粉嫩色系，約會必備款式。',
    rating: 4.5,
    reviews: 124,
    colors: ['粉色', '淡紫色', '漸層'],
    sizes: ['S', 'M', 'L'],
    tags: ['甜美', '少女', '可愛', '粉嫩', '約會'],
    aiMetadata: {
      occasion: ['date', 'sweet', 'youth'],
      season: ['spring', 'summer'],
      features: ['sweet', 'girly', 'cute'],
      material: '雪紡',
      fit: '寬鬆',
      sleeve: '短袖',
      length: '短版'
    }
  },

  // === TOP 上衣類 ===
  {
    id: 'top_basic_white_tee',
    name: 'Basic White Tee 上衣',
    price: 1480,
    image: '/picture/TOP/LINE_ALBUM__250808_78.jpg',
    category: 'top',
    style: 'casual',
    description: '基本款白色T恤，純棉材質，百搭必備單品。',
    rating: 4.4,
    reviews: 256,
    colors: ['白色', '純白'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['基本款', '白色', 'T恤', '簡約', '百搭'],
    aiMetadata: {
      occasion: ['daily', 'casual', 'basic'],
      season: ['spring', 'summer', 'autumn'],
      features: ['basic', 'white', 'versatile'],
      material: '純棉',
      fit: '標準',
      sleeve: '短袖',
      length: '標準版'
    }
  },
  {
    id: 'top_casual_striped',
    name: 'Casual Striped 上衣',
    price: 1680,
    image: '/picture/TOP/條紋1.jpg',
    category: 'top',
    style: 'casual',
    description: '休閒條紋上衣，經典法式風格，日常百搭首選。',
    rating: 4.3,
    reviews: 189,
    colors: ['黑白條紋', '經典條紋'],
    sizes: ['S', 'M', 'L'],
    tags: ['經典', '條紋', '百搭', '簡約', '法式'],
    aiMetadata: {
      occasion: ['classic', 'versatile', 'daily'],
      season: ['spring', 'autumn'],
      features: ['striped', 'classic', 'versatile'],
      material: '棉質',
      fit: '寬鬆',
      sleeve: '長袖',
      length: '標準版'
    }
  },
  {
    id: 'top_puff_sleeve',
    name: 'Puff Sleeve 上衣',
    price: 2380,
    image: '/picture/TOP/泡泡袖上衣.jpeg',
    category: 'top',
    style: 'romantic',
    description: '浪漫泡泡袖上衣，棉麻材質，甜美女性化設計。',
    rating: 4.7,
    reviews: 145,
    isNew: true,
    colors: ['白色', '米白色'],
    sizes: ['S', 'M', 'L'],
    tags: ['泡泡袖', '甜美', '浪漫', '女性化', '復古'],
    aiMetadata: {
      occasion: ['romantic', 'sweet', 'vintage'],
      season: ['spring', 'summer'],
      features: ['puff_sleeve', 'romantic', 'feminine'],
      material: '棉麻',
      fit: '寬鬆',
      sleeve: '泡泡短袖',
      length: '標準版'
    }
  },
  {
    id: 'top_french_romantic',
    name: 'French Romantic 上衣',
    price: 2680,
    image: '/picture/TOP/法式03.jpg',
    category: 'top',
    style: 'french',
    description: '法式浪漫上衣，真絲材質，優雅精緻設計。',
    rating: 4.8,
    reviews: 87,
    isNew: true,
    colors: ['粉色', '淡粉色'],
    sizes: ['S', 'M', 'L'],
    tags: ['法式', '浪漫', '優雅', '女性化', '精緻'],
    aiMetadata: {
      occasion: ['romantic', 'elegant', 'date'],
      season: ['spring', 'autumn'],
      features: ['french_style', 'romantic', 'elegant'],
      material: '真絲',
      fit: '修身',
      sleeve: '長袖',
      length: '標準版'
    }
  },

  // === SHORTS 短褲類 ===
  {
    id: 'shorts_high_waisted_denim',
    name: 'High Waisted Denim Shorts 牛仔短褲',
    price: 1690,
    image: '/picture/PANTS/shorts/LINE_ALBUM_🪸七月 · 各種上衣🪸_250808_100.jpg',
    category: 'shorts',
    style: 'casual',
    description: '高腰牛仔短褲，夏季必備，顯瘦修身設計。',
    rating: 4.5,
    reviews: 203,
    colors: ['藍色', '牛仔藍'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['高腰', '牛仔', '夏季', '休閒', '顯瘦'],
    aiMetadata: {
      occasion: ['summer', 'casual', 'trendy'],
      season: ['summer'],
      features: ['high_waisted', 'denim', 'summer'],
      material: '牛仔布',
      fit: '修身',
      sleeve: '無袖',
      length: '短版'
    }
  },
  {
    id: 'shorts_tailored_bermuda',
    name: 'Tailored Bermuda Shorts 百慕達短褲',
    price: 1890,
    image: '/picture/PANTS/shorts/LINE_ALBUM_🪸七月 · 各種上衣🪸_250808_172.jpg',
    category: 'shorts',
    style: 'chic',
    description: '俐落百慕達短褲，正式休閒兼具，夏季優雅首選。',
    rating: 4.6,
    reviews: 156,
    colors: ['卡其色', '米色'],
    sizes: ['S', 'M', 'L'],
    tags: ['百慕達', '正式', '俐落', '夏季', '優雅'],
    aiMetadata: {
      occasion: ['smart_casual', 'summer', 'elegant'],
      season: ['summer'],
      features: ['bermuda', 'tailored', 'elegant'],
      material: '棉質',
      fit: '修身',
      sleeve: '無袖',
      length: '中短版'
    }
  },

  // === OUTER 外套類 ===
  {
    id: 'jacket_knit_cardigan',
    name: 'Knit Cardigan 針織開衫',
    price: 2480,
    image: '/picture/jacket/LINE_ALBUM_🌼六月 · 各種外套、開衫、背心🌼_250808_1.jpg',
    category: 'outer',
    style: 'casual',
    description: '舒適針織開衫，羊毛混紡材質，秋冬百搭單品。',
    rating: 4.7,
    reviews: 234,
    colors: ['米色', '駝色'],
    sizes: ['S', 'M', 'L', 'XL'],
    tags: ['針織', '開衫', '舒適', '溫暖', '百搭'],
    aiMetadata: {
      occasion: ['cozy', 'casual', 'layering'],
      season: ['autumn', 'winter'],
      features: ['knit', 'cardigan', 'comfortable'],
      material: '羊毛混紡',
      fit: '寬鬆',
      sleeve: '長袖',
      length: '標準版'
    }
  },
  {
    id: 'jacket_blazer_formal',
    name: 'Blazer Formal Jacket 正式西裝外套',
    price: 3680,
    image: '/picture/jacket/LINE_ALBUM_🌼六月 · 各種外套、開衫、背心🌼_250808_12.jpg',
    category: 'outer',
    style: 'elegant',
    description: '正式西裝外套，羊毛材質，職場專業形象必備。',
    rating: 4.8,
    reviews: 167,
    isNew: true,
    colors: ['黑色', '深色'],
    sizes: ['S', 'M', 'L'],
    tags: ['西裝外套', '正式', '職場', '專業', '俐落'],
    aiMetadata: {
      occasion: ['work', 'formal', 'business'],
      season: ['spring', 'autumn', 'winter'],
      features: ['blazer', 'formal', 'professional'],
      material: '羊毛',
      fit: '修身',
      sleeve: '長袖',
      length: '標準版'
    }
  }
];

export default products;