import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Home } from './components/pages/Home';
import { AnimeDetails } from './components/pages/AnimeDetails';
import { Catalog } from './components/pages/Catalog';

function App() {
  return (
<BrowserRouter basename="/portal-animes-V2">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/anime/:id" element={<AnimeDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;