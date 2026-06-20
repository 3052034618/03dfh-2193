import { useState } from 'react';
import { X, Lock, User } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, password: string) => void;
  error?: string;
  title?: string;
}

export const PasswordModal = ({
  isOpen,
  onClose,
  onSubmit,
  error,
  title = '进入车局',
}: PasswordModalProps) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && password.trim()) {
      onSubmit(name.trim(), password.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-amber/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-gold-amber" />
            </div>
            <h2 className="text-xl font-bold heading-serif text-ivory-100">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ivory-400 hover:text-ivory-100 hover:bg-theater-500/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">
              <User className="w-4 h-4 inline mr-1" />
              你的名字
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入你的名字"
              className="input-field"
              autoFocus
            />
          </div>

          <div>
            <label className="label-text">
              <Lock className="w-4 h-4 inline mr-1" />
              车局口令
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入4位数字口令"
              className="input-field tracking-widest text-center text-lg font-mono"
              maxLength={10}
            />
          </div>

          {error && (
            <p className="text-sm text-accent-500 bg-accent-500/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={!name.trim() || !password.trim()}>
            进入车局
          </button>
        </form>

        <p className="mt-4 text-xs text-ivory-500 text-center">
          本车局为私密邀请制，请确保你已获得车头邀请
        </p>
      </div>
    </div>
  );
};
