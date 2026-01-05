import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Star, Share2, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { Sidebar } from '../layout/Sidebar';
import { Header } from '../layout/Header';
import { useAnimeInfo } from '../../hooks/useAnimeInfo';

export function AnimeDetails() {
  const { id } = useParams();
  const { anime, loading } = useAnimeInfo(id);
  
  // Estado para controlar a sinopse
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen bg-background-dark items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!anime) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark dark text-white font-sans">
      <Sidebar />
      
      <main className="flex-1 h-full overflow-y-auto relative scrollbar-thin scrollbar-thumb-surface-light scrollbar-track-background-dark">
        <Header />

        {/* --- HERO SECTION --- */}
        {/* pt-32 lg:pt-48 garante que o conteúdo comece na altura certa sem pular */}
        <section className="relative w-full min-h-[75vh] overflow-hidden">
          
          {/* Background Image & Gradient */}
          <div className="absolute inset-0 z-0">
             <div 
               className="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-105"
               style={{ backgroundImage: `url(${anime.image})` }}
             ></div>
             <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-10"></div>
             <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/60 to-transparent z-10"></div>
          </div>

          <div className="relative z-20 max-w-[1440px] mx-auto px-6 lg:px-10 h-full flex items-start pt-32 lg:pt-48 pb-12">
            <div className="grid lg:grid-cols-3 gap-8 w-full">
              
              {/* Esquerda: Título e Informações */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit">
                    <ArrowLeft className="w-5 h-5" /> Voltar
                </Link>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
                      {anime.type || 'TV'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider">
                      {anime.year}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${anime.status === 'Finished Airing' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {anime.status}
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white drop-shadow-xl">
                    {anime.title}
                  </h1>
                  <p className="text-xl text-white/50">{anime.title_jp}</p>
                </div>

                {/* --- SINOPSE COM BOTÃO E ANIMAÇÃO --- */}
                <div className="relative max-w-2xl">
                    <div 
                        className={`text-white/80 text-lg leading-relaxed overflow-hidden transition-all duration-1000 ease-in-out ${
                            showFullSynopsis ? 'max-h-[50rem]' : 'max-h-[8em]'
                        }`}
                    >
                        {anime.synopsis || "Sinopse não disponível."}
                    </div>

                    {/* Gradiente Condicional (só aparece se estiver fechado) */}
                    {!showFullSynopsis && (
                        <div className="absolute bottom-12 left-0 w-full h-24 bg-gradient-to-t from-background-dark/95 to-transparent pointer-events-none"></div>
                    )}

                    <button 
                        onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                        className="mt-4 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg backdrop-blur-sm z-30 relative"
                    >
                        {showFullSynopsis ? (
                            <>Ler menos <ChevronUp className="w-4 h-4" /></>
                        ) : (
                            <>Ler mais <ChevronDown className="w-4 h-4" /></>
                        )}
                    </button>
                </div>

                {/* Trailer Button */}
                {anime.trailer && (
                   <a href={anime.trailer} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold w-fit transition-all shadow-lg shadow-primary/20 mt-2">
                      <Play className="w-5 h-5 fill-current" /> Assistir Trailer
                   </a>
                )}
              </div>

              {/* Direita: Card Interativo */}
              <div className="lg:col-span-1 flex flex-col justify-end mt-10 lg:mt-0">
                <div className="bg-surface-dark/90 backdrop-blur-md rounded-xl p-6 border border-surface-light shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white text-lg">Ações</h3>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-surface-light/50 hover:bg-red-500/20 text-white hover:text-red-400 transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-lg bg-surface-light/50 hover:bg-primary/20 text-white hover:text-primary transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Dropdown Customizado */}
                  <div className="relative mb-4">
                    <select className="appearance-none w-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-white text-sm rounded-xl py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                      <option className="bg-surface-dark text-white">Adicionar à Lista</option>
                      <option className="bg-surface-dark text-white">Assistindo</option>
                      <option className="bg-surface-dark text-white">Completo</option>
                      <option className="bg-surface-dark text-white">Planejo Assistir</option>
                    </select>
                    
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-white/50" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <span className="text-sm text-white/60">Nota da Comunidade</span>
                     <div className="flex items-center justify-between">
                       <div className="flex text-yellow-400 gap-1">
                         <Star className="w-5 h-5 fill-current" />
                         <span className="font-bold text-white text-xl ml-2">{anime.score}</span>
                       </div>
                       <span className="text-xs text-white/40">Rank #{anime.rank}</span>
                     </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- CONTEÚDO PRINCIPAL (Grid) --- */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Esquerda (8 colunas) */}
            <div className="lg:col-span-8 flex flex-col gap-10">
               
               {/* Stats Rápidos */}
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-surface-dark p-4 rounded-xl border border-white/5 text-center">
                    <span className="block text-xl font-bold text-white mb-1">#{anime.rank}</span>
                    <span className="text-xs uppercase tracking-wide text-white/50">Ranking</span>
                  </div>
                  <div className="bg-surface-dark p-4 rounded-xl border border-white/5 text-center">
                    <span className="block text-xl font-bold text-white mb-1">{anime.score}</span>
                    <span className="text-xs uppercase tracking-wide text-white/50">Nota</span>
                  </div>
                  <div className="bg-surface-dark p-4 rounded-xl border border-white/5 text-center">
                    <span className="block text-xl font-bold text-white mb-1">{anime.episodes}</span>
                    <span className="text-xs uppercase tracking-wide text-white/50">Episódios</span>
                  </div>
                  <div className="bg-surface-dark p-4 rounded-xl border border-white/5 text-center">
                    <span className="block text-xl font-bold text-white mb-1 truncate px-1">{anime.rating?.split(' ')[0] || 'N/A'}</span>
                    <span className="text-xs uppercase tracking-wide text-white/50">Idade</span>
                  </div>
               </div>

               {/* Trailer Embutido */}
               {anime.trailer && (
                 <section>
                    <h3 className="text-2xl font-bold text-white mb-6">Trailer Oficial</h3>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-black">
                        <iframe 
                            src={anime.trailer.replace("autoplay=1", "autoplay=0")} 
                            title="Trailer"
                            className="w-full h-full"
                            allowFullScreen
                        ></iframe>
                    </div>
                 </section>
               )}

               {/* Lista de Episódios (Placeholder) */}
               <section>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Guia de Episódios</h3>
                    <div className="text-sm text-white/50">Total: {anime.episodes} eps</div>
                 </div>
                 <div className="flex flex-col gap-2 opacity-70">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center justify-between p-4 rounded-lg bg-surface-dark border border-white/5 hover:border-primary/30 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center size-8 rounded bg-surface-light text-white/70 font-bold text-sm">{num}</div>
                                <div className="flex flex-col">
                                    <h4 className="font-medium text-white group-hover:text-primary transition-colors">Episódio {num}</h4>
                                    <span className="text-xs text-white/40">Disponível</span>
                                </div>
                            </div>
                            <Play className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
                        </div>
                    ))}
                    <div className="p-4 text-center text-sm text-white/40 italic">
                        Carregar lista completa requer autenticação...
                    </div>
                 </div>
               </section>

            </div>

            {/* Sidebar Direita (4 colunas) */}
            <aside className="lg:col-span-4 flex flex-col gap-8">
               
               {/* Caixa de Info */}
               <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <h4 className="text-white font-bold mb-4 border-b border-white/5 pb-2">Detalhes</h4>
                  <div className="flex flex-col gap-3">
                     <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-white/50">Estúdio</span>
                        <span className="text-sm font-medium text-primary">{anime.studios}</span>
                     </div>
                     <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-white/50">Fonte</span>
                        <span className="text-sm font-medium text-white">{anime.source || '?'}</span>
                     </div>
                     <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-white/50">Duração</span>
                        <span className="text-sm font-medium text-white">{anime.duration}</span>
                     </div>
                     <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-white/50">Temporada</span>
                        <span className="text-sm font-medium text-white capitalize">{anime.season ? `${anime.season} ${anime.year}` : anime.year}</span>
                     </div>
                  </div>
               </div>

               {/* Tags de Gênero */}
               <div>
                  <h4 className="text-white font-bold mb-3">Gêneros</h4>
                  <div className="flex flex-wrap gap-2">
                     {anime.genres.map(genre => (
                        <span key={genre} className="px-3 py-1.5 rounded-lg bg-surface-dark hover:bg-primary/20 hover:text-primary border border-white/5 text-xs font-medium text-white/80 transition-colors cursor-pointer">
                           {genre}
                        </span>
                     ))}
                  </div>
               </div>

               {/* Estatísticas Visuais */}
               <div className="bg-surface-dark rounded-xl p-6 border border-white/5">
                  <h4 className="text-white font-bold mb-4">Estatísticas</h4>
                  <div className="space-y-2">
                     <div className="flex items-center gap-3 text-xs">
                        <span className="w-3 text-white">★</span>
                        <div className="flex-1 h-2 bg-background-dark rounded-full overflow-hidden relative group">
                           <div className="h-full bg-primary w-[85%] rounded-full"></div>
                        </div>
                     </div>
                     <div className="mt-4 pt-3 border-t border-white/5 text-xs text-white/50 text-center">
                        Baseado na popularidade global
                     </div>
                  </div>
               </div>

            </aside>

          </div>
        </div>

      </main>
    </div>
  );
}