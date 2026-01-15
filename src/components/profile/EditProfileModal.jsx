import { useState, useEffect, useRef } from 'react';
import { X, Save, Upload, Link as LinkIcon, Hash, Camera } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

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
    if (!isOpen) return null;

    const { user } = useAuth();
    const { toast } = useToast();
    const { uploadImage, uploading } = useImageUpload();

    const [formData, setFormData] = useState({
        displayName: '',
        photoURL: '',
        bannerURL: '',
        about: '',
        favoriteGenres: [],
        connections: {
            discord: '',
            twitter: '',
            instagram: ''
        }
    });

    // Estados para arquivos locais (preview/upload)
    const [bannerFile, setBannerFile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState('');
    const [photoPreview, setPhotoPreview] = useState('');

    const bannerInputRef = useRef(null);
    const photoInputRef = useRef(null);

    const [tempGenre, setTempGenre] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (profile) {
            setFormData({
                displayName: profile.displayName || '',
                photoURL: profile.photoURL || '',
                bannerURL: profile.bannerURL || '',
                about: profile.about || '',
                favoriteGenres: profile.favoriteGenres || [],
                connections: {
                    discord: profile.connections?.discord || '',
                    twitter: profile.connections?.twitter || '',
                    instagram: profile.connections?.instagram || ''
                }
            });
            // Reset files
            setBannerFile(null);
            setPhotoFile(null);
            setBannerPreview('');
            setPhotoPreview('');
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                connections: {
                    ...prev.connections,
                    [socialKey]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            if (type === 'banner') {
                setBannerFile(file);
                setBannerPreview(previewUrl);
            } else if (type === 'photo') {
                setPhotoFile(file);
                setPhotoPreview(previewUrl);
            }
        }
    };

    // Atualizar sugestões quando o usuário digita
    useEffect(() => {
        if (tempGenre.trim() === '') {
            setSuggestions([]);
        } else {
            const lowerVal = tempGenre.toLowerCase();
            const filtered = ANIME_GENRES.filter(g =>
                g.toLowerCase().includes(lowerVal) &&
                !formData.favoriteGenres.includes(g)
            );
            setSuggestions(filtered);
        }
    }, [tempGenre, formData.favoriteGenres]);

    const addGenre = (genre) => {
        // Enforce valid genre check
        const validGenre = ANIME_GENRES.find(g => g.toLowerCase() === genre.toLowerCase());

        if (validGenre && !formData.favoriteGenres.includes(validGenre)) {
            setFormData(prev => ({
                ...prev,
                favoriteGenres: [...prev.favoriteGenres, validGenre]
            }));
        }
        setTempGenre('');
        setSuggestions([]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            // 1. Se tiver sugestão, pega a primeira
            if (suggestions.length > 0) {
                addGenre(suggestions[0]);
                return;
            }

            // 2. Se o usuário digitou algo válido (case insensitive), aceita
            const typedVal = tempGenre.trim();
            if (typedVal) {
                const match = ANIME_GENRES.find(g => g.toLowerCase() === typedVal.toLowerCase());
                if (match) {
                    addGenre(match);
                } else {
                    // Opcional: Feedback visual de erro, por enquanto apenas não adiciona
                    toast.warning("Por favor, selecione um gênero válido da lista.");
                }
            }
        }
    };

    const removeGenre = (genre) => {
        setFormData(prev => ({
            ...prev,
            favoriteGenres: prev.favoriteGenres.filter(g => g !== genre)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let updatedData = { ...formData };

        try {
            // Upload Banner if changed
            if (bannerFile) {
                const bannerUrl = await uploadImage(bannerFile, `users/${user.uid}/banner_${Date.now()}`);
                if (bannerUrl) updatedData.bannerURL = bannerUrl;
            }

            // Upload Photo if changed
            if (photoFile) {
                const photoUrl = await uploadImage(photoFile, `users/${user.uid}/avatar_${Date.now()}`);
                if (photoUrl) updatedData.photoURL = photoUrl;
            }

            await onSave(updatedData);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            // Mostrar mensagem de erro mais específica
            if (error.code === 'storage/unauthorized') {
                toast.error("Erro de permissão: Verifique as regras do Firebase Storage.");
            } else if (error.code === 'storage/canceled') {
                toast.warning("Upload cancelado.");
            } else if (error.code === 'storage/unknown') {
                toast.error("Erro desconhecido no servidor de armazenamento.");
            } else {
                toast.error(`Erro ao salvar: ${error.message}`);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--bg-secondary)] w-full max-w-2xl rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)] bg-[var(--bg-tertiary)]">
                    <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-primary" /> Editar Perfil
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-primary)]/10 rounded-full transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">

                    {/* 1. Imagens */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Aparência
                        </h3>

                        {/* Banner Preview & Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-[var(--text-secondary)]">Banner do Perfil</label>
                            <div
                                className="relative h-32 w-full rounded-xl overflow-hidden bg-black/40 border-2 border-dashed border-white/10 group hover:border-primary/50 transition-colors cursor-pointer"
                                onClick={() => bannerInputRef.current.click()}
                            >
                                {(bannerPreview || formData.bannerURL) ? (
                                    <img
                                        src={bannerPreview || formData.bannerURL}
                                        alt="Banner Preview"
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        Clique para enviar
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={bannerInputRef}
                                onChange={(e) => handleFileChange(e, 'banner')}
                                accept="image/png, image/jpeg, image/jpg, image/webp"
                                className="hidden"
                            />
                        </div>

                        {/* Avatar Preview & Input */}
                        <div className="space-y-2">
                            <label className="text-sm text-gray-300">Foto de Perfil</label>
                            <div className="flex items-center gap-4">
                                <div
                                    className="relative w-20 h-20 rounded-full overflow-hidden bg-black/40 border-2 border-dashed border-white/10 group hover:border-primary/50 transition-colors cursor-pointer"
                                    onClick={() => photoInputRef.current.click()}
                                >
                                    {(photoPreview || formData.photoURL) ? (
                                        <img
                                            src={photoPreview || formData.photoURL}
                                            alt="Avatar Preview"
                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Camera className="w-6 h-6 text-gray-500" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    <p>Recomendado: 400x400px</p>
                                    <p>JPG e PNG suportados</p>
                                    <button
                                        type="button"
                                        onClick={() => photoInputRef.current.click()}
                                        className="text-primary hover:text-primary-hover mt-1 font-bold"
                                    >
                                        Selecionar arquivo
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={photoInputRef}
                                    onChange={(e) => handleFileChange(e, 'photo')}
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 2. Básico */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                            <Hash className="w-4 h-4" /> Informações Básicas
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-secondary)]">Nome de Exibição</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            {/* Tags de Gênero com Autocomplete */}
                            <div className="space-y-2 relative">
                                <label className="text-sm text-[var(--text-secondary)]">Gêneros Favoritos</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.favoriteGenres.map(g => (
                                        <span key={g} className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold flex items-center gap-1 group cursor-pointer hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all" onClick={() => removeGenre(g)}>
                                            {g} <X className="w-3 h-3" />
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={tempGenre}
                                    onChange={(e) => setTempGenre(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Digite um gênero..."
                                    className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                                />

                                {/* Sugestões Dropdown */}
                                {suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-[#25252b] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {suggestions.map(genre => (
                                            <div
                                                key={genre}
                                                onClick={() => addGenre(genre)}
                                                className="px-4 py-2 text-sm text-gray-300 hover:bg-primary/20 hover:text-white cursor-pointer transition-colors"
                                            >
                                                {genre}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 3. Conexões */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> Conexões
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-secondary)]">Discord</label>
                                <input
                                    type="text"
                                    name="social_discord"
                                    value={formData.connections.discord}
                                    onChange={handleChange}
                                    placeholder="User#0000"
                                    className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-secondary)]">Twitter / X</label>
                                <input
                                    type="text"
                                    name="social_twitter"
                                    value={formData.connections.twitter}
                                    onChange={handleChange}
                                    placeholder="@usuario"
                                    className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-[#1DA1F2] focus:outline-none focus:ring-1 focus:ring-[#1DA1F2] transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-[var(--text-secondary)]">Instagram</label>
                                <input
                                    type="text"
                                    name="social_instagram"
                                    value={formData.connections.instagram}
                                    onChange={handleChange}
                                    placeholder="@usuario"
                                    className="w-full bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:border-[#E1306C] focus:outline-none focus:ring-1 focus:ring-[#E1306C] transition-all text-sm"
                                />
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/10 hover:text-[var(--text-primary)] transition-all font-medium">
                        Cancelar
                    </button>
                    <button disabled={uploading} onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploading ? (
                            <>Uploading...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Salvar Alterações
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

import { Edit2 } from 'lucide-react';
