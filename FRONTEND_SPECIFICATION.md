# STYLEMATE 前端工程師規格文件

## 技術架構

### 核心技術棧
- **框架**: Next.js 13+ (App Router)
- **樣式**: Tailwind CSS 3+
- **語言**: TypeScript
- **狀態管理**: Zustand/Context API
- **圖像處理**: HTML5 Canvas + Fabric.js
- **HTTP 客戶端**: Axios
- **表單處理**: React Hook Form + Zod

### 開發環境設置
```bash
# 專案初始化
npx create-next-app@latest stylemate-frontend --typescript --tailwind --eslint
cd stylemate-frontend

# 安裝必要依賴
npm install @types/fabric fabric axios zustand react-hook-form @hookform/resolvers zod
npm install @tailwindcss/forms @headlessui/react lucide-react

# 開發工具
npm install -D prettier eslint-config-prettier @types/node
```

## 專案結構

```
frontend/
├── app/                          # Next.js 13 App Router
│   ├── globals.css              # 全局樣式
│   ├── layout.tsx               # 根布局
│   ├── page.tsx                 # 首頁 (風格表單)
│   ├── tryon/
│   │   └── page.tsx             # 虛擬試穿頁
│   ├── products/
│   │   └── page.tsx             # 商品選擇頁
│   └── checkout/
│       └── page.tsx             # 結帳頁
├── components/                   # React 組件
│   ├── ui/                      # 基礎 UI 組件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   ├── forms/                   # 表單組件
│   │   ├── StyleForm.tsx        # 風格偏好表單
│   │   ├── PhotoUpload.tsx      # 照片上傳
│   │   └── CheckoutForm.tsx     # 結帳表單
│   ├── canvas/                  # 畫布組件
│   │   ├── TryOnCanvas.tsx      # 2D 試穿畫布
│   │   └── ImageEditor.tsx      # 圖像編輯器
│   └── layout/                  # 版面組件
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Navigation.tsx
├── lib/                         # 工具函數
│   ├── api.ts                   # API 客戶端
│   ├── utils.ts                 # 通用工具
│   ├── canvas-utils.ts          # 畫布工具
│   └── image-utils.ts           # 圖像處理
├── store/                       # 狀態管理
│   ├── useUserStore.ts          # 用戶狀態
│   ├── useProductStore.ts       # 商品狀態
│   └── useTryOnStore.ts         # 試穿狀態
├── types/                       # TypeScript 類型
│   ├── api.ts                   # API 類型定義
│   ├── product.ts               # 商品類型
│   └── user.ts                  # 用戶類型
└── public/                      # 靜態資源
    ├── images/
    ├── icons/
    └── temp/                    # 臨時上傳文件
```

## 核心組件開發規格

### 1. 風格偏好表單 (StyleForm.tsx)

```typescript
interface StyleFormProps {
  onSubmit: (data: StylePreference) => void;
  isLoading?: boolean;
}

interface StylePreference {
  styles: string[];           // ['kpop', 'casual', 'formal', 'school']
  photo: File;               // 用戶全身照片
  height: number;            // 身高 (cm)
  bodyType: string;          // 體型偏好
}

// 功能需求
const StyleForm: React.FC<StyleFormProps> = ({ onSubmit, isLoading }) => {
  // 1. 多選風格偏好 (checkbox group)
  // 2. 拖拽照片上傳 (drag & drop)
  // 3. 表單驗證 (zod schema)
  // 4. 提交載入狀態
  // 5. 錯誤處理顯示
};
```

**開發細節:**
- 使用 `react-hook-form` 進行表單管理
- 圖片上傳需支援拖拽和點擊上傳
- 即時表單驗證和錯誤提示
- 韓式 UI 風格 (參考設計規格)

### 2. 2D 虛擬試穿畫布 (TryOnCanvas.tsx)

```typescript
interface TryOnCanvasProps {
  userPhoto: string;         // 用戶照片 URL
  selectedClothing?: Clothing; // 選中的服裝
  onSave: (result: string) => void; // 儲存試穿結果
}

interface CanvasControls {
  position: { x: number; y: number };
  scale: number;
  rotation: number;
}

// 核心功能
const TryOnCanvas: React.FC<TryOnCanvasProps> = (props) => {
  // 1. 載入用戶照片到畫布
  // 2. 疊加服裝圖片
  // 3. 拖拽調整位置
  // 4. 縮放調整大小
  // 5. 匯出合成結果
};
```

