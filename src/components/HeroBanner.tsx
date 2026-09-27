import React from 'react';
import { Globe, Smartphone, Zap, Calendar, Info, FolderGit2 } from 'lucide-react';
import { ProjectItem } from '../data/gamesData';

interface HeroBannerProps {
  onSolicitarOrcamento: () => void;
  onConhecerServicos: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  onSolicitarOrcamento,
  onConhecerServicos
}) => {
  return (
    <div className="relative mb-10 rounded-3xl overflow-hidden bg-[#111111] border border-white/10 hover:border-[#C8FF00]/40 transition-all duration-300 shadow-2xl group">
      
      {/* Background with 3D devices showcase and cinematic dark overlay */}
      <div className="absolute inset-0">
        <img
          src="/assets/hero_banner_sites_apps.jpg"
          alt="Criação de Sites e Apps"
          className="w-full h-full object-cover object-right sm:object-center opacity-85 filter brightness-100 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 sm:via-[#0A0A0A]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl flex flex-col items-start gap-4">
        
        {/* Eyebrow / Kicker - Sem 'DESTAQUE VIP //' e sem 'BRASIL' */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#C8FF00] bg-[#C8FF00]/10 border border-[#C8FF00]/30 px-3 py-1 rounded-full">
            CRIAÇÃO SOB MEDIDA
          </span>
          <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            WEB & MOBILE
          </span>
        </div>

        {/* Title in Impactful Font */}
        <h1 className="font-['Anton'] text-4xl sm:text-5xl md:text-6xl uppercase tracking-wider text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-[1.05]">
          CRIAÇÃO DE SITES DE <span className="text-[#C8FF00]">ALTA CONVERSÃO</span> & APPS MOBILE
        </h1>

        {/* Description */}
        <p className="text-[#B5B5B5] text-sm sm:text-base leading-relaxed line-clamp-3 max-w-2xl font-normal">
          Desenvolvimento de sites modernos, landing pages 3D e aplicativos para Android e iOS sob medida. Projetos com design exclusivo, velocidade máxima, integração com pagamentos e foco total em gerar clientes para o seu negócio.
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-3 text-xs font-bold text-[#E0E0E0] my-1">
          <div className="flex items-center gap-2 bg-[#161616]/90 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-md">
            <Globe className="w-4 h-4 text-[#C8FF00]" />
            <span>Sites 3D & Landing Pages</span>
          </div>
          <div className="flex items-center gap-2 bg-[#161616]/90 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-md">
            <Smartphone className="w-4 h-4 text-[#C8FF00]" />
            <span>Apps Android & iOS</span>
          </div>
          <div className="flex items-center gap-2 bg-[#161616]/90 px-3.5 py-2 rounded-xl border border-white/10 backdrop-blur-md">
            <Zap className="w-4 h-4 text-[#C8FF00]" />
            <span>Pagamentos & Automação IA</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3.5 pt-3">
          <button
            onClick={onSolicitarOrcamento}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(200,255,0,0.35)] hover:shadow-[0_0_35px_rgba(200,255,0,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 fill-black" />
            <span>SOLICITAR ORÇAMENTO DE SITE OU APP</span>
          </button>

          <button
            onClick={onConhecerServicos}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span>Conhecer Serviços</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[#888888] font-mono ml-1">
            <FolderGit2 className="w-3.5 h-3.5 text-[#C8FF00]" />
            <span>Serviços sob Demanda // Atendimento Especializado</span>
          </div>
        </div>

      </div>

    </div>
  );
};
