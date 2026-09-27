import React from 'react';
import { BlogPost } from '../../types/blog';
import { AdSenseSlot } from './AdSenseSlot';
import { COMPANY_INFO } from '../../data/legalData';
import { Instagram, Youtube, Clock, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogSidebarProps {
  recentPosts: BlogPost[];
  currentPostId?: string;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  recentPosts,
  currentPostId
}) => {
  const filteredRecent = recentPosts
    .filter(p => p.id !== currentPostId && p.is_published)
    .slice(0, 5);

  return (
    <aside className="w-full lg:w-[340px] shrink-0 space-y-8">
      {/* 1. Top AdSense Slot */}
      <AdSenseSlot
        slotId="8301271975"
        format="rectangle"
        label="Publicidade // Topo"
      />

      {/* 2. Redes Sociais do Ecossistema */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <TrendingUp className="w-4 h-4 text-[#C8FF00]" />
          <h5 className="font-['Anton'] text-sm uppercase tracking-wider text-white">
            Redes Sociais
          </h5>
        </div>

        <div className="space-y-2.5">
          {/* Instagram */}
          <a
            href={COMPANY_INFO.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border border-pink-500/20 transition-all hover:scale-102"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">
                  Instagram
                </span>
                <span className="text-[10px] text-zinc-400">@kito.expert</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-pink-400 px-2 py-0.5 rounded bg-pink-500/20">
              Seguir
            </span>
          </a>

          {/* Atendimento Direto */}
          <a
            href={COMPANY_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all hover:scale-102"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white group-hover:text-[#25D366] transition-colors">
                  WhatsApp VIP
                </span>
                <span className="text-[10px] text-zinc-400">Contato Comercial</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#25D366] px-2 py-0.5 rounded bg-[#25D366]/20">
              Conversar
            </span>
          </a>
        </div>
      </div>

      {/* 3. Veja Também (Artigos Recentes / Populares) */}
      <div className="bg-[#111113] rounded-2xl border border-white/5 p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h5 className="font-['Anton'] text-sm uppercase tracking-wider text-white">
            Veja Também
          </h5>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Recomendados
          </span>
        </div>

        <div className="space-y-4">
          {filteredRecent.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="group flex items-start gap-3.5 hover:bg-white/5 p-2 rounded-xl transition-all"
            >
              {/* Thumbnail 64x64 */}
              <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-black/50 border border-white/10 relative">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Title & Meta */}
              <div className="flex-1 min-w-0">
                <h6 className="text-xs font-bold text-zinc-200 group-hover:text-[#C8FF00] line-clamp-2 leading-snug transition-colors">
                  {post.title}
                </h6>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500">
                  <span className="text-[#C8FF00] font-semibold">{post.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {post.reading_time_minutes} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. Bottom AdSense Slot (Sticky) */}
      <div className="sticky top-24">
        <AdSenseSlot
          slotId="8301271975"
          format="rectangle"
          label="Publicidade // Fixa"
        />
      </div>
    </aside>
  );
};
