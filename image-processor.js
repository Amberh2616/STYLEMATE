const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class ImageProcessor {
  constructor() {
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.defaultQuality = 80;
  }

  async processImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = null,
        height = null,
        quality = this.defaultQuality,
        format = 'jpeg',
        fit = 'cover'
      } = options;

      let processor = sharp(inputPath);

      if (width || height) {
        processor = processor.resize(width, height, { fit });
      }

      if (format === 'jpeg') {
        processor = processor.jpeg({ quality });
      } else if (format === 'png') {
        processor = processor.png({ quality });
      } else if (format === 'webp') {
        processor = processor.webp({ quality });
      }

      await processor.toFile(outputPath);
      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  async validateImage(filePath) {
    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size > this.maxFileSize) {
        throw new Error('File size exceeds maximum limit');
      }

      const metadata = await sharp(filePath).metadata();
      const format = metadata.format;

      if (!this.supportedFormats.includes(format)) {
        throw new Error(`Unsupported format: ${format}`);
      }

      return {
        valid: true,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: stats.size
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  async createThumbnail(inputPath, outputPath, size = 200) {
    return this.processImage(inputPath, outputPath, {
      width: size,
      height: size,
      fit: 'cover',
      quality: 70
    });
  }

  async cropImage(inputPath, outputPath, cropOptions) {
    try {
      const { left, top, width, height } = cropOptions;
      
      await sharp(inputPath)
        .extract({ left, top, width, height })
        .toFile(outputPath);

      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Image cropping failed: ${error.message}`);
    }
  }

  async overlayImages(backgroundPath, overlayPath, outputPath, position = { x: 0, y: 0 }) {
    try {
      const overlay = await sharp(overlayPath).toBuffer();
      
      await sharp(backgroundPath)
        .composite([{
          input: overlay,
          left: position.x,
          top: position.y
        }])
        .toFile(outputPath);

      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Image overlay failed: ${error.message}`);
    }
  }

  async adjustBrightness(inputPath, outputPath, brightness = 1.0) {
    try {
      await sharp(inputPath)
        .modulate({ brightness })
        .toFile(outputPath);

      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Brightness adjustment failed: ${error.message}`);
    }
  }

  async adjustContrast(inputPath, outputPath, contrast = 1.0) {
    try {
      await sharp(inputPath)
        .linear(contrast, 0)
        .toFile(outputPath);

      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Contrast adjustment failed: ${error.message}`);
    }
  }

  async removeBackground(inputPath, outputPath) {
    try {
      await sharp(inputPath)
        .removeAlpha()
        .toFile(outputPath);

      return { success: true, outputPath };
    } catch (error) {
      throw new Error(`Background removal failed: ${error.message}`);
    }
  }

  async batchProcess(inputDir, outputDir, options = {}) {
    try {
      const files = await fs.readdir(inputDir);
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase().slice(1);
        return this.supportedFormats.includes(ext);
      });

      const results = [];

      for (const file of imageFiles) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);
        
        try {
          const result = await this.processImage(inputPath, outputPath, options);
          results.push({ file, success: true, outputPath: result.outputPath });
        } catch (error) {
          results.push({ file, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Batch processing failed: ${error.message}`);
    }
  }
}

module.exports = ImageProcessor;