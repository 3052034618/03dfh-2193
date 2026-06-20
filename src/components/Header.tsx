import { Link, useNavigate } from 'react-router-dom';
import { Dices, Home, Plus } from 'lucide-react';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-theater-900/80 border-b border-theater-600/30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-amber to-gold-500 flex items-center justify-center shadow-gold-glow">
            <Dices className="w-6 h-6 text-theater-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold heading-serif gold-text">剧本杀组局台</h1>
            <p className="text-xs text-ivory-400">熟人车局 · 私密组局</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-ivory-300 hover:bg-theater-600/50 hover:text-ivory-100 transition-all"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm">首页</span>
          </Link>
          <button
            onClick={() => navigate('/create')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-gold-amber/20 to-gold-500/20 text-gold-amber border border-gold-amber/30 hover:from-gold-amber/30 hover:to-gold-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">创建车局</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
