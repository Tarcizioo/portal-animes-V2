import { useState, useRef, useCallback, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, CropIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Generates a cropped image blob from a canvas.
 * @param {HTMLImageElement} image
 * @param {object} crop — pixel crop {x,y,width,height}
 * @param {boolean} circular — if true, applies circular mask
 * @returns {Promise<Blob>}
 */
async function getCroppedBlob(image, crop, circular = false) {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (circular) {
        ctx.beginPath();
        ctx.arc(crop.width / 2, crop.height / 2, crop.width / 2, 0, Math.PI * 2);
        ctx.clip();
    }

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0, 0,
        crop.width,
        crop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.92);
    });
}

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    );
}

/**
 * @param {object} props
 * @param {string}   props.imageSrc   — object URL to crop
 * @param {'avatar'|'banner'} props.type — determines aspect ratio and circular crop
 * @param {function} props.onConfirm  — (blob, previewUrl) => void
 * @param {function} props.onCancel
 */
export function ImageCropModal({ imageSrc, type, onConfirm, onCancel }) {
    const isAvatar = type === 'avatar';
    const aspect   = isAvatar ? 1 : 16 / 5;

    const imgRef = useRef(null);
    const [crop, setCrop]         = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [isProcessing, setIsProcessing]   = useState(false);

    const onImageLoad = useCallback((e) => {
        const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, aspect));
    }, [aspect]);

    const handleConfirm = async () => {
        if (!completedCrop || !imgRef.current) return;
        setIsProcessing(true);
        try {
            const blob = await getCroppedBlob(imgRef.current, completedCrop, isAvatar);
            const previewUrl = URL.createObjectURL(blob);
            onConfirm(blob, previewUrl);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-bg-secondary border border-border-color rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border-color">
                    <h3 className="font-bold text-text-primary flex items-center gap-2">
                        <CropIcon className="w-4 h-4 text-button-accent" />
                        {isAvatar ? 'Recortar Foto de Perfil' : 'Recortar Banner'}
                    </h3>
                    <button onClick={onCancel} className="p-2 rounded-full hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Crop area */}
                <div className="flex items-center justify-center p-4 bg-bg-primary/50 overflow-auto max-h-[60vh]">
                    <ReactCrop
                        crop={crop}
                        onChange={(_, pct) => setCrop(pct)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        circularCrop={isAvatar}
                        minWidth={isAvatar ? 100 : 200}
                    >
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            onLoad={onImageLoad}
                            className="max-h-[55vh] max-w-full object-contain"
                        />
                    </ReactCrop>
                </div>

                {/* Hint */}
                <p className="text-xs text-text-secondary text-center py-2 px-4">
                    {isAvatar ? 'Recorte circular · Arraste e redimensione a seleção' : 'Proporção 16:5 · Arraste e redimensione a seleção'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-border-color">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-border-color text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-all text-sm font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!completedCrop || isProcessing}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-button-accent text-text-on-primary font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Check className="w-4 h-4" />
                        {isProcessing ? 'Processando...' : 'Recortar e Usar'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
