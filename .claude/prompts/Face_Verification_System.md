# BE 76 真人臉部辨識防假帳號系統

## 系統目標
建立強大的身份驗證機制，要求用戶提供20年時間跨度的5張大頭照（每5年一張），通過臉部成長軌跡分析來確保真人身份，有效阻止假帳號和 AI 生成照片。

## 核心驗證流程

### 1. 照片收集要求
```python
class PhotoRequirements:
    required_photos = {
        "current": "最近6個月內照片",
        "5_years_ago": "5年前照片（±1年）", 
        "10_years_ago": "10年前照片（±1年）",
        "15_years_ago": "15年前照片（±1年）",
        "20_years_ago": "20年前照片（±2年）"
    }
    
    photo_standards = {
        "resolution": "最低 512x512 像素",
        "format": ["JPG", "PNG"],
        "face_size": "臉部佔照片面積 25-70%",
        "angle": "正面或準正面（偏轉不超過30度）",
        "lighting": "光線充足，無強烈陰影",
        "expression": "自然表情，雙眼清晰可見",
        "background": "無限制，但臉部需清晰"
    }
```

### 2. 多層次驗證架構

```python
class ComprehensiveFaceVerification:
    def __init__(self):
        self.face_detector = FaceDetector()  # MTCNN/RetinaFace
        self.feature_extractor = FaceNetEncoder()  # FaceNet/ArcFace
        self.aging_analyzer = FaceAgingAnalyzer()  # 臉部老化分析
        self.deepfake_detector = DeepfakeDetector()  # AI生成檢測
        self.liveness_checker = LivenessDetector()  # 活體檢測
        
    async def comprehensive_verification(self, photos: Dict[str, bytes], user_metadata: dict):
        """
        全面的臉部驗證流程
        """
        verification_results = {
            "face_consistency": False,
            "aging_authenticity": False,
            "deepfake_detection": False,
            "photo_authenticity": False,
            "final_score": 0.0,
            "risk_level": "high"
        }
        
        try:
            # 步驟1: 基礎臉部檢測和特徵提取
            face_features = await self.extract_all_face_features(photos)
            if not face_features:
                return verification_results
            
            # 步驟2: 臉部一致性驗證
            consistency_score = await self.verify_face_consistency(face_features)
            verification_results["face_consistency"] = consistency_score > 0.75
            
            # 步驟3: 臉部老化軌跡分析
            aging_score = await self.analyze_aging_trajectory(face_features, user_metadata)
            verification_results["aging_authenticity"] = aging_score > 0.7
            
            # 步驟4: AI生成檢測
            deepfake_scores = await self.detect_artificial_faces(photos)
            verification_results["deepfake_detection"] = all(score < 0.3 for score in deepfake_scores)
            
            # 步驟5: 照片真實性檢驗
            photo_auth_score = await self.verify_photo_authenticity(photos)
            verification_results["photo_authenticity"] = photo_auth_score > 0.8
            
            # 步驟6: 計算最終分數
            final_score = self.calculate_final_verification_score(verification_results)
            verification_results["final_score"] = final_score
            verification_results["risk_level"] = self.assess_risk_level(final_score)
            
            return verification_results
            
        except Exception as e:
            print(f"驗證過程出錯: {e}")
            return verification_results
    
    async def extract_all_face_features(self, photos: Dict[str, bytes]) -> Dict[str, np.ndarray]:
        """
        從所有照片中提取臉部特徵
        """
        face_features = {}
        
        for time_period, photo_bytes in photos.items():
            try:
                # 載入圖片
                image = cv2.imdecode(np.frombuffer(photo_bytes, np.uint8), cv2.IMREAD_COLOR)
                
                # 檢測臉部
                faces = self.face_detector.detect_faces(image)
                
                if len(faces) != 1:
                    raise ValueError(f"照片 {time_period} 必須包含且僅包含一張臉")
                
                # 提取特徵向量
                face_bbox = faces[0]
                face_crop = self.crop_face(image, face_bbox)
                features = self.feature_extractor.extract_features(face_crop)
                
                face_features[time_period] = {
                    "features": features,
                    "bbox": face_bbox,
                    "image_quality": self.assess_image_quality(face_crop),
                    "face_landmarks": self.extract_landmarks(face_crop)
                }
                
            except Exception as e:
                print(f"處理照片 {time_period} 時出錯: {e}")
                return {}
        
        return face_features
    
    async def verify_face_consistency(self, face_features: Dict) -> float:
        """
        驗證所有照片中的臉部特徵一致性
        """
        feature_vectors = [data["features"] for data in face_features.values()]
        
        # 計算所有特徵向量間的相似度
        similarity_scores = []
        for i in range(len(feature_vectors)):
            for j in range(i+1, len(feature_vectors)):
                similarity = cosine_similarity(feature_vectors[i], feature_vectors[j])
                similarity_scores.append(similarity)
        
        # 基於年齡差異調整閾值
        age_adjusted_threshold = self.calculate_age_adjusted_threshold(face_features)
        
        # 所有相似度都應該高於調整後的閾值
        min_similarity = min(similarity_scores)
        avg_similarity = np.mean(similarity_scores)
        
        # 結合最低相似度和平均相似度
        consistency_score = (min_similarity * 0.6 + avg_similarity * 0.4)
        
        return consistency_score
    
    async def analyze_aging_trajectory(self, face_features: Dict, user_metadata: dict) -> float:
        """
        分析臉部老化軌跡的合理性
        """
        # 按時間排序照片
        time_order = ["20_years_ago", "15_years_ago", "10_years_ago", "5_years_ago", "current"]
        ordered_features = [face_features[period] for period in time_order if period in face_features]
        
        aging_indicators = []
        
        for i in range(len(ordered_features) - 1):
            current_face = ordered_features[i]
            next_face = ordered_features[i + 1]
            
            # 分析各種老化指標
            aging_analysis = {
                "wrinkle_progression": self.analyze_wrinkle_changes(current_face, next_face),
                "skin_texture_change": self.analyze_skin_texture(current_face, next_face),
                "facial_structure_stability": self.analyze_bone_structure(current_face, next_face),
                "hair_changes": self.analyze_hair_changes(current_face, next_face),
                "eye_area_changes": self.analyze_eye_aging(current_face, next_face)
            }
            
            aging_indicators.append(aging_analysis)
        
        # 評估老化軌跡的自然性
        trajectory_score = self.evaluate_aging_naturality(aging_indicators, user_metadata)
        
        return trajectory_score
    
    async def detect_artificial_faces(self, photos: Dict[str, bytes]) -> List[float]:
        """
        檢測 AI 生成或深度偽造的臉部
        """
        deepfake_scores = []
        
        for time_period, photo_bytes in photos.items():
            # 使用多種深度偽造檢測模型
            detectors = [
                self.cnn_deepfake_detector,
                self.capsule_net_detector,
                self.vision_transformer_detector
            ]
            
            scores = []
            for detector in detectors:
                score = detector.predict(photo_bytes)
                scores.append(score)
            
            # 投票機制：多數檢測器的結果
            ensemble_score = np.mean(scores)
            deepfake_scores.append(ensemble_score)
        
        return deepfake_scores
    
    async def verify_photo_authenticity(self, photos: Dict[str, bytes]) -> float:
        """
        驗證照片的真實性（非修圖、非合成）
        """
        authenticity_scores = []
        
        for time_period, photo_bytes in photos.items():
            # EXIF 數據分析
            exif_score = self.analyze_exif_data(photo_bytes)
            
            # 壓縮痕跡分析
            compression_score = self.analyze_compression_artifacts(photo_bytes)
            
            # 光線一致性檢查
            lighting_score = self.verify_lighting_consistency(photo_bytes)
            
            # 像素級別異常檢測
            pixel_score = self.detect_pixel_anomalies(photo_bytes)
            
            # 綜合評分
            photo_auth_score = (
                exif_score * 0.2 + 
                compression_score * 0.3 + 
                lighting_score * 0.3 + 
                pixel_score * 0.2
            )
            
            authenticity_scores.append(photo_auth_score)
        
        return np.mean(authenticity_scores)
```

