import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

// Lazy loading pages
const Home = lazy(() => import('@/components/pages/Home').then(module => ({ default: module.Home })));
const AnimeDetails = lazy(() => import('@/components/pages/AnimeDetails').then(module => ({ default: module.AnimeDetails })));
const Catalog = lazy(() => import('@/components/pages/Catalog').then(module => ({ default: module.Catalog })));
const Profile = lazy(() => import('@/components/pages/Profile').then(module => ({ default: module.Profile })));
const Characters = lazy(() => import('@/components/pages/Characters').then(module => ({ default: module.Characters })));
const CharacterDetails = lazy(() => import('@/components/pages/CharacterDetails').then(module => ({ default: module.CharacterDetails }))); // [NEW] Lazy load CharacterDetails
const NotFound = lazy(() => import('@/components/pages/NotFound').then(module => ({ default: module.NotFound })));

// Loading Component
import { Loader } from '@/components/ui/Loader';

// Loading Component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-bg-primary">
    <Loader />
  </div>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/characters" element={<Characters />} />
          <Route path="/character/:id" element={<CharacterDetails />} /> {/* [NEW] Add route */}
          <Route path="/anime/:id" element={<AnimeDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;