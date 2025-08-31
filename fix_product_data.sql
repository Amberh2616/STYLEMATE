-- 修復產品數據與圖片不匹配的問題
-- 這個腳本將根據實際圖片內容來修正商品的名稱、類別和描述

-- 修復 ID 140: TOP/LINE_ALBUM_🪸七月 · 各種上衣🪸_250808_136.jpg
-- 從"套裝"改為"上衣"
UPDATE fashion_items 
SET 
  name_zh = '淺灰色寬鬆針織上衣',
  name_en = 'Light Gray Loose Knit Top',
  category_zh = '上衣',
  category_en = 'top',
  colors_zh = ARRAY['淺灰色'],
  colors_en = ARRAY['light gray'],
  style_tags_zh = ARRAY['針織', '寬鬆版型', '長袖'],
  style_tags_en = ARRAY['knit', 'loose fit', 'long sleeve'],
  description_zh = '一件淺灰色的長袖針織上衣，採用寬鬆版型設計，舒適透氣，適合日常休閒穿搭。',
  description_en = 'A light gray long sleeve knit top with a loose fit design, comfortable and breathable, suitable for casual daily wear.'
WHERE id = 140;

-- 修復 ID 139: TOP/LINE_ALBUM_🪸七月 · 各種上衣🪸_250808_135.jpg  
-- 從"套裝"改為"上衣"
UPDATE fashion_items 
SET 
  name_zh = '深灰色簡約針織上衣',
  name_en = 'Dark Gray Simple Knit Top',
  category_zh = '上衣',
  category_en = 'top',
  colors_zh = ARRAY['深灰色'],
  colors_en = ARRAY['dark gray'],
  style_tags_zh = ARRAY['針織', '簡約', '圓領'],
  style_tags_en = ARRAY['knit', 'minimalist', 'round neck'],
  description_zh = '一件深灰色的圓領針織上衣，簡約設計，版型舒適，適合多種場合搭配。',
  description_en = 'A dark gray round neck knit top with minimalist design, comfortable fit, suitable for various occasions.'
WHERE id = 139;

-- 修復 ID 138: TOP/LINE_ALBUM_🌼六月 · 各種外套、開衫、背心🌼_250808_38.jpg
-- 從"套裝"改為"外套"
UPDATE fashion_items 
SET 
  name_zh = '米色輕薄開襟外套',
  name_en = 'Beige Lightweight Open Front Cardigan',
  category_zh = '外套',
  category_en = 'outer',
  colors_zh = ARRAY['米色'],
  colors_en = ARRAY['beige'],
  style_tags_zh = ARRAY['開襟', '輕薄', '休閒'],
  style_tags_en = ARRAY['open front', 'lightweight', 'casual'],
  description_zh = '一件米色的輕薄開襟外套，材質柔軟舒適，適合春秋季節當作輕薄外搭。',
  description_en = 'A beige lightweight open front cardigan with soft and comfortable material, perfect as a light layer for spring and autumn.'
WHERE id = 138;

-- 修復更多類似問題的商品
-- 檢查其他可能有問題的套裝類商品

-- 修復 ID 137: TOP/LINE_ALBUM__250808_83.jpg
-- 看起來是上衣，但被標記為套裝
UPDATE fashion_items 
SET 
  name_zh = '米白色無袖背心上衣',
  name_en = 'Off-white Sleeveless Tank Top',
  category_zh = '上衣', 
  category_en = 'top',
  colors_zh = ARRAY['米白色'],
  colors_en = ARRAY['off-white'],
  style_tags_zh = ARRAY['無袖', '背心', '簡約'],
  style_tags_en = ARRAY['sleeveless', 'tank', 'minimalist'],
  description_zh = '一件米白色的無袖背心上衣，簡約設計，適合夏季穿著或作為內搭。',
  description_en = 'An off-white sleeveless tank top with minimalist design, suitable for summer wear or as an undershirt.'
WHERE id = 137;

-- 修復 ID 136: TOP/LINE_ALBUM__250808_80.jpg  
UPDATE fashion_items 
SET 
  name_zh = '白色簡約圓領T恤',
  name_en = 'White Simple Round Neck T-Shirt',
  category_zh = '上衣',
  category_en = 'top', 
  colors_zh = ARRAY['白色'],
  colors_en = ARRAY['white'],
  style_tags_zh = ARRAY['圓領', 'T恤', '簡約'],
  style_tags_en = ARRAY['round neck', 't-shirt', 'minimalist'],
  description_zh = '一件白色的圓領T恤，簡約設計，舒適透氣，是基礎百搭單品。',
  description_en = 'A white round neck t-shirt with minimalist design, comfortable and breathable, a basic versatile piece.'
WHERE id = 136;

-- 修復 ID 135: TOP/LINE_ALBUM__250808_79.jpg
UPDATE fashion_items 
SET 
  name_zh = '黑色方領泡泡袖上衣',
  name_en = 'Black Square Neck Puff Sleeve Top',
  category_zh = '上衣',
  category_en = 'top',
  colors_zh = ARRAY['黑色'], 
  colors_en = ARRAY['black'],
  style_tags_zh = ARRAY['方領', '泡泡袖', '女性化'],
  style_tags_en = ARRAY['square neck', 'puff sleeve', 'feminine'],
  description_zh = '一件黑色的方領泡泡袖上衣，設計獨特，女性化十足，適合約會或聚會場合。',
  description_en = 'A black square neck puff sleeve top with unique design and feminine appeal, suitable for dates or social gatherings.'
WHERE id = 135;

-- 修復 ID 134: TOP/LINE_ALBUM__250808_78.jpg
UPDATE fashion_items 
SET 
  name_zh = '白色印花圓領T恤',
  name_en = 'White Printed Round Neck T-Shirt', 
  category_zh = '上衣',
  category_en = 'top',
  colors_zh = ARRAY['白色'],
  colors_en = ARRAY['white'],
  style_tags_zh = ARRAY['印花', '圓領', 'T恤'],
  style_tags_en = ARRAY['printed', 'round neck', 't-shirt'],
  description_zh = '一件白色的印花圓領T恤，上面有趣味圖案，休閒舒適，適合日常穿搭。',
  description_en = 'A white printed round neck t-shirt with fun graphics, casual and comfortable, suitable for everyday wear.'
WHERE id = 134;

-- 顯示修復結果
SELECT id, name_zh, category_zh, filename 
FROM fashion_items 
WHERE id IN (134, 135, 136, 137, 138, 139, 140)
ORDER BY id DESC;