# STYLEMATE API 規格文件

## API 概述

### 基本資訊
- **Base URL**: `https://api.stylemate.com/v1`
- **認證方式**: JWT Bearer Token
- **資料格式**: JSON
- **字符編碼**: UTF-8
- **API 版本**: v1.0.0

### 通用響應格式
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T12:00:00Z",
  "requestId": "uuid-string"
}
```

### 錯誤響應格式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "錯誤訊息",
    "details": "詳細錯誤資訊"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "requestId": "uuid-string"
}
```

## 認證與授權

### 用戶註冊
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "使用者姓名",
  "preferences": {
    "styles": ["kpop", "casual"],
    "notifications": true
  }
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "使用者姓名",
      "createdAt": "2024-01-01T12:00:00Z"
    },
    "token": "jwt-token-string",
    "refreshToken": "refresh-token-string"
  }
}
```

### 用戶登入
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Token 刷新
```http
POST /auth/refresh
Authorization: Bearer {refresh-token}
```

## 風格推薦 API

### 上傳照片並獲取推薦
```http
POST /recommendations
Authorization: Bearer {jwt-token}
Content-Type: multipart/form-data

{
  "photo": [File], // 用戶全身照片
  "styles": ["kpop", "casual"], // 風格偏好
  "height": 165, // 身高 (cm)
  "bodyType": "slim", // 體型類型
  "preferences": {
    "colors": ["pink", "white"],
    "categories": ["tops", "dresses"],
    "priceRange": {
      "min": 10000,
      "max": 100000
    }
  }
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "recommendationId": "rec-uuid",
    "userPhotoUrl": "https://cdn.stylemate.com/user-photos/photo.jpg",
    "processedPhotoUrl": "https://cdn.stylemate.com/processed/photo-processed.jpg",
    "recommendations": [
      {
        "productId": "prod-uuid",
        "score": 0.95,
        "matchReason": "符合 K-pop 風格偏好",
        "product": {
          "id": "prod-uuid",
          "name": "韓系粉色連身裙",
          "price": 45000,
          "originalPrice": 60000,
          "images": [
            "https://cdn.stylemate.com/products/dress1.jpg"
          ],
          "category": "dresses",
          "brand": "CHUU",
          "colors": ["pink"],
          "sizes": ["S", "M", "L"],
          "rating": 4.8,
          "reviewCount": 123,
          "tags": ["kpop", "cute", "pink"]
        }
      }
    ],
    "totalCount": 20,
    "processingTime": 2.5
  }
}
```

### 獲取推薦結果
```http
GET /recommendations/{recommendationId}
Authorization: Bearer {jwt-token}
```

## 虛擬試穿 API

### 處理虛擬試穿
```http
POST /virtual-tryon
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "userPhotoUrl": "https://cdn.stylemate.com/user-photos/photo.jpg",
  "productId": "prod-uuid",
  "options": {
    "quality": "high", // low, medium, high
    "outputFormat": "jpeg", // jpeg, png, webp
    "adjustments": {
      "position": { "x": 0, "y": 0 },
      "scale": 1.0,
      "rotation": 0
    }
  }
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "tryonId": "tryon-uuid",
    "resultUrl": "https://cdn.stylemate.com/tryon-results/result.jpg",
    "thumbnailUrl": "https://cdn.stylemate.com/tryon-results/result-thumb.jpg",
    "processingTime": 3.2,
    "quality": "high",
    "dimensions": {
      "width": 400,
      "height": 600
    },
    "metadata": {
      "userPhotoUrl": "https://cdn.stylemate.com/user-photos/photo.jpg",
      "productId": "prod-uuid",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  }
}
```

### 批量虛擬試穿
```http
POST /virtual-tryon/batch
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "userPhotoUrl": "https://cdn.stylemate.com/user-photos/photo.jpg",
  "productIds": ["prod-1", "prod-2", "prod-3"],
  "options": {
    "quality": "medium",
    "priority": "speed" // speed, quality, balanced
  }
}
```

### 獲取試穿結果
```http
GET /virtual-tryon/{tryonId}
Authorization: Bearer {jwt-token}
```

### 儲存試穿結果
```http
POST /virtual-tryon/{tryonId}/save
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "title": "我的試穿造型",
  "tags": ["favorite", "kpop"],
  "isPublic": false
}
```

## 產品目錄 API

### 獲取產品列表
```http
GET /products?category=dresses&style=kpop&page=1&limit=20&sort=popular
Authorization: Bearer {jwt-token}
```

**查詢參數:**
- `category`: 產品類別 (tops, bottoms, dresses, accessories)
- `style`: 風格標籤 (kpop, casual, formal, school)
- `color`: 顏色篩選
- `brand`: 品牌篩選
- `priceMin`, `priceMax`: 價格範圍
- `size`: 尺寸篩選
- `page`: 頁碼 (預設: 1)
- `limit`: 每頁數量 (預設: 20, 最大: 100)
- `sort`: 排序方式 (popular, price_asc, price_desc, newest, rating)

**響應:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod-uuid",
        "name": "韓系粉色連身裙",
        "description": "清新可愛的韓式連身裙...",
        "price": 45000,
        "originalPrice": 60000,
        "discount": 25,
        "images": [
          "https://cdn.stylemate.com/products/dress1-main.jpg",
          "https://cdn.stylemate.com/products/dress1-detail.jpg"
        ],
        "category": "dresses",
        "subcategory": "mini-dress",
        "brand": "CHUU",
        "colors": ["pink", "white"],
        "sizes": ["S", "M", "L", "XL"],
        "materials": ["cotton", "polyester"],
        "rating": 4.8,
        "reviewCount": 123,
        "tags": ["kpop", "cute", "pink", "summer"],
        "inStock": true,
        "stockCount": 50,
        "isNew": false,
        "isBestseller": true,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "categories": [
        { "value": "dresses", "count": 45 },
        { "value": "tops", "count": 67 }
      ],
      "brands": [
        { "value": "CHUU", "count": 23 },
        { "value": "Stylenanda", "count": 18 }
      ],
      "colors": [
        { "value": "pink", "count": 34 },
        { "value": "white", "count": 28 }
      ],
      "priceRange": {
        "min": 15000,
        "max": 150000
      }
    }
  }
}
```

