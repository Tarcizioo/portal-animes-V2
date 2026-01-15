import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useCharacterInfo } from '@/hooks/useCharacterInfo';
import { Heart, Mic2, Tv, Film, ChevronRight, User, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { Loader } from '@/components/ui/Loader';

export function CharacterDetails() {
    const { id } = useParams();
    const { character, animeography, voiceActors, pictures, loading } = useCharacterInfo(id);
    const [activeTab, setActiveTab] = useState('about');
    const [selectedImage, setSelectedImage] = useState(null);

    // Initial enter animation state
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

    // Filter mainly japanese voice actors or fallback to first few
    const mainVoiceActors = voiceActors.filter(va => va.language === "Japanese").slice(0, 6);
    // If no japanese, just take top 6
    const displayVoiceActors = mainVoiceActors.length > 0 ? mainVoiceActors : voiceActors.slice(0, 6);

    return (
        <div className="flex h-screen overflow-hidden bg-bg-primary text-text-primary font-sans selection:bg-primary selection:text-white">
            <Sidebar />
            <ScrollToTop /> {/* Ensure scroll reset on mount */}

            <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-bg-secondary scrollbar-track-bg-primary">
                <Header />

                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">

                    {/* --- HERO HEADER --- */}
                    <div className={`relative flex flex-col md:flex-row gap-8 mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                        {/* Avatar Image */}
                        <div className="shrink-0 mx-auto md:mx-0">
                            <div className="relative w-64 h-80 lg:w-72 lg:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-bg-secondary group">
                                <img
                                    src={character.image}
                                    alt={character.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                                    <span className="text-white font-bold text-sm bg-primary/80 px-3 py-1 rounded-full backdrop-blur-md">
                                        #{character.favorites?.toLocaleString()} Favoritos
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info Header */}
                        <div className="flex-1 flex flex-col justify-end pb-4 text-center md:text-left">
                            <div className="mb-4">
                                <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight mb-2">
                                    {character.name}
                                </h1>
                                {character.name_kanji && (
                                    <h2 className="text-2xl text-primary font-bold opacity-80">{character.name_kanji}</h2>
                                )}
                            </div>

                            {character.nicknames?.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                                    {character.nicknames.map(nick => (
                                        <span key={nick} className="px-3 py-1 rounded-lg bg-bg-secondary border border-border-color text-xs font-medium text-text-secondary">
                                            {nick}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-center md:justify-start gap-4">
                                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/25 active:scale-95">
                                    <Heart className="w-5 h-5 fill-current" /> Favoritar
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-bg-secondary text-text-primary font-bold hover:bg-bg-tertiary transition-all border border-border-color">
                                    <ImageIcon className="w-5 h-5" /> Galeria
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- CONTENT GRID --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* LEFT COLUMN (8) */}
                        <div className="lg:col-span-8 space-y-12">

                            {/* ABOUT SECTION */}
                            <section>
                                <SectionTitle icon={User} title="Sobre" />
                                <div className="bg-bg-secondary rounded-2xl p-6 md:p-8 border border-border-color shadow-sm mt-6">
                                    <p className="text-text-primary/80 leading-relaxed whitespace-pre-line text-lg">
                                        {character.about ? character.about.replace(/\\n/g, '\n') : "Sem descrição disponível."}
                                    </p>
                                </div>
                            </section>

                            {/* ANIMEOGRAPHY */}
                            <section>
                                <SectionTitle icon={Film} title="Filmografia" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
                                    {animeography.map(entry => (
                                        <Link
                                            to={`/anime/${entry.anime.mal_id}`}
                                            key={entry.anime.mal_id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-bg-secondary border border-border-color hover:border-primary/50 hover:bg-bg-tertiary transition-all group overflow-hidden"
                                        >
                                            <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-bg-tertiary relative">
                                                <img
                                                    src={entry.anime.images?.jpg?.image_url}
                                                    alt={entry.anime.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                                                    {entry.anime.title}
                                                </h4>
                                                <span className={clsx(
                                                    "text-xs font-semibold px-2 py-0.5 rounded-md inline-block mt-1",
                                                    entry.role === 'Main'
                                                        ? "bg-primary/10 text-primary border border-primary/20"
                                                        : "bg-bg-tertiary text-text-secondary border border-border-color"
                                                )}>
                                                    {entry.role}
                                                </span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors -translate-x-full group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                                        </Link>
                                    ))}
                                </div>
                                {animeography.length === 0 && <p className="text-text-secondary mt-4">Nenhum anime encontrado.</p>}
                            </section>

                        </div>

                        {/* RIGHT COLUMN (4) */}
                        <aside className="lg:col-span-4 space-y-10">

                            {/* VOICE ACTORS */}
                            <section>
                                <SectionTitle icon={Mic2} title="Dubladores" />
                                <div className="flex flex-col gap-3 mt-6">
                                    {displayVoiceActors.map((va, idx) => (
                                        <div key={`${va.person.mal_id}-${idx}`} className="flex items-center justify-between p-3 rounded-xl bg-bg-secondary border border-border-color hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-12 h-12 rounded-full bg-cover bg-center border border-border-color"
                                                    style={{ backgroundImage: `url('${va.person.images?.jpg?.image_url}')` }}
                                                />
                                                <div>
                                                    <h5 className="text-sm font-bold text-text-primary">{va.person.name}</h5>
                                                    <span className="text-xs text-text-secondary">{va.language}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {voiceActors.length === 0 && <p className="text-text-secondary text-sm">Nenhum dublador registrado.</p>}
                                </div>
                            </section>

                            {/* PICTURES GRID */}
                            <section>
                                <SectionTitle icon={ImageIcon} title="Galeria" />
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 mt-6">
                                    {pictures.slice(0, 6).map((pic, idx) => (
                                        <div
                                            key={idx}
                                            className="aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group relative border border-border-color"
                                            onClick={() => setSelectedImage(pic.jpg.image_url)}
                                        >
                                            <img
                                                src={pic.jpg.image_url}
                                                alt="Character gallery"
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <ImageIcon className="text-white w-6 h-6" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                        </aside>

                    </div>
                </div>

                {/* IMAGE MODAL */}
                {selectedImage && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                        onClick={() => setSelectedImage(null)}
                    >
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-full rounded-lg shadow-2xl scale-100 object-contain"
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

// --- Helper Components ---
// eslint-disable-next-line no-unused-vars
function SectionTitle({ icon: Icon, title }) {
    return (
        <h3 className="text-xl md:text-2xl font-black text-text-primary flex items-center gap-3">
            <span className="p-2 mr-1 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg text-primary">
                <Icon className="w-6 h-6" />
            </span>
            {title}
        </h3>
    );
}
