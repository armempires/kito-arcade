import React from 'react';
import { 
  LayoutGrid, 
  Gamepad2, 
  Layers, 
  Smartphone, 
  Globe, 
  Clock, 
  Heart, 
  Flame,
  FolderGit2,
  Wrench,
  TrendingUp,
  Bot
} from 'lucide-react';
import { CATEGORIES } from '../data/gamesData';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  isOpen: boolean;
  activeFilter: 'all' | 'recent' | 'favorites' | 'popular';
  setActiveFilter: (filter: 'all' | 'recent' | 'favorites' | 'popular') => void;
  favoritesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  isOpen,
  activeFilter,
  setActiveFilter,
  favoritesCount
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gamepad2': return <Gamepad2 className="w-4 h-4 text-[#C8FF00]" />;
      case 'Layers': return <Layers className="w-4 h-4 text-[#C8FF00]" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4 text-[#C8FF00]" />;
      case 'Globe': return <Globe className="w-4 h-4 text-[#C8FF00]" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-[#C8FF00]" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4 text-[#C8FF00]" />;
      case 'Bot': return <Bot className="w-4 h-4 text-[#C8FF00]" />;
      default: return <LayoutGrid className="w-4 h-4 text-[#C8FF00]" />;
    }
  };

  return (
    <aside 
      className={`
        fixed md:sticky top-[65px] left-0 z-30 h-[calc(100vh-65px)] w-64 bg-[#0D0D0D] border-r border-white/10 overflow-y-auto p-4 transition-transform duration-300 shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Top Quick Filters */}
      <div className="space-y-1.5 mb-5">
        <button
          onClick={() => {
            setActiveFilter('all');
            onSelectCategory('all');
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeFilter === 'all' && selectedCategory === 'all'
              ? 'bg-[#C8FF00] text-black shadow-[0_0_20px_rgba(200,255,0,0.3)]'
              : 'text-[#A0A0A0] hover:text-white hover:bg-[#181818]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-4 h-4" />
            <span>Todos os Projetos</span>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
            activeFilter === 'all' && selectedCategory === 'all' ? 'bg-black text-[#C8FF00]' : 'bg-[#202020] text-[#A0A0A0]'
          }`}>
            28
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('popular')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeFilter === 'popular'
              ? 'bg-[#C8FF00] text-black shadow-[0_0_20px_rgba(200,255,0,0.3)]'
              : 'text-[#A0A0A0] hover:text-white hover:bg-[#181818]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-[#C8FF00]" />
            <span>Em Destaque</span>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('favorites')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeFilter === 'favorites'
              ? 'bg-[#C8FF00] text-black shadow-[0_0_20px_rgba(200,255,0,0.3)]'
              : 'text-[#A0A0A0] hover:text-white hover:bg-[#181818]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Favoritos</span>
          </div>
          {favoritesCount > 0 && (
            <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-md">
              {favoritesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter('recent')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
            activeFilter === 'recent'
              ? 'bg-[#C8FF00] text-black shadow-[0_0_20px_rgba(200,255,0,0.3)]'
              : 'text-[#A0A0A0] hover:text-white hover:bg-[#181818]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-[#C8FF00]" />
            <span>Recentes</span>
          </div>
        </button>
      </div>

      <hr className="border-white/10 my-4" />

      {/* 1. Portfolio Categories Section */}
      <div className="px-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C8FF00]">
          PORTFÓLIO & SISTEMAS (19)
        </span>
      </div>

      <div className="space-y-1.5 mb-5">
        {CATEGORIES.filter(c => c.section === 'portfolio').map((cat) => {
          const isActive = selectedCategory === cat.slug && activeFilter === 'all';
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveFilter('all');
                onSelectCategory(cat.slug);
              }}
              className={`w-full flex items-center justify-between text-left px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all gap-2 ${
                isActive
                  ? 'bg-[#1c1c1c] text-white border border-[#C8FF00]/50 shadow-[0_0_15px_rgba(200,255,0,0.15)]'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                <div className="shrink-0">{getIcon(cat.iconName)}</div>
                <span className="text-left leading-tight break-words">{cat.name}</span>
              </div>
              <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-md ${
                isActive ? 'bg-[#C8FF00] text-black' : 'bg-[#181818] text-[#888888]'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Services & Growth Categories Section */}
      <div className="px-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ADFF00]">
          SERVIÇOS & CRESCIMENTO (9)
        </span>
      </div>

      <div className="space-y-1.5">
        {CATEGORIES.filter(c => c.section === 'services').map((cat) => {
          const isActive = selectedCategory === cat.slug && activeFilter === 'all';
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveFilter('all');
                onSelectCategory(cat.slug);
              }}
              className={`w-full flex items-center justify-between text-left px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all gap-2 ${
                isActive
                  ? 'bg-[#1c1c1c] text-white border border-[#ADFF00]/50 shadow-[0_0_15px_rgba(173,255,0,0.15)]'
                  : 'text-[#A0A0A0] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
                <div className="shrink-0">{getIcon(cat.iconName)}</div>
                <span className="text-left leading-tight break-words">{cat.name}</span>
              </div>
              <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-md ${
                isActive ? 'bg-[#ADFF00] text-black' : 'bg-[#181818] text-[#888888]'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Info Card */}
      <div className="mt-8 p-4 rounded-2xl bg-[#141414] border border-white/10 shadow-inner">
        <div className="flex items-center gap-2 text-[#C8FF00] text-xs font-black uppercase tracking-wider mb-1.5">
          <FolderGit2 className="w-4 h-4" />
          <span>Diretórios Locais</span>
        </div>
        <p className="text-[11px] text-[#A0A0A0] leading-relaxed">
          100% dos projetos e pacotes conectados diretamente ao seu ambiente de desenvolvimento.
        </p>
      </div>

    </aside>
  );
};