### 獲取產品詳情
```http
GET /products/{productId}
Authorization: Bearer {jwt-token}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod-uuid",
      "name": "韓系粉色連身裙",
      "description": "這款連身裙採用優質棉質材料...",
      "price": 45000,
      "originalPrice": 60000,
      "discount": 25,
      "images": [
        {
          "url": "https://cdn.stylemate.com/products/dress1-main.jpg",
          "alt": "主要產品圖",
          "isPrimary": true
        },
        {
          "url": "https://cdn.stylemate.com/products/dress1-detail.jpg",
          "alt": "細節圖",
          "isPrimary": false
        }
      ],
      "category": "dresses",
      "subcategory": "mini-dress",
      "brand": {
        "id": "brand-uuid",
        "name": "CHUU",
        "logo": "https://cdn.stylemate.com/brands/chuu-logo.png"
      },
      "colors": ["pink", "white"],
      "sizes": [
        {
          "value": "S",
          "measurements": {
            "chest": 84,
            "waist": 68,
            "hip": 90,
            "length": 85
          },
          "inStock": true
        }
      ],
      "materials": ["cotton 70%", "polyester 30%"],
      "careInstructions": ["手洗", "陰乾", "不可漂白"],
      "rating": 4.8,
      "reviewCount": 123,
      "reviews": [
        {
          "id": "review-uuid",
          "userId": "user-uuid",
          "userName": "Alice",
          "rating": 5,
          "comment": "非常可愛的裙子，質料很好",
          "images": ["https://cdn.stylemate.com/reviews/review1.jpg"],
          "createdAt": "2024-01-01T12:00:00Z"
        }
      ],
      "tags": ["kpop", "cute", "pink", "summer"],
      "inStock": true,
      "stockCount": 50,
      "isNew": false,
      "isBestseller": true,
      "relatedProducts": ["prod-uuid-2", "prod-uuid-3"],
      "sizeChart": {
        "imageUrl": "https://cdn.stylemate.com/size-charts/dress-chart.jpg",
        "measurements": [...]
      },
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 搜尋產品
```http
GET /products/search?q=粉色裙子&category=dresses&limit=10
Authorization: Bearer {jwt-token}
```

## 購物車 API

### 獲取購物車
```http
GET /cart
Authorization: Bearer {jwt-token}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "cartId": "cart-uuid",
    "items": [
      {
        "id": "cart-item-uuid",
        "productId": "prod-uuid",
        "product": {
          "id": "prod-uuid",
          "name": "韓系粉色連身裙",
          "price": 45000,
          "images": ["https://cdn.stylemate.com/products/dress1-main.jpg"]
        },
        "quantity": 1,
        "size": "M",
        "color": "pink",
        "subtotal": 45000,
        "addedAt": "2024-01-01T12:00:00Z"
      }
    ],
    "summary": {
      "itemCount": 1,
      "subtotal": 45000,
      "shipping": 3000,
      "tax": 4500,
      "discount": 0,
      "total": 52500
    },
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 加入購物車
```http
POST /cart/items
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "productId": "prod-uuid",
  "quantity": 1,
  "size": "M",
  "color": "pink"
}
```

