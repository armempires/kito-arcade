import React from 'react';
import { Play, Star, Flame, Sparkles } from 'lucide-react';
import { GameItem } from '../data/gamesData';

interface GameCardProps {
  game: GameItem;
  onSelect: (game: GameItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onSelect,
  isFavorite,
  onToggleFavorite
}) => {
  return (
    <div 
      onClick={() => onSelect(game)}
      className="group relative flex flex-col cursor-pointer transition-all duration-200 select-none"
    >
      {/* Thumbnail Container (1001jogos squircle rounded card) */}
      <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-sm border border-emerald-900/10 bg-slate-200 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
        
        {/* Cover Image */}
        <img
          src={game.image}
          alt={game.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Gradient shadow for text & badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Top-left Badges (Identical to 1001jogos "NOVO" badge) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {game.isNew && (
            <span className="bg-[#e53935] text-white text-[10px] font-black px-2 py-0.5 rounded shadow uppercase tracking-wider animate-pulse">
              NOVO
            </span>
          )}
          {game.badge && !game.isNew && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow uppercase tracking-wider">
              {game.badge}
            </span>
          )}
          {game.id === 'arm-empires' && (
            <span className="bg-cyan-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow uppercase tracking-wider">
              3D FPS
            </span>
          )}
        </div>

        {/* Top-right Favorite Heart */}
        <button
          onClick={(e) => onToggleFavorite(e, game.id)}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'text-white'}`} />
        </button>

        {/* Hover Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="w-12 h-12 rounded-full bg-[#30773d] text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Bottom tags inside card */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/90 font-bold z-10">
          <span className="truncate max-w-[70%] drop-shadow">
            {game.category}
          </span>
          <span className="text-amber-300 flex items-center gap-0.5 drop-shadow">
            ★ {game.rating.toFixed(1)}
          </span>
        </div>

      </div>

      {/* Title Below Card (1001jogos pattern) */}
      <div className="mt-1.5 px-0.5 flex flex-col">
        <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {game.title}
        </h4>
        <span className="text-[10px] text-slate-500 font-semibold">
          {game.plays} jogadores
        </span>
      </div>

    </div>
  );
};
