import { Pool } from 'pg'

// 資料庫連接池
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'stylemate_fashion',
  user: 'postgres',
  password: '2616',
  max: 10,
  idleTimeoutMillis: 30000,
})

// 修復數據的配置
const fixData = [
  {
    id: 140,
    name_zh: '淺灰色寬鬆針織上衣',
    name_en: 'Light Gray Loose Knit Top',
    category_zh: '上衣',
    category_en: 'top',
    colors_zh: ['淺灰色'],
    colors_en: ['light gray'],
    style_tags_zh: ['針織', '寬鬆版型', '長袖'],
    style_tags_en: ['knit', 'loose fit', 'long sleeve'],
    description_zh: '一件淺灰色的長袖針織上衣，採用寬鬆版型設計，舒適透氣，適合日常休閒穿搭。',
    description_en: 'A light gray long sleeve knit top with a loose fit design, comfortable and breathable, suitable for casual daily wear.'
  },
  {
    id: 139,
    name_zh: '深灰色簡約針織上衣',
    name_en: 'Dark Gray Simple Knit Top',
    category_zh: '上衣',
    category_en: 'top',
    colors_zh: ['深灰色'],
    colors_en: ['dark gray'],
    style_tags_zh: ['針織', '簡約', '圓領'],
    style_tags_en: ['knit', 'minimalist', 'round neck'],
    description_zh: '一件深灰色的圓領針織上衣，簡約設計，版型舒適，適合多種場合搭配。',
    description_en: 'A dark gray round neck knit top with minimalist design, comfortable fit, suitable for various occasions.'
  },
  {
    id: 138,
    name_zh: '米色輕薄開襟外套',
    name_en: 'Beige Lightweight Open Front Cardigan',
    category_zh: '外套',
    category_en: 'outer',
    colors_zh: ['米色'],
    colors_en: ['beige'],
    style_tags_zh: ['開襟', '輕薄', '休閒'],
    style_tags_en: ['open front', 'lightweight', 'casual'],
    description_zh: '一件米色的輕薄開襟外套，材質柔軟舒適，適合春秋季節當作輕薄外搭。',
    description_en: 'A beige lightweight open front cardigan with soft and comfortable material, perfect as a light layer for spring and autumn.'
  },
  {
    id: 137,
    name_zh: '米白色無袖背心上衣',
    name_en: 'Off-white Sleeveless Tank Top',
    category_zh: '上衣',
    category_en: 'top',
    colors_zh: ['米白色'],
    colors_en: ['off-white'],
    style_tags_zh: ['無袖', '背心', '簡約'],
    style_tags_en: ['sleeveless', 'tank', 'minimalist'],
    description_zh: '一件米白色的無袖背心上衣，簡約設計，適合夏季穿著或作為內搭。',
    description_en: 'An off-white sleeveless tank top with minimalist design, suitable for summer wear or as an undershirt.'
  },
  {
    id: 136,
    name_zh: '白色簡約圓領T恤',
    name_en: 'White Simple Round Neck T-Shirt',
    category_zh: '上衣',
    category_en: 'top',
    colors_zh: ['白色'],
    colors_en: ['white'],
    style_tags_zh: ['圓領', 'T恤', '簡約'],
    style_tags_en: ['round neck', 't-shirt', 'minimalist'],
    description_zh: '一件白色的圓領T恤，簡約設計，舒適透氣，是基礎百搭單品。',
    description_en: 'A white round neck t-shirt with minimalist design, comfortable and breathable, a basic versatile piece.'
  },
  {
    id: 135,
    name_zh: '黑色方領泡泡袖上衣',
    name_en: 'Black Square Neck Puff Sleeve Top',
    category_zh: '上衣',
    category_en: 'top',
    colors_zh: ['黑色'],
    colors_en: ['black'],
    style_tags_zh: ['方領', '泡泡袖', '女性化'],
    style_tags_en: ['square neck', 'puff sleeve', 'feminine'],
    description_zh: '一件黑色的方領泡泡袖上衣，設計獨特，女性化十足，適合約會或聚會場合。',
    description_en: 'A black square neck puff sleeve top with unique design and feminine appeal, suitable for dates or social gatherings.'
  },
  {
    id: 134,
    name_zh: '白色印花圓領T恤',
    name_en: 'White Printed Round Neck T-Shirt',
    category_zh: '上衣',
    category_en: 'top',
    colors_zh: ['白色'],
    colors_en: ['white'],
    style_tags_zh: ['印花', '圓領', 'T恤'],
    style_tags_en: ['printed', 'round neck', 't-shirt'],
    description_zh: '一件白色的印花圓領T恤，上面有趣味圖案，休閒舒適，適合日常穿搭。',
    description_en: 'A white printed round neck t-shirt with fun graphics, casual and comfortable, suitable for everyday wear.'
  }
]

async function fixProductData() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 開始修復產品數據...')
    
    for (const item of fixData) {
      const query = `
        UPDATE fashion_items 
        SET 
          name_zh = $1,
          name_en = $2,
          category_zh = $3,
          category_en = $4,
          colors_zh = $5,
          colors_en = $6,
          style_tags_zh = $7,
          style_tags_en = $8,
          description_zh = $9,
          description_en = $10
        WHERE id = $11
      `
      
      const values = [
        item.name_zh,
        item.name_en,
        item.category_zh,
        item.category_en,
        JSON.stringify(item.colors_zh),
        JSON.stringify(item.colors_en),
        JSON.stringify(item.style_tags_zh),
        JSON.stringify(item.style_tags_en),
        item.description_zh,
        item.description_en,
        item.id
      ]
      
      const result = await client.query(query, values)
      console.log(`✅ 修復商品 ID ${item.id}: ${item.name_zh}`)
    }
    
    // 檢查修復結果
    console.log('\n📋 修復後的商品列表:')
    const checkQuery = `
      SELECT id, name_zh, category_zh, filename 
      FROM fashion_items 
      WHERE id IN (134, 135, 136, 137, 138, 139, 140)
      ORDER BY id DESC
    `
    
    const checkResult = await client.query(checkQuery)
    checkResult.rows.forEach(row => {
      console.log(`ID ${row.id}: ${row.name_zh} (${row.category_zh}) - ${row.filename}`)
    })
    
    console.log('\n🎉 數據修復完成！')
    
  } catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error)
  } finally {
    client.release()
    pool.end()
  }
}

// 執行修復
fixProductData()