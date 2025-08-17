# STYLEMATE Fashion Dataset

## 📋 資料集概述

本資料集專為 STYLEMATE AI 時尚推薦系統設計，包含標準化的風格分類與商品屬性標註，支援多模態檢索與推薦系統開發。

## 🗂️ 資料夾結構

```
fashion_dataset/
├── images/                     # 風格分類圖片（穿搭照片）
│   ├── FreshKorean/           # 清新韓系
│   ├── FrenchChic/            # 法式優雅
│   ├── Minimalist/            # 極簡
│   ├── SweetGirly/            # 甜美少女
│   ├── Streetwear/            # 街頭風
│   ├── UrbanOffice/           # 都會通勤
│   ├── AmericanCasual/        # 美式休閒
│   ├── RetroVintage/          # 復古懷舊
│   ├── Athleisure/            # 機能運動
│   └── Glamorous/             # 摩登華麗
│
├── catalog/                   # 商品庫
│   ├── images/                # 商品圖片
│   │   ├── tops/              # 上衣
│   │   ├── bottoms/           # 下身
│   │   ├── dress/             # 洋裝
│   │   ├── outerwear/         # 外套
│   │   └── shoes/             # 鞋子
│   └── catalog.csv            # 商品屬性表
│
├── metadata/                  # 標註與設定
│   ├── style_vocab.json       # 風格詞彙白名單
│   ├── annotations.csv        # 主標註表
│   └── splits.csv             # 訓練/驗證/測試分割
│
└── README.md                  # 本文件
```

## 🎯 風格分類 (10種標準風格)

1. **清新韓系 (Fresh Korean)** - 溫柔色調、層次穿搭
2. **法式優雅 (French Chic)** - 簡約高級、知性氣質
3. **極簡 (Minimalist)** - 純色基調、俐落剪裁
4. **甜美少女 (Sweet / Girly)** - 粉色系、蕾絲元素
5. **街頭風 (Streetwear)** - 寬鬆版型、潮流元素
6. **都會通勤 (Urban Office)** - 職場專業、正式場合
7. **美式休閒 (American Casual)** - 牛仔單品、舒適實穿
8. **復古懷舊 (Retro / Vintage)** - 復古印花、經典剪裁
9. **機能運動 (Athleisure)** - 運動元素、舒適機能
10. **摩登華麗 (Glamorous)** - 奢華質感、晚宴風格

## 📊 標註格式

### annotations.csv 欄位說明

| 欄位 | 說明 | 範例值 |
|------|------|--------|
| `image_path` | 圖片路徑 | `images/FreshKorean/FK_001.jpg` |
| `style_keyword` | 風格標籤（必須來自白名單） | `"清新韓系 (Fresh Korean)"` |
| `occasion` | 適合場合（以`;`分隔多選） | `"休閒;約會"` |
| `top_length` | 上衣長度 | `"短版/及腰/過臀"` |
| `skirt_length` | 裙長 | `"迷你/及膝/過膝/長裙"` |
| `pant_length` | 褲長 | `"短褲/九分/全長"` |
| `fit_preference` | 合身度偏好 | `"寬鬆/標準/合身"` |
| `fit_avoid` | 避免的版型 | `"太緊身;低腰"` |
| `exposure_avoid` | 避免的曝露 | `"露背;透膚"` |
| `notes` | 備註 | `"針織外套搭配，溫柔色調"` |

### catalog.csv 商品屬性

| 欄位 | 說明 | 範例值 |
|------|------|--------|
| `sku` | 商品編號 | `S1001` |
| `name` | 商品名稱 | `落肩襯衫` |
| `category` | 商品分類 | `上衣` |
| `style_tags` | 風格標籤（以`;`分隔） | `"落肩;極簡"` |
| `color` | 顏色 | `奶油白` |
| `price_tier` | 價格級距 | `低/中/高` |
| `occasion` | 適合場合 | `"通勤;休閒"` |
| `fit` | 版型 | `寬鬆` |
| `image_path` | 商品圖片路徑 | `catalog/images/tops/S1001.jpg` |

## 🔧 使用方式

### 1. 標註新圖片
```python
# 讀取風格詞彙表
with open('metadata/style_vocab.json', 'r') as f:
    vocab = json.load(f)

# 標註圖片時只使用白名單中的詞彙
valid_styles = vocab['style_keywords']
valid_occasions = vocab['occasion_whitelist']
```

### 2. 訓練檢索模型
```python
# 載入標註資料
annotations = pd.read_csv('metadata/annotations.csv')

# 按風格分組訓練
for style in annotations['style_keyword'].unique():
    style_images = annotations[annotations['style_keyword'] == style]
    # 訓練邏輯...
```

### 3. 商品推薦
```python
# GPT-4V 分析結果 → 商品檢索
def search_products(analysis_result):
    queries = analysis_result['product_query']
    # 使用 Fashion-CLIP 或屬性匹配
    return recommended_products
```

## 📝 標註原則

1. **一致性優先** - 同類穿搭使用相同風格標籤
2. **多選用分號** - 場合可多選：`"通勤;約會"`
3. **不確定留空** - 無法判斷的欄位留空
4. **避免猜測** - 不要推測品牌或精確價格

## 🎯 品質控制

- 圖片解析度：最低 512px，建議 1024px
- 人物要求：單人全身或半身照
- 風格一致性：由兩人以上標註員交叉驗證
- 定期更新：根據使用反饋調整標註規則

## 📈 使用統計

- **總圖片數**: 待填入
- **每風格平均**: 待填入
- **標註完整度**: 待計算
- **訓練/驗證/測試**: 80% / 10% / 10%

## 🔄 更新紀錄

- v1.0 (2024-01-13): 初始版本，建立基本結構與模板
- v1.1 (待更新): 完成實際圖片標註與驗證

## 📞 聯繫方式

如有標註疑問或建議改進，請聯繫開發團隊。