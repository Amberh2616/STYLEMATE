# BE 76 Figma 設計規格文檔

## 🎨 **整體設計理念**

### 視覺定位
- **時尚親和**: 歐美時尚網站美學 + 奈良美智可愛風格
- **信任專業**: 清潔簡約布局 + 專業色彩搭配  
- **智能安全**: 現代科技感 + 溫暖人性化互動

### 設計目標
- 25-35歲都市女性專業使用者
- 高端時尚感 + 易用性
- AI 社交體驗 + 個人助理功能

---

## 🎨 **設計系統 (Design System)**

### 色彩規範
```css
/* 主要色彩 */
--primary-brand: #FF6B9D;           /* 品牌粉紅 */
--primary-deep: #E91E63;            /* 深粉紅 */
--primary-light: #FFB3D1;           /* 淺粉紅 */

/* 輔助色彩 */
--secondary-blue: #4ECDC4;          /* 信任藍綠 */
--secondary-purple: #9C27B0;        /* 優雅紫 */
--secondary-gold: #FFD700;          /* 高級金 */

/* 中性色彩 */
--neutral-white: #FFFFFF;           /* 純白 */
--neutral-light: #F8F9FA;           /* 背景灰 */
--neutral-medium: #DEE2E6;          /* 邊框灰 */
--neutral-dark: #495057;            /* 文字灰 */
--neutral-black: #212529;           /* 標題黑 */

/* 狀態色彩 */
--success-green: #28A745;           /* 成功綠 */
--warning-orange: #FFC107;          /* 警告橙 */
--error-red: #DC3545;              /* 錯誤紅 */
--info-blue: #17A2B8;              /* 資訊藍 */

/* 漸變色彩 */
--gradient-primary: linear-gradient(135deg, #FF6B9D 0%, #4ECDC4 100%);
--gradient-secondary: linear-gradient(135deg, #9C27B0 0%, #FFD700 100%);
--gradient-neutral: linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%);
```

### 字體系統
```css
/* 字體家族 */
--font-primary: 'Inter', 'Noto Sans TC', sans-serif;     /* 主要字體 */
--font-secondary: 'Playfair Display', serif;             /* 裝飾字體 */
--font-code: 'Fira Code', monospace;                     /* 代碼字體 */

/* 字體大小 */
--text-xs: 12px;        /* 0.75rem - 輔助文字 */
--text-sm: 14px;        /* 0.875rem - 小文字 */
--text-base: 16px;      /* 1rem - 基準文字 */
--text-lg: 18px;        /* 1.125rem - 大文字 */
--text-xl: 20px;        /* 1.25rem - 標題 */
--text-2xl: 24px;       /* 1.5rem - 大標題 */
--text-3xl: 30px;       /* 1.875rem - 主標題 */
--text-4xl: 36px;       /* 2.25rem - 超大標題 */

/* 字重 */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;

/* 行高 */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.8;
```

### 間距系統
```css
/* 8pt 網格系統 */
--space-1: 4px;      /* 0.25rem */
--space-2: 8px;      /* 0.5rem */  
--space-3: 12px;     /* 0.75rem */
--space-4: 16px;     /* 1rem */
--space-5: 20px;     /* 1.25rem */
--space-6: 24px;     /* 1.5rem */
--space-8: 32px;     /* 2rem */
--space-10: 40px;    /* 2.5rem */
--space-12: 48px;    /* 3rem */
--space-16: 64px;    /* 4rem */
--space-20: 80px;    /* 5rem */
--space-24: 96px;    /* 6rem */
```

### 圓角系統
```css
--radius-none: 0px;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### 陰影系統
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.10);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
```

---

## 📐 **頁面佈局規格**

### 主要布局
```
┌─────────────────────────────────────────────┐
│                  Header                     │ 80px
├─────────────────────────────────────────────┤
│  Sidebar  │         Main Content            │
│   240px   │           Flexible              │
│           │                                 │
│           │  ┌─────────────────────────┐    │
│           │  │    Avatar Display       │    │
│           │  │       400px H           │    │
│           │  └─────────────────────────┘    │
│           │                                 │
│           │  ┌─────────────────────────┐    │
│           │  │   Function Cards        │    │
│           │  │     Grid Layout         │    │
│           │  └─────────────────────────┘    │
│           │                                 │
└───────────┴─────────────────────────────────┘
```

