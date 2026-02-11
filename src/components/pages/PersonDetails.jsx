import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePersonInfo } from '@/hooks/usePeople';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Loader } from '@/components/ui/Loader';
import { Heart, Info, Mic2, ChevronDown, Trophy, Images } from 'lucide-react';
import { RoleCard } from '@/components/ui/RoleCard';
import { ImageModal } from '@/components/ui/ImageModal';
import { motion } from 'framer-motion';
import { BackButton } from '@/components/ui/BackButton';

export function PersonDetails() {
  const { id } = useParams();
  const { person, voices, pictures, loading } = usePersonInfo(id);
  const [visibleVoices, setVisibleVoices] = useState(20);
  const [activeTab, setActiveTab] = useState('roles');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  usePageTitle(person?.name || 'Detalhes da Pessoa');

  const handleShowMore = () => {
    setVisibleVoices(prev => prev + 20);
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="flex bg-bg-primary text-text-primary items-center justify-center h-screen">
        <p>Pessoa não encontrada.</p>
      </div>
    );
  }

  // Ordenar por popularidade do anime ou personagem seria ideal, mas a API retorna um mix.
  // Vamos assumir que a API já retorna em alguma ordem relevante ou apenas listar.
  const displayedVoices = voices.slice(0, visibleVoices);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="mb-6">
            <BackButton />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Sidebar */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 self-start space-y-6 h-fit">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/5 bg-bg-secondary aspect-[2/3]">
              <img 
                src={person.images?.jpg?.image_url} 
                alt={person.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-xs font-bold text-white border border-white/10 shadow-lg flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  {person.favorites?.toLocaleString() || 0}
              </div>
            </div>

            <div className="bg-bg-secondary/50 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-4">
               <h3 className="font-bold border-b border-white/5 pb-2 flex items-center gap-2 text-sm text-text-secondary uppercase tracking-wider">
                  <Info className="w-4 h-4" /> Informações
               </h3>
               
               <div className="space-y-3 text-sm">
                  {person.given_name && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Nome:</span>
                      <span className="font-medium text-right">{person.given_name} {person.family_name}</span>
                    </div>
                  )}
                  {person.birthday && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Nascimento:</span>
                      <span className="font-medium text-right">{new Date(person.birthday).toLocaleDateString()}</span>
                    </div>
                  )}
                   {person.website_url && (
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Website:</span>
                      <a href={person.website_url} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline truncate max-w-[150px]">Link</a>
                    </div>
                  )}
               </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-10">
            
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight leading-none">
                {person.name}
              </h1>
              {person.given_name && (
                 <h2 className="text-xl text-primary font-bold opacity-80">{person.family_name} {person.given_name}</h2>
              )}
            </div>

            {/* About */}
             <div className="space-y-4">
                <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2 border-b border-white/10 pb-2">
                    <Info className="w-5 h-5 text-primary" /> Biografia
                </h3>
                <div className="prose prose-invert max-w-none">
                    <p className="text-text-secondary leading-relaxed whitespace-pre-line text-base">
                        {person.about 
                            ? (isExpanded ? person.about.replace(/\\n/g, '\n') : person.about.replace(/\\n/g, '\n').slice(0, 400) + (person.about.length > 400 ? '...' : ''))
                            : "Biografia indisponível."
                        }
                    </p>
                    {person.about && person.about.length > 400 && (
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-primary font-bold hover:text-white transition-colors text-sm mt-2"
                        >
                            {isExpanded ? 'Ler Menos' : 'Ler Mais'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Tabs */}
            <div className="space-y-6">
               <div className="flex items-center gap-6 border-b border-white/10 pb-1">
                  <button 
                    onClick={() => setActiveTab('roles')}
                    className={`flex items-center gap-2 pb-3 text-lg font-bold transition-all border-b-2 ${activeTab === 'roles' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
                  >
                    <Mic2 className="w-5 h-5" /> Dublagens & Papéis <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full ml-1">{voices.length}</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('photos')}
                    className={`flex items-center gap-2 pb-3 text-lg font-bold transition-all border-b-2 ${activeTab === 'photos' ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-text-primary'}`}
                  >
                    <Images className="w-5 h-5" /> Fotos <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full ml-1">{pictures.length}</span>
                  </button>
               </div>
                
                {activeTab === 'roles' ? (
                  <>
                    {voices.length > 0 ? (
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {displayedVoices.map((role, idx) => (
                          <motion.div
                            key={`${role.anime.mal_id}-${role.character.mal_id}-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3 }}
                          >
                             <RoleCard role={role} />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-secondary italic">Nenhum registro de dublagem encontrado.</p>
                    )}

                    {voices.length > visibleVoices && (
                      <div className="flex justify-center pt-4">
                        <button 
                          onClick={handleShowMore}
                          className="px-6 py-3 bg-bg-secondary border border-primary/30 text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                        >
                          Carregar Mais <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {pictures.map((pic, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/5 hover:border-primary/50 transition-all group relative cursor-pointer"
                        onClick={() => setSelectedImage(pic.jpg.image_url)}
                      >
                         <img 
                            src={pic.jpg.image_url} 
                            alt={`Foto ${idx + 1}`} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                         />
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Info className="w-8 h-8 text-white" />
                         </div>
                      </motion.div>
                    ))}
                    {pictures.length === 0 && <p className="text-text-secondary col-span-full italic">Nenhuma foto extra encontrada.</p>}
                  </div>
                )}
            </div>

          </div>

        </div>
      </div>
      
      <ImageModal 
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage}
        altText="Foto em tamanho grande"
      />
    </div>
  );
}
