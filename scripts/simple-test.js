#!/usr/bin/env node
console.log('🚀 開始測試程式');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('📂 當前目錄:', __dirname);

// 圖片資料夾路徑
const PICTURE_BASE_PATH = path.join(__dirname, '../picture');
console.log('📂 圖片目錄:', PICTURE_BASE_PATH);

// 檢查圖片目錄是否存在
if (fs.existsSync(PICTURE_BASE_PATH)) {
  console.log('✅ 圖片目錄存在');
  
  // 掃描圖片
  const folders = ['DRESS', 'TOP', 'PANTS', 'jacket'];
  let totalImages = 0;
  
  folders.forEach(folder => {
    const folderPath = path.join(PICTURE_BASE_PATH, folder);
    if (fs.existsSync(folderPath)) {
      const items = fs.readdirSync(folderPath);
      console.log(`📁 ${folder}: ${items.length} 個檔案`);
      totalImages += items.length;
    }
  });
  
  console.log(`📊 總共找到約 ${totalImages} 個檔案`);
} else {
  console.log('❌ 圖片目錄不存在:', PICTURE_BASE_PATH);
}

console.log('✅ 測試程式完成');