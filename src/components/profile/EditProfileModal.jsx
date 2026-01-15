import { useState, useEffect } from 'react';
import { X, Save, Upload, Link as LinkIcon, Hash } from 'lucide-react';

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
                    alert("Por favor, selecione um gênero válido da lista.");
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
        await onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#1a1a20] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#202028]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-primary" /> Editar Perfil
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">

                    {/* 1. Imagens */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Aparência
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">URL do Banner</label>
                                <input
                                    type="text"
                                    name="bannerURL"
                                    value={formData.bannerURL}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">URL do Avatar</label>
                                <input
                                    type="text"
                                    name="photoURL"
                                    value={formData.photoURL}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 2. Básico */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Hash className="w-4 h-4" /> Informações Básicas
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Nome de Exibição</label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold"
                                />
                            </div>
                            {/* Tags de Gênero com Autocomplete */}
                            <div className="space-y-2 relative">
                                <label className="text-sm text-gray-300">Gêneros Favoritos</label>
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
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm"
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
                                <label className="text-sm text-gray-300">Discord</label>
                                <input
                                    type="text"
                                    name="social_discord"
                                    value={formData.connections.discord}
                                    onChange={handleChange}
                                    placeholder="User#0000"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#5865F2] focus:outline-none focus:ring-1 focus:ring-[#5865F2] transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Twitter / X</label>
                                <input
                                    type="text"
                                    name="social_twitter"
                                    value={formData.connections.twitter}
                                    onChange={handleChange}
                                    placeholder="@usuario"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#1DA1F2] focus:outline-none focus:ring-1 focus:ring-[#1DA1F2] transition-all text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-300">Instagram</label>
                                <input
                                    type="text"
                                    name="social_instagram"
                                    value={formData.connections.instagram}
                                    onChange={handleChange}
                                    placeholder="@usuario"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-[#E1306C] focus:outline-none focus:ring-1 focus:ring-[#E1306C] transition-all text-sm"
                                />
                            </div>
                        </div>
                    </section>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 bg-[#202028] flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all font-medium">
                        Cancelar
                    </button>
                    <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
}

import { Edit2 } from 'lucide-react';
