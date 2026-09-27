import React, { useEffect } from 'react';
import { 
  X, Play, Star, FolderGit2, Cpu, CheckCircle2, Calendar, Zap, 
  DollarSign, ArrowRight, ShieldCheck, Rocket, Code2, Headphones, Sparkles, Check,
  ExternalLink
} from 'lucide-react';
import { ProjectItem } from '../data/gamesData';
import { DynamicAdBanner } from './ads/DynamicAdBanner';

interface PreviewModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onPlayProject: (project: ProjectItem) => void;
  onOpenAgenda?: (project: ProjectItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  project,
  onClose,
  onPlayProject,
  onOpenAgenda,
  isFavorite,
  onToggleFavorite
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const isServiceOrMarketing = project.categorySlug === 'servicos' || project.categorySlug === 'marketing';
  const isExternal = project.categorySlug === 'saas' || project.categorySlug === 'sites';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-3xl rounded-3xl bg-[#0F0F12] text-white shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden border border-[#C8FF00]/40 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cover Banner */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-black shrink-0">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-[#0F0F12]/60 to-black/40" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-[#C8FF00] hover:text-black text-white flex items-center justify-center transition-all border border-white/10"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
            <span className="bg-[#C8FF00] text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
              {project.category}
            </span>
            <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-white/10">
              {project.status}
            </span>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-6 right-6 z-10 flex items-end justify-between">
            <div>
              <span className="text-[11px] font-mono text-[#C8FF00] uppercase tracking-widest block mb-1">
                {project.badge}
              </span>
              <h2 className="font-['Anton'] text-2xl sm:text-4xl uppercase tracking-wider text-white drop-shadow-md">
                {project.title}
              </h2>
            </div>

            {/* Favorite button */}
            <button
              onClick={(e) => onToggleFavorite(e, project.id)}
              className={`p-3 rounded-2xl border transition-all ${
                isFavorite 
                  ? 'bg-amber-400/20 border-amber-400 text-amber-400' 
                  : 'bg-black/60 border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Modal Body / Information Scrollable */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* SE FOR SERVIÇO OU MARKETING: SUPER APRESENTAÇÃO DE VALOR */}
          {isServiceOrMarketing ? (
            <>
              {/* Headline e Proposta de Valor */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#161618] to-[#121214] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-[#C8FF00] text-xs font-black uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" />
                  <span>Proposta & Entrega de Alto Impacto</span>
                </div>
                <h3 className="font-['Anton'] text-xl sm:text-2xl text-white uppercase tracking-wide leading-snug">
                  {project.title} sob medida para o seu ecossistema
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Grid de Entregáveis / O Que Você Recebe */}
              <div>
                <h4 className="text-xs font-black text-[#C8FF00] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  <span>O Que Está Incluído no Projeto:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/8 flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs text-white block">Arquitetura Completa</strong>
                      <span className="text-[11px] text-zinc-400">Desenvolvimento com padrões modernos de engenharia e alta velocidade.</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/8 flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs text-white block">Propriedade e Código Fonte</strong>
                      <span className="text-[11px] text-zinc-400">Total autonomia e posse da sua infraestrutura sem dependências ocultas.</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/8 flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs text-white block">Automação & Conversão</strong>
                      <span className="text-[11px] text-zinc-400">Sistemas moldados para maximizar vendas, leads e retenção de usuários.</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/8 flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#C8FF00] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-xs text-white block">Suporte Tático Direto</strong>
                      <span className="text-[11px] text-zinc-400">Alinhamento estratégico do início ao lançamento oficial da aplicação.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Plans Table if present (Ex: Marketing Packages) */}
              {project.pricing && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141416] border border-[#C8FF00]/40 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#C8FF00]" />
                      <span className="text-xs font-black uppercase tracking-wider text-[#C8FF00]">
                        Planos Transparentes & Volume de Posts
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/30 font-bold">
                      Sem Mensalidades Ocultas
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {project.pricing.plans?.map((plan, i) => {
                      const isFeatured = plan.isPopular || plan.highlight;
                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isFeatured
                              ? 'bg-[#C8FF00]/10 border-[#C8FF00] shadow-[0_0_15px_rgba(200,255,0,0.15)]'
                              : 'bg-black/40 border-white/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-white uppercase">{plan.name}</span>
                              {isFeatured && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#C8FF00] text-black">
                                  Mais Escolhido
                                </span>
                              )}
                            </div>
                            <div className="font-['Anton'] text-2xl text-[#C8FF00] tracking-wide mb-1">
                              {plan.price}
                            </div>
                            <div className="text-xs font-bold text-zinc-200 mb-2">
                              {plan.volume}
                            </div>

                            {plan.composition && plan.composition.length > 0 && (
                              <div className="space-y-1 mb-2 pt-1 border-t border-white/10">
                                <span className="text-[9px] font-mono uppercase text-zinc-400 font-bold block">
                                  Composição:
                                </span>
                                {plan.composition.map((comp, cIdx) => (
                                  <div key={cIdx} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] shrink-0" />
                                    <span>{comp}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {plan.details && (
                            <p className="text-[11px] text-zinc-400 border-t border-white/10 pt-2 leading-relaxed">
                              {plan.details}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {project.pricing.features && (
                    <div className="pt-2 border-t border-white/10">
                      <span className="text-[10px] font-mono uppercase text-zinc-400 block mb-2 font-bold">
                        Garantidos em todos os planos:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {project.pricing.features.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                            <Zap className="w-3.5 h-3.5 text-[#C8FF00] shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUPER CTA BOX DE FECHAMENTO COM AGENDA KITO */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-black via-[#161a0e] to-black border-2 border-[#C8FF00] shadow-[0_0_35px_rgba(200,255,0,0.15)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C8FF00] flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>PRÓXIMO PASSO // AGENDAMENTO DIRETO</span>
                    </span>
                    <h4 className="font-['Anton'] text-xl sm:text-2xl text-white uppercase tracking-wide">
                      Pronto para iniciar seu projeto?
                    </h4>
                    <p className="text-xs text-zinc-300 max-w-lg">
                      Agende um horário na <strong>Agenda Kito</strong>. Vamos analisar seus objetivos, alinhar o cronograma e apresentar o plano de execução ideal.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenAgenda) {
                        onClose();
                        onOpenAgenda(project);
                      }
                    }}
                    className="shrink-0 flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(200,255,0,0.4)] hover:scale-105 active:scale-95 transition-all"
                  >
                    <Calendar className="w-4 h-4 fill-black" />
                    <span>Agendar Sessão Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* VISÃO PADRÃO PARA PROJETOS DE PORTFÓLIO (JOGOS, SAAS, APPS, SITES) */
            <>
              {/* Path Information */}
              <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 flex items-start gap-3">
                <FolderGit2 className="w-5 h-5 text-[#C8FF00] shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-black text-[#C8FF00] uppercase tracking-wider block mb-0.5">
                    Localização Real no Disco:
                  </span>
                  <code className="text-[#A0A0A0] font-mono text-[11px] bg-black/40 px-2 py-1 rounded block mt-1 break-all">
                    {project.localPath}
                  </code>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-black text-[#C8FF00] uppercase tracking-[0.2em] mb-2">
                  Sobre a Aplicação
                </h3>
                <p className="text-sm text-[#B5B5B5] leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="text-xs font-black text-[#C8FF00] uppercase tracking-[0.2em] mb-2.5 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  <span>Tecnologias Utilizadas</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="text-xs font-bold px-3 py-1 rounded-lg bg-[#1c1c1c] text-white border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="p-4 rounded-2xl bg-[#0A0A0A] border border-[#C8FF00]/20 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C8FF00] shrink-0" />
                <p className="text-xs text-[#A0A0A0]">
                  <strong className="text-white">Projeto 100% autêntico do Ecossistema:</strong> Conectado diretamente e pronto para execução instantânea na arena do Kito Arcade.
                </p>
              </div>
            </>
          )}

          {/* Banner de Anúncio Dinâmico no Modal do Produto */}
          <div className="pt-2">
            <DynamicAdBanner format="horizontal" />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#0A0A0C] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-xs font-bold text-[#888888] hover:text-white hover:bg-[#181818] transition-all uppercase tracking-wider"
          >
            Fechar
          </button>

          {isServiceOrMarketing ? (
            <button
              onClick={() => {
                onClose();
                onPlayProject(project);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              <span>Ver Apresentação Estendida →</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  onClose();
                  window.open(`/hosted/${project.id}/index.html`, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                title="Abrir em Nova Guia fora do portal"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C8FF00]" />
                <span>Nova Guia</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onPlayProject(project);
                }}
                className="flex items-center gap-2 px-6 sm:px-7 py-3 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Executar no Portal</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