**技術實現:**
```typescript
// Fabric.js 畫布初始化
const initializeCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const canvas = new fabric.Canvas(canvasRef.current, {
    width: 400,
    height: 600,
    backgroundColor: '#ffffff'
  });
  
  return canvas;
};

// 圖片疊加功能
const addClothingToCanvas = (canvas: fabric.Canvas, clothingUrl: string) => {
  fabric.Image.fromURL(clothingUrl, (img) => {
    img.set({
      left: 100,
      top: 100,
      scaleX: 0.8,
      scaleY: 0.8
    });
    canvas.add(img);
  });
};
```

### 3. 商品網格組件 (ProductGrid.tsx)

```typescript
interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onTryOn: (product: Product) => void;
  loading?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

// 響應式網格設計
const ProductGrid: React.FC<ProductGridProps> = (props) => {
  // 1. 響應式商品卡片 (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
  // 2. 商品圖片懶載入
  // 3. 試穿按鈕快速操作
  // 4. 購物車功能整合
  // 5. 無限滾動載入
};
```

### 4. 結帳表單組件 (CheckoutForm.tsx)

```typescript
interface CheckoutFormProps {
  cartItems: CartItem[];
  onSubmit: (orderData: OrderData) => void;
  totalAmount: number;
}

interface OrderData {
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  shippingAddress: Address;
  paymentMethod: 'card' | 'bank_transfer';
  paymentDetails: PaymentDetails;
}

// 多步驟結帳流程
const CheckoutForm: React.FC<CheckoutFormProps> = (props) => {
  // 1. 分步驟表單 (客戶資訊 → 配送地址 → 付款方式)
  // 2. 即時總價計算
  // 3. 付款安全驗證
  // 4. 訂單確認頁面
};
```

## API 整合規格

### HTTP 客戶端設置
```typescript
// lib/api.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 處理認證失敗
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API 服務函數
```typescript
// 風格推薦 API
export const getStyleRecommendations = async (preferences: StylePreference) => {
  const formData = new FormData();
  formData.append('styles', JSON.stringify(preferences.styles));
  formData.append('photo', preferences.photo);
  formData.append('height', preferences.height.toString());
  formData.append('bodyType', preferences.bodyType);

  const response = await apiClient.post('/recommendations', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  
  return response.data;
};

// 虛擬試穿 API
export const processVirtualTryOn = async (userPhoto: string, clothingId: string) => {
  const response = await apiClient.post('/virtual-tryon', {
    userPhoto,
    clothingId
  });
  
  return response.data;
};

// 商品列表 API
export const getProducts = async (filters?: ProductFilters) => {
  const response = await apiClient.get('/products', { params: filters });
  return response.data;
};

// 訂單提交 API
export const submitOrder = async (orderData: OrderData) => {
  const response = await apiClient.post('/orders', orderData);
  return response.data;
};
```

## 狀態管理架構

### Zustand Store 設計
```typescript
// store/useUserStore.ts
interface UserState {
  user: User | null;
  preferences: StylePreference | null;
  uploadedPhoto: string | null;
  setUser: (user: User) => void;
  setPreferences: (preferences: StylePreference) => void;
  setUploadedPhoto: (photo: string) => void;
  clearUserData: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  preferences: null,
  uploadedPhoto: null,
  setUser: (user) => set({ user }),
  setPreferences: (preferences) => set({ preferences }),
  setUploadedPhoto: (photo) => set({ uploadedPhoto: photo }),
  clearUserData: () => set({ user: null, preferences: null, uploadedPhoto: null }),
}));

// store/useProductStore.ts
interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