### 響應式斷點
```css
/* 移動端 */
@media (max-width: 767px) {
  .container { max-width: 100%; padding: 16px; }
  .sidebar { display: none; }
  .main-content { width: 100%; }
}

/* 平板端 */
@media (min-width: 768px) and (max-width: 1023px) {
  .container { max-width: 768px; padding: 24px; }
  .sidebar { width: 200px; }
}

/* 桌面端 */
@media (min-width: 1024px) {
  .container { max-width: 1200px; padding: 32px; }
  .sidebar { width: 240px; }
}

/* 大螢幕 */
@media (min-width: 1440px) {
  .container { max-width: 1400px; }
}
```

---

## 🧩 **組件設計規格**

### 1. Button 按鈕組件

#### Primary Button
```css
.btn-primary {
  background: var(--gradient-primary);
  color: var(--neutral-white);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: var(--neutral-white);
  color: var(--primary-brand);
  border: 2px solid var(--primary-brand);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--primary-brand);
  color: var(--neutral-white);
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--neutral-dark);
  border: 1px solid var(--neutral-medium);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-ghost:hover {
  background: var(--neutral-light);
  border-color: var(--primary-brand);
}
```

### 2. Card 卡片組件

#### Base Card
```css
.card {
  background: var(--neutral-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  transition: all 0.3s ease;
  border: 1px solid var(--neutral-medium);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

#### Feature Card (功能卡片)
```css
.feature-card {
  background: var(--gradient-neutral);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.4s ease;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.feature-card:hover::before {
  opacity: 0.1;
}

.feature-card:hover {
  border-color: var(--primary-brand);
  transform: translateY(-8px);
  box-shadow: var(--shadow-2xl);
}
```

### 3. Avatar Display 組件

#### Avatar Container
```css
.avatar-container {
  width: 400px;
  height: 400px;
  border-radius: var(--radius-2xl);
  background: var(--gradient-primary);
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  box-shadow: var(--shadow-xl);
}

.avatar-3d-space {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(255, 107, 157, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: avatar-pulse 3s infinite ease-in-out;
}

@keyframes avatar-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}
```

### 4. Status Panel 狀態面板

```css
.status-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  margin-top: var(--space-4);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.mood-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.mood-emoji {
  font-size: var(--text-xl);
  animation: mood-bounce 2s infinite ease-in-out;
}

@keyframes mood-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.activity-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--neutral-dark);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: var(--success-green);
  border-radius: 50%;
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
```

### 5. Room Card 房間卡片

```css
.room-card {
  background: var(--neutral-white);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  position: relative;
}

.room-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: var(--shadow-2xl);
  border-color: var(--primary-brand);
}

.room-header {
  padding: var(--space-6);
  background: var(--gradient-primary);
  color: var(--neutral-white);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.room-icon {
  font-size: var(--text-3xl);
  margin-right: var(--space-3);
}

.room-popularity {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: rgba(255, 255, 255, 0.2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
}

.room-preview {
  padding: var(--space-6);
  min-height: 200px;
}

.avatar-preview-container {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.mini-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-secondary);
  position: relative;
  animation: mini-avatar-float 3s infinite ease-in-out;
}

.mini-avatar.talking::after {
  content: '💬';
  position: absolute;
  top: -10px;
  right: -5px;
  font-size: 12px;
}

.mini-avatar.laughing::after {
  content: '😄';
  position: absolute;
  top: -10px;
  right: -5px;
  font-size: 12px;
}

@keyframes mini-avatar-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}
```

### 6. Message Bubble 對話泡泡

```css
.message-bubble {
  background: var(--neutral-light);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-2);
  position: relative;
  max-width: 80%;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.message-bubble.amber-message {
  background: var(--gradient-primary);
  color: var(--neutral-white);
  margin-left: auto;
}

.message-bubble.amber-message::before {
  content: '';
  position: absolute;
  bottom: -5px;
  right: 15px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid var(--primary-brand);
}

.message-bubble.friend-message::before {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 15px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid var(--neutral-light);
}
```

### 7. Tag 標籤組件

```css
.tag {
  display: inline-block;
  background: var(--primary-light);
  color: var(--primary-deep);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  margin-right: var(--space-1);
  margin-bottom: var(--space-1);
  transition: all 0.2s ease;
}

