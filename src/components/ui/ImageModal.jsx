import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Reutilizável - exibe qualquer imagem em fullscreen com animação suave.
 * Usa createPortal para escapar de qualquer stacking context do layout.
 * Props:
 *   isOpen    {boolean}
 *   onClose   {function}
 *   imageUrl  {string}
 *   altText   {string}
 */
export function ImageModal({ isOpen, onClose, imageUrl, altText = '' }) {
    const handleKey = useCallback(
        (e) => { if (e.key === 'Escape') onClose(); },
        [onClose]
    );

    useEffect(() => {
        if (!isOpen) return;
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKey]);

    const modal = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="image-modal-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    // position: fixed + inset-0 garante cobertura total do viewport
                    style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
                    className="flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                    onClick={onClose}
                >
                    {/* Image container */}
                    <motion.div
                        key="image-modal-content"
                        initial={{ opacity: 0, scale: 0.9, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.88, y: 12 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                        className="relative flex flex-col items-center gap-3"
                        style={{ maxWidth: '92vw', maxHeight: '92vh' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botão fechar — acima da imagem */}
                        <div className="self-end">
                            <button
                                onClick={onClose}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/90 border border-white/10 hover:border-white/30 rounded-full text-white/70 hover:text-white text-xs font-medium transition-all backdrop-blur-sm"
                                aria-label="Fechar"
                            >
                                <X className="w-4 h-4" /> Fechar
                            </button>
                        </div>

                        {/* Imagem: respeita qualquer orientação/proporção */}
                        <img
                            src={imageUrl}
                            alt={altText}
                            className="block w-auto h-auto rounded-xl shadow-2xl ring-1 ring-white/10"
                            style={{ maxWidth: '92vw', maxHeight: '80vh', objectFit: 'contain' }}
                            draggable={false}
                        />

                        {altText && (
                            <p className="text-white/45 text-xs text-center">{altText}</p>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Renderiza no body para escapar do stacking context do layout
    return createPortal(modal, document.body);
}