### 3. 安全等級分類系統

```python
class SecurityLevelAssessment:
    def __init__(self):
        self.risk_thresholds = {
            "very_high": 0.9,  # 極高可信度
            "high": 0.8,       # 高可信度
            "medium": 0.6,     # 中等可信度
            "low": 0.4,        # 低可信度
            "very_low": 0.0    # 極低可信度
        }
    
    def assess_user_trust_level(self, verification_results: dict) -> dict:
        """
        評估用戶的信任等級
        """
        final_score = verification_results["final_score"]
        
        if final_score >= self.risk_thresholds["very_high"]:
            trust_level = "verified_human"
            platform_access = "full_access"
            additional_checks = False
        elif final_score >= self.risk_thresholds["high"]:
            trust_level = "likely_human"
            platform_access = "standard_access"
            additional_checks = False
        elif final_score >= self.risk_thresholds["medium"]:
            trust_level = "uncertain"
            platform_access = "limited_access"
            additional_checks = True
        elif final_score >= self.risk_thresholds["low"]:
            trust_level = "suspicious"
            platform_access = "restricted_access"
            additional_checks = True
        else:
            trust_level = "high_risk"
            platform_access = "access_denied"
            additional_checks = True
        
        return {
            "trust_level": trust_level,
            "platform_access": platform_access,
            "verification_score": final_score,
            "requires_additional_verification": additional_checks,
            "verification_timestamp": datetime.now().isoformat()
        }
```

### 4. API 整合

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from typing import List

