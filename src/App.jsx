import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ScrollToTop } from '@/components/ui/ScrollToTop';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from '@/components/layout/PageTransition';

// Lazy loading pages
const Home = lazy(() => import('@/components/pages/Home').then(module => ({ default: module.Home })));
const AnimeDetails = lazy(() => import('@/components/pages/AnimeDetails').then(module => ({ default: module.AnimeDetails })));
const Catalog = lazy(() => import('@/components/pages/Catalog').then(module => ({ default: module.Catalog })));
const Profile = lazy(() => import('@/components/pages/Profile').then(module => ({ default: module.Profile })));
const Characters = lazy(() => import('@/components/pages/Characters').then(module => ({ default: module.Characters })));
const CharacterDetails = lazy(() => import('@/components/pages/CharacterDetails').then(module => ({ default: module.CharacterDetails })));
const PrivacyPolicy = lazy(() => import('@/components/pages/PrivacyPolicy').then(module => ({ default: module.PrivacyPolicy })));
const TermsOfUse = lazy(() => import('@/components/pages/TermsOfUse').then(module => ({ default: module.TermsOfUse })));
const NotFound = lazy(() => import('@/components/pages/NotFound').then(module => ({ default: module.NotFound })));
const Library = lazy(() => import('@/components/pages/Library').then(module => ({ default: module.Library })));
const PublicProfile = lazy(() => import('@/components/pages/PublicProfile').then(module => ({ default: module.PublicProfile })));

// Loading Component
import { Loader } from '@/components/ui/Loader';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen bg-bg-primary">
    <Loader />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/catalog" element={<PageTransition><Catalog /></PageTransition>} />
        <Route path="/characters" element={<PageTransition><Characters /></PageTransition>} />
        <Route path="/character/:id" element={<PageTransition><CharacterDetails /></PageTransition>} />
        <Route path="/anime/:id" element={<PageTransition><AnimeDetails /></PageTransition>} />
        <Route path="/library" element={<PageTransition><Library /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/u/:uid" element={<PageTransition><PublicProfile /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><TermsOfUse /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;