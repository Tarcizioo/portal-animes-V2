import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCharacterInfo } from '@/hooks/useCharacterInfo';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Heart, Mic2, Tv, Film, User, Image as ImageIcon, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { Loader } from '@/components/ui/Loader';
import { ReusableCarousel } from '@/components/ui/ReusableCarousel';

export function CharacterDetails() {
    const { id } = useParams();
    const { character, animeography, voiceActors, pictures, loading } = useCharacterInfo(id);
    const [isAboutExpanded, setIsAboutExpanded] = useState(false);

    usePageTitle(character?.name || 'Detalhes do Personagem');

    // --- Styles & Helpers ---
    const formatNumber = (num) => {
        if (!num) return '0';
        if (num > 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };
    const [selectedImage, setSelectedImage] = useState(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // Fade-in animation
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen bg-bg-primary text-primary items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (!character) return null;

    // Filter voice actors: prioritize Japanese, otherwise take first 6
    const mainVoiceActors = voiceActors.filter(va => va.language === "Japanese").slice(0, 4);
    const displayVoiceActors = mainVoiceActors.length > 0 ? mainVoiceActors : voiceActors.slice(0, 4);

    return (
        <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-white">
            <Sidebar />
            <ScrollToTop />

            <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-bg-secondary scrollbar-track-bg-primary">
                <Header />

                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

                    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">

                        {/* --- LEFT COLUMN (Sidebar) --- */}
                        <div className={`space-y-4 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            {/* Character Portrait */}
                            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border-color bg-bg-secondary aspect-[2/3] group">
                                <img
                                    src={character.image}
                                    alt={character.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                {character.favorites && (
                                    <div className="absolute top-2 left-2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-white/10 shadow-lg flex items-center gap-1">
                                        <Heart className="w-3 h-3 text-red-500 fill-red-500" /> {formatNumber(character.favorites)} FAVORITOS
                                    </div>
                                )}
                            </div>

                            {/* Actions Card */}
                            <div className="bg-bg-secondary rounded-xl p-4 border border-border-color shadow-sm hover:border-primary/30 transition-colors duration-300">
                                <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-bg-tertiary to-bg-secondary hover:from-primary hover:to-primary/80 text-text-primary hover:text-white py-3 rounded-lg font-bold transition-all duration-300 border border-border-color hover:border-primary shadow-sm hover:shadow-primary/25 active:scale-[0.98] group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                                    <Heart className="w-5 h-5 group-hover:fill-current transition-colors" />
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-xs font-normal opacity-70 group-hover:opacity-100">Adicionar aos</span>
                                        <span>Favoritos</span>
                                    </div>
                                </button>
                            </div>
                        </div>


                        {/* --- RIGHT COLUMN (Main Content) --- */}
                        <div className={`space-y-6 min-w-0 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                            {/* Header Info */}
                            <div className="relative">
                                <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary tracking-tight">{character.name}</h1>
                                {character.name_kanji && (
                                    <div className="inline-block mt-2 px-3 py-1 rounded-md bg-bg-secondary border border-border-color text-sm text-primary font-bold shadow-sm">
                                        {character.name_kanji}
                                    </div>
                                )}
                            </div>

                            {/* About Card */}
                            <div className="bg-bg-secondary rounded-2xl p-6 md:p-8 border border-border-color shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                                <div className="flex items-center gap-3 mb-4 relative z-10">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary">Sobre</h3>
                                </div>

                                <div className="prose prose-invert max-w-none relative z-10">
                                    <p className="text-text-secondary leading-relaxed whitespace-pre-line text-sm md:text-base">
                                        {character.about
                                            ? (isAboutExpanded ? character.about.replace(/\\n/g, '\n') : character.about.replace(/\\n/g, '\n').slice(0, 500) + (character.about.length > 500 ? '...' : ''))
                                            : "Sem descrição disponível."
                                        }
                                    </p>
                                    {character.about && character.about.length > 500 && (
                                        <button
                                            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                                            className="mt-2 text-primary font-bold hover:underline text-sm focus:outline-none"
                                        >
                                            {isAboutExpanded ? 'Ver Menos' : 'Ver Mais'}
                                        </button>
                                    )}
                                </div>

                                {/* Pseudo-Stats Section (Visual Only based on available data) */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border-color/50 relative z-10">
                                    {character.nicknames?.slice(0, 4).map((nick, i) => (
                                        <div key={i} className="flex flex-col p-2 rounded-lg hover:bg-white/5 transition-colors">
                                            <span className="text-[10px] uppercase font-bold text-primary tracking-wider mb-1">Apelido</span>
                                            <span className="text-sm font-semibold text-text-primary truncate" title={nick}>{nick}</span>
                                        </div>
                                    ))}
                                    {/* Fallback if no nicknames, show Favorites count as a stat */}
                                    {(!character.nicknames || character.nicknames.length === 0) && (
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Favoritos</span>
                                            <span className="text-sm font-semibold text-text-primary">{character.favorites?.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dubladores (Voice Actors) */}
                            <div>
                                <SectionHeader title="Dubladores" icon={Mic2} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {displayVoiceActors.map((va, idx) => (
                                        <div key={`${va.person.mal_id}-${idx}`} className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                                            <div
                                                className="w-10 h-10 rounded-full bg-cover bg-center shrink-0 border-2 border-transparent group-hover:border-primary/20"
                                                style={{ backgroundImage: `url('${va.person.images?.jpg?.image_url}')` }}
                                            />
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-text-primary truncate">{va.person.name}</h4>
                                                <p className="text-xs text-text-secondary truncate">{va.language}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {voiceActors.length === 0 && <span className="text-text-secondary text-sm">Nenhum dublador registrado.</span>}
                                </div>
                            </div>

                            {/* Filmografia (Carousel) */}
                            <div>
                                <ReusableCarousel
                                    title="Filmografia"
                                    icon={Film}
                                    items={animeography}
                                    renderItem={(entry) => (
                                        <Link
                                            to={`/anime/${entry.anime.mal_id}`}
                                            className="block w-[140px] md:w-[160px] group relative"
                                        >
                                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md border border-border-color group-hover:border-primary/50 transition-all">
                                                <img
                                                    src={entry.anime.images?.jpg?.image_url}
                                                    alt={entry.anime.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-1 right-1">
                                                    <span className={clsx(
                                                        "text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm",
                                                        entry.role === 'Main'
                                                            ? "bg-primary text-white"
                                                            : "bg-black/60 text-white backdrop-blur-md"
                                                    )}>
                                                        {entry.role === 'Main' ? 'MAIN' : 'SUPP'}
                                                    </span>
                                                </div>
                                            </div>
                                            <h4 className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-2 mt-2">
                                                {entry.anime.title}
                                            </h4>
                                        </Link>
                                    )}
                                />
                                {animeography.length === 0 && <p className="text-text-secondary mt-2">Nenhum anime encontrado.</p>}
                            </div>

                            {/* Gallery */}
                            <div className="bg-bg-secondary rounded-2xl p-6 border border-border-color shadow-sm hover:border-primary/30 transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-text-primary">Galeria</h3>
                                    </div>
                                    {pictures.length > 4 && (
                                        <button
                                            onClick={() => setIsGalleryOpen(true)}
                                            className="text-xs font-bold text-primary hover:text-white hover:bg-primary px-3 py-1.5 rounded-md transition-all uppercase tracking-wider"
                                        >
                                            Ver Tudo ({pictures.length})
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {pictures.slice(0, 4).map((pic, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative border border-white/5 hover:border-primary/50 transition-all shadow-sm hover:shadow-primary/20"
                                            onClick={() => setSelectedImage(pic.jpg.image_url)}
                                        >
                                            <img
                                                src={pic.jpg.image_url}
                                                alt="Character gallery"
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* --- MODALS --- */}

                {/* GALLERY MODAL */}
                {isGalleryOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-primary animate-in fade-in duration-200">
                        <div className="w-full h-full flex flex-col max-w-7xl mx-auto">
                            <div className="flex justify-between items-center p-4 border-b border-border-color">
                                <h2 className="text-xl font-bold text-text-primary">Galeria Completa</h2>
                                <button
                                    onClick={() => setIsGalleryOpen(false)}
                                    className="p-2 bg-bg-secondary hover:bg-bg-tertiary rounded-full text-text-primary transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {pictures.map((pic, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group relative border border-border-color hover:border-primary transition-all shadow-sm"
                                            onClick={() => setSelectedImage(pic.jpg.image_url)}
                                        >
                                            <img
                                                src={pic.jpg.image_url}
                                                alt="Gallery full"
                                                loading="lazy"
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SINGLE IMAGE MODAL */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={() => setSelectedImage(null)}
                    >
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
                        />
                        <button
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedImage(null);
                            }}
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                )}

                <Footer />
            </main>
        </div>
    );
}

// Helper for Section Headers
function SectionHeader({ title, icon: Icon }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
        </div>
    );
}
