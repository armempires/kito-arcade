import React, { useRef, useState } from 'react';
import { 
  ArrowLeft, Calendar, Sparkles, Rocket, Zap, 
  ChevronRight, ShieldCheck, Layers, Smartphone, Lock
} from 'lucide-react';
import { ProjectItem } from '../data/gamesData';
import { BookingSection } from './BookingSection';
import { 
  ESTEIRA_APP_SOFTWARE_JOGOS, 
  ESTEIRA_SITE_SAAS, 
  getEsteiraForProject 
} from '../data/esteirasData';
import { GameSidebar } from './GameSidebar';
import { DynamicAdBanner } from './ads/DynamicAdBanner';

interface ServicePageProps {
  project: ProjectItem;
  onBack: () => void;
}

export const ServicePage: React.FC<ServicePageProps> = ({ project, onBack }) => {
  const agendaRef = useRef<HTMLDivElement>(null);
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<string>(project.title);
  const [selectedPipelineId, setSelectedPipelineId] = useState<'app-software-jogos' | 'site-saas'>(() => 
    getEsteiraForProject(project.categorySlug, project.id).id
  );

  const activePipeline = selectedPipelineId === 'app-software-jogos' 
    ? ESTEIRA_APP_SOFTWARE_JOGOS 
    : ESTEIRA_SITE_SAAS;

  const scrollToAgenda = () => {
    agendaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectPlan = (planName: string, planPrice?: string) => {
    setSelectedServiceForBooking(planPrice ? `${project.title} - ${planName} (${planPrice})` : `${project.title} - ${planName}`);
    scrollToAgenda();
  };

  return (
    <div className="flex-1 bg-[#0A0A0A] text-white flex flex-col font-['Montserrat'] animate-fade-in pb-24">
      
      {/* Top Navigation Bar */}
      <div className="bg-[#101012] border-b border-white/10 px-4 sm:px-8 py-4 sticky top-16 z-30 flex items-center justify-between backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-[#C8FF00] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Arcade</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-admin-crm'))}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-[#C8FF00] text-xs font-mono border border-white/10 transition-all cursor-pointer"
            title="Acessar Painel Administrativo de CRM"
          >
            <Lock className="w-3.5 h-3.5 text-[#C8FF00]" />
            <span className="hidden sm:inline">CRM</span>
          </button>

          <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/30 font-black uppercase">
            {project.badge}
          </span>
          <button
            onClick={scrollToAgenda}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(200,255,0,0.3)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-4 h-4 fill-black" />
            <span>Ir para Agendamento</span>
          </button>
        </div>
      </div>

      {/* Main Extended Presentation Container (Layout 2 Colunas com Sidebar Padronizada) */}
      <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Coluna Principal do Serviço */}
        <div className="flex-1 min-w-0 w-full space-y-14">
        
        {/* 1. Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#121215] to-[#0A0A0C] p-6 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/30 text-[#C8FF00] text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>Solução Oficial Kito Expert</span>
              </div>

              <h1 className="font-['Anton'] text-3xl sm:text-5xl uppercase tracking-wider text-white leading-tight">
                {project.title}
              </h1>

              <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
                {project.description}
              </p>

              {/* Technologies */}
              <div className="pt-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest block mb-2 font-bold">
                  Pilha Tecnológica:
                </span>
                <div className="flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-black/60 text-white border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button inside Hero */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={scrollToAgenda}
                  className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(200,255,0,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Calendar className="w-5 h-5 fill-black" />
                  <span>Escolher Data & Horário Abaixo</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Right Card Image Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[16/11] rounded-2xl overflow-hidden border border-[#C8FF00]/30 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-xs font-black uppercase text-[#C8FF00] tracking-wider">
                  Showcase Real • Kito Expert
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Esteira Oficial de Desenvolvimento */}
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-[#C8FF00] uppercase tracking-widest font-black block mb-1">
                METODOLOGIA DE ENTREGA
              </span>
              <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white flex items-center gap-2">
                <Rocket className="w-6 h-6 text-[#C8FF00]" />
                <span>Esteira de Desenvolvimento</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {activePipeline.subtitle} ({activePipeline.totalSteps} etapas estruturadas)
              </p>
            </div>

            {/* Switcher entre as duas esteiras oficiais */}
            <div className="flex items-center gap-1.5 p-1 bg-[#141417] rounded-2xl border border-white/10 self-start md:self-auto">
              <button
                onClick={() => setSelectedPipelineId('site-saas')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedPipelineId === 'site-saas'
                    ? 'bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Site e SaaS (10 etapas)</span>
              </button>

              <button
                onClick={() => setSelectedPipelineId('app-software-jogos')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedPipelineId === 'app-software-jogos'
                    ? 'bg-[#C8FF00] text-black shadow-[0_0_15px_rgba(200,255,0,0.3)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>App, Software e Jogos (9 etapas)</span>
              </button>
            </div>
          </div>

          {/* Grid de Etapas da Esteira */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {activePipeline.steps.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-2xl bg-[#121215] border border-white/8 space-y-2 hover:border-[#C8FF00]/40 transition-all hover:-translate-y-0.5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/30 flex items-center justify-center text-[#C8FF00] font-black text-xs font-mono group-hover:bg-[#C8FF00] group-hover:text-black transition-colors">
                      {String(item.step).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase bg-black/60 px-2 py-0.5 rounded border border-white/5">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-white leading-snug">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* In-Content Dynamic Ad Banner (Card dinâmico padrão Blog no meio do conteúdo) */}
        <div className="w-full pt-2 pb-2">
          <DynamicAdBanner format="horizontal" />
        </div>

        {/* 3. Pricing Matrix if available (for marketing packages) */}
        {project.pricing && project.pricing.plans && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#121214] border-2 border-[#C8FF00]/40 space-y-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#C8FF00] tracking-widest font-black block mb-1">
                  TABELA DE INVESTIMENTO // PLANOS OFICIAIS
                </span>
                <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white">
                  {project.categorySlug === 'automacao' ? 'Planos de Automação & IA' : 'Planos Transparentes & Volume de Posts'}
                </h2>
              </div>
              <span className="text-xs font-bold font-mono px-3.5 py-1.5 rounded-full bg-[#C8FF00]/10 text-[#C8FF00] border border-[#C8FF00]/30 w-fit">
                Sem Taxas Ocultas
              </span>
            </div>

            {/* DESTAQUE UNIVERSAL: INCLUSO EM TODOS OS PACOTES */}
            {project.pricing.features && project.pricing.features.length > 0 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#171b0e] via-[#121415] to-[#171b0e] border border-[#C8FF00]/40 shadow-[0_0_25px_rgba(200,255,0,0.12)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#C8FF00] animate-pulse" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#C8FF00] font-black">
                    Incluso obrigatoriamente em todos os pacotes:
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {project.pricing.features.map((feat, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-black/60 border border-[#C8FF00]/20 hover:border-[#C8FF00]/60 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#C8FF00] text-black flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(200,255,0,0.4)]">
                        <Zap className="w-4 h-4 fill-black" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid dos Planos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {project.pricing.plans.map((plan, i) => {
                const isFeatured = plan.isPopular || plan.highlight;
                return (
                  <div
                    key={i}
                    className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                      isFeatured
                        ? 'bg-gradient-to-b from-[#181d11] to-[#0f110c] border-[#C8FF00] shadow-[0_0_25px_rgba(200,255,0,0.25)] md:-translate-y-2'
                        : 'bg-[#151518] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top Header of Plan */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-white uppercase tracking-wider">
                          {plan.name}
                        </span>
                        {isFeatured && (
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-[#C8FF00] text-black tracking-wider shadow">
                            Mais Escolhido
                          </span>
                        )}
                      </div>

                      {/* Price and Period */}
                      <div className="border-b border-white/10 pb-3">
                        <div className="flex items-baseline gap-2">
                          <span className="font-['Anton'] text-3xl sm:text-4xl text-[#C8FF00] tracking-wide">
                            {plan.price}
                          </span>
                          {plan.period && (
                            <span className="text-sm text-zinc-300 font-medium lowercase">
                              {plan.period}
                            </span>
                          )}
                        </div>
                        {plan.tag && (
                          <span className="text-[11px] text-zinc-400 font-medium block mt-1">
                            {plan.tag}
                          </span>
                        )}
                      </div>

                      {/* Volume Principal (somente se especificado) */}
                      {plan.volume && (
                        <div className="p-3 rounded-xl bg-black/40 border border-[#C8FF00]/30">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold mb-1">
                            Volume Contratado:
                          </span>
                          <div className="text-base font-black text-[#C8FF00] tracking-wide">
                            {plan.volume}
                          </div>
                        </div>
                      )}

                      {/* Composição do Pacote */}
                      {plan.composition && plan.composition.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block font-black">
                            Composição Exata:
                          </span>
                          <div className="flex flex-col gap-2">
                            {plan.composition.map((compItem, cIdx) => (
                              <div 
                                key={cIdx} 
                                className="flex items-center gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5 text-xs font-bold text-zinc-200"
                              >
                                <span className="w-2 h-2 rounded-full bg-[#C8FF00] shrink-0 shadow-[0_0_6px_#C8FF00]" />
                                <span>{compItem}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {plan.details && (
                        <p className="text-xs text-zinc-400 border-t border-white/10 pt-3 leading-relaxed">
                          {plan.details}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan.name, plan.price)}
                      className={`mt-6 w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        isFeatured
                          ? 'bg-[#C8FF00] text-black hover:bg-[#b5e600] shadow-[0_0_15px_rgba(200,255,0,0.3)] hover:scale-[1.02] active:scale-95'
                          : 'bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      Agendar este Plano
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. FLUXO DE AGENDAMENTO 100% NATIVO EMBUTIDO DIRETO NO DOM (SEM IFRAME, SEM POPUP) */}
        <div ref={agendaRef} className="space-y-6 pt-6">
          <div className="border-b border-[#C8FF00]/40 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-mono text-[#C8FF00] uppercase tracking-widest font-black block mb-1">
                AGENDA KITO // AGENDAMENTO DIRETO
              </span>
              <h2 className="font-['Anton'] text-3xl sm:text-4xl uppercase tracking-wider text-white">
                Agende sua Sessão para {selectedServiceForBooking}
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Preencha os passos abaixo para confirmar o horário diretamente com o especialista.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-[#C8FF00]" />
              <span>Sessão 100% Segura & Confirmada</span>
            </div>
          </div>

          {/* Componente Nativo de Agendamento */}
          <BookingSection key={selectedServiceForBooking} initialServiceName={selectedServiceForBooking} />
        </div>

        </div>

        {/* Coluna Lateral: Publicidade Dinâmica Fixa e Artigos Recomendados Padronizados */}
        <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0">
          <GameSidebar currentGameId={project.id} />
        </div>

      </div>

    </div>
  );
};
