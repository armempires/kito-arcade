import React from 'react';
import { ProjectItem } from '../data/gamesData';
import { DynamicAdBanner } from './ads/DynamicAdBanner';
import { INITIAL_BLOG_POSTS } from '../data/initialBlogPosts';
import { Link } from 'react-router-dom';

interface GameSidebarProps {
  currentGameId: string;
  onSelectProject?: (p: ProjectItem) => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = () => {
  // 5 Artigos em destaque recomendados
  const recommendedPosts = INITIAL_BLOG_POSTS.slice(0, 5);

  return (
    <aside className="w-full space-y-6 flex flex-col">
      {/* 1. VEJA TAMBÉM - RECOMENDADOS */}
      <div className="bg-[#111113] rounded-2xl border border-white/10 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h5 className="font-['Anton'] text-sm uppercase tracking-wider text-white">
            VEJA TAMBÉM
          </h5>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            RECOMENDADOS
          </span>
        </div>

        <div className="space-y-3.5">
          {recommendedPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex items-start gap-3.5 hover:bg-white/5 p-2 rounded-xl transition-all"
            >
              {/* Thumbnail 56x56 */}
              <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-black/60 border border-white/10 relative">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Detalhes */}
              <div className="flex-1 min-w-0">
                <h6 className="text-xs font-bold text-zinc-200 group-hover:text-[#C8FF00] line-clamp-2 leading-snug transition-colors">
                  {post.title}
                </h6>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500">
                  <span className="text-[#C8FF00] font-semibold">{post.category}</span>
                  <span>•</span>
                  <span>⏱ {post.reading_time_minutes} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. ANÚNCIO DINÂMICO PARCERIA & DESTAQUE (Nexus e outras campanhas ativas) */}
      <div className="sticky top-24">
        <DynamicAdBanner format="sidebar" />
      </div>
    </aside>
  );
};

