const ImageProcessor = require('./image-processor');
const VirtualTryOnProcessor = require('./virtual-tryOn-processor');
const ImageUtils = require('./image-utils');
const path = require('path');

async function demonstrateImageProcessor() {
  console.log('=== STYLEMATE 圖像處理工程師示範 ===\n');

  const imageProcessor = new ImageProcessor();
  const vtoProcessor = new VirtualTryOnProcessor();

  console.log('1. 基礎圖像處理功能：');
  console.log('   ✓ 圖像大小調整和格式轉換');
  console.log('   ✓ 圖像品質優化');
  console.log('   ✓ 縮圖生成');
  console.log('   ✓ 圖像裁剪和旋轉');
  console.log('   ✓ 亮度和對比度調整');
  console.log('   ✓ 圖像疊加和混合\n');

  console.log('2. 虛擬試穿專用功能：');
  console.log('   ✓ 人像圖像標準化處理');
  console.log('   ✓ 服裝圖像預處理');
  console.log('   ✓ 身體分割和關鍵點檢測');
  console.log('   ✓ 服裝對齊和適配');
  console.log('   ✓ 2D 虛擬試穿合成\n');

  console.log('3. 工具函數：');
  console.log('   ✓ 批次處理');
  console.log('   ✓ 檔案驗證');
  console.log('   ✓ 進度追蹤');
  console.log('   ✓ 錯誤處理\n');

  console.log('4. 使用範例：\n');

  console.log('// 基本圖像處理');
  console.log('const processor = new ImageProcessor();');
  console.log('await processor.processImage("input.jpg", "output.jpg", {');
  console.log('  width: 800,');
  console.log('  height: 600,');
  console.log('  quality: 85');
  console.log('});\n');

  console.log('// 虛擬試穿處理');
  console.log('const vtoProcessor = new VirtualTryOnProcessor();');
  console.log('await vtoProcessor.createVirtualTryOn(');
  console.log('  "person.jpg",');
  console.log('  "clothing.jpg",');
  console.log('  "result.jpg",');
  console.log('  { clothingCategory: "tops" }');
  console.log(');\n');

  console.log('// 批次處理');
  console.log('const results = await processor.batchProcess(');
  console.log('  "./input_folder",');
  console.log('  "./output_folder",');
  console.log('  { width: 512, height: 768 }');
  console.log(');\n');

  console.log('5. API 整合建議：');
  console.log('   ✓ Express.js 中間件整合');
  console.log('   ✓ 檔案上傳處理');
  console.log('   ✓ 圖像儲存管理');
  console.log('   ✓ 錯誤回應處理\n');

  console.log('6. 效能優化：');
  console.log('   ✓ 圖像壓縮和快取');
  console.log('   ✓ 並行處理支援');
  console.log('   ✓ 記憶體使用優化');
  console.log('   ✓ 臨時檔案清理\n');

  try {
    const sampleMetadata = {
      width: 800,
      height: 600,
      format: 'jpeg',
      size: 150000
    };

    const aspectRatio = ImageUtils.calculateAspectRatio(800, 600);
    console.log(`圖像長寬比: ${aspectRatio.ratio.toFixed(2)} (${aspectRatio.simplifiedRatio})`);
    
    const formattedSize = ImageUtils.formatFileSize(150000);
    console.log(`檔案大小: ${formattedSize}`);
    
    const optimalDimensions = ImageUtils.getOptimalDimensions(800, 600, 400, 300);
    console.log(`優化尺寸: ${optimalDimensions.width}x${optimalDimensions.height}`);

    console.log('\n=== 圖像處理工程師初始化完成 ===');
    console.log('所有功能模組已準備就緒，可開始處理圖像任務！');

  } catch (error) {
    console.error('示範過程發生錯誤:', error.message);
  }
}

async function createApiIntegrationExample() {
  console.log('\n=== API 整合範例 ===\n');
  
  console.log('// Express.js 路由整合範例');
  console.log(`
const express = require('express');
const multer = require('multer');
const VirtualTryOnProcessor = require('./virtual-tryOn-processor');

const app = express();
const upload = multer({ dest: 'uploads/' });
const vtoProcessor = new VirtualTryOnProcessor();

app.post('/api/virtual-tryon', upload.fields([
  { name: 'person', maxCount: 1 },
  { name: 'clothing', maxCount: 1 }
]), async (req, res) => {
  try {
    const personImage = req.files.person[0].path;
    const clothingImage = req.files.clothing[0].path;
    const outputPath = \`results/tryon_\${Date.now()}.jpg\`;
    
    const result = await vtoProcessor.createVirtualTryOn(
      personImage,
      clothingImage,
      outputPath,
      { clothingCategory: req.body.category || 'tops' }
    );
    
    res.json({
      success: true,
      imageUrl: \`/images/\${path.basename(outputPath)}\`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('STYLEMATE API 伺服器運行於 port 3000');
});
  `);
}

if (require.main === module) {
  demonstrateImageProcessor()
    .then(() => createApiIntegrationExample())
    .catch(console.error);
}

module.exports = {
  demonstrateImageProcessor,
  createApiIntegrationExample
};