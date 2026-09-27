import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, Brain, Sparkles, RefreshCw } from 'lucide-react';

export const NexusPage: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Set document title
  useEffect(() => {
    document.title = 'Nexus | Avaliação Cognitiva & Teste de Q.I. Online';
  }, []);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = '/hosted/teste-qi/index.html';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-screen bg-[#070709] text-white flex flex-col overflow-hidden font-['Montserrat'] select-none"
    >
      {/* Top Nexus Navigation Header (Clean, Premium, Zero Arcade Clutter) */}
      <header className="h-14 bg-[#0D0D11] border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        
        {/* Left: Brand & Back Link */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 cursor-pointer"
            title="Voltar ao Arcade"
          >
            <ArrowLeft className="w-4 h-4 text-[#A855F7]" />
            <span className="hidden sm:inline">Voltar ao Arcade</span>
          </Link>

          <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

          {/* Nexus Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Anton'] text-lg uppercase tracking-wider text-white">
                  NEXUS
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-gradient-to-r from-[#A855F7] to-[#06B6D4] text-white">
                  COGNITIVE LAB
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Test Info */}
        <div className="hidden md:flex items-center gap-3 text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-[#C8FF00]" />
            <span>26 Desafios Psicométricos • ~6 Minutos</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
            title="Reiniciar Teste"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-white/5 cursor-pointer"
            title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-[#A855F7]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[#A855F7]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Fullscreen Application Area */}
      <main className="flex-1 w-full relative bg-[#0B0F19] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#070709] gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/20 border border-[#A855F7]/40 flex items-center justify-center text-[#A855F7] animate-pulse">
              <Brain className="w-6 h-6 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <span className="font-['Anton'] text-lg uppercase tracking-wider text-white block">
                Carregando Bateria Psicométrica Nexus...
              </span>
              <span className="text-xs text-zinc-400">
                Preparando matrizes lógicas e cálculo percentil
              </span>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="/hosted/teste-qi/index.html"
          title="Nexus - Avaliação Cognitiva e Teste de Q.I."
          className="w-full h-full border-0 select-auto"
          onLoad={() => setIsLoading(false)}
          allow="clipboard-write"
        />
      </main>
    </div>
  );
};
