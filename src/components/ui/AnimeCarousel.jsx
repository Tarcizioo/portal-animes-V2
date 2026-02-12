import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimeCard } from '@/components/ui/AnimeCard';

import 'swiper/css';
import 'swiper/css/navigation';

export function AnimeCarousel({ animes, title, icon: Icon }) {
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

  if (!animes || animes.length === 0) return null;

  return (
    <section className="mb-12 relative group/carousel">
      {/* Header com Título */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          {Icon && <Icon className="text-primary w-6 h-6" />}
          {title}
        </h3>
      </div>

      <div className="relative group/arrows">
        {/* Navigation Buttons (Inside, visible on hover) */}
        <button
          ref={(node) => setPrevEl(node)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm text-white hover:bg-primary transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 -ml-6 disabled:opacity-0 disabled:pointer-events-none cursor-pointer shadow-lg border border-white/10"
          aria-label="Previous slide"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          ref={(node) => setNextEl(node)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-xl bg-black/50 backdrop-blur-sm text-white hover:bg-primary transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 -mr-6 disabled:opacity-0 disabled:pointer-events-none cursor-pointer shadow-lg border border-white/10"
          aria-label="Next slide"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <Swiper
          modules={[Navigation]}
          loop={true}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            prevEl,
            nextEl,
          }}
          breakpoints={{
            320: { slidesPerView: 2.3, spaceBetween: 16 },
            640: { slidesPerView: 3.3, spaceBetween: 20 },
            1024: { slidesPerView: 4.3, spaceBetween: 20 },
            1280: { slidesPerView: 5.3, spaceBetween: 20 },
          }}
          className="!pb-4 !px-1"
        >
          {animes.map((anime) => (
            <SwiperSlide key={anime.id}>
              <AnimeCard {...anime} image={anime.images?.webp?.image_url || anime.image} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}