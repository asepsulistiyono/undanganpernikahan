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
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB || 0.5,
      maxWidthOrHeight: options.maxWidthOrHeight || 1200,
      useWebWorker: options.useWebWorker ?? true,
      initialQuality: 0.8,
      fileType: 'image/webp'
    });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error('Compression error:', error);
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