.tag:hover {
  background: var(--primary-brand);
  color: var(--neutral-white);
  transform: scale(1.05);
}
```

---

## 🎭 **Nara 風格 Avatar 設計規格**

### Avatar 基本規格
```
頭身比例: 1:1.5 (大頭身)
總高度: 350px
頭部寬度: 140px
頭部高度: 160px
身體寬度: 110px
身體高度: 190px
```

### 臉部特徵規格
```
眼睛:
- 大小: 佔臉寬35%
- 形狀: 大杏仁形
- 位置: 臉部高度45%處
- 顏色: 可變 (棕、藍、綠、紫)
- 特效: 星形高光

鼻子:
- 類型: 極簡點狀
- 大小: 2% 臉寬
- 位置: 臉部高度52%處

嘴巴:
- 預設: 微上揚小嘴
- 寬度: 12% 臉寬
- 表情變化: 5種狀態
```

### Avatar 色彩規格
```css
/* Nara 風格色彩 */
--nara-skin-base: #FFEEE6;          /* 溫暖膚色 */
--nara-skin-blush: #FFB6C1;         /* 臉紅色 */
--nara-hair-brown: #8B4513;         /* 自然棕 */
--nara-hair-black: #2F2F2F;         /* 柔和黑 */
--nara-hair-blonde: #DEB887;        /* 溫暖金 */
--nara-hair-pink: #D8BFD8;          /* 灰粉紅 */

/* 眼睛顏色選項 */
--nara-eye-brown: #8B4513;
--nara-eye-blue: #4682B4;
--nara-eye-green: #228B22;
--nara-eye-purple: #9370DB;
```

### Avatar 動畫狀態
```css
/* 待機動畫 */
@keyframes nara-breathing {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.02); }
}

/* 眨眼動畫 */
@keyframes nara-blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

/* 說話動畫 */
@keyframes nara-talking {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.05); }
  75% { transform: scale(0.95); }
}

/* 開心動畫 */
@keyframes nara-happy {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(2deg) scale(1.05); }
  75% { transform: rotate(-2deg) scale(1.05); }
}
```

---

## 📱 **頁面模板設計**

### 1. 主頁面 (Homepage)
```
┌─────────────────────────────────────────────┐
│  Header                                     │
│  ┌─ Logo  ── Navigation ── User Profile ─┐  │
└──┴─────────────────────────────────────────┴──┘
┌─────────────────────────────────────────────┐
│  Hero Section                               │
│  ┌─────────────────────┐ ┌─────────────────┐ │
│  │                     │ │  Amber Avatar   │ │
│  │   Welcome Text      │ │   Display       │ │
│  │   + CTA Buttons     │ │   400x400px     │ │
│  │                     │ │                 │ │
│  └─────────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Feature Cards Section                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │Personal  │ │AI Social │ │Settings  │    │
│  │Assistant │ │Rooms     │ │& Profile │    │
│  │          │ │          │ │          │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

### 2. AI 社交房間頁面
```
┌─────────────────────────────────────────────┐
│  Room Navigation Tabs                       │
│  [生活風格] [創意藝術] [科技數位] [更多...]    │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Active Room Display                        │
│  ┌─────────────────────────────────────────┐ │
│  │         Room Environment                │ │
│  │                                         │ │
│  │  👤Amber    👤Maya    👤Alex           │ │
│  │    💬         😄        🤔            │ │
│  │                                         │ │
│  │  ┌─────────────────────────────────┐   │ │
│  │  │ "這件外套配牛仔褲會很棒！"        │   │ │
│  │  └─────────────────────────────────┘   │ │
│  │           ┌───────────────────────┐     │ │
│  │           │ "Amber 的品味真好！✨" │     │ │
│  │           └───────────────────────┘     │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Other Rooms Grid                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │Fashion   │ │Beauty    │ │Travel    │    │
│  │Room      │ │Room      │ │Room      │    │
│  │🔥 24     │ │🔥 18     │ │🔥 12     │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘
```

### 3. 個人助理頁面
```
┌─────────────────────────────────────────────┐
│  Personal Assistant Header                  │
│  "Amber 專屬造型師" + Mode Selector         │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Assistant Interaction Area                │
│  ┌─────────────┐ ┌─────────────────────────┐ │
│  │            │ │                         │ │
│  │   Amber     │ │    Chat Interface       │ │
│  │  Avatar     │ │                         │ │
│  │ (Stylist    │ │  💬 "今天想要什麼風格？"  │ │
│  │   Mode)     │ │                         │ │
│  │            │ │  [上傳照片] [語音輸入]   │ │
│  │            │ │                         │ │
│  └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  Results Display Area                       │
│  ┌─────────────────────────────────────────┐ │
│  │        Style Recommendations           │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │ │
│  │  │Item 1│ │Item 2│ │Item 3│ │Item 4│  │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘  │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🎨 **互動動畫規格**

### Hover Effects
```css
/* 按鈕懸浮效果 */
.btn-hover-effect {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-hover-effect:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 107, 157, 0.4);
}

