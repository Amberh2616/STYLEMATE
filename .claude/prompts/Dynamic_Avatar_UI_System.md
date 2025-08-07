# BE 76 動態 Avatar 與豐富網頁界面系統

## 🎨 視覺設計理念

### 整體風格定位
- **現代活潑**：明亮色彩 + 流暢動畫
- **親和力強**：可愛 Avatar + 溫暖色調
- **互動豐富**：即時反饋 + 動態效果
- **沉浸體驗**：3D 空間感 + 社交臨場感

### 色彩系統
```css
:root {
  /* 主色調 - 溫暖漸變 */
  --primary-gradient: linear-gradient(135deg, #FF6B6B, #4ECDC4);
  --secondary-gradient: linear-gradient(135deg, #A8E6CF, #DCEDC1);
  
  /* 情感色彩 */
  --happy-color: #FFD93D;
  --excited-color: #FF6B6B;
  --curious-color: #4ECDC4;
  --friendly-color: #95E1D3;
  
  /* 背景層次 */
  --bg-primary: #F8F9FA;
  --bg-secondary: #FFFFFF;
  --bg-card: rgba(255, 255, 255, 0.9);
  --bg-overlay: rgba(76, 205, 196, 0.1);
}
```

## 🏠 主頁面佈局設計

### 1. 動態歡迎區域
```html
<div class="welcome-zone">
  <!-- Amber Avatar 主展示區 -->
  <div class="amber-avatar-container">
    <div class="avatar-3d-space">
      <canvas id="amberAvatarCanvas"></canvas>
      <!-- 動態背景粒子效果 -->
      <div class="particle-background"></div>
    </div>
    
    <!-- Avatar 狀態指示器 -->
    <div class="avatar-status-panel">
      <div class="mood-indicator">
        <span class="mood-emoji">😊</span>
        <span class="mood-text">Amber 心情很棒！</span>
      </div>
      <div class="activity-indicator">
        <div class="pulse-dot"></div>
        <span>正在時尚房間聊天中...</span>
      </div>
    </div>
    
    <!-- 歡迎對話泡泡 -->
    <div class="welcome-bubble animated-bubble">
      <p>"Hi！今天想聊什麼呢？✨"</p>
      <div class="bubble-tail"></div>
    </div>
  </div>
</div>
```

### 2. 功能選單區域
```html
<div class="function-menu">
  <!-- 個人助理卡片 -->
  <div class="feature-card personal-assistant-card">
    <div class="card-header">
      <div class="icon-container">
        <i class="fas fa-magic sparkle-animation"></i>
      </div>
      <h3>個人助理</h3>
    </div>
    <div class="card-content">
      <div class="mini-avatars">
        <!-- 小型 Amber 正在分析服裝 -->
        <div class="mini-amber analyzing-outfit"></div>
      </div>
      <p>讓 Amber 為你搭配完美造型</p>
    </div>
    <button class="cta-button">開始諮詢 💄</button>
  </div>
  
  <!-- AI 社交卡片 -->
  <div class="feature-card social-card">
    <div class="card-header">
      <div class="icon-container">
        <i class="fas fa-users bounce-animation"></i>
      </div>
      <h3>AI 社交世界</h3>
    </div>
    <div class="card-content">
      <div class="social-preview">
        <!-- 多個小 Avatar 在不同房間互動 -->
        <div class="room-preview">
          <div class="mini-room fashion-room">
            <div class="mini-avatars-group">
              <div class="mini-avatar amber"></div>
              <div class="mini-avatar friend-1"></div>
              <div class="mini-avatar friend-2"></div>
            </div>
            <span class="room-label">時尚聊天室</span>
          </div>
        </div>
      </div>
      <p>Amber 正在為你建立友誼圈</p>
    </div>
    <button class="cta-button">探索社交 🌟</button>
  </div>
</div>
```

## 🎭 Avatar 動態系統設計

