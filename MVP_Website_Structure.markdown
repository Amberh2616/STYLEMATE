```mermaid
graph TD
  subgraph 前端_Nextjs_Tailwind
    A[首頁_表單輸入] -->|照片上傳| C[試穿畫布_2D]
    A -->|商品瀏覽| D[商品選擇頁]
    D -->|結帳| E[結帳頁]
  end

  subgraph 後端_Nodejs
    A -->|REST| RECO[推薦服務]
    C -->|REST| VTO[虛擬試穿API_2D]
    D -->|REST| CATALOG[商品目錄服務]
    E -->|REST| CHECK[結帳服務]
    RECO --> MODEL[AI模型]
    VTO --> ASSET[圖片儲存]
    CATALOG --> DB[資料庫]
    CHECK --> PAY[支付網關]
    USER[用戶服務] --> DB[資料庫]
    RECO --> USER
    VTO --> USER
  end

  subgraph 外部整合
    PAY[支付網關]
  end
```