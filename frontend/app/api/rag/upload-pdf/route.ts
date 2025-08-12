import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import pdf from 'pdf-parse'
import { OpenAI } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

// 創建上傳目錄
const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 創建知識庫目錄
const knowledgeDir = path.join(process.cwd(), 'knowledge')
if (!fs.existsSync(knowledgeDir)) {
  fs.mkdirSync(knowledgeDir, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: '請選擇 PDF 文件' },
        { status: 400 }
      )
    }

    // 保存檔案
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const fileName = `${Date.now()}_${file.name}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, buffer)

    // 解析 PDF
    const pdfData = await pdf(buffer)
    const text = pdfData.text

    // 分割文本
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const docs = await textSplitter.createDocuments([text])
    
    // 生成向量嵌入
    const openai = new OpenAI({
      openAIApiKey: process.env.OPEN_AI_API_KEY,
    })

    const embeddings = []
    for (const doc of docs) {
      try {
        // 使用 OpenAI 生成嵌入
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPEN_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: doc.pageContent,
            model: 'text-embedding-ada-002',
          }),
        })

        const embeddingData = await response.json()
        
        embeddings.push({
          content: doc.pageContent,
          embedding: embeddingData.data[0].embedding,
          metadata: {
            source: file.name,
            chunk_index: embeddings.length
          }
        })
      } catch (embeddingError) {
        console.error('嵌入生成錯誤:', embeddingError)
      }
    }

    // 保存到知識庫
    const knowledgeFile = path.join(knowledgeDir, `${fileName.replace('.pdf', '')}.json`)
    fs.writeFileSync(knowledgeFile, JSON.stringify({
      filename: file.name,
      uploadTime: new Date().toISOString(),
      totalChunks: embeddings.length,
      embeddings: embeddings
    }, null, 2))

    return NextResponse.json({
      success: true,
      message: `成功處理 PDF：${file.name}`,
      chunks: embeddings.length,
      filename: fileName
    })

  } catch (error) {
    console.error('PDF 處理錯誤:', error)
    return NextResponse.json(
      { success: false, message: 'PDF 處理失敗' },
      { status: 500 }
    )
  }
}