@app.post("/verification/face-verification")
async def submit_face_verification(
    user_id: str,
    current_photo: UploadFile = File(...),
    photo_5_years: UploadFile = File(...),
    photo_10_years: UploadFile = File(...),
    photo_15_years: UploadFile = File(...),
    photo_20_years: UploadFile = File(...),
    birth_year: int,
    gender: str
):
    """
    提交臉部驗證照片
    """
    # 驗證檔案格式
    allowed_formats = ["image/jpeg", "image/png"]
    photos = {
        "current": current_photo,
        "5_years_ago": photo_5_years,
        "10_years_ago": photo_10_years,
        "15_years_ago": photo_15_years,
        "20_years_ago": photo_20_years
    }
    
    for period, photo in photos.items():
        if photo.content_type not in allowed_formats:
            raise HTTPException(400, f"照片 {period} 格式不正確")
    
    # 轉換為字節數據
    photo_bytes = {}
    for period, photo in photos.items():
        photo_bytes[period] = await photo.read()
    
    # 用戶元數據
    user_metadata = {
        "birth_year": birth_year,
        "current_age": datetime.now().year - birth_year,
        "gender": gender
    }
    
    # 執行驗證
    verifier = ComprehensiveFaceVerification()
    verification_results = await verifier.comprehensive_verification(
        photo_bytes, user_metadata
    )
    
    # 評估信任等級
    assessor = SecurityLevelAssessment()
    trust_assessment = assessor.assess_user_trust_level(verification_results)
    
    # 保存驗證結果
    await save_verification_results(user_id, verification_results, trust_assessment)
    
    return {
        "verification_id": generate_verification_id(),
        "status": "completed",
        "trust_level": trust_assessment["trust_level"],
        "platform_access": trust_assessment["platform_access"],
        "verification_score": round(verification_results["final_score"], 3),
        "next_steps": get_next_steps(trust_assessment)
    }

@app.get("/verification/status/{user_id}")
async def get_verification_status(user_id: str):
    """
    獲取用戶驗證狀態
    """
    status = await get_user_verification_status(user_id)
    return status

@app.post("/verification/appeal")
async def submit_verification_appeal(
    user_id: str,
    appeal_reason: str,
    additional_evidence: List[UploadFile] = File(None)
):
    """
    提交驗證申訴
    """
    appeal_id = await create_verification_appeal(
        user_id, appeal_reason, additional_evidence
    )
    
    return {
        "appeal_id": appeal_id,
        "status": "submitted",
        "review_timeline": "3-5個工作天"
    }
```

### 5. 資料庫設計

```sql
-- 臉部驗證記錄
CREATE TABLE face_verification_records (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE,
    verification_id VARCHAR(100) UNIQUE,
    
    -- 驗證結果
    face_consistency_score FLOAT,
    aging_authenticity_score FLOAT,
    deepfake_detection_passed BOOLEAN,
    photo_authenticity_score FLOAT,
    final_verification_score FLOAT,
    
    -- 信任等級
    trust_level VARCHAR(20), -- 'verified_human', 'likely_human', 'uncertain', 'suspicious', 'high_risk'
    platform_access VARCHAR(20), -- 'full_access', 'standard_access', 'limited_access', 'restricted_access', 'access_denied'
    
    -- 時間戳
    submitted_at TIMESTAMP DEFAULT NOW(),
    verified_at TIMESTAMP,
    expires_at TIMESTAMP, -- 驗證有效期
    
    -- 額外信息
    user_metadata JSONB,
    verification_details JSONB,
    requires_review BOOLEAN DEFAULT FALSE
);

-- 照片存儲（加密）
CREATE TABLE verification_photos (
    id SERIAL PRIMARY KEY,
    verification_id VARCHAR(100),
    photo_period VARCHAR(20), -- 'current', '5_years_ago', etc.
    encrypted_photo_path VARCHAR(500),
    photo_hash VARCHAR(128),
    upload_timestamp TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (verification_id) REFERENCES face_verification_records(verification_id)
);

-- 申訴記錄
CREATE TABLE verification_appeals (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    verification_id VARCHAR(100),
    appeal_reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected'
    reviewer_id VARCHAR(50),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);
```

### 6. 安全性增強措施

```python
class SecurityEnhancements:
    
    @staticmethod
    async def implement_photo_watermarking(photo_bytes: bytes) -> bytes:
        """
        為照片添加不可見浮水印，防止重複使用
        """
        # 實施數位浮水印技術
        watermarked_photo = add_invisible_watermark(photo_bytes)
        return watermarked_photo
    
    @staticmethod
    async def create_photo_fingerprint(photo_bytes: bytes) -> str:
        """
        創建照片指紋，檢測重複提交
        """
        # 結合多種雜湊算法
        md5_hash = hashlib.md5(photo_bytes).hexdigest()
        sha256_hash = hashlib.sha256(photo_bytes).hexdigest()
        perceptual_hash = calculate_perceptual_hash(photo_bytes)
        
        combined_fingerprint = f"{md5_hash}:{sha256_hash}:{perceptual_hash}"
        return combined_fingerprint
    
    @staticmethod
    async def monitor_suspicious_patterns():
        """
        監控可疑的驗證模式
        """
        # 檢測批量註冊
        # 檢測相似照片提交
        # 檢測異常IP模式
        pass
```

這個系統通過多重驗證機制，有效防止：
1. **AI 生成照片**註冊假帳號
2. **盜用他人照片**進行身份冒用  
3. **修圖或合成照片**欺騙系統
4. **批量機器人註冊**攻擊

確保 BE 76 平台上的每個用戶都是經過嚴格驗證的真人。