### 更新購物車項目
```http
PUT /cart/items/{cartItemId}
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "quantity": 2,
  "size": "L"
}
```

### 移除購物車項目
```http
DELETE /cart/items/{cartItemId}
Authorization: Bearer {jwt-token}
```

### 清空購物車
```http
DELETE /cart
Authorization: Bearer {jwt-token}
```

## 訂單管理 API

### 建立訂單
```http
POST /orders
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "shippingAddress": {
    "name": "收件人姓名",
    "phone": "09xxxxxxxx",
    "address": "台北市信義區xxx路xxx號",
    "postalCode": "110",
    "city": "台北市",
    "district": "信義區"
  },
  "billingAddress": {
    // 同 shippingAddress 結構，可省略表示同收件地址
  },
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "cardToken": "stripe-card-token"
  },
  "notes": "訂單備註",
  "couponCode": "WELCOME10"
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order-uuid",
      "orderNumber": "STM-20240101-001",
      "status": "pending_payment",
      "items": [
        {
          "productId": "prod-uuid",
          "product": {...},
          "quantity": 1,
          "size": "M",
          "color": "pink",
          "price": 45000,
          "subtotal": 45000
        }
      ],
      "customer": {
        "id": "user-uuid",
        "name": "客戶姓名",
        "email": "user@example.com"
      },
      "shippingAddress": {...},
      "billingAddress": {...},
      "summary": {
        "subtotal": 45000,
        "shipping": 3000,
        "tax": 4500,
        "discount": 4500,
        "total": 48000
      },
      "paymentMethod": "credit_card",
      "paymentStatus": "pending",
      "shippingStatus": "preparing",
      "trackingNumber": null,
      "estimatedDelivery": "2024-01-05T00:00:00Z",
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    },
    "paymentUrl": "https://payment.stylemate.com/pay/order-uuid",
    "qrCode": "https://api.stylemate.com/payments/qr/order-uuid"
  }
}
```

### 獲取訂單列表
```http
GET /orders?status=completed&page=1&limit=10
Authorization: Bearer {jwt-token}
```

### 獲取訂單詳情
```http
GET /orders/{orderId}
Authorization: Bearer {jwt-token}
```

### 取消訂單
```http
POST /orders/{orderId}/cancel
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "reason": "改變主意",
  "notes": "取消原因詳述"
}
```

## 用戶資料 API

