import React from 'react';
import { ChevronRight } from 'lucide-react';
import { GameItem } from '../data/gamesData';
import { GameCard } from './GameCard';

interface GameSectionProps {
  title: string;
  moreText?: string;
  onMoreClick?: () => void;
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, gameId: string) => void;
}

export const GameSection: React.FC<GameSectionProps> = ({
  title,
  moreText,
  onMoreClick,
  games,
  onSelectGame,
  favorites,
  onToggleFavorite
}) => {
  if (games.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Section Header (1001jogos layout with title on left, "Mais jogos >" on right) */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-['Fredoka'] text-xl font-bold text-[#1f572a] flex items-center gap-2">
          {title}
        </h2>
        {moreText && (
          <button
            onClick={onMoreClick}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            <span>{moreText}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Grid of Cards (Dense, responsive: 2 cols on mobile, 4 on sm, 6 on md, 8 on lg, 9-10 on xl) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onSelect={onSelectGame}
            isFavorite={favorites.includes(game.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
};
