import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Zap, Radio } from 'lucide-react';
import { AdFormat, AdCampaign } from '../../types/ads';
import { useAdCampaigns } from '../../hooks/useAdCampaigns';

interface DynamicAdBannerProps {
  format: AdFormat;
  className?: string;
  targetPage?: string;
  fallbackToDefault?: boolean;
  closeable?: boolean;
}

export const DynamicAdBanner: React.FC<DynamicAdBannerProps> = ({
  format,
  className = '',
  targetPage,
  fallbackToDefault = true,
  closeable = false,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const location = useLocation();
  const { getCampaignsForPage, campaigns: allCampaigns } = useAdCampaigns();

  // Determinar caminho ativo (ou targetPage explícito como 'sidebar')
  const activePath = targetPage || location.pathname + (typeof window !== 'undefined' ? window.location.hash : '');

  // Buscar anúncios válidos para a página e formato atuais
  const matchingCampaigns = getCampaignsForPage(activePath, format);

  // Fallback para campanhas ativas do mesmo formato se nenhuma tiver o target específico
  const activeCampaigns: AdCampaign[] =
    matchingCampaigns.length > 0
      ? matchingCampaigns
      : fallbackToDefault
      ? allCampaigns.filter((c) => c.isActive && c.format === format)
      : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [fade, setFade] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Resetar índice se a lista mudar ou index ficar fora dos limites
  useEffect(() => {
    if (currentIndex >= activeCampaigns.length) {
      setCurrentIndex(0);
    }
  }, [activeCampaigns.length, currentIndex]);

  const currentCampaign = activeCampaigns[currentIndex];

  // Rotação dinâmica a cada X segundos (padrão 10s), pausada ao passar o mouse
  useEffect(() => {
    if (!currentCampaign || activeCampaigns.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const duration = (currentCampaign.durationSeconds || 10) * 1000;

    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activeCampaigns.length);
        setFade(true);
      }, 300);
    }, duration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentCampaign, activeCampaigns.length, isHovered]);

  if (isDismissed || !currentCampaign) {
    return null;
  }

  const isExternal = currentCampaign.targetUrl.startsWith('http://') || currentCampaign.targetUrl.startsWith('https://');

  // RENDERIZAÇÃO FORMATO HORIZONTAL (DESKTOP & MOBILE OTIMIZADO)
  if (format === 'horizontal') {
    return (
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-[#080d1a]/95 via-[#0b1426]/95 to-[#07131e]/95 p-1 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-400/50 group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Botão de Fechar Exclusivo da Caixa de Publicidade do Topo/Header */}
        {closeable && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="absolute top-3 right-3 z-30 w-7 h-7 rounded-full bg-black/70 hover:bg-red-500/80 border border-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs font-bold transition-all shadow-md"
            title="Fechar publicidade"
            aria-label="Fechar publicidade"
          >
            ✕
          </button>
        )}

        {/* Glow neon decorativo */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />

        <div
          className={`flex flex-col md:flex-row items-center gap-4 sm:gap-6 p-3.5 sm:p-6 transition-opacity duration-300 ${closeable ? 'pr-12' : ''} ${
            fade ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Imagem do Banner */}
          <div className="relative w-full md:w-5/12 h-44 sm:h-52 md:h-48 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-900/80">
            <img
              src={currentCampaign.imageUrl}
              alt={currentCampaign.title}
              className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            {/* Tag flutuante sobre imagem */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
              {currentCampaign.badgeText || 'Em Destaque'}
            </div>
          </div>

          {/* Conteúdo textual e Call to Action */}
          <div className="flex-1 flex flex-col justify-between w-full h-full text-left">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-emerald-400/90 bg-emerald-950/60 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                  Divulgação Oficial
                </span>

                {/* Indicador de rotação dinâmica */}
                {activeCampaigns.length > 1 && (
                  <div className="flex items-center gap-1">
                    {activeCampaigns.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentIndex(i);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentIndex
                            ? 'bg-emerald-400 w-4 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                            : 'bg-white/20 hover:bg-white/40'
                        }`}
                        aria-label={`Ver anúncio ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h3 className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                {currentCampaign.title}
              </h3>

              {currentCampaign.subtitle && (
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {currentCampaign.subtitle}
                </p>
              )}
            </div>

            {/* Ação e Botão */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Acesse o ambiente interativo agora
              </span>

              {isExternal ? (
                <a
                  href={currentCampaign.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] shrink-0"
                >
                  <span>{currentCampaign.ctaText || 'Acessar'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <Link
                  to={currentCampaign.targetUrl}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] shrink-0"
                >
                  <span>{currentCampaign.ctaText || 'Acessar'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDERIZAÇÃO FORMATO SIDEBAR / VERTICAL (DESKTOP & MOBILE COMPACTO)
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-[#090e1a]/95 via-[#0b1526]/95 to-[#07111c]/95 p-1 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/50 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow neon de fundo */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/25 transition-all duration-500" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/25 transition-all duration-500" />

      <div
        className={`p-3.5 sm:p-4 flex flex-col transition-opacity duration-300 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Header do Banner */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
            <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
            Parceria & Destaque
          </span>

          {/* Dots de navegação */}
          {activeCampaigns.length > 1 && (
            <div className="flex items-center gap-1">
              {activeCampaigns.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === currentIndex
                      ? 'bg-cyan-400 w-3 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Ver anúncio ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Imagem do Banner */}
        <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-white/10 bg-slate-900/80 mb-3">
          <img
            src={currentCampaign.imageUrl}
            alt={currentCampaign.title}
            className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-cyan-500/40 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {currentCampaign.badgeText || 'Especial'}
          </div>
        </div>

        {/* Título e Texto */}
        <div className="space-y-1 mb-3 text-left">
          <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
            {currentCampaign.title}
          </h4>
          {currentCampaign.subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed line-clamp-2">
              {currentCampaign.subtitle}
            </p>
          )}
        </div>

        {/* Botão de Ação */}
        {isExternal ? (
          <a
            href={currentCampaign.targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
          >
            <span>{currentCampaign.ctaText || 'Conhecer'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>
        ) : (
          <Link
            to={currentCampaign.targetUrl}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]"
          >
            <span>{currentCampaign.ctaText || 'Conhecer'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
};
