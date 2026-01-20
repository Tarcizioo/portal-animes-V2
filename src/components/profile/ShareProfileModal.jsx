import { useState, useRef } from 'react';
import { X, Copy, Download, Share2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';

export function ShareProfileModal({ isOpen, onClose, user, profile, favorites, library = [] }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const cardRef = useRef(null);

    if (!isOpen) return null;

    const publicUrl = `${window.location.origin}/u/${user?.uid}`;
    const banner = profile?.bannerURL || user?.bannerURL || "https://placehold.co/1200x400/1a1a1a/FFF?text=Banner";
    const photo = profile?.photoURL || user?.photoURL || "https://placehold.co/200x200/6366f1/FFF?text=User";
    const name = profile?.displayName || user?.displayName || "Usuário";

    // CALCULAR ESTATÍSTICAS REAIS
    const totalAnimes = library.length;

    // Dias Assistidos: (TotalEpisodios * 24min) / 60min / 24h
    const totalEpisodes = library.reduce((acc, curr) => acc + (curr.currentEp || 0), 0);
    const daysWatched = ((totalEpisodes * 24) / 1440).toFixed(1);

    // Top 3 Favoritos para o Card
    const topFavorites = favorites.slice(0, 3);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadCard = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true, // Importante para imagens externas
                backgroundColor: '#0f0f12', // Cor de fundo do card
                scale: 2, // Retina quality
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.href = image;
            link.download = `profile-${name}.png`;
            link.click();
        } catch (err) {
            console.error("Erro ao gerar card:", err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-bg-secondary w-full max-w-2xl rounded-3xl border border-border-color shadow-2xl relative flex flex-col max-h-[90vh]">

                {/* Header Modal */}
                <div className="flex items-center justify-between p-6 border-b border-border-color">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-primary" /> Compartilhar Perfil
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-bg-tertiary rounded-full text-text-secondary hover:text-text-primary transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-8">

                    {/* Link Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-text-secondary uppercase tracking-wider">Link Público</label>
                        <div className="flex gap-2">
                            <input
                                readOnly
                                value={publicUrl}
                                className="flex-1 bg-bg-tertiary border border-border-color rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary/50 text-sm font-mono"
                            />
                            <button
                                onClick={handleCopyLink}
                                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 min-w-[100px] justify-center"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-border-color"></div>

                    {/* Card Preview Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-text-secondary uppercase tracking-wider">Preview do Card</label>
                            <button
                                onClick={handleDownloadCard}
                                disabled={isGenerating}
                                className="text-sm font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                {isGenerating ? 'Gerando...' : 'Baixar Imagem'}
                            </button>
                        </div>

                        {/* O ELEMENTO QUE SERÁ TRANSFORMADO EM IMAGEM */}
                        <div className="flex justify-center bg-black/20 p-4 rounded-xl overflow-hidden">
                            <div
                                ref={cardRef}
                                className="w-[600px] bg-bg-primary text-text-primary rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl"
                                style={{ backgroundImage: `url('/bg-pattern.svg')` }} // Opcional texture
                            >
                                {/* Banner Card */}
                                <div className="h-32 relative">
                                    <img src={banner} className="w-full h-full object-cover" crossOrigin="anonymous" alt="Banner" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary to-transparent"></div>
                                </div>

                                {/* Content */}
                                <div className="px-8 pb-8 relative -top-10 flex gap-6 items-end">
                                    <div className="w-24 h-24 rounded-full p-1 bg-bg-primary relative z-10 shrink-0">
                                        <img src={photo} className="w-full h-full rounded-full object-cover" crossOrigin="anonymous" alt="Avatar" />
                                    </div>
                                    <div className="pb-2 flex-1 relative top-10">
                                        <h3 className="text-2xl font-black text-white">{name}</h3>
                                        <p className="text-gray-400 text-sm">Biblioteca do Portal Animes</p>
                                    </div>
                                    <div className="pb-3 relative top-10">
                                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                                            <span className="text-xs font-bold text-primary">PORTAL ANIMES</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid Minimal */}
                                <div className="px-8 mt-2 grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-bg-secondary p-3 rounded-lg border border-border-color text-center">
                                        <span className="block text-xl font-bold text-white">{favorites.length}</span>
                                        <span className="text-xs text-text-secondary uppercase">Favoritos</span>
                                    </div>
                                    <div className="bg-bg-secondary p-3 rounded-lg border border-border-color text-center">
                                        <span className="block text-xl font-bold text-white max-w-full truncate px-1">{totalAnimes}</span>
                                        <span className="text-xs text-text-secondary uppercase">Animes</span>
                                    </div>
                                    <div className="bg-bg-secondary p-3 rounded-lg border border-border-color text-center">
                                        <span className="block text-xl font-bold text-white max-w-full truncate px-1">{daysWatched}</span>
                                        <span className="text-xs text-text-secondary uppercase">Dias</span>
                                    </div>
                                </div>

                                {/* Top 3 Favorites */}
                                <div className="px-8 pb-8">
                                    <h4 className="text-sm font-bold text-text-secondary mb-3 uppercase tracking-wider">Top 3 Favoritos</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {topFavorites.length > 0 ? topFavorites.map(fav => (
                                            <div key={fav.id} className="aspect-[3/4] rounded-lg overflow-hidden relative bg-bg-secondary">
                                                <img src={fav.image} className="w-full h-full object-cover" crossOrigin="anonymous" alt={fav.title} />
                                                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                                                    <p className="text-[10px] text-white font-bold line-clamp-1">{fav.title}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="col-span-3 text-center py-4 text-xs text-text-secondary italic bg-bg-secondary rounded-lg">
                                                Sem favoritos definidos
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer do Card - Link visível */}
                                <div className="px-8 pb-4 flex justify-between items-center opacity-50">
                                    <div className="text-[10px] text-text-secondary font-mono tracking-wider">
                                        {publicUrl.replace(/^https?:\/\//, '')}
                                    </div>
                                    <div className="text-[10px] text-text-secondary">
                                        Gerado em {new Date().toLocaleDateString()}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <p className="text-xs text-text-secondary text-center">Este card é gerado automaticamente com base no seu perfil.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