### Avatar 3D 建模規格
```typescript
interface AmberAvatarConfig {
  // 基礎外觀
  appearance: {
    style: 'cute-chibi' | 'realistic' | 'anime',
    hairColor: string,
    skinTone: string,
    eyeColor: string,
    height: number, // 相對比例
    bodyType: 'slim' | 'average' | 'curvy'
  },
  
  // 服裝系統
  wardrobe: {
    currentOutfit: OutfitConfig,
    accessories: AccessoryConfig[],
    seasonalOptions: SeasonalWardrobe,
    moodBasedOutfits: MoodOutfits
  },
  
  // 動畫狀態
  animations: {
    idle: IdleAnimation[],
    talking: TalkingAnimation[],
    thinking: ThinkingAnimation[],
    excited: ExcitedAnimation[],
    analyzing: AnalyzingAnimation[]
  },
  
  // 表情系統
  expressions: {
    current: EmotionState,
    intensity: number,
    blendShapes: FacialBlendShapes
  }
}
```

### 動態行為邏輯
```typescript
class AmberAvatarController {
  private avatar: AmberAvatar;
  private animationQueue: AnimationSequence[];
  private emotionEngine: EmotionEngine;
  
  constructor() {
    this.avatar = new AmberAvatar();
    this.emotionEngine = new EmotionEngine();
  }
  
  // 根據上下文動態調整 Avatar
  async updateAvatarContext(context: InteractionContext) {
    // 1. 分析當前情境
    const contextualEmotion = await this.analyzeContextualEmotion(context);
    
    // 2. 選擇合適的服裝
    const appropriateOutfit = await this.selectContextualOutfit(context);
    
    // 3. 調整表情和動作
    await this.transitionToNewState(contextualEmotion, appropriateOutfit);
    
    // 4. 添加情境化動畫
    this.addContextualAnimations(context);
  }
  
  // 個人助理模式動畫
  async enterPersonalAssistantMode(taskType: 'fashion' | 'makeup' | 'general') {
    switch(taskType) {
      case 'fashion':
        await this.avatar.changeOutfit('stylist-chic');
        await this.avatar.playAnimation('fashion-analyzing');
        await this.avatar.addAccessory('style-glasses');
        break;
        
      case 'makeup':
        await this.avatar.changeOutfit('beauty-guru');
        await this.avatar.playAnimation('makeup-applying');
        await this.avatar.addAccessory('makeup-brush');
        break;
        
      case 'general':
        await this.avatar.changeOutfit('casual-friendly');
        await this.avatar.playAnimation('thinking-pose');
        break;
    }
    
    // 添加專業光環效果
    this.avatar.addVisualEffect('professional-aura');
  }
  
  // 社交模式動畫
  async enterSocialMode(roomType: string, participants: AIAgent[]) {
    // 根據房間主題調整外觀
    const socialOutfit = await this.selectSocialOutfit(roomType);
    await this.avatar.changeOutfit(socialOutfit);
    
    // 社交互動動畫
    await this.avatar.playAnimation('social-greeting');
    
    // 根據參與者調整互動風格
    const interactionStyle = this.calculateInteractionStyle(participants);
    this.avatar.setInteractionStyle(interactionStyle);
  }
  
  // 房間移動動畫
  async moveToRoom(targetRoom: SocialRoom, transitionType: 'walk' | 'teleport' | 'fade') {
    const currentPosition = this.avatar.getPosition();
    const targetPosition = targetRoom.getAvatarPosition();
    
    switch(transitionType) {
      case 'walk':
        await this.animateWalkToPosition(currentPosition, targetPosition);
        break;
      case 'teleport':
        await this.animateTeleport(targetPosition);
        break;
      case 'fade':
        await this.animateFadeTransition(targetPosition);
        break;
    }
    
    // 進入房間後的適應動畫
    await this.avatar.playAnimation('room-adaptation');
  }
}
```

## 🌈 動態背景與特效系統

