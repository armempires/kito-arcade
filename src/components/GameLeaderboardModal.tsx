import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  X, 
  Loader2, 
  Medal, 
  Sparkles, 
  Flame, 
  User
} from 'lucide-react';
import { getCurrentPlayer } from '../lib/arcadePlayerAuth';
import { 
  fetchXadrezLeaderboard, 
  fetchDamasLeaderboard, 
  XadrezLeaderboardEntry, 
  DamasLeaderboardEntry 
} from '../lib/arcadeLeaderboards';
import { supabase } from '../lib/supabase';

interface GameLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string; // 'neon-tetris' | 'jogo-xadrez' | 'damas-classicas'
  gameTitle: string;
}

interface TetrisScoreEntry {
  id: string;
  player_name: string;
  score: number;
  level: number;
  lines: number;
  created_at: string;
}

export const GameLeaderboardModal: React.FC<GameLeaderboardModalProps> = ({
  isOpen,
  onClose,
  gameId,
  gameTitle
}) => {
  const [loading, setLoading] = useState(true);
  const [tetrisScores, setTetrisScores] = useState<TetrisScoreEntry[]>([]);
  const [xadrezScores, setXadrezScores] = useState<XadrezLeaderboardEntry[]>([]);
  const [damasScores, setDamasScores] = useState<DamasLeaderboardEntry[]>([]);
  const currentPlayer = getCurrentPlayer();

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    if (gameId === 'neon-tetris') {
      supabase
        .from('tetris_leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(50)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setTetrisScores(data as TetrisScoreEntry[]);
          } else {
            try {
              const local = JSON.parse(localStorage.getItem('neon_tetris_solo_scores') || '[]');
              setTetrisScores(local);
            } catch {
              setTetrisScores([]);
            }
          }
        })
        .finally(() => setLoading(false));
    } else if (gameId === 'jogo-xadrez') {
      fetchXadrezLeaderboard(50)
        .then(setXadrezScores)
        .finally(() => setLoading(false));
    } else if (gameId === 'damas-classicas') {
      fetchDamasLeaderboard(50)
        .then(setDamasScores)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isOpen, gameId]);

  if (!isOpen) return null;

  const currentNick = currentPlayer ? currentPlayer.player_name_display.toLowerCase() : '';

  const getRankBadge = (index: number) => {
    if (index === 0) return <span className="text-xl">🥇</span>;
    if (index === 1) return <span className="text-xl">🥈</span>;
    if (index === 2) return <span className="text-xl">🥉</span>;
    return <span className="font-mono text-slate-400 font-bold text-xs sm:text-sm">#{index + 1}</span>;
  };

  // Encontra a posição do jogador atual
  let myPosition: number | null = null;
  if (currentNick) {
    if (gameId === 'neon-tetris') {
      const idx = tetrisScores.findIndex((s) => s.player_name.toLowerCase() === currentNick);
      if (idx !== -1) myPosition = idx + 1;
    } else if (gameId === 'jogo-xadrez') {
      const idx = xadrezScores.findIndex((s) => s.player_name.toLowerCase() === currentNick);
      if (idx !== -1) myPosition = idx + 1;
    } else if (gameId === 'damas-classicas') {
      const idx = damasScores.findIndex((s) => s.player_name.toLowerCase() === currentNick);
      if (idx !== -1) myPosition = idx + 1;
    }
  }

  const renderScores = () => {
    if (loading) {
      return (
        <div className="py-20 text-center text-slate-400">
          <Loader2 size={36} className="animate-spin text-amber-400 mx-auto mb-3" />
          <p className="text-sm">Carregando os maiores recordes mundiais...</p>
        </div>
      );
    }

    if (gameId === 'neon-tetris') {
      if (tetrisScores.length === 0) {
        return (
          <div className="py-16 text-center text-slate-400">
            <Medal size={40} className="text-slate-600 mx-auto mb-2" />
            <p>Nenhuma pontuação registrada ainda. Seja o primeiro a liderar!</p>
          </div>
        );
      }
      return tetrisScores.map((s, idx) => {
        const isMe = currentNick && s.player_name.toLowerCase() === currentNick;
        return (
          <div
            key={s.id || idx}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
              isMe
                ? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_25px_rgba(34,211,238,0.25)]'
                : idx === 0
                ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-slate-850 to-slate-850'
                : 'border-white/5 bg-slate-850/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 text-center shrink-0">{getRankBadge(idx)}</div>
              <div>
                <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>{s.player_name}</span>
                  {isMe && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-400/40">
                      Você
                    </span>
                  )}
                  {idx === 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold flex items-center gap-1">
                      <Flame size={10} className="fill-amber-400" /> Líder
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  Nível {s.level} · {s.lines} linhas
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {s.score.toLocaleString('pt-BR')}
              </div>
              <div className="text-[10px] text-slate-500">pontos</div>
            </div>
          </div>
        );
      });
    }

    if (gameId === 'jogo-xadrez') {
      if (xadrezScores.length === 0) {
        return (
          <div className="py-16 text-center text-slate-400">
            <Medal size={40} className="text-slate-600 mx-auto mb-2" />
            <p>Nenhuma vitória registrada ainda. Jogue e vença para entrar no Hall da Fama!</p>
          </div>
        );
      }
      return xadrezScores.map((s, idx) => {
        const isMe = currentNick && s.player_name.toLowerCase() === currentNick;
        return (
          <div
            key={s.id || idx}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
              isMe
                ? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_25px_rgba(34,211,238,0.25)]'
                : idx === 0
                ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-slate-850 to-slate-850'
                : 'border-white/5 bg-slate-850/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 text-center shrink-0">{getRankBadge(idx)}</div>
              <div>
                <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>{s.player_name}</span>
                  {isMe && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-400/40">
                      Você
                    </span>
                  )}
                  {idx === 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold flex items-center gap-1">
                      <Flame size={10} className="fill-amber-400" /> Mestre
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{s.wins}V</span>
                  <span className="text-slate-400">{s.draws}E</span>
                  <span className="text-rose-400">{s.losses}D</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {s.points} pts
              </div>
              <div className="text-[10px] text-slate-500">{s.wins} vitórias</div>
            </div>
          </div>
        );
      });
    }

    if (gameId === 'damas-classicas') {
      if (damasScores.length === 0) {
        return (
          <div className="py-16 text-center text-slate-400">
            <Medal size={40} className="text-slate-600 mx-auto mb-2" />
            <p>Nenhuma vitória registrada em Damas. Vença uma partida para liderar o ranking!</p>
          </div>
        );
      }
      return damasScores.map((s, idx) => {
        const isMe = currentNick && s.player_name.toLowerCase() === currentNick;
        return (
          <div
            key={s.id || idx}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
              isMe
                ? 'border-cyan-400/80 bg-cyan-950/40 shadow-[0_0_25px_rgba(34,211,238,0.25)]'
                : idx === 0
                ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-slate-850 to-slate-850'
                : 'border-white/5 bg-slate-850/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 text-center shrink-0">{getRankBadge(idx)}</div>
              <div>
                <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>{s.player_name}</span>
                  {isMe && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-400/40">
                      Você
                    </span>
                  )}
                  {idx === 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold flex items-center gap-1">
                      <Flame size={10} className="fill-amber-400" /> Campeão
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-medium flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">{s.wins} Vitórias</span>
                  <span className="text-amber-300 font-bold">{s.captures} Capturas</span>
                  <span className="text-rose-400">{s.losses}D</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                {s.points} pts
              </div>
              <div className="text-[10px] text-slate-500">{s.wins} vitórias</div>
            </div>
          </div>
        );
      });
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl border border-amber-400/40 bg-slate-900/95 p-5 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.25)] flex flex-col relative overflow-hidden text-white">
        
        {/* Glow de fundo */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-500/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Trophy size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-[0.25em] text-amber-300/80">
                <Sparkles size={12} /> Hall da Fama Individual
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Ranking: {gameTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Status do Jogador Atual */}
        <div className="mt-3.5 p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between relative z-10 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <User size={16} className="text-cyan-400" />
            <span className="text-slate-400">Seu Nick:</span>
            <strong className="text-white">
              {currentPlayer ? currentPlayer.player_name_display : 'Visitante (Sem Nick)'}
            </strong>
          </div>
          <div>
            {myPosition ? (
              <span className="font-bold text-amber-300 flex items-center gap-1">
                Sua Colocação: <strong className="text-white text-base">#{myPosition}</strong>
              </span>
            ) : (
              <span className="text-slate-500 text-xs">
                {currentPlayer ? 'Sem partidas registradas neste jogo' : 'Faça login para pontuar'}
              </span>
            )}
          </div>
        </div>

        {/* Lista de Pontuações */}
        <div className="flex-1 overflow-y-auto mt-4 pr-1 relative z-10 space-y-2">
          {renderScores()}
        </div>

        {/* Rodapé */}
        <div className="pt-3 border-t border-white/10 mt-3 text-center text-xs text-slate-400">
          Ranking atualizado em tempo real via Supabase. Apenas quem tem a senha do Nick pode pontuar!
        </div>
      </div>
    </div>
  );
};
