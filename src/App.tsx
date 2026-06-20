import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HomePage } from '@/pages/HomePage';
import { CreateGamePage } from '@/pages/CreateGamePage';
import { GameDetailPage } from '@/pages/GameDetailPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateGamePage />} />
            <Route path="/game/:id" element={<GameDetailPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
