import React from 'react';
import { REAL_PROJECTS } from '../../data/gamesData';
import { Sparkles, ArrowRight, Play, ExternalLink, Clock, Wrench } from 'lucide-react';

interface RelatedProductCardProps {
  projectId?: string;
  customCtaText?: string;
}

export const RelatedProductCard: React.FC<RelatedProductCardProps> = ({ 
  projectId,
  customCtaText 
}) => {
  if (!projectId) return null;

  const project = REAL_PROJECTS.find(p => p.id === projectId);
  if (!project) return null;

  const isInDevelopment = 
    project.id === 'arm-empires' || 
    project.status.includes('Em Fila') || 
    project.badge.includes('CONSTRUÇÃO');

  return (
    <div className="my-10 p-6 rounded-3xl bg-gradient-to-br from-[#16161A] via-[#121214] to-[#0A0A0C] border border-[#C8FF00]/40 shadow-[0_10px_35px_rgba(200,255,0,0.08)] relative overflow-hidden text-left">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#C8FF00]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        {/* Cover / Image */}
        <div className="w-full md:w-56 h-36 shrink-0 rounded-2xl overflow-hidden bg-black/60 border border-white/10 relative shadow-lg">
          <img
            src={project.image}
            alt={project.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/covers/card_gestor_os_web.png';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase text-[#C8FF00] flex items-center gap-1">
            {isInDevelopment ? <Clock className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
            {isInDevelopment ? 'EM CONSTRUÇÃO (2027)' : project.badge}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#C8FF00] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Produto do Portfólio Kito Expert
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-semibold">{project.category}</span>
          </div>

          <h4 className="font-['Anton'] text-2xl uppercase tracking-wider text-white">
            {project.title}
          </h4>

          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!isInDevelopment ? (
              <a
                href={project.id === 'teste-qi' ? '/nexus' : `/#play=${project.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.35)] transition-all hover:scale-105"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>
                  {project.id === 'teste-qi'
                    ? 'Acessar Nexus & Iniciar Teste'
                    : (customCtaText || 'Acessar Página Estendida & Testar Sistema')}
                </span>
              </a>
            ) : (
              <a
                href={`/#play=${project.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 font-black text-xs uppercase tracking-wider transition-all"
              >
                <Wrench className="w-4 h-4" />
                <span>Ver Ficha Técnica (Em Desenvolvimento)</span>
              </a>
            )}

            <a
              href="/#secao-servicos"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Solicitar Demonstração / Orçamento</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C8FF00]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