### 獲取用戶資料
```http
GET /users/profile
Authorization: Bearer {jwt-token}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "使用者姓名",
      "avatar": "https://cdn.stylemate.com/avatars/user-avatar.jpg",
      "phone": "09xxxxxxxx",
      "birthDate": "1995-05-15",
      "gender": "female",
      "preferences": {
        "styles": ["kpop", "casual"],
        "colors": ["pink", "white"],
        "priceRange": {
          "min": 10000,
          "max": 100000
        },
        "sizes": ["M", "L"],
        "notifications": {
          "email": true,
          "push": true,
          "sms": false
        }
      },
      "addresses": [
        {
          "id": "addr-uuid",
          "name": "家裡",
          "isDefault": true,
          "recipient": "收件人姓名",
          "phone": "09xxxxxxxx",
          "address": "台北市信義區xxx路xxx號",
          "postalCode": "110",
          "city": "台北市",
          "district": "信義區"
        }
      ],
      "stats": {
        "totalOrders": 15,
        "totalSpent": 675000,
        "favoriteProducts": 23,
        "tryonCount": 45
      },
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 更新用戶資料
```http
PUT /users/profile
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "name": "新的姓名",
  "phone": "09xxxxxxxx",
  "birthDate": "1995-05-15",
  "preferences": {
    "styles": ["kpop", "formal"],
    "colors": ["pink", "black"]
  }
}
```

### 上傳用戶頭像
```http
POST /users/avatar
Authorization: Bearer {jwt-token}
Content-Type: multipart/form-data

{
  "avatar": [File]
}
```

### 獲取我的收藏
```http
GET /users/favorites?type=products&page=1&limit=20
Authorization: Bearer {jwt-token}
```

### 加入收藏
```http
POST /users/favorites
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "itemId": "prod-uuid",
  "itemType": "product"
}
```

### 移除收藏
```http
DELETE /users/favorites/{itemId}
Authorization: Bearer {jwt-token}
```

## 文件上傳 API

### 上傳圖片
```http
POST /uploads/images
Authorization: Bearer {jwt-token}
Content-Type: multipart/form-data

{
  "file": [File],
  "type": "user_photo", // user_photo, product_image, review_image
  "resize": {
    "width": 400,
    "height": 600,
    "quality": 85
  }
}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "fileId": "file-uuid",
    "originalUrl": "https://cdn.stylemate.com/uploads/original/image.jpg",
    "processedUrl": "https://cdn.stylemate.com/uploads/processed/image.jpg",
    "thumbnailUrl": "https://cdn.stylemate.com/uploads/thumbs/image.jpg",
    "metadata": {
      "filename": "image.jpg",
      "size": 1024000,
      "mimeType": "image/jpeg",
      "dimensions": {
        "width": 400,
        "height": 600
      }
    },
    "uploadedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 獲取上傳進度
```http
GET /uploads/progress/{uploadId}
Authorization: Bearer {jwt-token}
```

## 分析統計 API

### 獲取用戶行為統計
```http
GET /analytics/user-stats
Authorization: Bearer {jwt-token}
```

**響應:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalTryOns": 45,
      "totalPurchases": 15,
      "totalSpent": 675000,
      "favoriteStyles": ["kpop", "casual"],
      "mostViewedCategories": ["dresses", "tops"]
    },
    "recentActivity": [
      {
        "type": "tryon",
        "productId": "prod-uuid",
        "productName": "韓系粉色連身裙",
        "timestamp": "2024-01-01T12:00:00Z"
      }
    ],
    "recommendations": {
      "suggestedProducts": ["prod-1", "prod-2"],
      "suggestedStyles": ["formal", "school"],
      "reasonCode": "based_on_recent_activity"
    }
  }
}
```

## WebHook API

### 訂單狀態更新
```http
POST {webhook_url}
Content-Type: application/json
X-Stylemate-Signature: sha256=xxx

