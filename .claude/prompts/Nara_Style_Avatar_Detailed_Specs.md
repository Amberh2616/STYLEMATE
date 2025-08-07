# BE 76 奈良美智風格 3D Avatar 詳細規格書

## 🎨 **3D 模型基礎規格**

### **頭部建模規格**
```javascript
// 頭部比例設計 (奈良美智特色)
const HeadModelSpecs = {
  overall: {
    shape: "rounded_oval",           // 圓潤橢圓形
    proportions: {
      width: 100,                    // 基準寬度
      height: 110,                   // 略高的比例
      depth: 95                      // 適度立體感
    },
    vertices: 8500,                  // 頭部頂點數
    polygons: 4200                   // 面數控制
  },
  
  // 眼部設計 (最重要特徵)
  eyes: {
    size_ratio: 0.35,               // 佔臉寬的35%
    position: {
      height: 0.45,                 // 眼睛位置較高
      spacing: 0.28,                // 眼距適中
      depth: 0.02                   // 微凹陷感
    },
    shape: "large_round_almond",     // 大杏仁形
    features: {
      iris_size: 0.8,              // 大虹膜
      pupil_size: 0.6,             // 大瞳孔
      eyelash_style: "subtle_long", // 微妙長睫毛
      eyebrow_distance: 0.15        // 眉眼距離
    }
  },
  
  // 鼻子設計 (簡化風格)
  nose: {
    type: "minimal_dot",             // 極簡點狀
    size: 0.02,                     // 非常小
    position: {
      height: 0.52,                 // 鼻子位置
      protrusion: 0.005             // 微突出
    }
  },
  
  // 嘴巴設計
  mouth: {
    default_shape: "small_gentle_curve", // 小巧溫和曲線
    width: 0.12,                    // 嘴寬比例
    expressions: {
      neutral: "subtle_upturn",      // 微上揚
      smile: "gentle_curve",         // 溫和弧度
      excited: "wider_smile",        // 較寬笑容
      thinking: "slight_pout"        // 微嘟嘴
    }
  }
};
```

### **身體建模規格**
```javascript
const BodyModelSpecs = {
  proportions: {
    head_to_body: "1:1.5",          // 大頭身比例
    shoulder_width: 0.8,            // 相對頭寬
    waist_ratio: 0.7,               // 腰身比例
    total_height: 2.5               // 總高度 (以頭為單位)
  },
  
  arms: {
    length_ratio: 0.9,              // 手臂長度
    thickness: "soft_rounded",       // 柔和圓潤
    joints: "smooth_cartoon",        // 卡通關節
    hands: {
      size: 0.8,                   // 手掌大小
      fingers: "simplified_4",      // 簡化4指
      gesture_capability: "full"    // 完整手勢能力
    }
  },
  
  legs: {
    length_ratio: 0.7,              // 腿長比例  
    thickness: "proportionate",      // 協調粗細
    feet: {
      size: 0.6,                   // 腳掌大小
      style: "cute_rounded"         // 可愛圓潤
    }
  }
};
```

## 🎭 **材質與渲染系統**

