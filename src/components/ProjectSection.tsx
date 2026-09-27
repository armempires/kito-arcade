import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ProjectItem } from '../data/gamesData';
import { ProjectCard } from './ProjectCard';

interface ProjectSectionProps {
  eyebrow?: string;
  title: string;
  moreText?: string;
  onMoreClick?: () => void;
  projects: ProjectItem[];
  onSelectProject: (project: ProjectItem) => void;
  onInfoProject?: (project: ProjectItem) => void;
  favorites: string[];
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const ProjectSection: React.FC<ProjectSectionProps> = ({
  eyebrow,
  title,
  moreText,
  onMoreClick,
  projects,
  onSelectProject,
  onInfoProject,
  favorites,
  onToggleFavorite
}) => {
  if (projects.length === 0) return null;

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 pb-2 border-b border-white/5 px-1">
        <div>
          {eyebrow && (
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-1">
              {eyebrow}
            </span>
          )}
          <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white flex items-center gap-2">
            {title}
          </h2>
        </div>

        {moreText && (
          <button
            onClick={onMoreClick}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#C8FF00] hover:text-[#b5e600] transition-colors pb-1"
          >
            <span>{moreText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid of Projects (Dense layout: 2 cols on mobile, 3 on sm, 4 on md, 5 on lg, 6 on xl) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={onSelectProject}
            onInfo={onInfoProject}
            isFavorite={favorites.includes(project.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
};
