import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Swords, 
  Copy, 
  Check, 
  LogOut, 
  Plus, 
  Zap, 
  Lock, 
  Search, 
  ArrowLeft, 
  Gamepad2, 
  Loader2, 
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Key
} from 'lucide-react';
import { 
  ArcadeRoom, 
  ArcadeGameType, 
  fetchOpenRooms, 
  createArcadeRoom, 
  joinArcadeRoom, 
  leaveArcadeRoom, 
  checkActiveSessionRoom, 
  getSessionId, 
  getPlayerName, 
  setPlayerName 
} from '../lib/arcadeMultiplayer';
import { supabase } from '../lib/supabase';
import { DynamicAdBanner } from '../components/ads/DynamicAdBanner';
import { PlayerAuthModal } from '../components/PlayerAuthModal';
import { getCurrentPlayer, onPlayerAuthChange, ArcadePlayerProfile } from '../lib/arcadePlayerAuth';

interface MultiplayerLobbyPageProps {
  onBack: () => void;
  onPlayGame: (gameId: string, roomId?: string) => void;
}

export const MultiplayerLobbyPage: React.FC<MultiplayerLobbyPageProps> = ({
  onBack,
  onPlayGame
}) => {
  const [sessionId] = useState(() => getSessionId());
  const [currentPlayer, setCurrentPlayer] = useState<ArcadePlayerProfile | null>(() => getCurrentPlayer());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userName, setUserName] = useState(() => {
    const cp = getCurrentPlayer();
    return cp ? cp.player_name_display : getPlayerName();
  });
  const [isEditingName, setIsEditingName] = useState(false);

  useEffect(() => {
    return onPlayerAuthChange((p) => {
      setCurrentPlayer(p);
      if (p) setUserName(p.player_name_display);
    });
  }, []);
  const [selectedFilter, setSelectedFilter] = useState<'all' | ArcadeGameType>(() => {
    try {
      const hash = window.location.hash;
      if (hash.includes('jogo=tetris')) return 'tetris';
      if (hash.includes('jogo=damas')) return 'damas';
      if (hash.includes('jogo=xadrez')) return 'xadrez';
    } catch {}
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<ArcadeRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<ArcadeRoom | null>(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal de criação de sala
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createGameType, setCreateGameType] = useState<ArcadeGameType>('tetris');
  const [createIsPrivate, setCreateIsPrivate] = useState(false);

  // Modal de entrar por código
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Sincroniza nome
  const handleSaveName = (newName: string) => {
    setUserName(newName);
    setPlayerName(newName);
    setIsEditingName(false);
  };

  // Carregar salas e sala ativa
  const refreshRooms = useCallback(async () => {
    const list = await fetchOpenRooms(selectedFilter === 'all' ? undefined : selectedFilter);
    setRooms(list);
    setIsLoadingRooms(false);
  }, [selectedFilter]);

  const refreshActiveRoom = useCallback(async () => {
    const active = await checkActiveSessionRoom();
    setActiveRoom(active);
    if (active && active.status === 'playing') {
      // Redireciona para o jogo
      const gameSlug = active.game_type === 'tetris' 
        ? 'neon-tetris' 
        : active.game_type === 'damas' 
          ? 'damas-classicas' 
          : 'jogo-xadrez';
      onPlayGame(gameSlug, active.id);
    }
  }, [onPlayGame]);

  useEffect(() => {
    refreshRooms();
    refreshActiveRoom();

    // Inscrever em atualizações em tempo real no Supabase
    const channel = supabase
      .channel('arcade-multiplayer-lobby')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'arcade_multiplayer_rooms' },
        (payload) => {
          refreshRooms();
          // Se afetar a sala ativa do usuário
          const newRow = payload.new as ArcadeRoom;
          if (newRow && (newRow.host_session_id === sessionId || newRow.guest_session_id === sessionId)) {
            setActiveRoom(newRow);
            if (newRow.status === 'playing') {
              const gameSlug = newRow.game_type === 'tetris' 
                ? 'neon-tetris' 
                : newRow.game_type === 'damas' 
                  ? 'damas-classicas' 
                  : 'jogo-xadrez';
              onPlayGame(gameSlug, newRow.id);
            }
          }
        }
      )
      .subscribe();

    const interval = setInterval(() => {
      refreshRooms();
      refreshActiveRoom();
    }, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [refreshRooms, refreshActiveRoom, sessionId, onPlayGame]);

  // Criar Sala
  const handleCreateRoom = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await createArcadeRoom(createGameType, createIsPrivate, userName);
    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    if (res.room) {
      setActiveRoom(res.room);
      setShowCreateModal(false);
      refreshRooms();
    }
  };

  // Entrar em Sala
  const handleJoin = async (codeOrId: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const res = await joinArcadeRoom(codeOrId, userName);
    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
      return;
    }

    if (res.room) {
      setActiveRoom(res.room);
      const gameSlug = res.room.game_type === 'tetris' 
        ? 'neon-tetris' 
        : res.room.game_type === 'damas' 
          ? 'damas-classicas' 
          : 'jogo-xadrez';
      onPlayGame(gameSlug, res.room.id);
    }
  };

  // Sair da Sala Ativa
  const handleLeaveRoom = async () => {
    if (!activeRoom) return;
    setIsSubmitting(true);
    await leaveArcadeRoom(activeRoom.id);
    setActiveRoom(null);
    setIsSubmitting(false);
    refreshRooms();
  };

  // Copiar link de convite
  const handleCopyLink = () => {
    if (!activeRoom) return;
    const url = `${window.location.origin}/#multiplayer?sala=${activeRoom.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Filtragem
  const filteredRooms = rooms.filter(r => {
    if (selectedFilter !== 'all' && r.game_type !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.code.toLowerCase().includes(q) || r.host_name.toLowerCase().includes(q);
    }
    return true;
  });

  const getGameIcon = (type: ArcadeGameType) => {
    switch (type) {
      case 'tetris': return '🧱';
      case 'damas': return '⚪';
      case 'xadrez': return '♟️';
    }
  };

  const getGameTitle = (type: ArcadeGameType) => {
    switch (type) {
      case 'tetris': return 'Neon Tetris';
      case 'damas': return 'Damas Clássicas';
      case 'xadrez': return 'Jogo de Xadrez';
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 antialiased selection:bg-cyan-500 selection:text-black pb-20">
      
      {/* BANNER DO NEXUS EMBAIXO DO HEADER COM BOTÃO DE FECHAR */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 pt-6">
        <DynamicAdBanner format="horizontal" closeable={true} />
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* HERO TITLE & ACTIONS */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-gray-800/60">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
                Rede 1v1 em Tempo Real
              </span>
              <span className="text-xs text-gray-500 font-mono">• Supabase Broadcast & Webhooks</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Salas & Partidas Online</h1>
            <p className="text-gray-400 text-sm mt-1 max-w-2xl">
              Crie sua própria sala privada com link de convite ou entre em partidas públicas. O mesmo usuário só pode participar de <strong class="text-white">1 partida ao mesmo tempo</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              disabled={!!activeRoom}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} /> Criar Nova Sala
            </button>

            <button 
              onClick={() => {
                const waitingRoom = rooms.find(r => r.status === 'waiting' && r.host_session_id !== sessionId);
                if (waitingRoom) {
                  handleJoin(waitingRoom.code);
                } else {
                  setShowCreateModal(true);
                }
              }}
              disabled={!!activeRoom}
              className="px-4 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold text-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={18} className="text-purple-400" /> Partida Rápida (Fila)
            </button>

            {/* Botão de Nick do Jogador (Perfil / Senha) */}
            <button
              onClick={() => setShowAuthModal(true)}
              className={`px-4 py-3 rounded-xl border text-sm font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                currentPlayer
                  ? 'bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                  : 'bg-gray-900 hover:bg-gray-800 border-gray-700 text-amber-300'
              }`}
              title={currentPlayer ? `Nick Protegido: ${currentPlayer.player_name_display}` : 'Cadastrar Nick e Senha'}
            >
              {currentPlayer ? (
                <>
                  <ShieldCheck size={18} className="text-cyan-400" />
                  <span>Nick: {currentPlayer.player_name_display}</span>
                </>
              ) : (
                <>
                  <Key size={18} className="text-amber-400" />
                  <span>Entrar com Nick</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ERRO GERAL / ALERTA DE CONCORRÊNCIA */}
        {errorMessage && (
          <div className="mt-6 p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-red-400 shrink-0" size={20} />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="text-xs text-red-400 hover:text-white underline cursor-pointer"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* HUD DE SALA ATIVA (DESTAQUE NO TOPO) */}
        {activeRoom && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950 border-2 border-cyan-500/60 shadow-2xl shadow-cyan-950/40 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              
              {/* Left: Game & Status */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-inner">
                    {getGameIcon(activeRoom.game_type)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      SALA #{activeRoom.code}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Você está nesta Sala
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">Modo: {getGameTitle(activeRoom.game_type)}</span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
                    {activeRoom.status === 'waiting' 
                      ? 'Aguardando oponente entrar na sala...' 
                      : 'Oponente conectado! Carregando partida...'}
                  </h3>
                  
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Quando o segundo jogador entrar, a partida é iniciada instantaneamente no navegador de ambos.
                  </p>
                </div>
              </div>

              {/* Middle: Invite Link */}
              <div className="w-full lg:w-auto flex-1 max-w-md bg-black/60 border border-gray-800 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="overflow-hidden">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Link de Convite Direto</span>
                  <span className="font-mono text-xs text-cyan-300 truncate block">
                    {window.location.origin}/#multiplayer?sala={activeRoom.code}
                  </span>
                </div>
                <button 
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-bold text-white transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedLink ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>

              {/* Right: Slots & Mandatory Sair da Sala */}
              <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                <div className="flex items-center -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 border-2 border-black flex items-center justify-center font-bold text-xs text-black" title={activeRoom.host_name}>
                    {activeRoom.host_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center text-xs text-gray-500 animate-pulse">
                    {activeRoom.guest_name ? activeRoom.guest_name.substring(0, 2).toUpperCase() : '?'}
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-cyan-400">
                  {activeRoom.guest_name ? '2 / 2' : '1 / 2'}
                </span>

                {/* BOTÃO OBRIGATÓRIO: LEVANTAR DA MESA */}
                <button 
                  onClick={handleLeaveRoom}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-500 text-red-300 hover:text-red-200 text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 shadow-lg shadow-red-950/40 cursor-pointer"
                >
                  <LogOut size={16} className="text-red-400" />
                  Levantar da Mesa
                </button>
              </div>
            </div>

            {/* Concurrency Rule Footer */}
            <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>
                  <strong className="text-amber-300">Regra de Segurança:</strong> Você está bloqueado para entrar em outras salas enquanto estiver nesta. Se fechar a aba ou clicar em "Sair", a vaga é liberada no Supabase.
                </span>
              </div>
              <span className="font-mono text-gray-500 text-[11px]">Heartbeat: 4s</span>
            </div>
          </div>
        )}

        {/* FILTERS & SEARCH */}
        <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            <button 
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'all' 
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' 
                  : 'bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800'
              }`}
            >
              🎮 Todas as Salas ({rooms.length})
            </button>
            <button 
              onClick={() => setSelectedFilter('tetris')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'tetris' 
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20' 
                  : 'bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800'
              }`}
            >
              🧱 Neon Tetris ({rooms.filter(r => r.game_type === 'tetris').length})
            </button>
            <button 
              onClick={() => setSelectedFilter('damas')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'damas' 
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20' 
                  : 'bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800'
              }`}
            >
              ⚪ Damas Clássicas ({rooms.filter(r => r.game_type === 'damas').length})
            </button>
            <button 
              onClick={() => setSelectedFilter('xadrez')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === 'xadrez' 
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20' 
                  : 'bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-800'
              }`}
            >
              ♟️ Jogo de Xadrez ({rooms.filter(r => r.game_type === 'xadrez').length})
            </button>
          </div>

          {/* Search by code / host */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3.5 top-2.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Buscar por código ou host..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/90 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            
            {/* Direct code join input */}
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="#Código"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-24 bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-2 text-xs text-center font-mono text-cyan-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
              <button 
                onClick={() => joinCodeInput.trim() && handleJoin(joinCodeInput.trim())}
                disabled={!joinCodeInput.trim() || isSubmitting || !!activeRoom}
                className="px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs border border-gray-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>

        {/* LIST / GRID OF ROOMS */}
        <div className="mt-6">
          {isLoadingRooms ? (
            <div className="text-center py-20">
              <Loader2 className="animate-spin text-cyan-400 mx-auto mb-3" size={32} />
              <p className="text-sm text-gray-400">Sincronizando salas no Supabase...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl border border-gray-900 bg-gray-950/40">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-3xl mx-auto mb-4">
                🎮
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Nenhuma sala aberta no momento</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                Seja o primeiro a desafiar alguém! Crie uma sala pública ou convide um amigo compartilhando o código direto.
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                disabled={!!activeRoom}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Criar Sala Agora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((r) => {
                const isMyRoom = r.host_session_id === sessionId;
                const isWaiting = r.status === 'waiting';
                const isPlaying = r.status === 'playing';

                return (
                  <div 
                    key={r.id}
                    className={`p-5 rounded-2xl bg-gray-950/80 border transition-all relative ${
                      isMyRoom 
                        ? 'border-cyan-500/60 shadow-lg shadow-cyan-950/30' 
                        : isWaiting 
                          ? 'border-gray-800 hover:border-cyan-500/50' 
                          : 'border-gray-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl">
                          {getGameIcon(r.game_type)}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                            {getGameTitle(r.game_type)}
                          </span>
                          <h4 className="text-base font-bold text-white">
                            {r.game_type === 'tetris' ? 'Batalha 1v1' : r.game_type === 'damas' ? 'Tabuleiros Mestres' : 'Duelo FIDE'}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Host: <span className="text-gray-300 font-medium">{r.host_name}</span>
                            {isMyRoom && <span className="ml-1 text-[10px] text-cyan-400 font-bold">(Você)</span>}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isWaiting ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 text-[11px] font-bold">
                          1/2 Livre
                        </span>
                      ) : isPlaying ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-950/50 border border-red-900/50 text-red-400 text-[11px] font-bold">
                          2/2 Ocupada
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-gray-900 text-gray-500 text-[11px] font-bold">
                          Finalizada
                        </span>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-900 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                        <span>#{r.code}</span>
                        <span>•</span>
                        <span className={r.is_private ? 'text-yellow-400 flex items-center gap-1' : 'text-cyan-400'}>
                          {r.is_private ? 'Privada' : 'Pública'}
                        </span>
                      </div>

                      {isMyRoom ? (
                        <button
                          onClick={handleLeaveRoom}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Levantar da Mesa
                        </button>
                      ) : isWaiting ? (
                        <button 
                          onClick={() => handleJoin(r.code)}
                          disabled={isSubmitting || !!activeRoom}
                          className="px-4 py-2 rounded-xl bg-[#C8FF00] hover:bg-[#bceb00] text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-[0_0_15px_rgba(200,255,0,0.25)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          SENTAR ♟️
                        </button>
                      ) : (
                        <button disabled className="px-3 py-1.5 rounded-lg bg-gray-900 text-gray-600 text-xs font-bold cursor-not-allowed">
                          Em Partida
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODO 2 JOGADORES NO MESMO DISPOSITIVO PRESERVADO */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-gray-950 border border-blue-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-900/40 border border-blue-500/40 flex items-center justify-center text-3xl">
              👥
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Prefere jogar presencialmente no mesmo computador?</h4>
              <p className="text-gray-400 text-xs mt-1 max-w-xl">
                Para <strong className="text-white">Damas</strong> e <strong className="text-white">Xadrez</strong>, o modo clássico de <span className="text-cyan-400 font-bold">"2 Jogadores no Mesmo Dispositivo"</span> continua 100% intacto dentro de cada jogo, sem precisar criar sala online.
              </p>
            </div>
          </div>
          <button 
            onClick={() => onPlayGame('damas-classicas')}
            className="px-5 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer"
          >
            Jogar Modo Local →
          </button>
        </div>

        {/* CONTAINER DE MARKETING & ANÚNCIOS (ESTRUTURA NEXUS PADRONIZADA) */}
        <div className="mt-14 pt-10 border-t border-gray-800/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="p-8 rounded-2xl bg-gray-950/60 border border-gray-800/80 relative overflow-hidden">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest block mb-2">
                  INFRAESTRUTURA DE ALTA PERFORMANCE
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">Multiplayer Supabase Realtime & WebSockets</h2>
                <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                  As salas do Kito Arcade operam com latência ultrabaixa via canais de broadcast distribuídos. Sincronização automática de estados de jogo, eliminação de salas fantasmas no fechamento da janela e segurança contra múltiplas conexões simultâneas da mesma sessão.
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-gray-400">
                  <span className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">⚡ Ping médio: &lt; 25ms</span>
                  <span className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">🛡️ Proteção Anti-Self-Play</span>
                  <span className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">🔄 Limpeza Automática onUnload</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <DynamicAdBanner 
                placement="player-sidebar"
                className="w-full"
              />
            </div>
          </div>
        </div>

      </main>

      {/* MODAL CRIAR SALA */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gray-950 border border-gray-800 p-6 shadow-2xl relative">
            <h3 className="text-xl font-black text-white mb-1">Criar Nova Sala Multiplayer</h3>
            <p className="text-xs text-gray-400 mb-6">Escolha o jogo e o tipo de visibilidade da sala.</p>

            <div className="space-y-4">
              {/* Game selection */}
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-2">Selecione o Jogo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateGameType('tetris')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      createGameType === 'tetris' 
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300' 
                        : 'border-gray-800 bg-gray-900 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">🧱</div>
                    <div className="text-xs font-bold">Neon Tetris</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateGameType('damas')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      createGameType === 'damas' 
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300' 
                        : 'border-gray-800 bg-gray-900 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">⚪</div>
                    <div className="text-xs font-bold">Damas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateGameType('xadrez')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      createGameType === 'xadrez' 
                        ? 'border-purple-500 bg-purple-950/40 text-purple-300' 
                        : 'border-gray-800 bg-gray-900 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">♟️</div>
                    <div className="text-xs font-bold">Xadrez</div>
                  </button>
                </div>
              </div>

              {/* Private or Public */}
              <div className="pt-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-800 bg-gray-900/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createIsPrivate}
                    onChange={(e) => setCreateIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">Sala Privada (Apenas com Código)</span>
                    <span className="text-[11px] text-gray-400 block">Não será listada publicamente no mural aberto.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateRoom}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                Confirmar e Abrir Sala
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Autenticação / Perfil de Nick com Senha */}
      <PlayerAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(p) => {
          setUserName(p.player_name_display);
          refreshRooms();
        }}
      />

    </div>
  );
};
