import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 計算向量相似度 (余弦相似度)
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0)
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0))
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 3 } = await request.json()

    if (!query) {
      return NextResponse.json(
        { success: false, message: '請提供查詢內容' },
        { status: 400 }
      )
    }

    // 生成查詢向量
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPEN_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-ada-002',
      }),
    })

    const embeddingData = await response.json()
    const queryEmbedding = embeddingData.data[0].embedding

    // 讀取所有知識庫文件
    const knowledgeDir = path.join(process.cwd(), 'knowledge')
    if (!fs.existsSync(knowledgeDir)) {
      return NextResponse.json({
        success: true,
        results: [],
        message: '知識庫為空，請先上傳 PDF 文件'
      })
    }

    const knowledgeFiles = fs.readdirSync(knowledgeDir)
    const allResults = []

    for (const file of knowledgeFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(knowledgeDir, file)
        const knowledge = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        for (const item of knowledge.embeddings) {
          const similarity = cosineSimilarity(queryEmbedding, item.embedding)
          
          if (similarity > 0.7) { // 相似度閾值
            allResults.push({
              content: item.content,
              similarity: similarity,
              source: knowledge.filename,
              metadata: item.metadata
            })
          }
        }
      }
    }

    // 排序並限制結果數量
    allResults.sort((a, b) => b.similarity - a.similarity)
    const topResults = allResults.slice(0, limit)

    return NextResponse.json({
      success: true,
      results: topResults,
      total: topResults.length
    })

  } catch (error) {
    console.error('RAG 搜尋錯誤:', error)
    return NextResponse.json(
      { success: false, message: 'RAG 搜尋失敗' },
      { status: 500 }
    )
  }
}