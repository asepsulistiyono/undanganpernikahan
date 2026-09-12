import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 0.5, // Max 500KB
  maxWidthOrHeight: 1200,
  useWebWorker: true
};

export async function compressImage(
  file: File,
  options: CompressionOptions = defaultOptions
): Promise<string> {
  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  console.log('Compressing image, isMobile:', isMobile, 'file size:', file.size);
  
  try {
    // Use more aggressive compression on mobile
    const compressionOptions = {
      maxSizeMB: isMobile ? 0.3 : (options.maxSizeMB || 0.5), // 300KB on mobile, 500KB on desktop
      maxWidthOrHeight: isMobile ? 800 : (options.maxWidthOrHeight || 1200), // Smaller on mobile
      useWebWorker: isMobile ? false : (options.useWebWorker ?? true), // Disable WebWorker on mobile
      initialQuality: isMobile ? 0.7 : 0.8,
      fileType: 'image/webp'
    };
    
    console.log('Compression options:', compressionOptions);
    
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log('Compressed file size:', compressedFile.size);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        console.log('Data URL length:', result.length);
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error('Compression error:', error);
    console.log('Falling back to original file');
    // Fallback: read original file
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export function getCompressedSize(originalSize: number, compressedSize: number): string {
  const saved = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
  return `${saved}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
