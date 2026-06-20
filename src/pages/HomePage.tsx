import { useNavigate } from 'react-router-dom';
import { Plus, Dices, Sparkles, Users, Shield } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { GameCard } from '@/components/GameCard';
import { useEffect } from 'react';

export const HomePage = () => {
  const navigate = useNavigate();
  const { games, init } = useGameStore();

  useEffect(() => {
    init();
  }, [init]);

  const recruitingGames = games.filter((g) => g.status === 'recruiting');
  const confirmedGames = games.filter((g) => g.status === 'confirmed');
  const finishedGames = games.filter((g) => g.status === 'finished');

  return (
    <div className="min-h-screen">
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-gold-amber/5 via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-amber/10 border border-gold-amber/20 mb-6">
            <Sparkles className="w-4 h-4 text-gold-amber" />
            <span className="text-sm text-gold-amber">熟人车局 · 私密组局</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold heading-serif mb-4">
            <span className="gold-text">今晚开哪本？</span>
          </h1>
          <p className="text-lg text-ivory-400 mb-8 max-w-2xl mx-auto">
            告别群聊刷屏，轻松组织剧本杀小圈子。私密车局、熟人邀请、实时座位确认，一切尽在掌握。
          </p>
          
          <button
            onClick={() => navigate('/create')}
            className="btn-primary inline-flex items-center gap-2 text-lg"
          >
            <Plus className="w-5 h-5" />
            创建新车局
          </button>
        </div>

        <div className="max-w-3xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-shield/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-gold-amber" />
            </div>
            <h3 className="font-semibold text-ivory-100 mb-1">私密保护</h3>
            <p className="text-sm text-ivory-400">带口令的车局页，剧本信息不扩散</p>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-shield/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-gold-amber" />
            </div>
            <h3 className="font-semibold text-ivory-100 mb-1">熟人邀请</h3>
            <p className="text-sm text-ivory-400">只邀熟悉的人，组局更靠谱</p>
          </div>
          <div className="glass-card p-5 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-shield/10 flex items-center justify-center">
              <Dices className="w-6 h-6 text-gold-amber" />
            </div>
            <h3 className="font-semibold text-ivory-100 mb-1">座位管理</h3>
            <p className="text-sm text-ivory-400">拖拽排序，按熟悉程度安排</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-16">
        {recruitingGames.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold heading-serif text-ivory-100">
                招募中 <span className="text-gold-amber">({recruitingGames.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recruitingGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {confirmedGames.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold heading-serif text-ivory-100">
                已成局 <span className="text-emerald-400">({confirmedGames.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {confirmedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {finishedGames.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold heading-serif text-ivory-400">
                已结束 <span className="text-ivory-500">({finishedGames.length})</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {finishedGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}

        {games.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-theater-600/50 flex items-center justify-center">
              <Dices className="w-10 h-10 text-ivory-500" />
            </div>
            <h3 className="text-xl font-semibold text-ivory-200 mb-2">还没有车局</h3>
            <p className="text-ivory-400 mb-6">点击上方按钮，创建你的第一个车局吧</p>
            <button
              onClick={() => navigate('/create')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              创建车局
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
