import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { apiFetch } from '@/services/api';

export function ImageSelectModal({ isOpen, onClose, itemId, type, onSelect }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isOpen || !itemId || !type) return;

        const fetchImages = async () => {
            setLoading(true);
            setError(null);
            try {
                // Jikan API expects type: "anime" or "characters"
                const endpointType = type === 'anime' ? 'anime' : 'characters';
                const response = await apiFetch(`/${endpointType}/${itemId}/pictures`);
                
                // Extrai as URLs baseado no formato retornado pela Jikan V4
                const pics = response?.data?.map(pic => 
                    pic.webp?.large_image_url || pic.jpg?.large_image_url || pic.webp?.image_url || pic.jpg?.image_url
                ).filter(Boolean);

                setImages(pics || []);
            } catch (err) {
                console.error("Erro ao buscar imagens:", err);
                setError("Não foi possível carregar as imagens.");
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [isOpen, itemId, type]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-bg-secondary w-full max-w-2xl rounded-2xl border border-border-color shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 md:p-6 border-b border-border-color bg-bg-tertiary">
                    <h2 className="text-lg md:text-xl font-bold text-text-primary flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-button-accent" /> Escolher Imagem do Card
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-bg-primary/50 text-text-secondary hover:text-text-primary rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-border-color scrollbar-track-transparent">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-12 text-text-secondary">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-button-accent" />
                            <p>Buscando imagens na galeria oficial...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center p-10 text-red-400">
                            <p>{error}</p>
                            <button 
                                onClick={onClose}
                                className="mt-4 px-4 py-2 border border-red-500/30 rounded-lg hover:bg-red-500/10 text-sm"
                            >
                                Fechar
                            </button>
                        </div>
                    ) : images.length === 0 ? (
                        <div className="text-center p-10 text-text-secondary">
                            <p>Nenhuma imagem alternativa encontrada.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {images.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onSelect(url)}
                                    className="relative aspect-[2/3] rounded-xl overflow-hidden border-2 border-transparent hover:border-button-accent outline-none shadow-md group transition-all"
                                >
                                    <img 
                                        src={url} 
                                        alt={`Opção ${idx + 1}`} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="px-3 py-1.5 bg-button-accent font-bold text-text-on-primary text-xs rounded-lg shadow-lg">
                                            Selecionar
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
