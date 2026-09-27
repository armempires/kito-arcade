import React from 'react';
import { Search, Dices, Menu, Gamepad2, ShieldCheck, Users } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRandomGame: () => void;
  toggleSidebar: () => void;
  totalProjects: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onRandomGame,
  toggleSidebar,
  totalProjects
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md text-white border-b border-white/10 shadow-2xl">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Logo Kito Arcade */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-xl bg-[#181818] border border-white/10 hover:border-[#C8FF00]/40 transition-colors"
            title="Menu de Categorias"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <a href="#" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-['Anton'] text-2xl tracking-wider text-white uppercase group-hover:text-white transition-colors">
                  KITO<span className="text-[#C8FF00]">ARCADE</span>
                </span>
                <span className="bg-[#C8FF00] text-black text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                  ECOSSISTEMA
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#A0A0A0] tracking-wider uppercase hidden sm:inline">
                Site, App, Marketing e Automação
              </span>
            </div>
          </a>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Pesquisar entre as ${totalProjects} aplicações do ecossistema...`}
              className="w-full h-11 pl-4 pr-12 rounded-xl bg-[#161616] text-white text-xs sm:text-sm font-medium placeholder-[#666666] border border-white/10 focus:outline-none focus:border-[#C8FF00] focus:ring-1 focus:ring-[#C8FF00] transition-all shadow-inner"
            />
            <button 
              className="absolute right-1.5 w-8 h-8 rounded-lg bg-[#222222] hover:bg-[#C8FF00] hover:text-black text-[#A0A0A0] flex items-center justify-center transition-all"
              title="Pesquisar"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRandomGame}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#161616] hover:bg-[#202020] border border-[#C8FF00]/40 text-[#C8FF00] font-bold text-xs uppercase tracking-wider shadow-sm hover:border-[#C8FF00] hover:shadow-[0_0_20px_rgba(200,255,0,0.2)] active:scale-95 transition-all"
            title="Sortear e jogar um jogo arcade aleatório"
          >
            <Dices className="w-4 h-4 text-[#C8FF00]" />
            <span className="hidden sm:inline">Surpreenda-me</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161616] text-[#A0A0A0] text-xs font-bold border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
            <span><strong className="text-white">{totalProjects}</strong> Projetos Reais</span>
          </div>
        </div>

      </div>
    </header>
  );
};
