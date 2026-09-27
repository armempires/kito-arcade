import React from 'react';
import { Play, Star, FolderGit2, Info, Swords, ExternalLink } from 'lucide-react';
import { ProjectItem } from '../data/gamesData';

interface ProjectCardProps {
  project: ProjectItem;
  onSelect: (project: ProjectItem) => void;
  onInfo?: (project: ProjectItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onInfo,
  isFavorite,
  onToggleFavorite
}) => {
  const isExternal = project.categorySlug === 'saas' || project.categorySlug === 'sites';

  return (
    <div 
      onClick={() => onSelect(project)}
      className="group relative flex flex-col bg-[#141414] hover:bg-[#181818] rounded-2xl border border-white/8 hover:border-[#C8FF00]/60 p-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(200,255,0,0.15)] cursor-pointer select-none"
    >
      {/* Thumbnail Aspect Box */}
      <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-white/5">
        
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Dark contrast gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

        {/* Top-left Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-[#C8FF00] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow">
            {project.badge}
          </span>
          {isExternal && (
            <span className="bg-black/80 text-[#C8FF00] border border-[#C8FF00]/40 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm flex items-center gap-1 w-fit shadow">
              <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
              <span>Nova Aba</span>
            </span>
          )}
        </div>

        {/* Top-right Actions (Mesas Online + Star + Info + Direct External) */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          {['neon-tetris', 'damas-classicas', 'jogo-xadrez'].includes(project.id) && (
            <a
              href={`#multiplayer?jogo=${project.id === 'neon-tetris' ? 'tetris' : project.id === 'damas-classicas' ? 'damas' : 'xadrez'}`}
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 rounded-lg bg-black/80 hover:bg-[#C8FF00] hover:text-black text-[#C8FF00] border border-[#C8FF00]/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all shadow-md group/btn"
              title="Acessar Mesas Online deste jogo"
            >
              <Swords className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Mesas</span>
            </a>
          )}
          {isExternal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/hosted/${project.id}/index.html`, '_blank', 'noopener,noreferrer');
              }}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-[#C8FF00] hover:text-black text-white backdrop-blur-sm transition-all"
              title="Abrir diretamente em Nova Aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          {onInfo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (project.categorySlug === 'servicos' || project.categorySlug === 'marketing') {
                  onSelect(project);
                } else {
                  onInfo(project);
                }
              }}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition-all hover:text-[#C8FF00]"
              title={project.categorySlug === 'servicos' || project.categorySlug === 'marketing' ? "Apresentação & Agendamento" : "Ficha Técnica"}
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => onToggleFavorite(e, project.id)}
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition-all"
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-[#888888]'}`} />
          </button>
        </div>

        {/* Center Hover Action Circle */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="w-11 h-11 rounded-full bg-[#C8FF00] text-black flex items-center justify-center shadow-[0_0_20px_rgba(200,255,0,0.6)] transform scale-75 group-hover:scale-100 transition-transform">
            {(project.categorySlug === 'servicos' || project.categorySlug === 'marketing') ? (
              <Info className="w-4 h-4 text-black" />
            ) : (
              <Play className="w-4 h-4 ml-0.5 fill-black" />
            )}
          </div>
        </div>

        {/* Bottom Status inside Image */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-[#E0E0E0] z-10">
          <span className="text-[#C8FF00] font-black uppercase tracking-wider">
            {project.category}
          </span>
          <span className="text-[#888888]">
            {project.tech[0]}
          </span>
        </div>

      </div>

      {/* Title & Info Below Image */}
      <div className="mt-2.5 flex flex-col gap-1">
        <h3 className="font-['Montserrat'] text-xs sm:text-sm font-bold text-white group-hover:text-[#C8FF00] transition-colors line-clamp-1 uppercase tracking-wide">
          {project.title}
        </h3>

        {/* Real Local Path Badge */}
        <div className="mt-1.5 pt-1.5 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-[#777777] font-mono truncate">
          <FolderGit2 className="w-3 h-3 text-[#C8FF00] shrink-0" />
          <span className="truncate">{project.localPath}</span>
        </div>
      </div>

    </div>
  );
};
