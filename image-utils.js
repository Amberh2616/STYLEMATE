const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class ImageUtils {
  static async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  static generateUniqueFilename(originalName, prefix = '') {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    
    return `${prefix}${baseName}_${timestamp}_${random}${ext}`;
  }

  static async cleanupTempFiles(tempDir) {
    try {
      const files = await fs.readdir(tempDir);
      for (const file of files) {
        await fs.unlink(path.join(tempDir, file));
      }
      await fs.rmdir(tempDir);
    } catch (error) {
      console.warn(`Cleanup warning: ${error.message}`);
    }
  }

  static validateImageDimensions(width, height, maxWidth = 4096, maxHeight = 4096) {
    if (width <= 0 || height <= 0) {
      return { valid: false, error: 'Invalid image dimensions' };
    }
    
    if (width > maxWidth || height > maxHeight) {
      return { valid: false, error: 'Image dimensions too large' };
    }
    
    return { valid: true };
  }

  static calculateAspectRatio(width, height) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(width, height);
    return {
      ratio: width / height,
      simplifiedRatio: `${width / divisor}:${height / divisor}`
    };
  }

  static getOptimalDimensions(originalWidth, originalHeight, maxWidth, maxHeight, maintainAspect = true) {
    if (!maintainAspect) {
      return { width: maxWidth, height: maxHeight };
    }

    const aspectRatio = originalWidth / originalHeight;
    let newWidth = maxWidth;
    let newHeight = maxHeight;

    if (maxWidth / aspectRatio <= maxHeight) {
      newHeight = Math.round(maxWidth / aspectRatio);
    } else {
      newWidth = Math.round(maxHeight * aspectRatio);
    }

    return { width: newWidth, height: newHeight };
  }

  static getMimeTypeFromExtension(extension) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  static getExtensionFromMimeType(mimeType) {
    const extensions = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/bmp': '.bmp',
      'image/tiff': '.tiff'
    };

    return extensions[mimeType] || '.bin';
  }

  static formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  static async getImageInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath);
      const mimeType = this.getMimeTypeFromExtension(extension);
      
      return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        formattedSize: this.formatFileSize(stats.size),
        mimeType,
        extension,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to get image info: ${error.message}`);
    }
  }

  static createImageProcessingQueue() {
    const queue = [];
    let processing = false;

    const processQueue = async () => {
      if (processing || queue.length === 0) return;
      
      processing = true;
      
      while (queue.length > 0) {
        const task = queue.shift();
        try {
          await task.processor();
          task.resolve({ success: true });
        } catch (error) {
          task.reject(error);
        }
      }
      
      processing = false;
    };

    return {
      add: (processor) => {
        return new Promise((resolve, reject) => {
          queue.push({ processor, resolve, reject });
          processQueue();
        });
      },
      
      getQueueLength: () => queue.length,
      isProcessing: () => processing
    };
  }

  static createProgressTracker() {
    return {
      current: 0,
      total: 0,
      
      start: function(total) {
        this.current = 0;
        this.total = total;
      },
      
      increment: function() {
        this.current++;
      },
      
      getProgress: function() {
        if (this.total === 0) return 0;
        return Math.round((this.current / this.total) * 100);
      },
      
      isComplete: function() {
        return this.current >= this.total;
      }
    };
  }

  static async validateImageFile(filePath, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedFormats = ['jpeg', 'jpg', 'png', 'webp'],
      minWidth = 1,
      minHeight = 1,
      maxWidth = 4096,
      maxHeight = 4096
    } = options;

    try {
      const stats = await fs.stat(filePath);
      
      if (stats.size > maxSize) {
        return { valid: false, error: 'File size too large' };
      }

      const extension = path.extname(filePath).toLowerCase().slice(1);
      if (!allowedFormats.includes(extension)) {
        return { valid: false, error: 'Unsupported file format' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  static createBatchProcessor(processorFunction, options = {}) {
    const { concurrency = 3, onProgress = null, onError = null } = options;
    
    return async function(items) {
      const results = [];
      const errors = [];
      let completed = 0;

      const processBatch = async (batch) => {
        return Promise.allSettled(
          batch.map(async (item, index) => {
            try {
              const result = await processorFunction(item);
              completed++;
              
              if (onProgress) {
                onProgress({
                  completed,
                  total: items.length,
                  progress: Math.round((completed / items.length) * 100)
                });
              }
              
              return { index, success: true, result };
            } catch (error) {
              completed++;
              
              if (onError) {
                onError({ item, error });
              }
              
              return { index, success: false, error: error.message };
            }
          })
        );
      };

      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency);
        const batchResults = await processBatch(batch);
        
        batchResults.forEach(result => {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          }
        });
      }

      return {
        results,
        errors,
        total: items.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    };
  }
}

module.exports = ImageUtils;