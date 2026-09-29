import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: any) => void;
  onClose: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onClose }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop: any) => setCrop(crop);
  const onZoomChange = (zoom: any) => setZoom(zoom);

  const handleCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121620] border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Редактировать изображение</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative w-full h-64 bg-black/50 rounded-lg overflow-hidden border border-white/5 mb-6">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={true}
            onCropChange={onCropChange}
            onCropComplete={handleCropComplete}
            onZoomChange={onZoomChange}
            style={{
              containerStyle: { backgroundColor: 'transparent' },
              cropAreaStyle: { border: '2px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 0 0 9999em rgba(0,0,0,0.6)' }
            }}
          />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <span className="text-slate-400 text-xs font-bold">1x</span>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
          <span className="text-slate-400 text-xs font-bold">3x</span>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-slate-300 font-bold hover:bg-white/5 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400 transition-colors shadow-[0_0_15px_rgba(14,165,233,0.4)]"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

// Утилита для обрезки картинки на канвасе и возврата Base64
export async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Возвращаем base64 webp с хорошим сжатием
  return canvas.toDataURL('image/webp', 0.9);
}