### **奈良美智風格材質**
```hlsl
// Toon Shader 配置
Shader "NaraStyle/CharacterToon" {
    Properties {
        // 基礎顏色
        _MainTex ("Albedo", 2D) = "white" {}
        _BaseColor ("Base Color", Color) = (1,1,1,1)
        
        // 奈良風格特色
        _Softness ("Softness", Range(0,1)) = 0.8     // 柔和度
        _WarmthTint ("Warmth Tint", Color) = (1,0.95,0.9,1)  // 溫暖色調
        _BlushIntensity ("Blush Intensity", Range(0,1)) = 0.3 // 臉紅強度
        
        // 卡通渲染
        _ShadowSteps ("Shadow Steps", Range(2,10)) = 3       // 陰影層級
        _RimLightColor ("Rim Light", Color) = (1,1,1,0.5)   // 邊緣光
        _OutlineWidth ("Outline Width", Range(0,0.1)) = 0.02 // 輪廓線寬
    }
    
    SubShader {
        // 卡通渲染通道
        Pass {
            Name "ToonRender"
            CGPROGRAM
            
            // 柔和光照計算
            fixed3 NaraSoftLighting(fixed3 normal, fixed3 lightDir) {
                fixed NdotL = max(0, dot(normal, lightDir));
                
                // 分層光照 (奈良風格)
                if (NdotL > 0.8) return _BaseColor.rgb;
                else if (NdotL > 0.4) return _BaseColor.rgb * 0.8;
                else if (NdotL > 0.1) return _BaseColor.rgb * 0.6;
                else return _BaseColor.rgb * 0.4;
            }
            
            // 臉紅效果
            fixed3 ApplyBlush(fixed2 uv, fixed3 baseColor) {
                fixed2 cheekCenter = fixed2(0.3, 0.4); // 臉頰位置
                fixed cheekDist = distance(uv, cheekCenter);
                fixed blushMask = smoothstep(0.15, 0.05, cheekDist);
                
                fixed3 blushColor = fixed3(1, 0.7, 0.8); // 粉紅色
                return lerp(baseColor, blushColor, blushMask * _BlushIntensity);
            }
            
            ENDCG
        }
    }
}
```

### **紋理貼圖設計**
```javascript
const TextureSpecs = {
  face_texture: {
    resolution: "1024x1024",
    format: "RGBA",
    features: {
      base_skin: {
        color: "#FFEEE6",            // 溫暖膚色
        smoothness: 0.9,             // 高平滑度
        subsurface: 0.3              // 皮下散射
      },
      
      eyes: {
        iris_texture: "gradient_soft", // 漸變虹膜
        highlight: "star_sparkle",     // 星形高光
        colors: [
          "#8B4513",  // 棕色
          "#4682B4",  // 藍色
          "#228B22",  // 綠色
          "#9370DB"   // 紫色
        ]
      },
      
      blush_areas: {
        cheek_positions: [(0.25, 0.4), (0.75, 0.4)],
        color: "#FFB6C1",            // 淡粉色
        softness: 0.8,               // 柔和邊緣
        intensity_range: [0.1, 0.5]  // 強度範圍
      }
    }
  },
  
  hair_texture: {
    resolution: "512x512", 
    style: "soft_painted",           // 柔和手繪風
    colors: {
      natural_brown: "#8B4513",
      soft_black: "#2F2F2F", 
      warm_blonde: "#DEB887",
      dusty_pink: "#D8BFD8"
    },
    properties: {
      glossiness: 0.4,             // 適度光澤
      flow_direction: "natural",    // 自然流向
      layering: "multi_strand"      // 多層次
    }
  }
};
```

## 🎪 **動畫系統詳細規格**

