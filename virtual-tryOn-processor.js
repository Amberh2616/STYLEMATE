const ImageProcessor = require('./image-processor');
const path = require('path');

class VirtualTryOnProcessor extends ImageProcessor {
  constructor() {
    super();
    this.bodyKeypoints = [
      'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
      'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
      'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ];
    
    this.clothingCategories = {
      'tops': ['shirt', 'blouse', 't-shirt', 'sweater', 'jacket'],
      'bottoms': ['pants', 'jeans', 'skirt', 'shorts'],
      'dresses': ['dress', 'gown', 'sundress'],
      'accessories': ['hat', 'scarf', 'glasses', 'jewelry']
    };
  }

  async processPersonImage(imagePath, outputDir) {
    try {
      const validation = await this.validateImage(imagePath);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const filename = path.basename(imagePath, path.extname(imagePath));
      const results = {};

      results.original = imagePath;
      results.standardized = path.join(outputDir, `${filename}_standardized.jpg`);
      await this.processImage(imagePath, results.standardized, {
        width: 512,
        height: 768,
        fit: 'contain',
        quality: 85
      });

      results.thumbnail = path.join(outputDir, `${filename}_thumb.jpg`);
      await this.createThumbnail(imagePath, results.thumbnail, 150);

      results.bodySegment = path.join(outputDir, `${filename}_body_segment.png`);
      await this.extractBodySegment(results.standardized, results.bodySegment);

      return results;
    } catch (error) {
      throw new Error(`Person image processing failed: ${error.message}`);
    }
  }

  async processClothingItem(imagePath, outputDir, category) {
    try {
      const validation = await this.validateImage(imagePath);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      if (!this.isValidClothingCategory(category)) {
        throw new Error(`Invalid clothing category: ${category}`);
      }

      const filename = path.basename(imagePath, path.extname(imagePath));
      const results = {};

      results.original = imagePath;
      results.processed = path.join(outputDir, `${filename}_processed.png`);
      await this.processImage(imagePath, results.processed, {
        width: 256,
        height: 384,
        fit: 'contain',
        format: 'png',
        quality: 90
      });

      results.mask = path.join(outputDir, `${filename}_mask.png`);
      await this.createClothingMask(results.processed, results.mask);

      results.thumbnail = path.join(outputDir, `${filename}_thumb.jpg`);
      await this.createThumbnail(imagePath, results.thumbnail, 100);

      return results;
    } catch (error) {
      throw new Error(`Clothing item processing failed: ${error.message}`);
    }
  }

  async createVirtualTryOn(personImagePath, clothingImagePath, outputPath, options = {}) {
    try {
      const {
        clothingCategory = 'tops',
        alignmentMode = 'auto',
        blendMode = 'normal',
        opacity = 0.9
      } = options;

      const tempDir = path.join(path.dirname(outputPath), 'temp');
      
      const personResults = await this.processPersonImage(personImagePath, tempDir);
      const clothingResults = await this.processClothingItem(clothingImagePath, tempDir, clothingCategory);

      const alignedClothing = path.join(tempDir, 'aligned_clothing.png');
      await this.alignClothingToPerson(
        personResults.bodySegment,
        clothingResults.processed,
        alignedClothing,
        clothingCategory
      );

      await this.blendImages(
        personResults.standardized,
        alignedClothing,
        outputPath,
        { mode: blendMode, opacity }
      );

      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Virtual try-on failed: ${error.message}`);
    }
  }

  async extractBodySegment(imagePath, outputPath) {
    try {
      await this.processImage(imagePath, outputPath, {
        format: 'png',
        quality: 100
      });
      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Body segmentation failed: ${error.message}`);
    }
  }

  async createClothingMask(imagePath, outputPath) {
    try {
      const processor = this.sharp(imagePath);
      await processor
        .threshold(128)
        .toFormat('png')
        .toFile(outputPath);
      
      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Clothing mask creation failed: ${error.message}`);
    }
  }

  async alignClothingToPerson(bodyImagePath, clothingImagePath, outputPath, category) {
    try {
      const alignment = this.getAlignmentParameters(category);
      
      await this.processImage(clothingImagePath, outputPath, {
        width: alignment.width,
        height: alignment.height,
        fit: 'contain',
        format: 'png'
      });

      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Clothing alignment failed: ${error.message}`);
    }
  }

  async blendImages(backgroundPath, overlayPath, outputPath, blendOptions = {}) {
    try {
      const { mode = 'normal', opacity = 1.0 } = blendOptions;
      
      const overlay = await this.sharp(overlayPath)
        .composite([{ input: { r: 255, g: 255, b: 255, alpha: opacity * 255 }, blend: 'multiply' }])
        .toBuffer();

      await this.sharp(backgroundPath)
        .composite([{ input: overlay, blend: mode }])
        .toFile(outputPath);

      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Image blending failed: ${error.message}`);
    }
  }

  getAlignmentParameters(category) {
    const alignments = {
      'tops': { width: 256, height: 300, offsetY: 50 },
      'bottoms': { width: 256, height: 350, offsetY: 250 },
      'dresses': { width: 256, height: 400, offsetY: 50 },
      'accessories': { width: 128, height: 128, offsetY: 0 }
    };

    return alignments[category] || alignments['tops'];
  }

  isValidClothingCategory(category) {
    return Object.keys(this.clothingCategories).includes(category);
  }

  async batchVirtualTryOn(personImage, clothingDir, outputDir, options = {}) {
    try {
      const fs = require('fs').promises;
      const files = await fs.readdir(clothingDir);
      const results = [];

      for (const file of files) {
        const clothingPath = path.join(clothingDir, file);
        const outputPath = path.join(outputDir, `tryOn_${file}`);
        
        try {
          const result = await this.createVirtualTryOn(
            personImage, 
            clothingPath, 
            outputPath, 
            options
          );
          results.push({ file, success: true, outputPath: result.outputPath });
        } catch (error) {
          results.push({ file, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Batch virtual try-on failed: ${error.message}`);
    }
  }
}

module.exports = VirtualTryOnProcessor;