import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  ExternalLink, 
  Star, 
  Smartphone, 
  Monitor, 
  FolderGit2, 
  Cpu, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Users,
  Swords,
  Trophy,
  Key
} from 'lucide-react';
import { ProjectItem, REAL_PROJECTS } from '../data/gamesData';
import { DynamicAdBanner } from './ads/DynamicAdBanner';
import { GameSidebar } from './GameSidebar';
import { PlayerAuthModal } from './PlayerAuthModal';
import { GameLeaderboardModal } from './GameLeaderboardModal';
import { getCurrentPlayer, onPlayerAuthChange, ArcadePlayerProfile } from '../lib/arcadePlayerAuth';

interface ArenaPlayerProps {
  project: ProjectItem;
  onBack: () => void;
  onSelectProject: (p: ProjectItem) => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
}

export const ArenaPlayer: React.FC<ArenaPlayerProps> = ({
  project,
  onBack,
  onSelectProject,
  isFavorite,
  onToggleFavorite
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>(
    project.categorySlug === 'mobile' ? 'mobile' : 'desktop'
  );
  const [currentPlayer, setCurrentPlayer] = useState<ArcadePlayerProfile | null>(() => getCurrentPlayer());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);

  useEffect(() => {
    return onPlayerAuthChange((p) => {
      setCurrentPlayer(p);
    });
  }, []);

  const getRoomParam = () => {
    try {
      const hash = window.location.hash;
      const match = hash.match(/room=([a-zA-Z0-9_-]+)/);
      if (match) return match[1];
      const searchMatch = window.location.search.match(/room=([a-zA-Z0-9_-]+)/);
      if (searchMatch) return searchMatch[1];
      return null;
    } catch {
      return null;
    }
  };

  const currentRoom = getRoomParam();
  const nickParam = currentPlayer ? `nick=${encodeURIComponent(currentPlayer.player_name_display)}&pid=${encodeURIComponent(currentPlayer.id)}` : '';
  const roomParam = currentRoom ? `room=${encodeURIComponent(currentRoom)}` : '';
  const queryParts = [roomParam, nickParam].filter(Boolean).join('&');
  const hostedUrl = `/hosted/${project.id}/index.html${queryParts ? `?${queryParts}` : ''}`;

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Erro ao entrar em tela cheia:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Erro ao sair de tela cheia:', err);
      });
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

  // Reload iframe
  const reloadIframe = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = hostedUrl;
    }
  };

  // Related projects
  const relatedProjects = React.useMemo(() => {
    return REAL_PROJECTS
      .filter(p => p.id !== project.id && (p.categorySlug === project.categorySlug || p.isPopular))
      .slice(0, 6);
  }, [project]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#070707] text-[#E0E0E0] animate-fade-in font-['Montserrat']">
      
      {/* Top Bar / Navigation Toolbar */}
      <div className="sticky top-0 z-40 bg-[#0E0E10]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl bg-white/5 hover:bg-[#C8FF00] hover:text-black text-white text-xs font-black uppercase tracking-wider transition-all border border-white/10 shrink-0"
            title="Voltar ao Arcade"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Voltar ao Arcade</span>
          </button>

          <div className="h-6 w-px bg-white/10 hidden sm:block shrink-0" />

          <div className="min-w-0 flex-1">
            <div className="hidden sm:flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#C8FF00] bg-[#C8FF00]/10 border border-[#C8FF00]/20 px-2 py-0.5 rounded-full shrink-0">
                {project.category}
              </span>
              <span className="text-xs text-[#888888] font-mono truncate">
                {project.badge}
              </span>
            </div>
            <h1 className="font-['Anton'] text-sm sm:text-2xl uppercase tracking-wider text-white truncate leading-tight">
              {project.title}
            </h1>
          </div>
        </div>

        {/* Right: Actions Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Botão para Acessar Mesas Online (PokerStars) deste jogo */}
          {['neon-tetris', 'damas-classicas', 'jogo-xadrez'].includes(project.id) && (
            <a
              href={`#multiplayer?jogo=${project.id === 'neon-tetris' ? 'tetris' : project.id === 'damas-classicas' ? 'damas' : 'xadrez'}`}
              className="flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#C8FF00]/20 to-[#C8FF00]/10 hover:bg-[#C8FF00] hover:text-black border border-[#C8FF00]/40 text-[#C8FF00] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(200,255,0,0.15)] group shrink-0"
              title="Acessar Mesas Online estilo PokerStars"
            >
              <Swords className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="text-[11px] sm:text-xs">Mesas</span>
            </a>
          )}

          {/* Botão de Ranking Dedicado do Jogo */}
          {['neon-tetris', 'damas-classicas', 'jogo-xadrez'].includes(project.id) && (
            <button
              onClick={() => setShowLeaderboardModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)] shrink-0"
              title="Ver Ranking Global deste Jogo"
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">Ranking</span>
            </button>
          )}

          {/* Botão de Nick do Jogador (Perfil / Senha) */}
          <button
            onClick={() => setShowAuthModal(true)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
              currentPlayer
                ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                : 'bg-white/5 hover:bg-white/10 border border-white/20 text-slate-300'
            }`}
            title={currentPlayer ? `Nick: ${currentPlayer.player_name_display} (Protegido por Senha)` : 'Definir Nick e Senha para o Ranking'}
          >
            {currentPlayer ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                <span className="truncate max-w-[70px] sm:max-w-[120px] text-[11px] sm:text-xs normal-case font-bold">
                  {currentPlayer.player_name_display}
                </span>
              </>
            ) : (
              <>
                <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">Nick</span>
              </>
            )}
          </button>

          {/* Mobile/Desktop Frame Toggle (especially for mobile apps) */}
          {project.categorySlug === 'mobile' && (
            <div className="flex items-center bg-black/60 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'mobile' ? 'bg-[#C8FF00] text-black shadow' : 'text-[#888] hover:text-white'
                }`}
                title="Modo Smartphone"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Smartphone</span>
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  viewMode === 'desktop' ? 'bg-[#C8FF00] text-black shadow' : 'text-[#888] hover:text-white'
                }`}
                title="Modo Tela Inteira"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px]">Expandido</span>
              </button>
            </div>
          )}

          {/* Favorite */}
          <button
            onClick={(e) => onToggleFavorite(e, project.id)}
            className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center gap-1.5"
            title={isFavorite ? "Remover dos Favoritos" : "Favoritar Projeto"}
          >
            <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-white'}`} />
            <span className="text-xs font-bold hidden lg:inline">
              {isFavorite ? 'Favorito' : 'Favoritar'}
            </span>
          </button>

          {/* Reload */}
          <button
            onClick={reloadIframe}
            className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center gap-1.5"
            title="Reiniciar Aplicação"
          >
            <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs font-bold hidden lg:inline">Reiniciar</span>
          </button>

          {/* Open in standalone tab */}
          <button
            onClick={() => window.open(`/hosted/${project.id}/index.html`, '_blank', 'noopener,noreferrer')}
            className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all flex items-center gap-1.5"
            title="Abrir em Nova Aba"
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs font-bold hidden lg:inline">Nova Aba</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(200,255,0,0.25)]"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Sair' : 'Tela Cheia'}</span>
          </button>
        </div>
      </div>

      {/* SaaS & Sites Full Experience Notice */}
      {(project.categorySlug === 'saas' || project.categorySlug === 'sites') && (
        <div className="bg-gradient-to-r from-blue-900/90 via-[#111113] to-indigo-900/90 border-b border-blue-500/30 text-white px-4 py-2.5 text-center text-xs font-bold flex flex-wrap items-center justify-center gap-3 shadow-lg z-30">
          <span className="text-blue-200">🌐 Esta é uma plataforma web completa. Para a melhor experiência sem moldura de simulação:</span>
          <button
            onClick={() => window.open(`/hosted/${project.id}/index.html`, '_blank', 'noopener,noreferrer')}
            className="px-3.5 py-1 rounded-lg bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Abrir em Nova Aba Completa</span>
          </button>
        </div>
      )}

      {/* Arm Empires Construction Alert */}
      {project.id === 'arm-empires' && (
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-4 py-2.5 text-center text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg z-30 animate-pulse">
          <span className="text-base">🚧</span>
          <span>Jogo em construção, previsão para 10/12/2027</span>
          <span className="hidden sm:inline opacity-80 font-medium normal-case">• Showroom tático com armas, HUD e física Unity 3D</span>
        </div>
      )}

      {/* Palco Principal + Barra Lateral Dedicada (Recomendados + Anúncio Dinâmico para Todos os Projetos) */}
      <div 
        ref={containerRef} 
        className={`relative w-full transition-all ${
          isFullscreen 
            ? 'fixed inset-0 z-50 w-screen h-screen p-0 bg-black flex items-center justify-center' 
            : 'max-w-[1920px] mx-auto p-2 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-start'
        }`}
      >
        {/* Palco da Aplicação / Jogo / Sistema (Adaptável) */}
        <div className={`relative flex-1 w-full min-w-0 flex flex-col items-center justify-center transition-all ${
          isFullscreen ? 'h-full w-full' : 'w-full'
        }`}>
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#09090B]/90 backdrop-blur-sm rounded-2xl">
              <div className="w-14 h-14 border-4 border-[#C8FF00]/20 border-t-[#C8FF00] rounded-full animate-spin mb-4" />
              <span className="font-['Anton'] text-xl uppercase tracking-wider text-white">Carregando...</span>
              <span className="text-xs text-[#888888] font-mono mt-1">{project.title}</span>
            </div>
          )}

          {project.id === 'calculadora-cientifica' && !isFullscreen ? (
            /* Calculadora com dimensões verticais dedicadas */
            <div className="w-full max-w-[420px] h-[780px] flex items-center justify-center overflow-hidden my-auto">
              <iframe
                ref={iframeRef}
                src={hostedUrl}
                title={project.title}
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-none bg-transparent"
                scrolling="no"
              />
            </div>
          ) : project.categorySlug === 'mobile' && viewMode === 'mobile' && !isFullscreen ? (
            /* Mockup Smartphone para Apps Mobile */
            <div className="relative w-full max-w-[430px] h-[780px] max-h-[85vh] my-auto bg-[#0c0d10] border-4 border-[#252830] rounded-[48px] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-end px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
              </div>
              <div className="relative flex-1 w-full h-full rounded-[38px] overflow-hidden bg-black flex flex-col">
                <iframe
                  ref={iframeRef}
                  src={hostedUrl}
                  title={project.title}
                  onLoad={() => setIsLoading(false)}
                  className="w-full h-full border-none bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                />
              </div>
              <div className="h-4 flex items-center justify-center pt-2">
                <div className="w-28 h-1 bg-[#475569] rounded-full" />
              </div>
            </div>
          ) : (
            /* Palco Nobre: Jogos, Plataformas SaaS, Sites e Mobile Expandido */
            <div className={`w-full relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-[0_20px_70px_rgba(0,0,0,0.9)] ${
              isFullscreen ? 'h-full w-full' : 'h-[600px] sm:h-[720px] lg:h-[800px] xl:h-[840px]'
            }`}>
              <iframe
                ref={iframeRef}
                src={hostedUrl}
                title={project.title}
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-none block game-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              />
            </div>
          )}

          {/* Botão flutuante para sair de tela cheia */}
          {isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-30 p-2.5 rounded-xl bg-black/80 hover:bg-[#C8FF00] text-white hover:text-black border border-white/20 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-2xl"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Sair da Tela Cheia</span>
            </button>
          )}
        </div>

        {/* Barra Lateral Dedicada de Publicidade e Artigos Recomendados (Presente em Todos os Projetos) */}
        {!isFullscreen && (
          <div className="w-full lg:w-[350px] xl:w-[380px] shrink-0">
            <GameSidebar
              currentGameId={project.id}
              onSelectProject={onSelectProject}
            />
          </div>
        )}
      </div>

      {/* Seção Inferior Unificada: Detalhes do Projeto e Recomendações */}
      {!isFullscreen && (
        <div className="bg-[#0A0A0A] border-t border-white/10 py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1650px] mx-auto space-y-8">
            {/* Detalhes do Projeto, Origem e Stack Tecnológica */}
            <div className="bg-[#111113] border border-white/10 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-1">
                    DETALHES DO PROJETO // KITO ARCADE
                  </span>
                  <h2 className="font-['Anton'] text-2xl sm:text-3xl uppercase tracking-wider text-white mb-3">
                    {project.title}
                  </h2>
                  <p className="text-sm sm:text-base text-[#B0B0B0] leading-relaxed max-w-4xl">
                    {project.description}
                  </p>
                </div>

                {/* Botão de Destaque "Nova Guia Fora do Portal" */}
                <button
                  onClick={() => window.open(`/hosted/${project.id}/index.html`, '_blank', 'noopener,noreferrer')}
                  className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C8FF00] hover:bg-[#b5e600] text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(200,255,0,0.25)] hover:scale-105 active:scale-95 cursor-pointer self-start"
                  title="Abrir em Nova Guia Limpa fora do portal"
                >
                  <ExternalLink className="w-4 h-4 stroke-[2.5]" />
                  <span>Abrir em Nova Guia</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-[#C8FF00]" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">Origem no Ecossistema</span>
                  </div>
                  <code className="text-[#888] font-mono text-[11px] block break-all">
                    {project.localPath}
                  </code>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#C8FF00]" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">Stack Tecnológica</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span key={t} className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-white/5 text-white border border-white/10">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs text-[#22c55e] font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Status Operacional: {project.status}</span>
                </div>
                <span className="text-xs text-[#888] font-mono">
                  Sandbox local isolada • Carregamento instantâneo
                </span>
              </div>
            </div>

            {/* Trilho de Outros Projetos */}
            {relatedProjects.length > 0 && (
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C8FF00] block mb-1">
                      EXPLORAR MAIS
                    </span>
                    <h3 className="font-['Anton'] text-2xl uppercase tracking-wider text-white">
                      Outras Aplicações do Ecossistema
                    </h3>
                  </div>
                  <button
                    onClick={onBack}
                    className="text-xs font-black uppercase tracking-wider text-[#C8FF00] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver Todas as Aplicações</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {relatedProjects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer rounded-2xl bg-[#121214] border border-white/10 hover:border-[#C8FF00]/50 p-3 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(200,255,0,0.15)] flex flex-col"
                    >
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black mb-2.5">
                        <img 
                          src={p.image} 
                          alt={p.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-black uppercase tracking-wider bg-black/80 text-[#C8FF00] px-2 py-0.5 rounded">
                          {p.category.split('&')[0].trim()}
                        </span>
                      </div>
                      <h4 className="font-['Anton'] text-sm uppercase tracking-wide text-white group-hover:text-[#C8FF00] transition-colors truncate">
                        {p.title}
                      </h4>
                      <span className="text-[10px] text-[#777] font-mono mt-0.5 truncate">
                        {p.tech[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Autenticação / Perfil de Nick com Senha */}
      <PlayerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          reloadIframe();
        }}
      />

      {/* Modal de Ranking Dedicado do Jogo */}
      <GameLeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        gameId={project.id}
        gameTitle={project.title}
      />

    </div>
  );
};