### **基礎動作庫**
```javascript
const NaraAnimationLibrary = {
  // 待機動畫
  idle_animations: {
    gentle_breathing: {
      duration: 4.0,
      loop: true,
      keyframes: [
        { time: 0, chest_scale: 1.0, eye_blink: 0 },
        { time: 2, chest_scale: 1.02, eye_blink: 0 },
        { time: 2.1, chest_scale: 1.02, eye_blink: 1 },
        { time: 2.2, chest_scale: 1.02, eye_blink: 0 },
        { time: 4, chest_scale: 1.0, eye_blink: 0 }
      ]
    },
    
    subtle_sway: {
      duration: 6.0,
      loop: true,
      keyframes: [
        { time: 0, body_rotation: 0, head_tilt: 0 },
        { time: 3, body_rotation: 1, head_tilt: -0.5 },
        { time: 6, body_rotation: 0, head_tilt: 0 }
      ]
    },
    
    occasional_blink: {
      duration: 3.5,
      loop: true,
      probability: 0.8,
      keyframes: [
        { time: 0, eyelid_position: 0 },
        { time: 0.1, eyelid_position: 1 },
        { time: 0.2, eyelid_position: 0 }
      ]
    }
  },
  
  // 情感表達動畫
  emotion_animations: {
    happiness: {
      eye_sparkle: {
        duration: 1.5,
        effects: ["star_particles", "gentle_glow"],
        keyframes: [
          { time: 0, eye_scale: 1.0, sparkle: 0 },
          { time: 0.5, eye_scale: 1.1, sparkle: 1 },
          { time: 1.5, eye_scale: 1.0, sparkle: 0 }
        ]
      },
      
      happy_bounce: {
        duration: 1.0,
        keyframes: [
          { time: 0, body_y: 0, arm_angle: 0 },
          { time: 0.3, body_y: 5, arm_angle: 15 },
          { time: 0.6, body_y: 0, arm_angle: 0 },
          { time: 1.0, body_y: 0, arm_angle: 0 }
        ]
      },
      
      cheek_blush: {
        duration: 2.0,
        keyframes: [
          { time: 0, blush_intensity: 0.1 },
          { time: 1.0, blush_intensity: 0.4 },
          { time: 2.0, blush_intensity: 0.2 }
        ]
      }
    },
    
    thinking: {
      head_tilt: {
        duration: 2.0,
        keyframes: [
          { time: 0, head_rotation: 0, hand_position: "side" },
          { time: 1.0, head_rotation: 15, hand_position: "chin" },
          { time: 2.0, head_rotation: 12, hand_position: "chin" }
        ]
      },
      
      eye_movement: {
        duration: 3.0,
        keyframes: [
          { time: 0, eye_direction: "center" },
          { time: 1.0, eye_direction: "up_left" },
          { time: 2.0, eye_direction: "up_right" },
          { time: 3.0, eye_direction: "center" }
        ]
      }
    },
    
    excitement: {
      energetic_gesture: {
        duration: 1.5,
        keyframes: [
          { time: 0, arms: "neutral", body_lean: 0 },
          { time: 0.5, arms: "raised_joy", body_lean: 5 },
          { time: 1.0, arms: "clapping", body_lean: -2 },
          { time: 1.5, arms: "neutral", body_lean: 0 }
        ]
      },
      
      eye_shine: {
        duration: 1.0,
        effects: ["bright_highlight", "pupil_dilation"],
        keyframes: [
          { time: 0, eye_brightness: 1.0 },
          { time: 0.5, eye_brightness: 1.3 },
          { time: 1.0, eye_brightness: 1.0 }
        ]
      }
    }
  },
  
  // 社交互動動畫
  social_animations: {
    friendly_wave: {
      duration: 2.0,
      keyframes: [
        { time: 0, right_arm: "down", wrist_rotation: 0 },
        { time: 0.5, right_arm: "raised_45", wrist_rotation: 0 },
        { time: 1.0, right_arm: "raised_45", wrist_rotation: 30 },
        { time: 1.3, right_arm: "raised_45", wrist_rotation: -30 },
        { time: 1.6, right_arm: "raised_45", wrist_rotation: 30 },
        { time: 2.0, right_arm: "down", wrist_rotation: 0 }
      ]
    },
    
    active_listening: {
      duration: 4.0,
      loop: true,
      keyframes: [
        { time: 0, head_nod: 0, eye_focus: "speaker" },
        { time: 1.0, head_nod: 5, eye_focus: "speaker" },
        { time: 1.5, head_nod: 0, eye_focus: "speaker" },
        { time: 3.0, head_nod: 3, eye_focus: "speaker" },
        { time: 4.0, head_nod: 0, eye_focus: "speaker" }
      ]
    },
    
    conversation_gestures: {
      duration: 5.0,
      variations: 8,
      keyframes: [
        // 手勢變化1: 輕柔指向
        { time: 0, gesture: "gentle_point", intensity: 0.6 },
        { time: 1.5, gesture: "open_palm", intensity: 0.7 },
        { time: 3.0, gesture: "subtle_emphasis", intensity: 0.5 },
        { time: 5.0, gesture: "rest_position", intensity: 0 }
      ]
    }
  }
};
```

