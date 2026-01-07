import { useState } from 'react'; // Importamos o useState para gerenciar os botões
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimeCard } from '@/components/ui/AnimeCard';

import 'swiper/css';
import 'swiper/css/navigation';

// Não precisamos mais receber o 'id' aqui, a lógica interna resolve
export function AnimeCarousel({ animes, title, icon: Icon }) {
  // Criamos um "estado" para guardar os botões. 
  // Assim o React avisa o Swiper quando os botões estiverem prontos.
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

  if (!animes || animes.length === 0) return null;

  return (
    <section className="mb-8 relative group/carousel">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {Icon && <Icon className="text-primary" />}
          {title}
        </h3>

        <div className="flex gap-2">
          {/* O atributo 'ref' salva o botão dentro da nossa variável de estado */}
          <button
            ref={(node) => setPrevEl(node)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-surface-dark hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            ref={(node) => setNextEl(node)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-surface-dark hover:bg-primary hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        loop={true}
        spaceBetween={20}
        slidesPerView={2}
        navigation={{
          prevEl, // Passamos o botão direto (não o nome da classe)
          nextEl, // Passamos o botão direto
        }}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="!pb-4"
      >
        {animes.map((anime) => (
          <SwiperSlide key={anime.id}>
            <AnimeCard {...anime} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}