### 背景粒子效果
```typescript
class DynamicBackgroundEngine {
  private particleSystem: ParticleSystem;
  private environmentLighting: LightingSystem;
  
  async createMoodBasedBackground(mood: EmotionState): Promise<BackgroundConfig> {
    const backgroundEffects = {
      happy: {
        particles: 'floating-hearts',
        colors: ['#FFD93D', '#FF6B6B', '#4ECDC4'],
        animation: 'gentle-float',
        intensity: 0.7
      },
      excited: {
        particles: 'sparkle-burst',
        colors: ['#FF6B6B', '#FFD93D', '#FF8E8E'],
        animation: 'energetic-burst',
        intensity: 1.0
      },
      curious: {
        particles: 'question-marks',
        colors: ['#4ECDC4', '#95E1D3', '#A8E6CF'],
        animation: 'floating-curiosity',
        intensity: 0.5
      },
      thinking: {
        particles: 'thought-bubbles',
        colors: ['#B8B8B8', '#D3D3D3', '#F0F0F0'],
        animation: 'slow-drift',
        intensity: 0.3
      }
    };
    
    return backgroundEffects[mood] || backgroundEffects.happy;
  }
  
  async animateRoomTransition(fromRoom: string, toRoom: string) {
    // 房間主題化背景轉換
    const roomThemes = {
      'fashion-room': {
        background: 'gradient(#FFB6C1, #FFC0CB)',
        particles: 'fashion-items',
        lighting: 'warm-spotlight'
      },
      'art-room': {
        background: 'gradient(#DDA0DD, #E6E6FA)',
        particles: 'paint-drops',
        lighting: 'creative-ambiance'
      },
      'tech-room': {
        background: 'gradient(#00CED1, #20B2AA)',
        particles: 'binary-code',
        lighting: 'digital-glow'
      }
    };
    
    await this.smoothTransition(roomThemes[fromRoom], roomThemes[toRoom]);
  }
}
```

### 互動反饋系統
```css
/* 動態互動效果 */
.interactive-element {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.interactive-element::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(76, 205, 196, 0.3) 0%, transparent 70%);
  transition: all 0.6s ease;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.interactive-element:hover::before {
  width: 300px;
  height: 300px;
}

/* Avatar 互動光暈 */
.avatar-interaction-glow {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: radial-gradient(circle, rgba(255, 107, 107, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-glow 2s infinite ease-in-out;
  opacity: 0;
}

.avatar-container:hover .avatar-interaction-glow {
  opacity: 1;
}

@keyframes pulse-glow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* 對話泡泡動畫 */
.animated-bubble {
  animation: bubble-float 3s infinite ease-in-out;
  transform-origin: bottom center;
}

@keyframes bubble-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(1deg); }
  75% { transform: translateY(-2px) rotate(-1deg); }
}

/* 房間入口動畫 */
.room-entrance {
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.room-entrance::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(76, 205, 196, 0.3), transparent);
  transition: left 0.8s ease;
}

.room-entrance:hover::after {
  left: 100%;
}
```

## 🎪 社交房間視覺設計

### 房間界面佈局
```html
<div class="social-rooms-container">
  <!-- 房間導航 -->
  <div class="room-navigation">
    <div class="room-category-tabs">
      <button class="tab-button active" data-category="lifestyle">
        <i class="fas fa-home"></i>
        <span>生活風格</span>
        <div class="tab-indicator"></div>
      </button>
      <button class="tab-button" data-category="creative">
        <i class="fas fa-palette"></i>
        <span>創意藝術</span>
      </button>
      <button class="tab-button" data-category="tech">
        <i class="fas fa-laptop"></i>
        <span>科技數位</span>
      </button>
    </div>
  </div>
  
  <!-- 房間展示區 -->
  <div class="rooms-grid">
    <!-- 時尚穿搭房間 -->
    <div class="room-card fashion-room">
      <div class="room-header">
        <div class="room-icon">👗</div>
        <h3>時尚穿搭</h3>
        <div class="room-popularity">
          <span class="fire-icon">🔥</span>
          <span class="participant-count">24</span>
        </div>
      </div>
      
      <div class="room-preview">
        <!-- 實時 Avatar 預覽 -->
        <div class="avatar-preview-container">
          <div class="mini-avatar amber talking"></div>
          <div class="mini-avatar friend-maya laughing"></div>
          <div class="mini-avatar friend-alex thinking"></div>
        </div>
        
        <!-- 對話預覽 -->
        <div class="conversation-preview">
          <div class="message-bubble amber-message">
            "這件外套配牛仔褲會很棒！"
          </div>
          <div class="message-bubble friend-message">
            "Amber 的品味真好！✨"
          </div>
        </div>
      </div>
      
      <div class="room-footer">
        <div class="room-tags">
          <span class="tag">#穿搭</span>
          <span class="tag">#風格</span>
          <span class="tag">#購物</span>
        </div>
        <button class="enter-room-btn">
          <span>讓 Amber 進入</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
    
    <!-- 美妝保養房間 -->
    <div class="room-card beauty-room">
      <!-- 類似結構，不同主題色彩 -->
    </div>
    
    <!-- 旅行探索房間 -->
    <div class="room-card travel-room">
      <!-- 類似結構，不同主題色彩 -->
    </div>
  </div>
</div>
```