// store/useTryOnStore.ts
interface TryOnState {
  tryOnResults: TryOnResult[];
  currentResult: TryOnResult | null;
  isProcessing: boolean;
  saveTryOnResult: (result: TryOnResult) => void;
  setProcessing: (processing: boolean) => void;
}
```

## 圖像處理實現

### 照片上傳處理
```typescript
// lib/image-utils.ts
export const validateImage = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // 檢查圖片尺寸和比例
      const isValidSize = img.width >= 300 && img.height >= 400;
      const isValidRatio = (img.height / img.width) >= 1.2; // 直立照片
      resolve(isValidSize && isValidRatio);
    };
    img.src = URL.createObjectURL(file);
  });
};

export const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = calculateNewDimensions(img.width, img.height, maxWidth, maxHeight);
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

### 2D 圖像合成
```typescript
// lib/canvas-utils.ts
export const overlayClothing = (
  userImageUrl: string,
  clothingImageUrl: string,
  position: Position,
  scale: number
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const userImg = new Image();
    const clothingImg = new Image();
    
    userImg.onload = () => {
      canvas.width = userImg.width;
      canvas.height = userImg.height;
      
      // 繪製用戶照片
      ctx.drawImage(userImg, 0, 0);
      
      clothingImg.onload = () => {
        // 繪製服裝圖片
        const width = clothingImg.width * scale;
        const height = clothingImg.height * scale;
        
        ctx.drawImage(
          clothingImg,
          position.x - width / 2,
          position.y - height / 2,
          width,
          height
        );
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      
      clothingImg.src = clothingImageUrl;
    };
    
    userImg.src = userImageUrl;
  });
};
```

## 效能優化策略

### 圖片懶載入
```typescript
// components/ui/LazyImage.tsx
const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isInView ? src : undefined}
      alt={alt}
      className={className}
      onLoad={() => setIsLoaded(true)}
    />
  );
};
```

### 快取策略
```typescript
// lib/cache.ts
class ImageCache {
  private cache = new Map<string, string>();
  private maxSize = 50; // 最多快取 50 張圖片

  async get(url: string): Promise<string> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      URL.revokeObjectURL(this.cache.get(firstKey)!);
      this.cache.delete(firstKey);
    }

    this.cache.set(url, objectUrl);
    return objectUrl;
  }
}

export const imageCache = new ImageCache();
```

## 測試策略

### 單元測試
```typescript
// __tests__/components/StyleForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { StyleForm } from '@/components/forms/StyleForm';

describe('StyleForm', () => {
  it('should render all style options', () => {
    render(<StyleForm onSubmit={jest.fn()} />);
    
    expect(screen.getByText('K-pop 風格')).toBeInTheDocument();
    expect(screen.getByText('日常韓系')).toBeInTheDocument();
    expect(screen.getByText('正式場合')).toBeInTheDocument();
  });

  it('should handle form submission', () => {
    const mockSubmit = jest.fn();
    render(<StyleForm onSubmit={mockSubmit} />);
    
    // 測試表單提交邏輯
  });
});
```

### 整合測試
```typescript
// __tests__/integration/tryon-flow.test.tsx
describe('Virtual Try-On Flow', () => {
  it('should complete full try-on process', async () => {
    // 1. 上傳照片
    // 2. 選擇服裝
    // 3. 處理試穿
    // 4. 儲存結果
  });
});
```

## 部署配置

### Next.js 配置
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-api-domain.com', 'cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

### 環境變數設置
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 開發檢查清單

### 功能完整性
- [ ] 風格表單提交功能
- [ ] 照片上傳和驗證
- [ ] 2D 虛擬試穿功能
- [ ] 商品瀏覽和篩選
- [ ] 購物車功能
- [ ] 結帳流程完整

### 效能優化
- [ ] 圖片懶載入實現
- [ ] API 請求快取
- [ ] 組件程式碼分割
- [ ] 靜態資源優化

### 用戶體驗
- [ ] 響應式設計適配
- [ ] 載入狀態反饋
- [ ] 錯誤處理顯示
- [ ] 成功操作提示

### 程式碼品質
- [ ] TypeScript 類型完整
- [ ] ESLint 規則通過
- [ ] 單元測試覆蓋率 > 80%
- [ ] 組件文檔完整

### 安全性
- [ ] XSS 防護
- [ ] CSRF 保護
- [ ] 圖片上傳安全檢查
- [ ] API 請求驗證