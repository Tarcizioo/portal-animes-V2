import { useState, useEffect, useRef } from 'react';
import { useModalClose } from '@/hooks/useModalClose';
import { X, Save, Upload, Link as LinkIcon, Hash, Camera, Lock, Globe, Edit2 } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ImageCropModal } from '@/components/ui/ImageCropModal';

// Lista de Gêneros Comuns
const ANIME_GENRES = [
    "Action", "Adventure", "Avant Garde", "Award Winning", "Boys Love", "Comedy", "Drama",
    "Fantasy", "Girls Love", "Gourmet", "Horror", "Mystery", "Romance", "Sci-Fi",
    "Slice of Life", "Sports", "Supernatural", "Suspense", "Ecchi", "Isekai", "Mecha",
    "Military", "Music", "Parody", "Psychological", "School", "Shoujo", "Shonen",
    "Josei", "Seinen", "Space", "Super Power", "Vampire", "Harem", "Historical",
    "Demons", "Magic", "Martial Arts", "Police", "Samurai", "Thriller"
];

export function EditProfileModal({ isOpen, onClose, profile, onSave }) {
    useModalClose(isOpen, onClose);

    const { user } = useAuth();
    const { toast } = useToast();
    const { uploadImage, uploading } = useImageUpload();

    const [formData, setFormData] = useState({
        displayName: '',
        photoURL: '',
        bannerURL: '',
        about: '',
        isPublic: true,
        favoriteGenres: [],
        connections: { discord: '', twitter: '', instagram: '' }
    });

    // Files and previews
    const [bannerFile, setBannerFile]     = useState(null);
    const [photoFile, setPhotoFile]       = useState(null);
    const [bannerPreview, setBannerPreview] = useState('');
    const [photoPreview, setPhotoPreview]   = useState('');

    // Crop modal state
    const [cropModal, setCropModal] = useState({ open: false, src: '', type: '' });

    const bannerInputRef = useRef(null);
    const photoInputRef  = useRef(null);

    const [tempGenre, setTempGenre]   = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (profile) {
            setFormData({
                displayName: profile.displayName || '',
                photoURL:    profile.photoURL    || '',
                bannerURL:   profile.bannerURL   || '',
                about:       profile.about       || '',
                isPublic:    profile.isPublic !== undefined ? profile.isPublic : true,
                favoriteGenres: profile.favoriteGenres || [],
                connections: {
                    discord:   profile.connections?.discord   || '',
                    twitter:   profile.connections?.twitter   || '',
                    instagram: profile.connections?.instagram || ''
                }
            });
            setBannerFile(null); setPhotoFile(null);
            setBannerPreview(''); setPhotoPreview('');
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const key = name.replace('social_', '');
            setFormData(prev => ({ ...prev, connections: { ...prev.connections, [key]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Open crop modal instead of setting file directly
    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        const src = URL.createObjectURL(file);
        setCropModal({ open: true, src, type });
        // reset input so same file can be selected again
        e.target.value = '';
    };

    // Called when user confirms crop
    const handleCropConfirm = (blob, previewUrl) => {
        const file = new File([blob], `${cropModal.type}_crop.jpg`, { type: 'image/jpeg' });
        if (cropModal.type === 'banner') {
            setBannerFile(file);
            setBannerPreview(previewUrl);
        } else {
            setPhotoFile(file);
            setPhotoPreview(previewUrl);
        }
        setCropModal({ open: false, src: '', type: '' });
    };

    // Sugestões de gênero
    useEffect(() => {
        if (!tempGenre.trim()) { setSuggestions([]); return; }
        const lowerVal = tempGenre.toLowerCase();
        setSuggestions(ANIME_GENRES.filter(g =>
            g.toLowerCase().includes(lowerVal) && !formData.favoriteGenres.includes(g)
        ));
    }, [tempGenre, formData.favoriteGenres]);

    const addGenre = (genre) => {
        const valid = ANIME_GENRES.find(g => g.toLowerCase() === genre.toLowerCase());
        if (valid && !formData.favoriteGenres.includes(valid))
            setFormData(prev => ({ ...prev, favoriteGenres: [...prev.favoriteGenres, valid] }));
        setTempGenre(''); setSuggestions([]);
    };

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (suggestions.length) { addGenre(suggestions[0]); return; }
        const match = ANIME_GENRES.find(g => g.toLowerCase() === tempGenre.trim().toLowerCase());
        if (match) addGenre(match);
        else toast.warning("Por favor, selecione um gênero válido da lista.");
    };

    const removeGenre = (genre) =>
        setFormData(prev => ({ ...prev, favoriteGenres: prev.favoriteGenres.filter(g => g !== genre) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        let updatedData = { ...formData };
        try {
            if (bannerFile) {
                const url = await uploadImage(bannerFile, `users/${user.uid}/banner_${Date.now()}`);
                if (url) updatedData.bannerURL = url;
            }
            if (photoFile) {
                const url = await uploadImage(photoFile, `users/${user.uid}/avatar_${Date.now()}`);
                if (url) updatedData.photoURL = url;
            }
            await onSave(updatedData);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            if (error.code === 'storage/unauthorized') toast.error("Erro de permissão no Firebase Storage.");
            else if (error.code === 'storage/canceled')  toast.warning("Upload cancelado.");
            else toast.error(`Erro ao salvar: ${error.message}`);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Crop Modal (above everything) */}
            {cropModal.open && (
                <ImageCropModal
                    imageSrc={cropModal.src}
                    type={cropModal.type}
                    onConfirm={handleCropConfirm}
                    onCancel={() => setCropModal({ open: false, src: '', type: '' })}
                />
            )}

            <div
                className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            >
                <div
                    className="bg-[var(--bg-secondary)] w-full max-w-2xl rounded-t-2xl md:rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] md:max-h-[90vh] mb-16 md:mb-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                        <h2 className="text-lg md:text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                            <Edit2 className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Editar Perfil
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--bg-primary)]/10 rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">

                        {/* 1. Aparência */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Aparência
                            </h3>

                            {/* Banner */}
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-secondary)]">Banner do Perfil</label>
                                <div
                                    className="relative h-32 w-full rounded-xl overflow-hidden bg-black/40 border-2 border-dashed border-white/10 group hover:border-primary/50 transition-colors cursor-pointer"
                                    onClick={() => bannerInputRef.current.click()}
                                >
                                    {(bannerPreview || formData.bannerURL) ? (
                                        <img src={bannerPreview || formData.bannerURL} alt="Banner Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                                            <Camera className="w-8 h-8" />
                                            <span className="text-xs">Clique para enviar (proporção 16:5)</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                    </div>
                                </div>
                                <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="hidden" />
                            </div>

                            {/* Avatar */}
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Foto de Perfil</label>
                                <div className="flex items-center gap-4">
                                    <div
                                        className="relative w-20 h-20 rounded-full overflow-hidden bg-black/40 border-2 border-dashed border-white/10 group hover:border-primary/50 transition-colors cursor-pointer"
                                        onClick={() => photoInputRef.current.click()}
                                    >
                                        {(photoPreview || formData.photoURL) ? (
                                            <img src={photoPreview || formData.photoURL} alt="Avatar Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full"><Camera className="w-6 h-6 text-gray-500" /></div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        <p>Recorte circular automático</p>
                                        <p>JPG, PNG e WebP suportados</p>
                                        <button type="button" onClick={() => photoInputRef.current.click()} className="text-primary hover:text-primary-hover mt-1 font-bold">
                                            Selecionar arquivo
                                        </button>
                                    </div>
                                    <input type="file" ref={photoInputRef} onChange={(e) => handleFileChange(e, 'avatar')} accept="image/*" className="hidden" />
                                </div>
                            </div>
                        </section>

                        {/* 2. Informações Básicas */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                                <Hash className="w-4 h-4" /> Informações Básicas
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-secondary)]">Nome de Exibição</label>
                                    <input
                                        type="text" name="displayName" value={formData.displayName} onChange={handleChange}
                                        className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold"
                                    />
                                </div>
                                {/* Gêneros com Autocomplete */}
                                <div className="space-y-2 relative">
                                    <label className="text-sm text-[var(--text-secondary)]">Gêneros Favoritos</label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.favoriteGenres.map(g => (
                                            <span key={g} className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all" onClick={() => removeGenre(g)}>
                                                {g} <X className="w-3 h-3" />
                                            </span>
                                        ))}
                                    </div>
                                    <input
                                        type="text" value={tempGenre} onChange={(e) => setTempGenre(e.target.value)} onKeyDown={handleKeyDown}
                                        placeholder="Digite um gênero..."
                                        className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                                    />
                                    {suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-[#25252b] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                            {suggestions.map(genre => (
                                                <div key={genre} onClick={() => addGenre(genre)} className="px-4 py-2 text-sm text-gray-300 hover:bg-primary/20 hover:text-white cursor-pointer transition-colors">{genre}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 3. Privacidade */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                                <Lock className="w-4 h-4" /> Privacidade
                            </h3>
                            <div className="bg-[var(--bg-primary)]/30 border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                                        {formData.isPublic ? <Globe className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-red-400" />}
                                        Perfil Público
                                    </h4>
                                    <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-[80%]">
                                        Se desativado, seu perfil público ficará inacessível para outras pessoas.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.isPublic} onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))} />
                                    <div className="w-11 h-6 bg-[var(--bg-tertiary)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                                </label>
                            </div>
                        </section>

                        {/* 4. Conexões */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" /> Conexões
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                                        {/* Discord icon */}
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.014.043.031.056A19.9 19.9 0 0 0 5.99 21.2a.077.077 0 0 0 .084-.026c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.088.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.029z"/></svg>
                                        Discord
                                    </label>
                                    <input type="text" name="social_discord" value={formData.connections.discord} onChange={handleChange} placeholder="Seu username do Discord" className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] transition-all text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                                        {/* X/Twitter icon */}
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                        Twitter / X
                                    </label>
                                    <input type="text" name="social_twitter" value={formData.connections.twitter} onChange={handleChange} placeholder="@usuario" className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-[#1DA1F2] focus:outline-none focus:ring-1 focus:ring-[#1DA1F2] transition-all text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                                        {/* Instagram icon */}
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="url(#ig)"><defs><linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="25%" stopColor="#e6683c"/><stop offset="50%" stopColor="#dc2743"/><stop offset="75%" stopColor="#cc2366"/><stop offset="100%" stopColor="#bc1888"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                        Instagram
                                    </label>
                                    <input type="text" name="social_instagram" value={formData.connections.instagram} onChange={handleChange} placeholder="@usuario" className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-[#E1306C] focus:outline-none focus:ring-1 focus:ring-[#E1306C] transition-all text-sm" />
                                </div>
                            </div>
                        </section>
                    </div>


                    {/* Footer */}
                    <div className="p-4 md:p-6 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] flex justify-end gap-2 md:gap-3">
                        <button onClick={onClose} className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/10 hover:text-[var(--text-primary)] transition-all font-medium text-sm md:text-base">
                            Cancelar
                        </button>
                        <button disabled={uploading} onClick={handleSubmit} className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base">
                            {uploading ? 'Enviando...' : <><Save className="w-4 h-4" /> Salvar Alterações</>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
