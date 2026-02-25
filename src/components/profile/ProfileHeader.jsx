import { useState } from 'react';
import { Edit2, Share2, Maximize2 } from 'lucide-react';
import { ImageModal } from '@/components/ui/ImageModal';
import { motion } from 'framer-motion';

export function ProfileHeader({ user, profile, onEdit, onShare, readOnly = false }) {
    const banner = profile?.bannerURL || user?.bannerURL || "https://placehold.co/1200x400/1a1a1a/FFF?text=Banner+Anime";
    const photo  = profile?.photoURL  || user?.photoURL  || "https://placehold.co/200x200/6366f1/FFF?text=User";
    const name   = profile?.displayName || user?.displayName || "Usuário";
    const isOnline = true;

    const [lightbox, setLightbox] = useState({ open: false, url: '', alt: '' });
    const openLightbox = (url, alt) => setLightbox({ open: true, url, alt });
    const closeLightbox = () => setLightbox({ open: false, url: '', alt: '' });

    return (
        <>
            <div className="relative mb-20 md:mb-20">
                {/* ── Banner ───────────────────────────────────────────────── */}
                <div
                    className="h-36 md:h-72 w-full rounded-2xl md:rounded-3xl overflow-hidden relative shadow-2xl group cursor-pointer"
                    onClick={() => openLightbox(banner, 'Banner')}
                    title="Clique para ampliar"
                >
                    <img
                        src={banner}
                        alt="Banner"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-black/30 opacity-90" />

                    {/* Expand hint overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/40 backdrop-blur-sm rounded-full p-2">
                            <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Online badge — stays top right */}
                    <div className="absolute top-3 right-3 md:top-6 md:right-6 flex gap-2" onClick={e => e.stopPropagation()}>
                        <span className="bg-black/40 backdrop-blur-md text-white px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium border border-white/10 flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>

                {/* ── Avatar (bottom-left, no action buttons here) ─────────── */}
                <div className="absolute -bottom-14 left-0 right-0 md:-bottom-16 md:left-12 md:right-auto flex flex-col md:flex-row items-center md:items-end gap-3 md:gap-6 px-4 md:px-0">
                    <div
                        className="group relative cursor-pointer"
                        onClick={() => openLightbox(photo, name)}
                        title="Clique para ampliar"
                    >
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-1 md:p-1.5 bg-background-light dark:bg-background-dark shadow-2xl">
                            <img
                                src={photo}
                                alt={name}
                                className="w-full h-full rounded-full object-cover border-3 md:border-4 border-white dark:border-[#1e1e24] transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        {/* Expand hint */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <div className="bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                                <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Name / join info */}
                    <div className="mb-0 md:mb-4 space-y-0.5 text-center md:text-left">
                        <h1 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">{name}</h1>
                        <p className="text-gray-400 text-xs md:text-sm">Membro desde {new Date().getFullYear()}</p>
                    </div>
                </div>

                {/* ── Edit / Share buttons — below banner, right side ───────── */}
                {!readOnly && (
                    <div className="absolute -bottom-12 right-0 md:-bottom-14 md:right-0 flex items-center gap-2 px-4 md:px-0">
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={onShare}
                            className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-bg-secondary border border-border-color text-text-secondary hover:text-text-primary hover:border-button-accent/50 rounded-xl shadow-md transition-all text-xs md:text-sm font-semibold"
                            title="Compartilhar Perfil"
                        >
                            <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Compartilhar</span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={onEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-button-accent text-text-on-primary rounded-xl shadow-md hover:opacity-90 transition-all text-xs md:text-sm font-bold"
                            title="Editar Perfil"
                        >
                            <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="hidden sm:inline">Editar Perfil</span>
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <ImageModal
                isOpen={lightbox.open}
                onClose={closeLightbox}
                imageUrl={lightbox.url}
                altText={lightbox.alt}
            />
        </>
    );
}