### **房間專屬動畫**
```javascript
const RoomSpecificAnimations = {
  fashion_room: {
    entry_animation: {
      name: "fashionable_entrance",
      duration: 3.0,
      sequence: [
        { action: "confident_walk", duration: 1.0 },
        { action: "outfit_showcase_spin", duration: 1.0 },
        { action: "pleased_pose", duration: 1.0 }
      ]
    },
    
    idle_behaviors: [
      {
        name: "admire_outfit",
        probability: 0.3,
        animation: "look_down_at_clothes_approvingly"
      },
      {
        name: "style_hair",
        probability: 0.2, 
        animation: "gentle_hair_touch"
      },
      {
        name: "confident_stance",
        probability: 0.5,
        animation: "subtle_pose_adjust"
      }
    ],
    
    interaction_animations: {
      compliment_received: "bashful_smile_with_blush",
      giving_advice: "thoughtful_gesture_with_point",
      showing_outfit: "graceful_turn_display"
    }
  },
  
  beauty_room: {
    entry_animation: {
      name: "beauty_check_entrance", 
      duration: 3.0,
      sequence: [
        { action: "mirror_check_gesture", duration: 1.5 },
        { action: "satisfied_nod", duration: 0.5 },
        { action: "ready_for_chat_pose", duration: 1.0 }
      ]
    },
    
    idle_behaviors: [
      {
        name: "lip_touch",
        probability: 0.25,
        animation: "gentle_lip_touch_check"
      },
      {
        name: "cheek_touch",
        probability: 0.25,
        animation: "soft_cheek_pat"
      },
      {
        name: "hair_adjust",
        probability: 0.3,
        animation: "delicate_hair_adjust"
      },
      {
        name: "makeup_check",
        probability: 0.2,
        animation: "subtle_face_examination"
      }
    ]
  },
  
  social_lounge: {
    entry_animation: {
      name: "friendly_social_entrance",
      duration: 2.5,
      sequence: [
        { action: "warm_wave", duration: 1.0 },
        { action: "look_around_friendly", duration: 1.0 },
        { action: "relaxed_settle", duration: 0.5 }
      ]
    },
    
    conversation_states: {
      storytelling: "animated_narrative_gestures",
      listening_intently: "engaged_leaning_posture", 
      laughing: "genuine_laugh_animation",
      agreeing: "enthusiastic_nodding",
      surprised: "cute_surprise_expression"
    }
  }
};
```

## 🎨 **個性化定制系統**

### **外觀變化配置**
```javascript
const PersonalizationOptions = {
  hair_styles: {
    bob_cut: {
      style: "nara_classic_bob",
      colors: ["natural_brown", "soft_black", "warm_chestnut"],
      personality_match: ["professional", "minimalist", "classic"]
    },
    
    messy_artistic: {
      style: "creative_tousled",
      colors: ["dusty_pink", "ash_blonde", "purple_tint"],
      personality_match: ["creative", "artistic", "free_spirit"]
    },
    
    long_wavy: {
      style: "gentle_waves",
      colors: ["honey_blonde", "auburn", "chocolate_brown"],
      personality_match: ["romantic", "gentle", "dreamy"]
    },
    
    pixie_cut: {
      style: "adorable_short",
      colors: ["platinum_blonde", "silver_grey", "bright_red"],
      personality_match: ["confident", "bold", "modern"]
    }
  },
  
  outfit_categories: {
    casual_cozy: {
      pieces: ["oversized_sweater", "comfortable_jeans", "cute_sneakers"],
      colors: ["soft_pastels", "earth_tones", "muted_colors"],
      accessories: ["small_backpack", "simple_jewelry", "cute_hat"]
    },
    
    chic_professional: {
      pieces: ["elegant_blouse", "tailored_pants", "sleek_shoes"],
      colors: ["neutral_tones", "classic_navy", "sophisticated_grey"],
      accessories: ["structured_bag", "minimal_watch", "subtle_earrings"]
    },
    
    artistic_creative: {
      pieces: ["unique_top", "flowing_skirt", "comfortable_boots"],
      colors: ["artistic_palette", "bold_accents", "creative_combinations"],
      accessories: ["creative_bag", "artistic_jewelry", "expressive_pieces"]
    },
    
    sweet_feminine: {
      pieces: ["cute_dress", "cardigan", "mary_jane_shoes"],
      colors: ["soft_pinks", "gentle_blues", "cream_whites"],
      accessories: ["small_purse", "delicate_jewelry", "hair_accessories"]
    }
  },
  
  personality_expressions: {
    confident: {
      posture: "upright_assured",
      gestures: "decisive_clear",
      eye_contact: "direct_warm",
      smile: "genuine_bright"
    },
    
    gentle: {
      posture: "soft_relaxed",
      gestures: "delicate_graceful", 
      eye_contact: "warm_inviting",
      smile: "tender_sweet"
    },
    
    playful: {
      posture: "dynamic_bouncy",
      gestures: "animated_expressive",
      eye_contact: "sparkling_mischievous",
      smile: "bright_infectious"
    },
    
    thoughtful: {
      posture: "contemplative_poised",
      gestures: "measured_meaningful",
      eye_contact: "deep_understanding",
      smile: "knowing_serene"
    }
  }
};
```

