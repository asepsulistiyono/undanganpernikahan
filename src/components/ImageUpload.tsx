import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { compressImage, formatFileSize } from '../utils/imageCompressor';

interface Props {
  value: string;
  onChange: (base64: string) => void;
  label: string;
  aspectRatio?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({ value, onChange, label, aspectRatio = '1/1', maxSizeMB = 0.5 }: Props) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file terlalu besar (max 10MB sebelum compress)');
      return;
    }

    setIsCompressing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 90));
      }, 200);

      const compressed = await compressImage(file, {
        maxSizeMB,
        maxWidthOrHeight: 1200,
        useWebWorker: true
      });

      clearInterval(progressInterval);
      setProgress(100);
      onChange(compressed);

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsCompressing(false);
        setProgress(0);
      }, 1500);
    } catch (error) {
      console.error('Error compressing image:', error);
      setIsCompressing(false);
      setProgress(0);
      alert('Gagal mengompres gambar. Silakan coba lagi.');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {!value ? (
        <div
          onClick={() => !isCompressing && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all hover:border-amber-400 hover:bg-amber-50/50 ${
            isCompressing ? 'border-amber-400 bg-amber-50' : 'border-gray-300'
          }`}
        >
          {isCompressing ? (
            <div className="space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Mengompres gambar...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{progress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600">Klik untuk upload gambar</p>
              <p className="text-xs text-gray-400">Auto-compress • Max {maxSizeMB}MB • JPG/PNG/WebP</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative group">
          <div
            className="rounded-xl overflow-hidden border border-gray-200 shadow-sm"
            style={{ aspectRatio }}
          >
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>

          {showSuccess && (
            <div className="absolute inset-0 bg-green-500/80 rounded-xl flex items-center justify-center">
              <div className="text-center text-white">
                <Check className="w-10 h-10 mx-auto mb-1" />
                <p className="text-sm font-medium">Berhasil!</p>
              </div>
            </div>
          )}

          {/* Overlay actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-xl flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white/90 text-gray-800 rounded-lg text-sm font-medium hover:bg-white transition"
            >
              Ganti
            </button>
            <button
              onClick={handleRemove}
              className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