/* 卡片懸浮效果 */
.card-hover-effect {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.card-hover-effect:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
}

/* Avatar 互動效果 */
.avatar-interactive:hover {
  cursor: pointer;
}

.avatar-interactive:hover .avatar-glow {
  animation-duration: 1s;
  opacity: 0.8;
}
```

### Loading Animations
```css
/* 載入動畫 */
@keyframes loading-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes loading-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-indicator {
  animation: loading-pulse 1.5s infinite ease-in-out;
}

.loading-spinner {
  animation: loading-spin 1s linear infinite;
}
```

### Transition Effects
```css
/* 頁面轉場效果 */
.page-transition-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.6s ease-out;
}

.page-transition-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-transition-exit-active {
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.4s ease-in;
}
```

---

## 📐 **Figma 實作指南**

### 1. 設計檔案結構
```
BE76_Design_System/
├── 🎨 Design_Tokens
│   ├── Colors
│   ├── Typography  
│   ├── Spacing
│   └── Effects
├── 🧩 Components
│   ├── Buttons
│   ├── Cards
│   ├── Forms
│   ├── Navigation
│   └── Avatar_System
├── 📱 Templates
│   ├── Homepage
│   ├── Social_Rooms
│   ├── Personal_Assistant
│   └── Settings
└── 📐 Layouts
    ├── Desktop_1440px
    ├── Tablet_768px
    └── Mobile_375px
```

### 2. 組件命名規範
```
Button/Primary/Default
Button/Primary/Hover
Button/Primary/Active
Button/Primary/Disabled

Card/Feature/Default
Card/Feature/Hover
Card/Room/Fashion
Card/Room/Beauty

Avatar/Nara/Happy
Avatar/Nara/Thinking
Avatar/Nara/Talking
```

### 3. Auto Layout 設定
```
Stack Direction: Vertical
Spacing: 16px (var(--space-4))
Padding: 24px (var(--space-6))
Fill: Horizontal fill container
Alignment: Center
```

### 4. 樣式 (Styles) 配置
```
Text Styles:
- Heading/H1 - Inter Bold 36px
- Heading/H2 - Inter Bold 30px  
- Heading/H3 - Inter SemiBold 24px
- Body/Large - Inter Regular 18px
- Body/Base - Inter Regular 16px
- Caption - Inter Medium 14px

Color Styles:
- Primary/Brand
- Primary/Deep
- Primary/Light
- Neutral/White
- Neutral/Dark
- Status/Success
- Status/Warning
- Status/Error

Effect Styles:
- Shadow/Small
- Shadow/Medium
- Shadow/Large
- Shadow/XLarge
```

---

## 💻 **開發交接規格**

### CSS 變數對應
```css
/* 與 Figma Tokens 對應的 CSS 變數 */
:root {
  /* Figma Color Tokens → CSS Variables */
  --figma-primary-brand: #FF6B9D;
  --figma-primary-deep: #E91E63;
  
  /* Figma Typography Tokens → CSS Variables */
  --figma-heading-h1: 36px;
  --figma-heading-h2: 30px;
  
  /* Figma Spacing Tokens → CSS Variables */
  --figma-space-xs: 4px;
  --figma-space-sm: 8px;
  
  /* Figma Effect Tokens → CSS Variables */
  --figma-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

### 組件對應表
| Figma 組件 | CSS 類別 | 用途 |
|------------|----------|------|
| Button/Primary | .btn-primary | 主要行動按鈕 |
| Card/Feature | .feature-card | 功能展示卡片 |
| Avatar/Container | .avatar-container | Avatar 展示容器 |
| Room/Card | .room-card | 社交房間卡片 |

### 輸出規格
- **圖片**: PNG 24bit, @1x @2x @3x
- **圖標**: SVG 格式, 24x24px 基準
- **字體**: WOFF2 格式
- **動畫**: CSS Keyframes + Figma Motion

---

這份 Figma 設計規格文檔提供了完整的 BE 76 平台視覺設計系統，包含所有必要的設計 token、組件規格、頁面布局和實作指南，可以直接用於前端開發實作！✨