## 🔧 **技術實現細節**

### **性能優化配置**
```javascript
const PerformanceConfig = {
  level_of_detail: {
    high_quality: {
      distance: "0-5 units",
      vertices: 15000,
      texture_resolution: "1024x1024",
      animation_fps: 60,
      effects: "full"
    },
    
    medium_quality: {
      distance: "5-15 units", 
      vertices: 8000,
      texture_resolution: "512x512",
      animation_fps: 30,
      effects: "reduced"
    },
    
    low_quality: {
      distance: "15+ units",
      vertices: 3000,
      texture_resolution: "256x256", 
      animation_fps: 15,
      effects: "minimal"
    }
  },
  
  mobile_optimization: {
    max_vertices: 5000,
    texture_size: "512x512",
    animation_complexity: "simplified",
    effect_quality: "optimized",
    battery_mode: "adaptive_fps"
  },
  
  loading_strategy: {
    base_model: "immediate_load",      // 立即載入基礎模型
    textures: "progressive_load",      // 漸進載入材質
    animations: "on_demand_load",      // 按需載入動畫
    effects: "lazy_load"               // 延遲載入特效
  }
};
```

### **互動系統整合**
```javascript
const InteractionSystem = {
  touch_interactions: {
    avatar_tap: {
      action: "friendly_acknowledgment",
      animation: "happy_wave_response",
      audio: "cute_greeting_sound"
    },
    
    head_pet: {
      gesture: "gentle_downward_swipe",
      response: "content_purr_like_reaction",
      visual_effect: "soft_sparkle_particles"
    },
    
    clothing_tap: {
      area: "outfit_region",
      response: "outfit_showcase_spin",
      info_display: "clothing_details_popup"
    }
  },
  
  voice_interactions: {
    user_speaking: {
      avatar_response: "attentive_listening_pose",
      eye_tracking: "follow_voice_source",
      body_language: "engaged_posture"
    },
    
    avatar_speaking: {
      lip_sync: "basic_mouth_animation",
      gestures: "contextual_hand_movements",
      expressions: "emotion_matched_face"
    }
  },
  
  environmental_responses: {
    room_change: {
      adaptation_time: 2.0,
      costume_change: "automatic_if_appropriate",
      mood_adjustment: "context_sensitive"
    },
    
    time_of_day: {
      morning: "energetic_fresh_demeanor",
      afternoon: "relaxed_content_mood",
      evening: "calm_cozy_atmosphere"
    },
    
    weather_sync: {
      sunny: "bright_cheerful_mood",
      rainy: "cozy_thoughtful_mood", 
      cloudy: "gentle_peaceful_mood"
    }
  }
};
```

這個詳細的奈良美智風格 Avatar 規格將為 BE 76 創造出獨特、親切、充滿藝術感的 AI 助理形象，讓用戶感受到真正的陪伴感！ 🎨✨