### Avatar 互動動畫
```typescript
class RoomInteractionAnimations {
  
  async playAvatarEntry(avatar: AmberAvatar, room: SocialRoom) {
    // 1. 入場動畫
    await avatar.playAnimation('confident-walk-in');
    
    // 2. 環顧四周
    await avatar.playAnimation('look-around');
    
    // 3. 友善打招呼
    await avatar.playAnimation('wave-greeting');
    
    // 4. 找位置坐下或站立
    await avatar.playAnimation('find-position');
    
    // 5. 開始社交模式
    avatar.enterSocialMode();
  }
  
  async playConversationAnimation(avatar: AmberAvatar, messageType: string) {
    const animations = {
      'agreement': 'nod-enthusiastically',
      'excitement': 'clap-hands',
      'thinking': 'hand-to-chin',
      'laughing': 'laugh-animation',
      'surprised': 'gasp-reaction',
      'sharing': 'gesture-explaining'
    };
    
    await avatar.playAnimation(animations[messageType] || 'neutral-talk');
  }
  
  async playRoomTransition(avatar: AmberAvatar, fromRoom: string, toRoom: string) {
    // 1. 告別動畫
    await avatar.playAnimation('polite-goodbye');
    
    // 2. 移動動畫
    await avatar.playAnimation('confident-walk');
    
    // 3. 淡出效果
    await avatar.fadeOut(0.5);
    
    // 4. 切換房間背景
    await this.switchRoomEnvironment(fromRoom, toRoom);
    
    // 5. 淡入新房間
    await avatar.fadeIn(0.5);
    
    // 6. 新房間入場
    await this.playAvatarEntry(avatar, toRoom);
  }
}
```

## 📱 響應式設計與移動端優化

```css
/* 響應式 Avatar 系統 */
@media (max-width: 768px) {
  .amber-avatar-container {
    height: 300px; /* 移動端適配 */
  }
  
  .avatar-3d-space {
    transform: scale(0.8); /* 縮放適配 */
  }
  
  .rooms-grid {
    grid-template-columns: 1fr; /* 單列顯示 */
    gap: 15px;
  }
  
  .room-card {
    padding: 15px;
    margin: 10px;
  }
  
  /* 移動端手勢優化 */
  .interactive-element {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}

/* 平板適配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .rooms-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 桌面端完整體驗 */
@media (min-width: 1025px) {
  .rooms-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  /* 桌面端懸浮效果 */
  .room-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
}
```

這個動態 Avatar 與豐富網頁界面系統將為 BE 76 平台帶來：

🎨 **視覺震撼**：流暢動畫 + 豐富色彩 + 3D 效果
🎭 **情感連結**：可愛 Avatar + 表情豐富 + 個性化互動  
🌟 **沉浸體驗**：即時反饋 + 情境動畫 + 社交臨場感
📱 **全端優化**：響應式設計 + 跨設備體驗

讓用戶在使用 BE 76 時感受到真正的 AI 社交樂趣！