{
  "event": "order.status_updated",
  "data": {
    "orderId": "order-uuid",
    "oldStatus": "pending_payment",
    "newStatus": "paid",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

### 支付結果通知
```http
POST {webhook_url}
Content-Type: application/json
X-Stylemate-Signature: sha256=xxx

{
  "event": "payment.completed",
  "data": {
    "orderId": "order-uuid",
    "paymentId": "payment-uuid",
    "amount": 48000,
    "status": "success",
    "timestamp": "2024-01-01T12:00:00Z"
  }
}
```

## 錯誤代碼

### 認證錯誤 (401)
- `AUTH_TOKEN_MISSING`: 缺少認證 Token
- `AUTH_TOKEN_INVALID`: 無效的認證 Token
- `AUTH_TOKEN_EXPIRED`: 認證 Token 已過期
- `AUTH_INSUFFICIENT_PERMISSIONS`: 權限不足

### 資料驗證錯誤 (400)
- `VALIDATION_ERROR`: 資料驗證失敗
- `MISSING_REQUIRED_FIELD`: 缺少必填欄位
- `INVALID_FIELD_FORMAT`: 欄位格式錯誤
- `FILE_SIZE_TOO_LARGE`: 檔案大小超出限制
- `UNSUPPORTED_FILE_TYPE`: 不支援的檔案類型

### 業務邏輯錯誤 (422)
- `PRODUCT_OUT_OF_STOCK`: 商品無庫存
- `INVALID_PRODUCT_SIZE`: 無效的商品尺寸
- `CART_ITEM_NOT_FOUND`: 購物車項目不存在
- `ORDER_CANNOT_BE_CANCELLED`: 訂單無法取消
- `INSUFFICIENT_BALANCE`: 餘額不足

### 伺服器錯誤 (500)
- `INTERNAL_SERVER_ERROR`: 內部伺服器錯誤
- `DATABASE_CONNECTION_ERROR`: 資料庫連接錯誤
- `THIRD_PARTY_SERVICE_ERROR`: 第三方服務錯誤
- `FILE_UPLOAD_FAILED`: 檔案上傳失敗

## API 速率限制

### 限制規則
- **一般用戶**: 1000 次/小時
- **Premium 用戶**: 5000 次/小時
- **圖片上傳**: 100 次/小時
- **虛擬試穿**: 50 次/小時

### 限制標頭
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## API 版本控制

### 版本號格式
- 主版本號: 重大變更，不向下相容
- 次版本號: 新增功能，向下相容
- 修訂版本號: Bug 修復，向下相容

### 版本指定方式
```http
# URL 路徑指定
GET https://api.stylemate.com/v1/products

# 標頭指定
GET https://api.stylemate.com/products
API-Version: v1.0.0
```

## SDK 與範例

### JavaScript SDK
```javascript
import { StylemateAPI } from '@stylemate/sdk';

const api = new StylemateAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.stylemate.com/v1'
});

// 獲取推薦
const recommendations = await api.recommendations.create({
  photo: file,
  styles: ['kpop', 'casual'],
  height: 165
});

// 虛擬試穿
const tryonResult = await api.virtualTryOn.process({
  userPhotoUrl: 'photo-url',
  productId: 'prod-uuid'
});
```

### cURL 範例
```bash
# 獲取產品列表
curl -X GET "https://api.stylemate.com/v1/products?category=dresses" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# 上傳照片獲取推薦
curl -X POST "https://api.stylemate.com/v1/recommendations" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@user_photo.jpg" \
  -F "styles=[\"kpop\",\"casual\"]" \
  -F "height=165"
```

## 測試環境

### 測試 API 端點
- **Staging**: `https://api-staging.stylemate.com/v1`
- **Testing**: `https://api-test.stylemate.com/v1`

### 測試資料
```json
{
  "testUser": {
    "email": "test@stylemate.com",
    "password": "test123456"
  },
  "testProducts": [
    "prod-test-001",
    "prod-test-002"
  ]
}
```

### API 文件工具
- **Swagger UI**: https://api.stylemate.com/docs
- **Postman Collection**: [下載連結]
- **OpenAPI Spec**: https://api.stylemate.com/openapi.json